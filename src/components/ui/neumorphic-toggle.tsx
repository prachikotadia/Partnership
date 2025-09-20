import React, { useState } from 'react';

interface NeumorphicToggleProps {
  options: string[];
  selected?: string;
  onSelect?: (option: string) => void;
  className?: string;
}

export const NeumorphicToggle: React.FC<NeumorphicToggleProps> = ({
  options,
  selected,
  onSelect,
  className = ''
}) => {
  const [activeOption, setActiveOption] = useState(selected || options[0]);

  const handleSelect = (option: string) => {
    setActiveOption(option);
    onSelect?.(option);
  };

  return (
    <div className={`flex rounded-2xl bg-gray-100 p-1 ${className}`}>
      {options.map((option) => (
        <button
          key={option}
          onClick={() => handleSelect(option)}
          className={`px-4 py-2 rounded-xl transition-all duration-200 ${
            activeOption === option
              ? 'bg-gradient-to-r from-teal-400 to-blue-500 text-white shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2),inset_-2px_-2px_4px_rgba(255,255,255,0.2)]'
              : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
};