import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export const TestTheme: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className={`
      min-h-screen flex items-center justify-center
      ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}
    `}>
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">
          Theme Test
        </h1>
        <p className="text-lg mb-4">
          Current theme: {theme}
        </p>
        <button
          onClick={toggleTheme}
          className={`
            px-6 py-3 rounded-2xl font-medium transition-all duration-300
            ${theme === 'dark' 
              ? 'bg-gray-800 text-white shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.1),inset_2px_2px_4px_rgba(0,0,0,0.8)]' 
              : 'bg-gray-100 text-gray-900 shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(0,0,0,0.1)]'
            }
            hover:scale-105 active:scale-95
          `}
        >
          Toggle Theme
        </button>
      </div>
    </div>
  );
};
