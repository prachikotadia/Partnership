import React from 'react';
import { Input, InputProps } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface GlassmorphismInputProps extends Omit<InputProps, 'className'> {
  variant?: 'glass' | 'glass-primary' | 'glass-secondary';
  className?: string;
}

export const GlassmorphismInput: React.FC<GlassmorphismInputProps> = ({
  className,
  variant = 'glass',
  ...props
}) => {
  const variants = {
    glass: 'bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder:text-white/60 focus:border-white/40',
    'glass-primary': 'bg-yellow-400/20 backdrop-blur-md border border-yellow-400/30 text-white placeholder:text-white/60 focus:border-yellow-400/50',
    'glass-secondary': 'bg-amber-800/20 backdrop-blur-md border border-amber-800/30 text-white placeholder:text-white/60 focus:border-amber-800/50',
  };

  return (
    <Input
      className={cn(
        'backdrop-blur-md transition-all duration-300 focus:scale-105',
        variants[variant],
        className
      )}
      {...props}
    />
  );
};
