import React, { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';

interface NeumorphicInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: 'text' | 'search' | 'dropdown';
  options?: string[];
  className?: string;
  disabled?: boolean;
}

export const NeumorphicInput: React.FC<NeumorphicInputProps> = ({
  placeholder = "Lorem Ipsum",
  value = "",
  onChange,
  type = 'text',
  options = [],
  className = '',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(newValue);
  };

  const handleOptionSelect = (option: string) => {
    setInputValue(option);
    onChange?.(option);
    setIsOpen(false);
  };

  if (type === 'search') {
    return (
      <div className={`relative ${className}`}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder={placeholder}
            value={inputValue}
            onChange={handleInputChange}
            disabled={disabled}
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-gray-100 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] border-0 focus:outline-none focus:ring-0 text-gray-700 placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>
    );
  }

  if (type === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className="w-full px-4 py-3 rounded-2xl bg-gray-100 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] border-0 focus:outline-none focus:ring-0 text-gray-700 flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{inputValue || placeholder}</span>
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl bg-gray-100 shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-gray-200 z-10">
            <div className="p-2">
              <div className="px-3 py-2 text-sm font-medium text-gray-700 border-b border-gray-200">
                {placeholder}
                <ChevronDown className="inline w-3 h-3 ml-1 rotate-180" />
              </div>
              {options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(option)}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-200 transition-colors text-gray-700"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      <input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        disabled={disabled}
        className="w-full px-4 py-3 rounded-2xl bg-gray-100 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] border-0 focus:outline-none focus:ring-0 text-gray-700 placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  );
};