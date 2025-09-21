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
  Calendar, 
  MapPin, 
  Heart, 
  Plane,
  MoreVertical,
  Edit3,
  Trash2,
  Clock
} from 'lucide-react';

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  category: 'travel' | 'relationship' | 'work' | 'personal' | 'milestone';
  location?: string;
  createdBy: 'Alex' | 'Sam';
  participants: ('Alex' | 'Sam')[];
  completed?: boolean;
}

export function Timeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([
    {
      id: '1',
      title: 'Weekend Trip to Paris',
      description: 'Romantic getaway for our anniversary. Book hotels and plan itinerary.',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      category: 'travel',
      location: 'Paris, France',
      createdBy: 'Alex',
      participants: ['Alex', 'Sam'],
    },
    {
      id: '2', 
      title: 'Anniversary Dinner',
      description: 'Celebrate our 2-year anniversary at the fancy restaurant downtown.',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      category: 'relationship',
      location: 'Downtown Restaurant',
      createdBy: 'Sam',
      participants: ['Alex', 'Sam'],
    },
    {
      id: '3',
      title: 'Move to New Apartment',
      description: 'Final decision on the apartment and start moving process.',
      date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      category: 'milestone',
      createdBy: 'Alex',
      participants: ['Alex', 'Sam'],
    },
  ]);

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    category: 'personal' as const,
    location: '',
  });

  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');

  const addEvent = () => {
    if (newEvent.title && newEvent.date) {
      const event: TimelineEvent = {
        id: Date.now().toString(),
        title: newEvent.title,
        description: newEvent.description,
        date: new Date(newEvent.date),
        category: newEvent.category,
        location: newEvent.location,
        createdBy: 'Alex',
        participants: ['Alex', 'Sam'],
      };
      setEvents([...events, event].sort((a, b) => a.date.getTime() - b.date.getTime()));
      setNewEvent({
        title: '',
        description: '',
        date: '',
        category: 'personal',
        location: '',
      });
    }
  };

  const deleteEvent = (eventId: string) => {
    setEvents(events.filter(event => event.id !== eventId));
  };

  const toggleComplete = (eventId: string) => {
    setEvents(events.map(event => 
      event.id === eventId 
        ? { ...event, completed: !event.completed }
        : event
    ));
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'travel': return 'bg-gradient-coral';
      case 'relationship': return 'bg-gradient-primary';
      case 'work': return 'bg-gradient-secondary';
      case 'milestone': return 'bg-gradient-teal';
      default: return 'bg-muted';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'travel': return Plane;
      case 'relationship': return Heart;
      case 'work': return Clock;
      case 'milestone': return Calendar;
      default: return Calendar;
    }
  };

  const filteredEvents = events.filter(event => {
    const now = new Date();
    switch (filter) {
      case 'upcoming': return event.date >= now;
      case 'past': return event.date < now;
      default: return true;
    }
  });

  const isEventOverdue = (date: Date) => {
    return date < new Date() && date.toDateString() !== new Date().toDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-card border-glass-border">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Timeline & Planning
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter('all')}
                className={filter === 'all' ? 'bg-gradient-primary' : ''}
              >
                All ({events.length})
              </Button>
              <Button
                variant={filter === 'upcoming' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter('upcoming')}
                className={filter === 'upcoming' ? 'bg-gradient-primary' : ''}
              >
                Upcoming ({events.filter(e => e.date >= new Date()).length})
              </Button>
              <Button
                variant={filter === 'past' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter('past')}
                className={filter === 'past' ? 'bg-gradient-primary' : ''}
              >
                Past ({events.filter(e => e.date < new Date()).length})
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary hover-lift w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add New Event
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-glass-border">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    placeholder="Event title..."
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                    className="glass-card border-glass-border"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="Event description..."
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                    className="glass-card border-glass-border"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Date & Time</label>
                    <Input
                      type="datetime-local"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                      className="glass-card border-glass-border"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <Select value={newEvent.category} onValueChange={(value: any) => setNewEvent({...newEvent, category: value})}>
                      <SelectTrigger className="glass-card border-glass-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-glass-border">
                        <SelectItem value="travel">Travel</SelectItem>
                        <SelectItem value="relationship">Relationship</SelectItem>
                        <SelectItem value="work">Work</SelectItem>
                        <SelectItem value="personal">Personal</SelectItem>
                        <SelectItem value="milestone">Milestone</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Location (Optional)</label>
                  <Input
                    placeholder="Event location..."
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                    className="glass-card border-glass-border"
                  />
                </div>
                <Button onClick={addEvent} className="bg-gradient-primary hover-lift w-full">
                  Create Event
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Timeline */}
      <div className="space-y-4">
        {filteredEvents.map((event) => {
          const CategoryIcon = getCategoryIcon(event.category);
          const isOverdue = isEventOverdue(event.date);
          
          return (
            <Card 
              key={event.id} 
              className={`glass-card border-glass-border hover-lift transition-all duration-300 ${
                event.completed ? 'opacity-70' : ''
              } ${isOverdue ? 'border-destructive/50' : ''}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Category Icon */}
                  <div className={`w-12 h-12 rounded-xl ${getCategoryColor(event.category)} flex items-center justify-center flex-shrink-0`}>
                    <CategoryIcon className="w-6 h-6 text-white" />
                  </div>

                  {/* Event Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`font-semibold text-lg ${event.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {event.title}
                        </h3>
                        
                        {event.description && (
                          <p className="text-muted-foreground mt-1">{event.description}</p>
                        )}
                        
                        <div className="flex items-center gap-4 mt-3">
                          {/* Date */}
                          <div className={`flex items-center gap-1 text-sm ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                            <Calendar className="w-4 h-4" />
                            {event.date.toLocaleDateString()} at {event.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            {isOverdue && <span className="ml-1 text-xs">(Overdue)</span>}
                          </div>

                          {/* Location */}
                          {event.location && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="w-4 h-4" />
                              {event.location}
                            </div>
                          )}

                          {/* Category Badge */}
                          <Badge className={`${getCategoryColor(event.category)} text-white border-0 text-xs capitalize`}>
                            {event.category}
                          </Badge>
                        </div>

                        {/* Participants */}
                        <div className="flex items-center gap-2 mt-3">
                          <div className="flex -space-x-2">
                            {event.participants.map((participant) => (
                              <Avatar key={participant} className="w-6 h-6 border-2 border-white">
                                <AvatarFallback className="text-xs bg-gradient-primary text-white">
                                  {participant[0]}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            Created by {event.createdBy}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant={event.completed ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => toggleComplete(event.id)}
                          className={event.completed ? 'bg-success text-white' : ''}
                        >
                          {event.completed ? 'Completed' : 'Mark Complete'}
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="glass-card border-glass-border">
                            <DropdownMenuItem className="gap-2">
                              <Edit3 className="w-4 h-4" />
                              Edit Event
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="gap-2 text-destructive focus:text-destructive"
                              onClick={() => deleteEvent(event.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredEvents.length === 0 && (
        <Card className="glass-card border-glass-border">
          <CardContent className="p-8 text-center">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No events found</h3>
            <p className="text-muted-foreground">
              {filter === 'all' ? 'Add your first event to get started!' : 
               filter === 'upcoming' ? 'No upcoming events planned.' :
               'No past events yet.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}