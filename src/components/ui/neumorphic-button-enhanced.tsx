import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface NeumorphicButtonEnhancedProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  active?: boolean;
  icon?: React.ReactNode;
}

export const NeumorphicButtonEnhanced: React.FC<NeumorphicButtonEnhancedProps> = ({
  children,
  onClick,
  className = '',
  variant = 'primary',
  size = 'md',
  disabled = false,
  active = false,
  icon
}) => {
  const { theme } = useTheme();

  const getVariantStyles = () => {
    const baseStyles = theme === 'dark' 
      ? 'bg-gray-800' 
      : 'bg-gray-100';

    const colorStyles = {
      primary: 'text-blue-600 dark:text-blue-400',
      secondary: 'text-gray-600 dark:text-gray-300',
      success: 'text-green-600 dark:text-green-400',
      warning: 'text-yellow-600 dark:text-yellow-400',
      danger: 'text-red-600 dark:text-red-400'
    };

    return `${baseStyles} ${colorStyles[variant]}`;
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2 text-sm rounded-xl';
      case 'md':
        return 'px-4 py-3 text-base rounded-2xl';
      case 'lg':
        return 'px-6 py-4 text-lg rounded-3xl';
      default:
        return 'px-4 py-3 text-base rounded-2xl';
    }
  };

  const getShadowStyles = () => {
    if (disabled) return 'shadow-none';
    if (active) {
      return theme === 'dark'
        ? 'shadow-[inset_2px_2px_4px_rgba(0,0,0,0.8),inset_-2px_-2px_4px_rgba(255,255,255,0.1)]'
        : 'shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]';
    }
    return theme === 'dark'
      ? 'shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.1),inset_2px_2px_4px_rgba(0,0,0,0.8)]'
      : 'shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(0,0,0,0.1)]';
  };

  const getHoverStyles = () => {
    if (disabled) return '';
    return 'hover:scale-105 active:scale-95 transition-all duration-200';
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${getVariantStyles()}
        ${getSizeStyles()}
        ${getShadowStyles()}
        ${getHoverStyles()}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
        flex items-center justify-center gap-2
      `}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
