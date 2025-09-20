import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface NeumorphicCardEnhancedProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'elevated' | 'pressed' | 'flat';
  size?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  active?: boolean;
}

export const NeumorphicCardEnhanced: React.FC<NeumorphicCardEnhancedProps> = ({
  children,
  className = '',
  variant = 'elevated',
  size = 'md',
  hover = true,
  active = false
}) => {
  const { theme } = useTheme();

  const getVariantStyles = () => {
    const baseStyles = theme === 'dark' 
      ? 'bg-gray-900' 
      : 'bg-gray-50';

    switch (variant) {
      case 'elevated':
        return `${baseStyles} ${
          theme === 'dark'
            ? 'shadow-[inset_-4px_-4px_8px_rgba(255,255,255,0.1),inset_4px_4px_8px_rgba(0,0,0,0.8)]'
            : 'shadow-[inset_-4px_-4px_8px_rgba(255,255,255,0.8),inset_4px_4px_8px_rgba(0,0,0,0.1)]'
        }`;
      case 'pressed':
        return `${baseStyles} ${
          theme === 'dark'
            ? 'shadow-[inset_4px_4px_8px_rgba(0,0,0,0.8),inset_-4px_-4px_8px_rgba(255,255,255,0.1)]'
            : 'shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.8)]'
        }`;
      case 'flat':
        return `${baseStyles} shadow-none`;
      default:
        return baseStyles;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'p-3 rounded-xl';
      case 'md':
        return 'p-4 rounded-2xl';
      case 'lg':
        return 'p-6 rounded-3xl';
      default:
        return 'p-4 rounded-2xl';
    }
  };

  const getHoverStyles = () => {
    if (!hover) return '';
    return 'hover:scale-[1.02] hover:shadow-lg transition-all duration-300';
  };

  const getActiveStyles = () => {
    if (!active) return '';
    return 'scale-[0.98]';
  };

  return (
    <div className={`
      ${getVariantStyles()}
      ${getSizeStyles()}
      ${getHoverStyles()}
      ${getActiveStyles()}
      ${className}
    `}>
      {children}
    </div>
  );
};
