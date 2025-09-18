import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Zap, 
  Clock, 
  Cpu, 
  Memory, 
  Wifi, 
  Battery,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { NeumorphicCard } from '@/components/ui/neumorphic-card';
import { NeumorphicButton } from '@/components/ui/neumorphic-button';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  networkLatency: number;
  fps: number;
  bundleSize: number;
}

interface PerformanceOptimizerProps {
  children: React.ReactNode;
  enableMonitoring?: boolean;
  enableLazyLoading?: boolean;
  enableMemoization?: boolean;
  enableVirtualization?: boolean;
  className?: string;
}

export const PerformanceOptimizer: React.FC<PerformanceOptimizerProps> = ({
  children,
  enableMonitoring = true,
  enableLazyLoading = true,
  enableMemoization = true,
  enableVirtualization = false,
  className = ""
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    networkLatency: 0,
    fps: 60,
    bundleSize: 0
  });

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<string[]>([]);

  // Performance monitoring
  useEffect(() => {
    if (!enableMonitoring) return;

    const startTime = performance.now();
    
    // Monitor performance metrics
    const measurePerformance = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const loadTime = navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0;
      
      // Memory usage (if available)
      const memory = (performance as any).memory;
      const memoryUsage = memory ? memory.usedJSHeapSize / 1024 / 1024 : 0;
      
      // Network latency
      const networkEntries = performance.getEntriesByType('resource');
      const avgLatency = networkEntries.length > 0 
        ? networkEntries.reduce((sum, entry) => sum + entry.duration, 0) / networkEntries.length 
        : 0;

      setMetrics(prev => ({
        ...prev,
        loadTime,
        memoryUsage,
        networkLatency: avgLatency
      }));
    };

    // Measure render time
    const measureRenderTime = () => {
      const renderTime = performance.now() - startTime;
      setMetrics(prev => ({ ...prev, renderTime }));
    };

    // FPS monitoring
    let lastTime = performance.now();
    let frameCount = 0;
    
    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        setMetrics(prev => ({ ...prev, fps: frameCount }));
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };

    // Start monitoring
    measurePerformance();
    measureRenderTime();
    measureFPS();

    // Cleanup
    return () => {
      // Stop FPS monitoring
    };
  }, [enableMonitoring]);

  // Generate optimization suggestions
  useEffect(() => {
    const suggestions: string[] = [];
    
    if (metrics.loadTime > 3000) {
      suggestions.push('Consider code splitting and lazy loading');
    }
    
    if (metrics.memoryUsage > 100) {
      suggestions.push('Memory usage is high - check for memory leaks');
    }
    
    if (metrics.networkLatency > 1000) {
      suggestions.push('Network latency is high - optimize API calls');
    }
    
    if (metrics.fps < 30) {
      suggestions.push('Low FPS detected - optimize rendering performance');
    }
    
    if (metrics.renderTime > 100) {
      suggestions.push('Render time is high - consider memoization');
    }

    setOptimizationSuggestions(suggestions);
  }, [metrics]);

  // Lazy loading implementation
  const LazyComponent = useCallback(({ children }: { children: React.ReactNode }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);
    const ref = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!enableLazyLoading) {
        setIsVisible(true);
        setHasLoaded(true);
        return;
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !hasLoaded) {
            setIsVisible(true);
            setHasLoaded(true);
          }
        },
        { threshold: 0.1 }
      );

      if (ref.current) {
        observer.observe(ref.current);
      }

      return () => observer.disconnect();
    }, [enableLazyLoading, hasLoaded]);

    return (
      <div ref={ref} className="lazy-component">
        {isVisible ? children : (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
    );
  }, [enableLazyLoading]);

  // Memoization wrapper
  const MemoizedComponent = useMemo(() => {
    if (!enableMemoization) return children;
    
    return React.memo(children as React.ComponentType<any>);
  }, [children, enableMemoization]);

  // Performance optimization actions
  const optimizePerformance = useCallback(() => {
    setIsOptimizing(true);
    
    // Simulate optimization process
    setTimeout(() => {
      // Clear unused resources
      if ('memory' in performance) {
        // Force garbage collection if available
        (window as any).gc?.();
      }
      
      // Preload critical resources
      const criticalResources = [
        '/static/css/main.css',
        '/static/js/bundle.js'
      ];
      
      criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource;
        link.as = resource.endsWith('.css') ? 'style' : 'script';
        document.head.appendChild(link);
      });
      
      setIsOptimizing(false);
    }, 2000);
  }, []);

  const clearCache = useCallback(() => {
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          caches.delete(cacheName);
        });
      });
    }
  }, []);

  const preloadResources = useCallback(() => {
    const resources = [
      '/api/tasks',
      '/api/notes',
      '/api/finance'
    ];
    
    resources.forEach(resource => {
      fetch(resource, { method: 'HEAD' });
    });
  }, []);

  return (
    <div className={`performance-optimizer ${className}`}>
      {children}
      
      {enableMonitoring && (
        <div className="fixed bottom-4 right-4 z-50">
          <NeumorphicCard className="p-4 max-w-sm">
            <div className="space-y-3">
              {/* Performance Metrics */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700">Performance</h3>
                <Activity className="h-4 w-4 text-blue-500" />
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span>{metrics.loadTime.toFixed(0)}ms</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Memory className="h-3 w-3 text-gray-400" />
                  <span>{metrics.memoryUsage.toFixed(1)}MB</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Wifi className="h-3 w-3 text-gray-400" />
                  <span>{metrics.networkLatency.toFixed(0)}ms</span>
                </div>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-3 w-3 text-gray-400" />
                  <span>{metrics.fps} FPS</span>
                </div>
              </div>

              {/* Optimization Suggestions */}
              {optimizationSuggestions.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center space-x-1">
                    <AlertCircle className="h-3 w-3 text-yellow-500" />
                    <span className="text-xs font-medium">Suggestions</span>
                  </div>
                  {optimizationSuggestions.slice(0, 2).map((suggestion, index) => (
                    <div key={index} className="text-xs text-gray-600">
                      • {suggestion}
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-1">
                <NeumorphicButton
                  size="sm"
                  onClick={optimizePerformance}
                  disabled={isOptimizing}
                  className="flex-1 text-xs"
                >
                  {isOptimizing ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                  ) : (
                    <Zap className="h-3 w-3" />
                  )}
                </NeumorphicButton>
                
                <NeumorphicButton
                  size="sm"
                  onClick={clearCache}
                  variant="ghost"
                  className="text-xs"
                >
                  Clear
                </NeumorphicButton>
              </div>
            </div>
          </NeumorphicCard>
        </div>
      )}
    </div>
  );
};

// Performance monitoring hook
export const usePerformanceMonitoring = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    networkLatency: 0,
    fps: 60,
    bundleSize: 0
  });

  const measureComponentRender = useCallback((componentName: string) => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      console.log(`${componentName} render time: ${renderTime.toFixed(2)}ms`);
      
      setMetrics(prev => ({
        ...prev,
        renderTime: Math.max(prev.renderTime, renderTime)
      }));
    };
  }, []);

  const measureAsyncOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await operation();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.log(`${operationName} took: ${duration.toFixed(2)}ms`);
      
      setMetrics(prev => ({
        ...prev,
        networkLatency: Math.max(prev.networkLatency, duration)
      }));
      
      return result;
    } catch (error) {
      console.error(`${operationName} failed:`, error);
      throw error;
    }
  }, []);

  return {
    metrics,
    measureComponentRender,
    measureAsyncOperation
  };
};

// Lazy loading hook
export const useLazyLoading = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, hasLoaded]);

  return { ref, isVisible, hasLoaded };
};

// Debounce hook for performance
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Throttle hook for performance
export const useThrottle = <T>(value: T, limit: number): T => {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef<number>(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
};
