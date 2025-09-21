import React, { useState, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface NeumorphicSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export const NeumorphicSlider: React.FC<NeumorphicSliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  className = ''
}) => {
  const { theme } = useTheme();
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const percentage = ((value - min) / (max - min)) * 100;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updateValue(e);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      updateValue(e);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const updateValue = (e: MouseEvent | React.MouseEvent) => {
    if (!sliderRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const newValue = min + (percentage / 100) * (max - min);
    const steppedValue = Math.round(newValue / step) * step;
    
    onChange(Math.max(min, Math.min(max, steppedValue)));
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <div className={`relative ${className}`}>
      <div
        ref={sliderRef}
        className={`
          w-full h-2 rounded-full cursor-pointer
          ${theme === 'dark'
            ? 'bg-gray-800 shadow-[inset_-1px_-1px_2px_rgba(255,255,255,0.1),inset_1px_1px_2px_rgba(0,0,0,0.8)]'
            : 'bg-gray-100 shadow-[inset_-1px_-1px_2px_rgba(255,255,255,0.8),inset_1px_1px_2px_rgba(0,0,0,0.1)]'
          }
        `}
        onMouseDown={handleMouseDown}
      >
        <div
          className={`
            h-full rounded-full transition-all duration-200
            bg-gradient-to-r from-teal-400 to-blue-500
            ${isDragging ? 'shadow-lg' : ''}
          `}
          style={{ width: `${percentage}%` }}
        />
        <div
          className={`
            absolute top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full cursor-pointer
            bg-white shadow-[2px_2px_4px_rgba(0,0,0,0.2)]
            transition-all duration-200
            ${isDragging ? 'scale-110 shadow-lg' : 'hover:scale-105'}
          `}
          style={{ left: `calc(${percentage}% - 8px)` }}
        />
      </div>
    </div>
  );
};
