import React from 'react';

interface NeumorphicChartProps {
  data: { label: string; value: number; highlighted?: boolean }[];
  className?: string;
}

export const NeumorphicChart: React.FC<NeumorphicChartProps> = ({ data, className = '' }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className={`bg-gray-100 rounded-2xl p-4 shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(0,0,0,0.1)] ${className}`}>
      <div className="flex items-end justify-between h-32 gap-2">
        {data.map((item, index) => {
          const height = (item.value / maxValue) * 100;
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="relative w-full flex flex-col items-center">
                <div 
                  className={`w-full rounded-t-lg transition-all duration-500 ${
                    item.highlighted 
                      ? 'bg-gradient-to-t from-teal-400 to-blue-500' 
                      : 'bg-gray-300'
                  }`}
                  style={{ height: `${height}%` }}
                />
                {item.highlighted && (
                  <div className="absolute -bottom-1 w-2 h-2 bg-teal-400 rounded-full" />
                )}
              </div>
              <span className="text-xs text-gray-600 mt-2">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
