import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { timelineService, TimelineEvent, TripPlan, MealPlan } from '@/services/timelineService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { 
  Calendar as CalendarIcon,
  Plus,
  MapPin,
  Clock,
  Plane,
  Hotel,
  Utensils,
  Heart,
  Star,
  CheckCircle,
  Edit,
  Trash2,
  Filter,
  Search,
  Tag,
  Users,
  DollarSign,
  Camera,
  FileText
} from 'lucide-react';

export function TimelineEnhanced() {
  const { user } = useAuth();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [tripPlans, setTripPlans] = useState<TripPlan[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showCreateTrip, setShowCreateTrip] = useState(false);
  const [showCreateMealPlan, setShowCreateMealPlan] = useState(false);
  const [filter, setFilter] = useState<'all' | 'trip' | 'meal' | 'life' | 'task'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    type: 'life' as const,
    category: '',
    startDate: '',
    endDate: '',
    allDay: true,
    color: '#3b82f6',
    priority: 'medium' as const,
    location: '',
    tags: '',
    notes: ''
  });

  const [newTrip, setNewTrip] = useState({
    title: '',
    destination: '',
    startDate: '',
    endDate: '',
    budget: 0,
    status: 'planning' as const
  });

  const [newMealPlan, setNewMealPlan] = useState({
    weekStart: '',
    meals: {} as any
  });

  useEffect(() => {
    if (user) {
      timelineService.initialize(user.id);
      loadData();
    }
  }, [user]);

  const loadData = () => {
    setEvents(timelineService.getEvents());
    setTripPlans(timelineService.getTripPlans());
    setMealPlans(timelineService.getMealPlans());
  };

  const handleCreateEvent = async () => {
    if (!newEvent.title || !newEvent.startDate) return;

    await timelineService.createEvent({
      title: newEvent.title,
      description: newEvent.description,
      type: newEvent.type as any,
      category: newEvent.category,
      startDate: new Date(newEvent.startDate),
      endDate: newEvent.endDate ? new Date(newEvent.endDate) : undefined,
      allDay: newEvent.allDay,
      color: newEvent.color,
      priority: newEvent.priority,
      isCompleted: false,
      createdBy: user!.id,
      location: newEvent.location,
      tags: newEvent.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      notes: newEvent.notes
    });

    setNewEvent({
      title: '',
      description: '',
      type: 'life',
      category: '',
      startDate: '',
      endDate: '',
      allDay: true,
      color: '#3b82f6',
      priority: 'medium',
      location: '',
      tags: '',
      notes: ''
    });
    setShowCreateEvent(false);
    loadData();
  };

  const handleCreateTrip = async () => {
    if (!newTrip.title || !newTrip.destination || !newTrip.startDate || !newTrip.endDate) return;

    await timelineService.createTripPlan({
      title: newTrip.title,
      destination: newTrip.destination,
      startDate: new Date(newTrip.startDate),
      endDate: new Date(newTrip.endDate),
      budget: newTrip.budget,
      status: newTrip.status,
      activities: [],
      todoList: [],
      sharedWith: [user!.id]
    });

    setNewTrip({
      title: '',
      destination: '',
      startDate: '',
      endDate: '',
      budget: 0,
      status: 'planning'
    });
    setShowCreateTrip(false);
    loadData();
  };

  const handleCreateMealPlan = async () => {
    if (!newMealPlan.weekStart) return;

    await timelineService.createMealPlan({
      weekStart: new Date(newMealPlan.weekStart),
      meals: newMealPlan.meals,
      shoppingList: [],
      sharedWith: [user!.id]
    });

    setNewMealPlan({
      weekStart: '',
      meals: {}
    });
    setShowCreateMealPlan(false);
    loadData();
  };

  const filteredEvents = events.filter(event => {
    const matchesFilter = filter === 'all' || event.type === filter;
    const matchesSearch = !searchQuery || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  const eventsForDate = timelineService.getEventsByDate(selectedDate);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'trip': return Plane;
      case 'meal': return Utensils;
      case 'life': return Heart;
      case 'task': return CheckCircle;
      default: return CalendarIcon;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-card border-glass-border">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-6 h-6" />
              Timeline & Planning
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={showCreateEvent} onOpenChange={setShowCreateEvent}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-card border-glass-border max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Event</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        placeholder="Event title"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select value={newEvent.type} onValueChange={(value: any) => setNewEvent(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="life">Life Event</SelectItem>
                          <SelectItem value="trip">Trip</SelectItem>
                          <SelectItem value="meal">Meal</SelectItem>
                          <SelectItem value="task">Task</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={newEvent.startDate}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>End Date (Optional)</Label>
                      <Input
                        type="date"
                        value={newEvent.endDate}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        placeholder="Event description"
                        value={newEvent.description}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        placeholder="Event location"
                        value={newEvent.location}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Tags (comma-separated)</Label>
                      <Input
                        placeholder="travel, vacation, fun"
                        value={newEvent.tags}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, tags: e.target.value }))}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleCreateEvent} className="flex-1 bg-gradient-primary">
                        Create Event
                      </Button>
                      <Button variant="outline" onClick={() => setShowCreateEvent(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={showCreateTrip} onOpenChange={setShowCreateTrip}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Plane className="w-4 h-4" />
                    Plan Trip
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-card border-glass-border max-w-md">
                  <DialogHeader>
                    <DialogTitle>Plan a Trip</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Trip Title</Label>
                      <Input
                        placeholder="e.g., Summer Vacation"
                        value={newTrip.title}
                        onChange={(e) => setNewTrip(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Destination</Label>
                      <Input
                        placeholder="e.g., Paris, France"
                        value={newTrip.destination}
                        onChange={(e) => setNewTrip(prev => ({ ...prev, destination: e.target.value }))}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Input
                          type="date"
                          value={newTrip.startDate}
                          onChange={(e) => setNewTrip(prev => ({ ...prev, startDate: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End Date</Label>
                        <Input
                          type="date"
                          value={newTrip.endDate}
                          onChange={(e) => setNewTrip(prev => ({ ...prev, endDate: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Budget (Optional)</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={newTrip.budget}
                        onChange={(e) => setNewTrip(prev => ({ ...prev, budget: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleCreateTrip} className="flex-1 bg-gradient-primary">
                        Plan Trip
                      </Button>
                      <Button variant="outline" onClick={() => setShowCreateTrip(false)}>
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

      {/* Filters and Search */}
      <Card className="glass-card border-glass-border">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-64"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="trip">Trips</SelectItem>
                  <SelectItem value="meal">Meals</SelectItem>
                  <SelectItem value="life">Life Events</SelectItem>
                  <SelectItem value="task">Tasks</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="glass-card border-glass-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
            />
            
            {eventsForDate.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="font-medium text-sm">Events for {selectedDate.toLocaleDateString()}</h4>
                {eventsForDate.map((event) => {
                  const EventIcon = getEventIcon(event.type);
                  return (
                    <div key={event.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(event.priority)}`} />
                      <EventIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">{event.title}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Events List */}
        <div className="lg:col-span-2 space-y-4">
          <Tabs defaultValue="events" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="trips">Trips</TabsTrigger>
              <TabsTrigger value="meals">Meal Plans</TabsTrigger>
            </TabsList>
            
            <TabsContent value="events" className="space-y-4">
              {filteredEvents.map((event) => {
                const EventIcon = getEventIcon(event.type);
                return (
                  <Card key={event.id} className="glass-card border-glass-border hover-lift">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: event.color }}
                          >
                            <EventIcon className="w-5 h-5 text-white" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{event.title}</h4>
                              <div className={`w-2 h-2 rounded-full ${getPriorityColor(event.priority)}`} />
                              {event.isCompleted && <CheckCircle className="w-4 h-4 text-green-500" />}
                            </div>
                            
                            {event.description && (
                              <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                            )}
                            
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {event.allDay ? 
                                  event.startDate.toLocaleDateString() : 
                                  event.startDate.toLocaleString()
                                }
                              </div>
                              
                              {event.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {event.location}
                                </div>
                              )}
                              
                              {event.tags.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <Tag className="w-3 h-3" />
                                  {event.tags.slice(0, 2).join(', ')}
                                  {event.tags.length > 2 && ` +${event.tags.length - 2}`}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              
              {filteredEvents.length === 0 && (
                <Card className="glass-card border-glass-border">
                  <CardContent className="p-8 text-center">
                    <CalendarIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No events found</h3>
                    <p className="text-muted-foreground">
                      {searchQuery ? 'Try adjusting your search or filters.' : 'Create your first event to get started!'}
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="trips" className="space-y-4">
              {tripPlans.map((trip) => (
                <Card key={trip.id} className="glass-card border-glass-border hover-lift">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                          <Plane className="w-5 h-5 text-white" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{trip.title}</h4>
                            <Badge variant="outline">{trip.status}</Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2">
                            {trip.destination} • {trip.startDate.toLocaleDateString()} - {trip.endDate.toLocaleDateString()}
                          </p>
                          
                          {trip.budget > 0 && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <DollarSign className="w-3 h-3" />
                              Budget: ${trip.budget.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {tripPlans.length === 0 && (
                <Card className="glass-card border-glass-border">
                  <CardContent className="p-8 text-center">
                    <Plane className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No trips planned</h3>
                    <p className="text-muted-foreground">Start planning your next adventure together!</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="meals" className="space-y-4">
              {mealPlans.map((mealPlan) => (
                <Card key={mealPlan.id} className="glass-card border-glass-border hover-lift">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                          <Utensils className="w-5 h-5 text-white" />
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">Weekly Meal Plan</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            Week of {mealPlan.weekStart.toLocaleDateString()}
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Utensils className="w-3 h-3" />
                              {Object.keys(mealPlan.meals).length} days planned
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {mealPlan.shoppingList.length} items on shopping list
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {mealPlans.length === 0 && (
                <Card className="glass-card border-glass-border">
                  <CardContent className="p-8 text-center">
                    <Utensils className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No meal plans</h3>
                    <p className="text-muted-foreground">Plan your weekly meals together!</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
