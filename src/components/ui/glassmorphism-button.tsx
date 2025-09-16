import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GlassmorphismButtonProps extends ButtonProps {
  variant?: 'glass' | 'glass-primary' | 'glass-secondary' | 'glass-accent';
  size?: 'sm' | 'md' | 'lg';
}

export const GlassmorphismButton: React.FC<GlassmorphismButtonProps> = ({
  children,
  className,
  variant = 'glass',
  size = 'md',
  ...props
}) => {
  const variants = {
    glass: 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20',
    'glass-primary': 'bg-yellow-400/20 backdrop-blur-md border border-yellow-400/30 text-white hover:bg-yellow-400/30',
    'glass-secondary': 'bg-amber-800/20 backdrop-blur-md border border-amber-800/30 text-white hover:bg-amber-800/30',
    'glass-accent': 'bg-amber-100/20 backdrop-blur-md border border-amber-100/30 text-white hover:bg-amber-100/30',
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
  };

  return (
    <Button
      className={cn(
        'backdrop-blur-md transition-all duration-300 hover:scale-105 hover:shadow-lg',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
};
