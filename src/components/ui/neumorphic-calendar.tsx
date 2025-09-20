import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface NeumorphicCalendarProps {
  className?: string;
}

export const NeumorphicCalendar: React.FC<NeumorphicCalendarProps> = ({ className = '' }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const monthNames = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ];

  const days = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
  const dates = [
    [1, 2, 3, 4, 5, 6, 7],
    [8, 9, 10, 11, 12, 13, 14],
    [15, 16, 17, 18, 19, 20, 21],
    [22, 23, 24, 25, 26, 27, 28],
    [29, 30, 31]
  ];

  const highlightedDates = [8, 23];
  const rangeStart = 13;
  const rangeEnd = 19;

  const isInRange = (date: number) => date >= rangeStart && date <= rangeEnd;
  const isHighlighted = (date: number) => highlightedDates.includes(date);

  return (
    <div className={`bg-gray-100 rounded-2xl p-4 shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(0,0,0,0.1)] ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          className="p-1 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        <h3 className="text-sm font-semibold text-gray-700">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button 
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          className="p-1 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {days.map((day) => (
          <div key={day} className="text-xs font-medium text-gray-500 text-center py-1">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {dates.map((week, weekIndex) =>
          week.map((date, dayIndex) => (
            <div
              key={`${weekIndex}-${dayIndex}`}
              className={`
                aspect-square flex items-center justify-center text-xs font-medium rounded-lg transition-colors
                ${isHighlighted(date) 
                  ? 'bg-blue-100 text-blue-600' 
                  : isInRange(date)
                  ? 'bg-blue-50 text-blue-500'
                  : 'text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              {date}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
