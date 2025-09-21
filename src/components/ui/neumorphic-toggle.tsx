import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface NeumorphicToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'purple' | 'red';
  disabled?: boolean;
  className?: string;
}

export const NeumorphicToggle: React.FC<NeumorphicToggleProps> = ({
  checked,
  onChange,
  size = 'md',
  color = 'blue',
  disabled = false,
  className,
}) => {
  const sizes = {
    sm: 'w-10 h-6',
    md: 'w-12 h-7',
    lg: 'w-14 h-8',
  };

  const colors = {
    blue: checked ? 'bg-blue-500' : 'bg-gray-300',
    green: checked ? 'bg-green-500' : 'bg-gray-300',
    purple: checked ? 'bg-purple-500' : 'bg-gray-300',
    red: checked ? 'bg-red-500' : 'bg-gray-300',
  };

  const thumbSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const thumbPositions = {
    sm: checked ? 'translate-x-4' : 'translate-x-0',
    md: checked ? 'translate-x-5' : 'translate-x-0',
    lg: checked ? 'translate-x-6' : 'translate-x-0',
  };

  return (
    <button
      className={cn(
        'relative inline-flex items-center rounded-full transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
        sizes[size],
        colors[color],
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        className
      )}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
    >
      <span
        className={cn(
          'inline-block rounded-full bg-white shadow-lg transform transition-transform duration-300 ease-out',
          thumbSizes[size],
          thumbPositions[size]
        )}
      />
    </button>
  );
};
