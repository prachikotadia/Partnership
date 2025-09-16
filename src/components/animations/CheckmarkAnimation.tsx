import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';

interface CheckmarkAnimationProps {
  isActive: boolean;
  onComplete: () => void;
  duration?: number;
  size?: number;
  color?: string;
}

export const CheckmarkAnimation: React.FC<CheckmarkAnimationProps> = ({
  isActive,
  onComplete,
  duration = 1000,
  size = 48,
  color = '#10b981'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    if (isActive) {
      setIsVisible(true);
      
      // Animate scale
      const timer1 = setTimeout(() => {
        setScale(1);
      }, 100);

      // Complete animation
      const timer2 = setTimeout(() => {
        setIsVisible(false);
        setScale(0);
        onComplete();
      }, duration);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [isActive, duration, onComplete]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
      <div
        className="bg-white rounded-full shadow-lg flex items-center justify-center"
        style={{
          width: size,
          height: size,
          transform: `scale(${scale})`,
          transition: 'transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        }}
      >
        <Check 
          size={size * 0.6} 
          color={color}
          strokeWidth={3}
        />
      </div>
    </div>
  );
};
