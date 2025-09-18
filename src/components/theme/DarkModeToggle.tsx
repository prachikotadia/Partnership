import React, { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { NeumorphicButton } from '@/components/ui/neumorphic-button';
import { NeumorphicCard } from '@/components/ui/neumorphic-card';

type Theme = 'light' | 'dark' | 'system';

interface DarkModeToggleProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const DarkModeToggle: React.FC<DarkModeToggleProps> = ({
  className = "",
  showLabel = true,
  size = 'md'
}) => {
  const [theme, setTheme] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Get saved theme from localStorage
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // Check system preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(systemPrefersDark ? 'dark' : 'light');
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    
    switch (theme) {
      case 'light':
        root.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        break;
      case 'dark':
        root.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        break;
      case 'system':
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (systemPrefersDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
        localStorage.setItem('theme', 'system');
        break;
    }
  }, [theme, mounted]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        const root = document.documentElement;
        if (mediaQuery.matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const cycleTheme = () => {
    setTheme(prev => {
      switch (prev) {
        case 'light': return 'dark';
        case 'dark': return 'system';
        case 'system': return 'light';
        default: return 'light';
      }
    });
  };

  const getIcon = () => {
    switch (theme) {
      case 'light': return Sun;
      case 'dark': return Moon;
      case 'system': return Monitor;
      default: return Sun;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'light': return 'Light';
      case 'dark': return 'Dark';
      case 'system': return 'System';
      default: return 'Light';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'h-8 w-8 p-1';
      case 'md': return 'h-10 w-10 p-2';
      case 'lg': return 'h-12 w-12 p-3';
      default: return 'h-10 w-10 p-2';
    }
  };

  if (!mounted) {
    return (
      <div className={`${getSizeClasses()} ${className}`}>
        <div className="animate-pulse bg-gray-200 rounded-full h-full w-full" />
      </div>
    );
  }

  const Icon = getIcon();

  return (
    <NeumorphicButton
      onClick={cycleTheme}
      className={`${getSizeClasses()} ${className}`}
      title={`Current theme: ${getLabel()}. Click to cycle through themes.`}
    >
      <Icon className="h-full w-full" />
      {showLabel && (
        <span className="ml-2 text-sm font-medium">
          {getLabel()}
        </span>
      )}
    </NeumorphicButton>
  );
};

// Theme Provider Component
interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-white">{children}</div>;
  }

  return <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">{children}</div>;
};

// Theme-aware component wrapper
interface ThemeAwareProps {
  children: React.ReactNode;
  lightClassName?: string;
  darkClassName?: string;
  className?: string;
}

export const ThemeAware: React.FC<ThemeAwareProps> = ({
  children,
  lightClassName = "",
  darkClassName = "",
  className = ""
}) => {
  return (
    <div className={`${lightClassName} dark:${darkClassName} ${className}`}>
      {children}
    </div>
  );
};

// Dark mode styles for the app
export const darkModeStyles = `
  /* Dark mode base styles */
  .dark {
    color-scheme: dark;
  }

  .dark body {
    background-color: #111827;
    color: #f9fafb;
  }

  /* Dark mode neumorphic adjustments */
  .dark .neumorphic-card {
    background: #1f2937;
    box-shadow: 
      8px 8px 16px #0f172a,
      -8px -8px 16px #374151;
  }

  .dark .neumorphic-button {
    background: #1f2937;
    color: #f9fafb;
  }

  .dark .neumorphic-button:hover {
    background: #374151;
  }

  .dark .neumorphic-input {
    background: #1f2937;
    color: #f9fafb;
    border-color: #374151;
  }

  .dark .neumorphic-input:focus {
    border-color: #3b82f6;
  }

  /* Dark mode text colors */
  .dark .text-gray-900 {
    color: #f9fafb;
  }

  .dark .text-gray-700 {
    color: #d1d5db;
  }

  .dark .text-gray-600 {
    color: #9ca3af;
  }

  .dark .text-gray-500 {
    color: #6b7280;
  }

  /* Dark mode background colors */
  .dark .bg-white {
    background-color: #111827;
  }

  .dark .bg-gray-50 {
    background-color: #1f2937;
  }

  .dark .bg-gray-100 {
    background-color: #374151;
  }

  /* Dark mode border colors */
  .dark .border-gray-200 {
    border-color: #374151;
  }

  .dark .border-gray-300 {
    border-color: #4b5563;
  }

  /* Dark mode scrollbar */
  .dark ::-webkit-scrollbar {
    width: 8px;
  }

  .dark ::-webkit-scrollbar-track {
    background: #1f2937;
  }

  .dark ::-webkit-scrollbar-thumb {
    background: #4b5563;
    border-radius: 4px;
  }

  .dark ::-webkit-scrollbar-thumb:hover {
    background: #6b7280;
  }
`;

// Inject dark mode styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = darkModeStyles;
  document.head.appendChild(styleSheet);
}
