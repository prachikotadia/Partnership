import React from 'react';
import { cn } from '@/lib/utils';

interface NeumorphicInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const NeumorphicInput: React.FC<NeumorphicInputProps> = ({
  className,
  variant = 'primary',
  size = 'md',
  ...props
}) => {
  const variants = {
    primary: 'bg-gray-100 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]',
    secondary: 'bg-gray-200 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]'
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  };

  return (
    <input
      className={cn(
        'w-full rounded-2xl border-0 focus:outline-none focus:ring-0 text-gray-700 placeholder-gray-500 transition-all duration-200',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
};
