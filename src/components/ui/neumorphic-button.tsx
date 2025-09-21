import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface NeumorphicButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
  icon?: React.ReactNode;
}

export const NeumorphicButton: React.FC<NeumorphicButtonProps> = ({
  children,
  onClick,
  className = '',
  variant = 'secondary',
  size = 'md',
  active = false,
  icon
}) => {
  const { theme } = useTheme();

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2 text-sm rounded-lg';
      case 'md':
        return 'px-4 py-3 text-base rounded-xl';
      case 'lg':
        return 'px-6 py-4 text-lg rounded-2xl';
      default:
        return 'px-4 py-3 text-base rounded-xl';
    }
  };

  const getVariantStyles = () => {
    if (variant === 'primary') {
      return active
        ? 'bg-gradient-to-r from-teal-400 to-blue-500 text-white shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2),inset_-2px_-2px_4px_rgba(255,255,255,0.1)]'
        : 'bg-gradient-to-r from-teal-400 to-blue-500 text-white shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.1),inset_2px_2px_4px_rgba(0,0,0,0.2)]';
    }
    
    if (variant === 'icon') {
      return active
        ? theme === 'dark'
          ? 'bg-gray-700 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.8),inset_-2px_-2px_4px_rgba(255,255,255,0.1)]'
          : 'bg-gray-200 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]'
        : theme === 'dark'
          ? 'bg-gray-800 shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.1),inset_2px_2px_4px_rgba(0,0,0,0.8)]'
          : 'bg-gray-100 shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(0,0,0,0.1)]';
    }

    return active
      ? theme === 'dark'
        ? 'bg-gray-700 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.8),inset_-2px_-2px_4px_rgba(255,255,255,0.1)]'
        : 'bg-gray-200 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]'
      : theme === 'dark'
        ? 'bg-gray-800 shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.1),inset_2px_2px_4px_rgba(0,0,0,0.8)]'
        : 'bg-gray-100 shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(0,0,0,0.1)]';
  };

  return (
    <button
      onClick={onClick}
      className={`
        ${getSizeStyles()}
        ${getVariantStyles()}
        ${className}
        transition-all duration-200
        hover:scale-105 active:scale-95
        flex items-center justify-center gap-2
        ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
      `}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
};