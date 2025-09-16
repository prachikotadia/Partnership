import React from 'react';
import { cn } from '@/lib/utils';

interface GlassmorphismCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'yellow' | 'brown' | 'beige';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const GlassmorphismCard: React.FC<GlassmorphismCardProps> = ({
  children,
  className,
  variant = 'default',
  size = 'md',
  onClick,
}) => {
  const variants = {
    default: 'bg-white/10 backdrop-blur-md border border-white/20',
    yellow: 'bg-yellow-400/20 backdrop-blur-md border border-yellow-400/30',
    brown: 'bg-amber-800/20 backdrop-blur-md border border-amber-800/30',
    beige: 'bg-amber-100/20 backdrop-blur-md border border-amber-100/30',
  };

  const sizes = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={cn(
        'rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105',
        variants[variant],
        sizes[size],
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
