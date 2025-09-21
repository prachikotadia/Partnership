import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface NeumorphicToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const NeumorphicToggle: React.FC<NeumorphicToggleProps> = ({
  checked,
  onChange,
  className = '',
  size = 'md'
}) => {
  const { theme } = useTheme();

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'w-8 h-4';
      case 'md':
        return 'w-12 h-6';
      case 'lg':
        return 'w-16 h-8';
      default:
        return 'w-12 h-6';
    }
  };

  const getThumbSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'w-3 h-3';
      case 'md':
        return 'w-5 h-5';
      case 'lg':
        return 'w-7 h-7';
      default:
        return 'w-5 h-5';
    }
  };

  return (
    <button
      onClick={() => onChange(!checked)}
      className={`
        ${getSizeStyles()}
        ${className}
        rounded-full transition-all duration-300
        ${checked
          ? 'bg-gradient-to-r from-teal-400 to-blue-500 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2),inset_-2px_-2px_4px_rgba(255,255,255,0.1)]'
          : theme === 'dark'
            ? 'bg-gray-800 shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.1),inset_2px_2px_4px_rgba(0,0,0,0.8)]'
            : 'bg-gray-100 shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(0,0,0,0.1)]'
        }
        focus:outline-none
      `}
    >
      <div
        className={`
          ${getThumbSizeStyles()}
          rounded-full transition-all duration-300
          ${checked
            ? 'bg-white shadow-[2px_2px_4px_rgba(0,0,0,0.2)] transform translate-x-6'
            : theme === 'dark'
              ? 'bg-gray-600 shadow-[2px_2px_4px_rgba(0,0,0,0.8)] transform translate-x-0'
              : 'bg-white shadow-[2px_2px_4px_rgba(0,0,0,0.1)] transform translate-x-0'
          }
        `}
      />
    </button>
  );
};