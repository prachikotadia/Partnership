import React, { useState, useRef, useEffect } from 'react';
import { 
  SwipeLeft, 
  SwipeRight, 
  SwipeUp, 
  SwipeDown, 
  Tap, 
  RotateCw,
  Move,
  Hand
} from 'lucide-react';

interface TouchGesturesProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  onLongPress?: () => void;
  onPinch?: (scale: number) => void;
  onRotate?: (angle: number) => void;
  swipeThreshold?: number;
  longPressDelay?: number;
  className?: string;
}

interface TouchPoint {
  x: number;
  y: number;
  time: number;
}

export const TouchGestures: React.FC<TouchGesturesProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onTap,
  onLongPress,
  onPinch,
  onRotate,
  swipeThreshold = 50,
  longPressDelay = 500,
  className = ""
}) => {
  const [touchStart, setTouchStart] = useState<TouchPoint | null>(null);
  const [touchEnd, setTouchEnd] = useState<TouchPoint | null>(null);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [gestureFeedback, setGestureFeedback] = useState<string | null>(null);
  
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTouchRef = useRef<TouchPoint | null>(null);
  const initialDistanceRef = useRef<number | null>(null);
  const initialAngleRef = useRef<number | null>(null);

  const getTouchPoint = (touch: Touch): TouchPoint => ({
    x: touch.clientX,
    y: touch.clientY,
    time: Date.now()
  });

  const getDistance = (point1: TouchPoint, point2: TouchPoint): number => {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getAngle = (point1: TouchPoint, point2: TouchPoint): number => {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.atan2(dy, dx) * (180 / Math.PI);
  };

  const showGestureFeedback = (gesture: string) => {
    setGestureFeedback(gesture);
    setTimeout(() => setGestureFeedback(null), 1000);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const point = getTouchPoint(touch);
    
    setTouchStart(point);
    setTouchEnd(null);
    lastTouchRef.current = point;

    // Start long press timer
    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        setIsLongPressing(true);
        onLongPress();
        showGestureFeedback('Long Press');
      }, longPressDelay);
    }

    // Handle multi-touch gestures
    if (e.touches.length === 2) {
      const touch1 = getTouchPoint(e.touches[0]);
      const touch2 = getTouchPoint(e.touches[1]);
      initialDistanceRef.current = getDistance(touch1, touch2);
      initialAngleRef.current = getAngle(touch1, touch2);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const point = getTouchPoint(touch);
    
    setTouchEnd(point);
    lastTouchRef.current = point;

    // Cancel long press if user moves
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    // Handle multi-touch gestures
    if (e.touches.length === 2 && onPinch) {
      const touch1 = getTouchPoint(e.touches[0]);
      const touch2 = getTouchPoint(e.touches[1]);
      const currentDistance = getDistance(touch1, touch2);
      
      if (initialDistanceRef.current) {
        const scale = currentDistance / initialDistanceRef.current;
        onPinch(scale);
      }
    }

    if (e.touches.length === 2 && onRotate) {
      const touch1 = getTouchPoint(e.touches[0]);
      const touch2 = getTouchPoint(e.touches[1]);
      const currentAngle = getAngle(touch1, touch2);
      
      if (initialAngleRef.current !== null) {
        const rotation = currentAngle - initialAngleRef.current;
        onRotate(rotation);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    
    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (!touchStart || !touchEnd) {
      // Handle tap
      if (onTap && !isLongPressing) {
        onTap();
        showGestureFeedback('Tap');
      }
      return;
    }

    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = touchEnd.y - touchStart.y;
    const deltaTime = touchEnd.time - touchStart.time;
    const distance = getDistance(touchStart, touchEnd);

    // Check if it's a swipe (fast movement)
    const isSwipe = distance > swipeThreshold && deltaTime < 300;

    if (isSwipe) {
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      if (absDeltaX > absDeltaY) {
        // Horizontal swipe
        if (deltaX > 0) {
          onSwipeRight?.();
          showGestureFeedback('Swipe Right');
        } else {
          onSwipeLeft?.();
          showGestureFeedback('Swipe Left');
        }
      } else {
        // Vertical swipe
        if (deltaY > 0) {
          onSwipeDown?.();
          showGestureFeedback('Swipe Down');
        } else {
          onSwipeUp?.();
          showGestureFeedback('Swipe Up');
        }
      }
    }

    // Reset state
    setTouchStart(null);
    setTouchEnd(null);
    setIsLongPressing(false);
    initialDistanceRef.current = null;
    initialAngleRef.current = null;
  };

  const handleTouchCancel = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setTouchStart(null);
    setTouchEnd(null);
    setIsLongPressing(false);
  };

  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`touch-gestures-container ${className} ${
        isLongPressing ? 'bg-blue-50 dark:bg-blue-900' : ''
      }`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      style={{ touchAction: 'none' }}
    >
      {children}
      
      {/* Gesture Feedback Overlay */}
      {gestureFeedback && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium">
            {gestureFeedback}
          </div>
        </div>
      )}

      {/* Long Press Indicator */}
      {isLongPressing && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
          <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            Long Press
          </div>
        </div>
      )}
    </div>
  );
};

// Gesture HOC for easy wrapping
export const withTouchGestures = <P extends object>(
  Component: React.ComponentType<P>,
  gestureProps: Omit<TouchGesturesProps, 'children'>
) => {
  return (props: P) => (
    <TouchGestures {...gestureProps}>
      <Component {...props} />
    </TouchGestures>
  );
};

// Predefined gesture combinations
export const swipeGestures = {
  onSwipeLeft: () => console.log('Swipe Left'),
  onSwipeRight: () => console.log('Swipe Right'),
  onSwipeUp: () => console.log('Swipe Up'),
  onSwipeDown: () => console.log('Swipe Down'),
};

export const tapGestures = {
  onTap: () => console.log('Tap'),
  onLongPress: () => console.log('Long Press'),
};

export const multiTouchGestures = {
  onPinch: (scale: number) => console.log('Pinch:', scale),
  onRotate: (angle: number) => console.log('Rotate:', angle),
};

// Gesture detection utilities
export const gestureUtils = {
  isSwipe: (start: TouchPoint, end: TouchPoint, threshold: number = 50): boolean => {
    const distance = getDistance(start, end);
    const time = end.time - start.time;
    return distance > threshold && time < 300;
  },

  getSwipeDirection: (start: TouchPoint, end: TouchPoint): string => {
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    if (absDeltaX > absDeltaY) {
      return deltaX > 0 ? 'right' : 'left';
    } else {
      return deltaY > 0 ? 'down' : 'up';
    }
  },

  getDistance: (start: TouchPoint, end: TouchPoint): number => {
    return getDistance(start, end);
  },

  getAngle: (start: TouchPoint, end: TouchPoint): number => {
    return getAngle(start, end);
  }
};

// Helper function to get distance between two points
function getDistance(point1: TouchPoint, point2: TouchPoint): number {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Helper function to get angle between two points
function getAngle(point1: TouchPoint, point2: TouchPoint): number {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.atan2(dy, dx) * (180 / Math.PI);
}
