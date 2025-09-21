import React from 'react';

interface NeumorphicInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  type?: 'text' | 'search';
  icon?: React.ReactNode;
  variant?: 'elevated' | 'pressed';
}

export const NeumorphicInput: React.FC<NeumorphicInputProps> = ({
  placeholder,
  value,
  onChange,
  className = '',
  type = 'text',
  icon,
  variant = 'elevated'
}) => {
  const theme = 'light'; // Default theme for now

  const getVariantStyles = () => {
    if (variant === 'pressed') {
      return theme === 'dark'
        ? 'bg-gray-800 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.8),inset_-2px_-2px_4px_rgba(255,255,255,0.1)]'
        : 'bg-gray-100 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]';
    }
    return theme === 'dark'
      ? 'bg-gray-800 shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.1),inset_2px_2px_4px_rgba(0,0,0,0.8)]'
      : 'bg-gray-100 shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(0,0,0,0.1)]';
  };

  return (
    <div className={`relative ${className}`}>
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
          {icon}
        </div>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className={`
          w-full px-4 py-3 rounded-xl border-0 outline-none transition-all duration-200
          ${getVariantStyles()}
          ${icon ? 'pl-10' : ''}
          ${theme === 'dark' ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'}
          focus:shadow-lg
        `}
      />
    </div>
  );
};