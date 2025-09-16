import React from 'react';
import { cn } from '@/lib/utils';

interface NeumorphicCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'elevated' | 'inset' | 'flat';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  interactive?: boolean;
}

export const NeumorphicCard: React.FC<NeumorphicCardProps> = ({
  children,
  className,
  variant = 'elevated',
  size = 'md',
  onClick,
  interactive = false,
}) => {
  const variants = {
    elevated: 'shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.8)]',
    inset: 'shadow-[inset_8px_8px_16px_rgba(0,0,0,0.1),inset_-8px_-8px_16px_rgba(255,255,255,0.8)]',
    flat: 'shadow-[4px_4px_8px_rgba(0,0,0,0.1),-4px_-4px_8px_rgba(255,255,255,0.8)]',
  };

  const sizes = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };

  const interactiveStyles = interactive ? 'hover:shadow-[12px_12px_24px_rgba(0,0,0,0.15),-12px_-12px_24px_rgba(255,255,255,0.9)] active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.8)]' : '';

  return (
    <div
      className={cn(
        'rounded-3xl bg-gray-100 transition-all duration-300 ease-out',
        variants[variant],
        sizes[size],
        interactive && 'cursor-pointer',
        interactiveStyles,
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
