import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NeumorphicButtonProps extends Omit<ButtonProps, 'className'> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  icon?: React.ReactNode;
}

export const NeumorphicButton: React.FC<NeumorphicButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  icon,
  ...props
}) => {
  const variants = {
    primary: 'bg-blue-500 text-white shadow-[8px_8px_16px_rgba(59,130,246,0.3),-8px_-8px_16px_rgba(255,255,255,0.1)] hover:shadow-[12px_12px_24px_rgba(59,130,246,0.4),-12px_-12px_24px_rgba(255,255,255,0.2)] active:shadow-[inset_4px_4px_8px_rgba(59,130,246,0.3),inset_-4px_-4px_8px_rgba(255,255,255,0.1)]',
    secondary: 'bg-gray-200 text-gray-700 shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.8)] hover:shadow-[12px_12px_24px_rgba(0,0,0,0.15),-12px_-12px_24px_rgba(255,255,255,0.9)] active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.8)]',
    accent: 'bg-purple-500 text-white shadow-[8px_8px_16px_rgba(147,51,234,0.3),-8px_-8px_16px_rgba(255,255,255,0.1)] hover:shadow-[12px_12px_24px_rgba(147,51,234,0.4),-12px_-12px_24px_rgba(255,255,255,0.2)] active:shadow-[inset_4px_4px_8px_rgba(147,51,234,0.3),inset_-4px_-4px_8px_rgba(255,255,255,0.1)]',
    danger: 'bg-red-500 text-white shadow-[8px_8px_16px_rgba(239,68,68,0.3),-8px_-8px_16px_rgba(255,255,255,0.1)] hover:shadow-[12px_12px_24px_rgba(239,68,68,0.4),-12px_-12px_24px_rgba(255,255,255,0.2)] active:shadow-[inset_4px_4px_8px_rgba(239,68,68,0.3),inset_-4px_-4px_8px_rgba(255,255,255,0.1)]',
    success: 'bg-green-500 text-white shadow-[8px_8px_16px_rgba(34,197,94,0.3),-8px_-8px_16px_rgba(255,255,255,0.1)] hover:shadow-[12px_12px_24px_rgba(34,197,94,0.4),-12px_-12px_24px_rgba(255,255,255,0.2)] active:shadow-[inset_4px_4px_8px_rgba(34,197,94,0.3),inset_-4px_-4px_8px_rgba(255,255,255,0.1)]',
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs rounded-2xl',
    md: 'h-10 px-4 text-sm rounded-2xl',
    lg: 'h-12 px-6 text-base rounded-3xl',
    xl: 'h-14 px-8 text-lg rounded-3xl',
  };

  return (
    <Button
      className={cn(
        'font-medium transition-all duration-300 ease-out border-0',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </Button>
  );
};
