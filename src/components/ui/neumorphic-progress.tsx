import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface NeumorphicProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  label?: string;
  className?: string;
}

export const NeumorphicProgress: React.FC<NeumorphicProgressProps> = ({
  value,
  max = 100,
  size = 'md',
  showPercentage = true,
  label,
  className = ''
}) => {
  const { theme } = useTheme();
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'w-16 h-16';
      case 'md':
        return 'w-24 h-24';
      case 'lg':
        return 'w-32 h-32';
      default:
        return 'w-24 h-24';
    }
  };

  const getTextSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'text-xs';
      case 'md':
        return 'text-sm';
      case 'lg':
        return 'text-base';
      default:
        return 'text-sm';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className={`
        ${getSizeStyles()}
        rounded-full relative
        ${theme === 'dark'
          ? 'bg-gray-800 shadow-[inset_-4px_-4px_8px_rgba(255,255,255,0.1),inset_4px_4px_8px_rgba(0,0,0,0.8)]'
          : 'bg-gray-100 shadow-[inset_-4px_-4px_8px_rgba(255,255,255,0.8),inset_4px_4px_8px_rgba(0,0,0,0.1)]'
        }
      `}>
        {/* Progress Circle */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className={theme === 'dark' ? 'text-gray-700' : 'text-gray-300'}
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 40}`}
            strokeDashoffset={`${2 * Math.PI * 40 * (1 - percentage / 100)}`}
            className="transition-all duration-500"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#14b8a6" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {showPercentage && (
            <div className={`
              font-bold
              ${getTextSizeStyles()}
              ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
            `}>
              {Math.round(percentage)}%
            </div>
          )}
          {label && (
            <div className={`
              text-center mt-1
              ${getTextSizeStyles()}
              ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}
            `}>
              {label}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};