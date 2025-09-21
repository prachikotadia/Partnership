import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface DropdownOption {
  value: string;
  label: string;
}

interface NeumorphicDropdownProps {
  options: DropdownOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const NeumorphicDropdown: React.FC<NeumorphicDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select option',
  className = ''
}) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(option => option.value === value);

  const handleOptionClick = (optionValue: string) => {
    onChange?.(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full px-4 py-3 rounded-xl border-0 outline-none transition-all duration-200
          flex items-center justify-between
          ${theme === 'dark' 
            ? 'bg-gray-800 shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.1),inset_2px_2px_4px_rgba(0,0,0,0.8)] text-white' 
            : 'bg-gray-100 shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(0,0,0,0.1)] text-gray-900'
          }
          hover:shadow-lg
        `}
      >
        <span className={selectedOption ? '' : 'text-gray-500'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>

      {isOpen && (
        <div className={`
          absolute top-full left-0 right-0 mt-2 rounded-xl border-0 z-50
          ${theme === 'dark' 
            ? 'bg-gray-800 shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.1),inset_2px_2px_4px_rgba(0,0,0,0.8)]' 
            : 'bg-gray-100 shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(0,0,0,0.1)]'
          }
        `}>
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleOptionClick(option.value)}
              className={`
                w-full px-4 py-3 text-left transition-colors duration-200
                ${theme === 'dark' ? 'text-white hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-200'}
                first:rounded-t-xl last:rounded-b-xl
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
