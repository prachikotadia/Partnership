import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  StickyNote, 
  Tag, 
  Search,
  MoreVertical,
  Edit3,
  Trash2,
  Pin,
  Heart,
  Lightbulb,
  MapPin,
  Utensils,
  Plane
} from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  category: 'random' | 'brainstorm' | 'bucket-list' | 'travel' | 'food' | 'love';
  tags: string[];
  createdBy: 'Person1' | 'Person2';
  createdAt: Date;
  updatedAt: Date;
  pinned?: boolean;
  color?: string;
}

export function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);

  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    category: 'random' as const,
    tags: [] as string[],
    color: 'gradient-primary',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [newTag, setNewTag] = useState('');

  const addNote = () => {
    if (newNote.title && newNote.content) {
      const note: Note = {
        id: Date.now().toString(),
        title: newNote.title,
        content: newNote.content,
        category: newNote.category,
        tags: newNote.tags,
        createdBy: 'Person1',
        createdAt: new Date(),
        updatedAt: new Date(),
        color: newNote.color,
      };
      setNotes([note, ...notes]);
      setNewNote({
        title: '',
        content: '',
        category: 'random',
        tags: [],
        color: 'gradient-primary',
      });
    }
  };

  const deleteNote = (noteId: string) => {
    setNotes(notes.filter(note => note.id !== noteId));
  };

  const togglePin = (noteId: string) => {
    setNotes(notes.map(note => 
      note.id === noteId 
        ? { ...note, pinned: !note.pinned }
        : note
    ));
  };

  const addTag = () => {
    if (newTag && !newNote.tags.includes(newTag)) {
      setNewNote({
        ...newNote,
        tags: [...newNote.tags, newTag.toLowerCase()]
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewNote({
      ...newNote,
      tags: newNote.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'travel': return Plane;
      case 'food': return Utensils;
      case 'love': return Heart;
      case 'brainstorm': return Lightbulb;
      case 'bucket-list': return MapPin;
      default: return StickyNote;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'travel': return 'bg-gradient-coral';
      case 'food': return 'bg-gradient-secondary';
      case 'love': return 'bg-gradient-primary';
      case 'brainstorm': return 'bg-gradient-teal';
      case 'bucket-list': return 'bg-purple-500';
      default: return 'bg-muted';
    }
  };

  const filteredNotes = notes
    .filter(note => {
      const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = filterCategory === 'all' || note.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });

  const allTags = Array.from(new Set(notes.flatMap(note => note.tags)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-card border-glass-border">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StickyNote className="w-6 h-6" />
              Notes & Ideas
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-gradient-primary hover-lift">
                  <Plus className="w-4 h-4 mr-2" />
                  New Note
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card border-glass-border max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Note</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      placeholder="Note title..."
                      value={newNote.title}
                      onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                      className="glass-card border-glass-border"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Content</label>
                    <Textarea
                      placeholder="Write your note here..."
                      value={newNote.content}
                      onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                      className="glass-card border-glass-border h-32"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Category</label>
                      <Select value={newNote.category} onValueChange={(value: any) => setNewNote({...newNote, category: value})}>
                        <SelectTrigger className="glass-card border-glass-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-card border-glass-border">
                          <SelectItem value="random">Random</SelectItem>
                          <SelectItem value="brainstorm">Brainstorm</SelectItem>
                          <SelectItem value="bucket-list">Bucket List</SelectItem>
                          <SelectItem value="travel">Travel</SelectItem>
                          <SelectItem value="food">Food</SelectItem>
                          <SelectItem value="love">Love Notes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Color</label>
                      <Select value={newNote.color} onValueChange={(value) => setNewNote({...newNote, color: value})}>
                        <SelectTrigger className="glass-card border-glass-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-card border-glass-border">
                          <SelectItem value="gradient-primary">Purple</SelectItem>
                          <SelectItem value="gradient-secondary">Yellow</SelectItem>
                          <SelectItem value="gradient-coral">Coral</SelectItem>
                          <SelectItem value="gradient-teal">Teal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Tags</label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        placeholder="Add tag..."
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                        className="glass-card border-glass-border"
                      />
                      <Button type="button" onClick={addTag} size="sm">
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {newNote.tags.map(tag => (
                        <Badge 
                          key={tag} 
                          variant="secondary"
                          className="cursor-pointer hover:bg-destructive"
                          onClick={() => removeTag(tag)}
                        >
                          #{tag} ×
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button onClick={addNote} className="bg-gradient-primary hover-lift w-full">
                    Create Note
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search notes, tags, content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-card border-glass-border pl-10"
              />
            </div>
            {/* Category Filter */}
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="glass-card border-glass-border md:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="glass-card border-glass-border">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="random">Random</SelectItem>
                <SelectItem value="brainstorm">Brainstorm</SelectItem>
                <SelectItem value="bucket-list">Bucket List</SelectItem>
                <SelectItem value="travel">Travel</SelectItem>
                <SelectItem value="food">Food</SelectItem>
                <SelectItem value="love">Love Notes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Popular Tags */}
          {allTags.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Popular Tags:</p>
              <div className="flex flex-wrap gap-2">
                {allTags.slice(0, 8).map(tag => (
                  <Badge 
                    key={tag}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-white"
                    onClick={() => setSearchQuery(tag)}
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNotes.map((note) => {
          const CategoryIcon = getCategoryIcon(note.category);
          
          return (
            <Card 
              key={note.id} 
              className={`glass-card border-glass-border hover-lift transition-all duration-300 relative ${note.color === 'gradient-primary' ? 'bg-gradient-primary/10' :
                note.color === 'gradient-secondary' ? 'bg-gradient-secondary/10' :
                note.color === 'gradient-coral' ? 'bg-gradient-coral/10' :
                note.color === 'gradient-teal' ? 'bg-gradient-teal/10' : ''
              }`}
            >
              {note.pinned && (
                <Pin className="absolute top-3 right-12 w-4 h-4 text-primary" />
              )}
              
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-8 h-8 rounded-lg ${getCategoryColor(note.category)} flex items-center justify-center`}>
                        <CategoryIcon className="w-4 h-4 text-white" />
                      </div>
                      <Badge className="text-xs capitalize bg-muted text-muted-foreground">
                        {note.category.replace('-', ' ')}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-lg leading-tight">{note.title}</h3>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="glass-card border-glass-border">
                      <DropdownMenuItem onClick={() => togglePin(note.id)} className="gap-2">
                        <Pin className="w-4 h-4" />
                        {note.pinned ? 'Unpin' : 'Pin'}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2">
                        <Edit3 className="w-4 h-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="gap-2 text-destructive focus:text-destructive"
                        onClick={() => deleteNote(note.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                  {note.content}
                </p>
                
                {/* Tags */}
                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {note.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-5 h-5">
                      <AvatarFallback className="text-xs bg-gradient-primary text-white">
                        {note.createdBy[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span>{note.createdBy}</span>
                  </div>
                  <div>
                    {note.updatedAt.toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredNotes.length === 0 && (
        <Card className="glass-card border-glass-border">
          <CardContent className="p-8 text-center">
            <StickyNote className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No notes found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? `No notes match "${searchQuery}"` : 'Create your first note to get started!'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}