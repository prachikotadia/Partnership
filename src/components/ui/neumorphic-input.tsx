import React from 'react';
import { Input, InputProps } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface NeumorphicInputProps extends Omit<InputProps, 'className'> {
  variant?: 'default' | 'search' | 'large';
  className?: string;
  icon?: React.ReactNode;
}

export const NeumorphicInput: React.FC<NeumorphicInputProps> = ({
  className,
  variant = 'default',
  icon,
  ...props
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800 placeholder:text-gray-500 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] focus:shadow-[inset_6px_6px_12px_rgba(0,0,0,0.15),inset_-6px_-6px_12px_rgba(255,255,255,0.9)]',
    search: 'bg-gray-100 text-gray-800 placeholder:text-gray-500 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] focus:shadow-[inset_6px_6px_12px_rgba(0,0,0,0.15),inset_-6px_-6px_12px_rgba(255,255,255,0.9)] pl-10',
    large: 'bg-gray-100 text-gray-800 placeholder:text-gray-500 shadow-[inset_6px_6px_12px_rgba(0,0,0,0.1),inset_-6px_-6px_12px_rgba(255,255,255,0.8)] focus:shadow-[inset_8px_8px_16px_rgba(0,0,0,0.15),inset_-8px_-8px_16px_rgba(255,255,255,0.9)] text-lg',
  };

  const sizeClasses = {
    default: 'h-10 px-4 rounded-2xl',
    search: 'h-10 px-4 rounded-2xl',
    large: 'h-12 px-6 rounded-3xl',
  };

  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
          {icon}
        </div>
      )}
      <Input
        className={cn(
          'border-0 transition-all duration-300 ease-out focus:ring-0',
          variants[variant],
          sizeClasses[variant],
          className
        )}
        {...props}
      />
    </div>
  );
};
