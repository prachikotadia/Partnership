import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface NeumorphicCalendarProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  className?: string;
}

export const NeumorphicCalendar: React.FC<NeumorphicCalendarProps> = ({
  selectedDate,
  onDateSelect,
  className = ''
}) => {
  const { theme } = useTheme();
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date());

  const monthNames = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ];

  const dayNames = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    onDateSelect?.(clickedDate);
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentDate.getMonth() &&
      selectedDate.getFullYear() === currentDate.getFullYear()
    );
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === currentDate.getMonth() &&
      today.getFullYear() === currentDate.getFullYear()
    );
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className={`
      p-4 rounded-2xl
      ${theme === 'dark'
        ? 'bg-gray-800 shadow-[inset_-4px_-4px_8px_rgba(255,255,255,0.1),inset_4px_4px_8px_rgba(0,0,0,0.8)]'
        : 'bg-gray-100 shadow-[inset_-4px_-4px_8px_rgba(255,255,255,0.8),inset_4px_4px_8px_rgba(0,0,0,0.1)]'
      }
      ${className}
    `}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePreviousMonth}
          className={`
            p-2 rounded-xl transition-all duration-200
            ${theme === 'dark'
              ? 'bg-gray-700 shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.1),inset_2px_2px_4px_rgba(0,0,0,0.8)] hover:bg-gray-600'
              : 'bg-gray-200 shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(0,0,0,0.1)] hover:bg-gray-300'
            }
          `}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        <h3 className={`
          font-semibold text-sm
          ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
        `}>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        
        <button
          onClick={handleNextMonth}
          className={`
            p-2 rounded-xl transition-all duration-200
            ${theme === 'dark'
              ? 'bg-gray-700 shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.1),inset_2px_2px_4px_rgba(0,0,0,0.8)] hover:bg-gray-600'
              : 'bg-gray-200 shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(0,0,0,0.1)] hover:bg-gray-300'
            }
          `}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className={`
              text-center text-xs font-medium py-2
              ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}
            `}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => (
          <button
            key={index}
            onClick={() => day && handleDateClick(day)}
            disabled={!day}
            className={`
              w-8 h-8 rounded-lg text-sm transition-all duration-200
              ${!day ? 'invisible' : ''}
              ${isSelected(day!) 
                ? 'bg-gradient-to-r from-teal-400 to-blue-500 text-white shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2),inset_-2px_-2px_4px_rgba(255,255,255,0.1)]'
                : isToday(day!)
                  ? theme === 'dark'
                    ? 'bg-gray-700 text-white shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.1),inset_2px_2px_4px_rgba(0,0,0,0.8)]'
                    : 'bg-gray-200 text-gray-900 shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(0,0,0,0.1)]'
                  : theme === 'dark'
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
};
