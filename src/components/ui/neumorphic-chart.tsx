import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface NeumorphicChartProps {
  data: ChartData[];
  type?: 'bar' | 'line';
  className?: string;
}

export const NeumorphicChart: React.FC<NeumorphicChartProps> = ({
  data,
  type = 'bar',
  className = ''
}) => {
  const { theme } = useTheme();

  const maxValue = Math.max(...data.map(d => d.value));

  if (type === 'bar') {
    return (
      <div className={`
        p-4 rounded-2xl
        ${theme === 'dark'
          ? 'bg-gray-800 shadow-[inset_-4px_-4px_8px_rgba(255,255,255,0.1),inset_4px_4px_8px_rgba(0,0,0,0.8)]'
          : 'bg-gray-100 shadow-[inset_-4px_-4px_8px_rgba(255,255,255,0.8),inset_4px_4px_8px_rgba(0,0,0,0.1)]'
        }
        ${className}
      `}>
        <div className="flex items-end justify-between h-32 gap-2">
          {data.map((item, index) => {
            const height = (item.value / maxValue) * 100;
            const isHighlighted = index === 2; // Highlight 2019 as in the image
            
            return (
              <div key={item.label} className="flex flex-col items-center flex-1">
                <div className="relative w-full flex flex-col items-center">
                  <div
                    className={`
                      w-full rounded-t-lg transition-all duration-500
                      ${isHighlighted
                        ? 'bg-gradient-to-t from-teal-400 to-blue-500 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2),inset_-2px_-2px_4px_rgba(255,255,255,0.1)]'
                        : theme === 'dark'
                          ? 'bg-gray-600 shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.1),inset_2px_2px_4px_rgba(0,0,0,0.8)]'
                          : 'bg-gray-300 shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(0,0,0,0.1)]'
                      }
                    `}
                    style={{ height: `${height}%` }}
                  />
                  {isHighlighted && (
                    <div className="absolute -bottom-1 w-2 h-2 rounded-full bg-teal-400" />
                  )}
                </div>
                <div className={`
                  mt-2 text-xs font-medium
                  ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}
                `}>
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Line chart implementation
  return (
    <div className={`
      p-4 rounded-2xl
      ${theme === 'dark'
        ? 'bg-gray-800 shadow-[inset_-4px_-4px_8px_rgba(255,255,255,0.1),inset_4px_4px_8px_rgba(0,0,0,0.8)]'
        : 'bg-gray-100 shadow-[inset_-4px_-4px_8px_rgba(255,255,255,0.8),inset_4px_4px_8px_rgba(0,0,0,0.1)]'
      }
      ${className}
    `}>
      <div className="h-32 relative">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={data.map((item, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = 100 - (item.value / maxValue) * 100;
              return `${x},${y}`;
            }).join(' ')}
          />
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#14b8a6" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};
