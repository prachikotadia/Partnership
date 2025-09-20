import React, { useState } from 'react';

interface NeumorphicSliderProps {
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export const NeumorphicSlider: React.FC<NeumorphicSliderProps> = ({
  value = 50,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  className = ''
}) => {
  const [sliderValue, setSliderValue] = useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    setSliderValue(newValue);
    onChange?.(newValue);
  };

  const percentage = ((sliderValue - min) / (max - min)) * 100;

  return (
    <div className={`relative ${className}`}>
      <div className="relative h-2 bg-gray-200 rounded-full shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]">
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-teal-400 to-blue-500 rounded-full transition-all duration-200"
          style={{ width: `${percentage}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={sliderValue}
          onChange={handleChange}
          className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div 
          className="absolute top-1/2 w-4 h-4 bg-white rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.2)] transform -translate-y-1/2 transition-all duration-200"
          style={{ left: `calc(${percentage}% - 8px)` }}
        />
      </div>
    </div>
  );
};
