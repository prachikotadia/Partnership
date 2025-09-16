import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { notesService, Note, NoteCategory, NoteVersion } from '@/services/notesService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  FileText,
  Plus,
  Search,
  Filter,
  Tag,
  Heart,
  Star,
  Pin,
  Lock,
  Users,
  History,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Share,
  Download,
  Upload,
  Smile,
  Lightbulb,
  Target,
  Briefcase,
  Plane,
  DollarSign,
  MessageCircle,
  Clock,
  User
} from 'lucide-react';

export function NotesEnhanced() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<NoteCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateNote, setShowCreateNote] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [versions, setVersions] = useState<NoteVersion[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    category: 'random' as const,
    tags: '',
    isShared: false,
    isEncrypted: false,
    color: '#3b82f6',
    emoji: '📝'
  });

  useEffect(() => {
    if (user) {
      notesService.initialize(user.id);
      loadData();
    }
  }, [user]);

  const loadData = () => {
    setNotes(notesService.getNotes());
    setCategories(notesService.getCategories());
  };

  const handleCreateNote = async () => {
    if (!newNote.title.trim()) return;

    await notesService.createNote({
      title: newNote.title,
      content: newNote.content,
      category: newNote.category,
      tags: newNote.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      isShared: newNote.isShared,
      isEncrypted: newNote.isEncrypted,
      isFavorite: false,
      isPinned: false,
      createdBy: user!.id,
      collaborators: []
    });

    setNewNote({
      title: '',
      content: '',
      category: 'random',
      tags: '',
      isShared: false,
      isEncrypted: false,
      color: '#3b82f6',
      emoji: '📝'
    });
    setShowCreateNote(false);
    loadData();
  };

  const handleUpdateNote = async (id: string, updates: Partial<Note>) => {
    await notesService.updateNote(id, updates);
    loadData();
  };

  const handleDeleteNote = async (id: string) => {
    await notesService.deleteNote(id);
    loadData();
  };

  const handleViewVersions = async (note: Note) => {
    setSelectedNote(note);
    setVersions(await notesService.getNoteVersions(note.id));
    setShowVersionHistory(true);
  };

  const handleRestoreVersion = async (version: number) => {
    if (selectedNote) {
      await notesService.restoreToVersion(selectedNote.id, version);
      loadData();
      setShowVersionHistory(false);
    }
  };

  const filteredNotes = notes.filter(note => {
    const matchesCategory = selectedCategory === 'all' || note.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (!note.isEncrypted && note.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.emoji || '📝';
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.color || '#6b7280';
  };

  const getPopularTags = () => {
    return notesService.getPopularTags(10);
  };

  const stats = notesService.getStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-card border-glass-border">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-6 h-6" />
              Notes & Ideas
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="gap-2"
              >
                {viewMode === 'grid' ? 'List View' : 'Grid View'}
              </Button>
              
              <Dialog open={showCreateNote} onOpenChange={setShowCreateNote}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    New Note
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-card border-glass-border max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Note</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          placeholder="Note title"
                          value={newNote.title}
                          onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={newNote.category} onValueChange={(value: any) => setNewNote(prev => ({ ...prev, category: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                <div className="flex items-center gap-2">
                                  <span>{category.emoji}</span>
                                  <span>{category.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Content</Label>
                      <Textarea
                        placeholder="Write your note here..."
                        value={newNote.content}
                        onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                        rows={8}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Tags (comma-separated)</Label>
                      <Input
                        placeholder="travel, finance, fun"
                        value={newNote.tags}
                        onChange={(e) => setNewNote(prev => ({ ...prev, tags: e.target.value }))}
                      />
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={newNote.isShared}
                          onCheckedChange={(checked) => setNewNote(prev => ({ ...prev, isShared: checked }))}
                        />
                        <Label>Share with partner</Label>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={newNote.isEncrypted}
                          onCheckedChange={(checked) => setNewNote(prev => ({ ...prev, isEncrypted: checked }))}
                        />
                        <Label>Encrypt content</Label>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleCreateNote} className="flex-1 bg-gradient-primary">
                        Create Note
                      </Button>
                      <Button variant="outline" onClick={() => setShowCreateNote(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card border-glass-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.totalNotes}</div>
            <div className="text-sm text-muted-foreground">Total Notes</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-glass-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-500">{stats.sharedNotes}</div>
            <div className="text-sm text-muted-foreground">Shared</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-glass-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-500">{stats.favoriteNotes}</div>
            <div className="text-sm text-muted-foreground">Favorites</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-glass-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-500">{stats.totalTags}</div>
            <div className="text-sm text-muted-foreground">Tags</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="glass-card border-glass-border">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-64"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <span>{category.emoji}</span>
                        <span>{category.name}</span>
                        <Badge variant="outline" className="ml-auto">{category.noteCount}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Popular Tags */}
      <Card className="glass-card border-glass-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Popular Tags
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {getPopularTags().map(({ tag, count }) => (
              <Badge
                key={tag}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-white transition-colors"
                onClick={() => setSearchQuery(tag)}
              >
                #{tag} ({count})
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notes Grid/List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
        {filteredNotes.map((note) => (
          <Card key={note.id} className="glass-card border-glass-border hover-lift">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm"
                    style={{ backgroundColor: getCategoryColor(note.category) }}
                  >
                    {getCategoryIcon(note.category)}
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{note.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {note.category} • {note.updatedAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  {note.isShared && <Users className="w-4 h-4 text-blue-500" />}
                  {note.isEncrypted && <Lock className="w-4 h-4 text-yellow-500" />}
                  {note.isFavorite && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                  {note.isPinned && <Pin className="w-4 h-4 text-red-500" />}
                </div>
              </div>

              <div className="mb-3">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {note.isEncrypted ? '🔒 Encrypted content' : note.content}
                </p>
              </div>

              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {note.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                  {note.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{note.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUpdateNote(note.id, { isFavorite: !note.isFavorite })}
                    className="h-8 w-8 p-0"
                  >
                    <Star className={`w-4 h-4 ${note.isFavorite ? 'text-yellow-500 fill-current' : ''}`} />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUpdateNote(note.id, { isPinned: !note.isPinned })}
                    className="h-8 w-8 p-0"
                  >
                    <Pin className={`w-4 h-4 ${note.isPinned ? 'text-red-500' : ''}`} />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewVersions(note)}
                    className="h-8 w-8 p-0"
                  >
                    <History className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 text-destructive"
                    onClick={() => handleDeleteNote(note.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredNotes.length === 0 && (
        <Card className="glass-card border-glass-border">
          <CardContent className="p-8 text-center">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No notes found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try adjusting your search or filters.' : 'Create your first note to get started!'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Version History Dialog */}
      <Dialog open={showVersionHistory} onOpenChange={setShowVersionHistory}>
        <DialogContent className="glass-card border-glass-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Version History - {selectedNote?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {versions.map((version) => (
              <Card key={version.id} className="border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">v{version.version}</Badge>
                      <span className="text-sm font-medium">{version.changeType}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {version.editedAt.toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground mb-2">
                    by {version.editedBy}
                  </div>
                  
                  {version.changes && version.changes.length > 0 && (
                    <div className="space-y-1">
                      {version.changes.map((change, index) => (
                        <div key={index} className="text-xs">
                          <span className="font-medium">{change.field}:</span>
                          <div className="text-muted-foreground">
                            <div className="line-through">{change.oldValue}</div>
                            <div className="text-green-600">{change.newValue}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRestoreVersion(version.version)}
                    >
                      Restore to this version
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
