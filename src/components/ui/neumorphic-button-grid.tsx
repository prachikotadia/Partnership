import React from 'react';
import { Check, ArrowUp, Menu, Square, ArrowDown, X } from 'lucide-react';

interface NeumorphicButtonGridProps {
  className?: string;
}

export const NeumorphicButtonGrid: React.FC<NeumorphicButtonGridProps> = ({ className = '' }) => {
  const buttons = [
    { icon: Check, label: 'Check' },
    { icon: ArrowUp, label: 'Up' },
    { icon: Menu, label: 'Menu' },
    { icon: Square, label: 'Square' },
    { icon: ArrowDown, label: 'Down' },
    { icon: X, label: 'Close' }
  ];

  return (
    <div className={`grid grid-cols-3 gap-3 ${className}`}>
      {buttons.map((button, index) => {
        const Icon = button.icon;
        return (
          <button
            key={index}
            className="w-12 h-12 rounded-2xl bg-gray-100 shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(0,0,0,0.1)] hover:shadow-[inset_-1px_-1px_2px_rgba(255,255,255,0.8),inset_1px_1px_2px_rgba(0,0,0,0.1)] active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] transition-all duration-200 flex items-center justify-center"
            title={button.label}
          >
            <Icon className="w-5 h-5 text-gray-600" />
          </button>
        );
      })}
    </div>
  );
};
