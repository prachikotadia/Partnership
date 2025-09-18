import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  Filter, 
  Clock, 
  User, 
  Tag, 
  Calendar,
  DollarSign,
  CheckSquare,
  MessageCircle,
  Star,
  FileText,
  Image,
  Mic
} from 'lucide-react';
import { NeumorphicButton } from '@/components/ui/neumorphic-button';
import { NeumorphicCard } from '@/components/ui/neumorphic-card';
import { NeumorphicInput } from '@/components/ui/neumorphic-input';

interface SearchResult {
  id: string;
  type: 'task' | 'note' | 'finance' | 'schedule' | 'bucket' | 'file';
  title: string;
  content: string;
  date: string;
  author: string;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: string;
  url?: string;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onResultClick?: (result: SearchResult) => void;
  className?: string;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  isOpen,
  onClose,
  onResultClick,
  className = ""
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchResult[]>([]);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const filterOptions = [
    { id: 'task', label: 'Tasks', icon: CheckSquare, color: 'blue' },
    { id: 'note', label: 'Notes', icon: MessageCircle, color: 'green' },
    { id: 'finance', label: 'Finance', icon: DollarSign, color: 'yellow' },
    { id: 'schedule', label: 'Schedule', icon: Calendar, color: 'purple' },
    { id: 'bucket', label: 'Bucket List', icon: Star, color: 'pink' },
    { id: 'file', label: 'Files', icon: FileText, color: 'gray' }
  ];

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.length > 2) {
      performSearch(query);
    } else {
      setResults([]);
    }
  }, [query, selectedFilters]);

  const performSearch = async (searchQuery: string) => {
    setIsSearching(true);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        // Simulate API call - replace with actual search implementation
        const mockResults = await simulateSearch(searchQuery, selectedFilters);
        setResults(mockResults);
        
        // Add to search history
        if (searchQuery.trim() && !recentSearches.includes(searchQuery.trim())) {
          setRecentSearches(prev => [searchQuery.trim(), ...prev.slice(0, 4)]);
        }
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  const simulateSearch = async (searchQuery: string, filters: string[]): Promise<SearchResult[]> => {
    // Mock data - replace with actual search implementation
    const mockData: SearchResult[] = [
      {
        id: '1',
        type: 'task',
        title: 'Buy groceries for weekend',
        content: 'Need to get milk, bread, and vegetables',
        date: '2024-01-15',
        author: 'Person1',
        priority: 'high',
        status: 'todo',
        tags: ['shopping', 'weekend']
      },
      {
        id: '2',
        type: 'note',
        title: 'Anniversary ideas',
        content: 'Restaurant reservation, flowers, gift ideas',
        date: '2024-01-14',
        author: 'Person2',
        tags: ['anniversary', 'planning']
      },
      {
        id: '3',
        type: 'finance',
        title: 'Monthly rent payment',
        content: 'Rent payment due on 1st of each month',
        date: '2024-01-01',
        author: 'Person1',
        tags: ['rent', 'monthly']
      },
      {
        id: '4',
        type: 'schedule',
        title: 'Date night',
        content: 'Romantic dinner at favorite restaurant',
        date: '2024-01-20',
        author: 'Person2',
        tags: ['date', 'romantic']
      },
      {
        id: '5',
        type: 'bucket',
        title: 'Visit Japan together',
        content: 'Plan trip to Tokyo and Kyoto',
        date: '2024-12-01',
        author: 'Person1',
        tags: ['travel', 'japan']
      }
    ];

    // Filter by search query
    const filteredResults = mockData.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Filter by selected types
    if (filters.length > 0) {
      return filteredResults.filter(item => filters.includes(item.type));
    }

    return filteredResults;
  };

  const handleFilterToggle = (filterId: string) => {
    setSelectedFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  const handleResultClick = (result: SearchResult) => {
    onResultClick?.(result);
    setSearchHistory(prev => [result, ...prev.slice(0, 9)]);
  };

  const handleRecentSearchClick = (recentQuery: string) => {
    setQuery(recentQuery);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setSelectedFilters([]);
  };

  const getResultIcon = (type: string) => {
    const filter = filterOptions.find(f => f.id === type);
    return filter?.icon || FileText;
  };

  const getResultColor = (type: string) => {
    const filter = filterOptions.find(f => f.id === type);
    return filter?.color || 'gray';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50">
      <NeumorphicCard className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Global Search</h2>
            <NeumorphicButton
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2"
            >
              <X className="h-4 w-4" />
            </NeumorphicButton>
          </div>

          {/* Search Input */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <NeumorphicInput
              ref={searchInputRef}
              type="text"
              placeholder="Search across all your data..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {query && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            {filterOptions.map((filter) => {
              const Icon = filter.icon;
              const isSelected = selectedFilters.includes(filter.id);
              return (
                <NeumorphicButton
                  key={filter.id}
                  variant={isSelected ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleFilterToggle(filter.id)}
                  className={`flex items-center space-x-1 ${
                    isSelected ? `bg-${filter.color}-500 text-white` : ''
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  <span>{filter.label}</span>
                </NeumorphicButton>
              );
            })}
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {query.length === 0 ? (
              /* Recent Searches */
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Searches</h3>
                {recentSearches.length > 0 ? (
                  <div className="space-y-1">
                    {recentSearches.map((recent, index) => (
                      <button
                        key={index}
                        onClick={() => handleRecentSearchClick(recent)}
                        className="w-full text-left p-2 hover:bg-gray-50 rounded-lg flex items-center space-x-2"
                      >
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{recent}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No recent searches</p>
                )}
              </div>
            ) : (
              /* Search Results */
              <div>
                {isSearching ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-sm text-gray-500">Searching...</span>
                  </div>
                ) : results.length > 0 ? (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-700">
                      {results.length} result{results.length !== 1 ? 's' : ''} found
                    </h3>
                    {results.map((result) => {
                      const Icon = getResultIcon(result.type);
                      const color = getResultColor(result.type);
                      return (
                        <button
                          key={result.id}
                          onClick={() => handleResultClick(result)}
                          className="w-full text-left p-3 hover:bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg bg-${color}-100`}>
                              <Icon className={`h-4 w-4 text-${color}-600`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-gray-900 truncate">
                                {result.title}
                              </h4>
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                {result.content}
                              </p>
                              <div className="flex items-center space-x-2 mt-2">
                                <span className="text-xs text-gray-400">
                                  {formatDate(result.date)}
                                </span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-400">
                                  {result.author}
                                </span>
                                {result.tags && result.tags.length > 0 && (
                                  <>
                                    <span className="text-xs text-gray-400">•</span>
                                    <div className="flex space-x-1">
                                      {result.tags.slice(0, 2).map((tag, index) => (
                                        <span
                                          key={index}
                                          className="text-xs bg-gray-100 text-gray-600 px-1 py-0.5 rounded"
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-sm text-gray-500">No results found for "{query}"</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Try different keywords or check your spelling
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Search across tasks, notes, finance, schedule, and more</span>
              <div className="flex items-center space-x-2">
                <span>Press</span>
                <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Esc</kbd>
                <span>to close</span>
              </div>
            </div>
          </div>
        </div>
      </NeumorphicCard>
    </div>
  );
};
