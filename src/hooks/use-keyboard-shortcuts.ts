import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const matchingShortcut = shortcuts.find(shortcut => {
      return (
        shortcut.key.toLowerCase() === event.key.toLowerCase() &&
        !!shortcut.ctrlKey === event.ctrlKey &&
        !!shortcut.altKey === event.altKey &&
        !!shortcut.shiftKey === event.shiftKey &&
        !!shortcut.metaKey === event.metaKey
      );
    });

    if (matchingShortcut) {
      event.preventDefault();
      matchingShortcut.action();
    }
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

// Common keyboard shortcuts for the app
export const createAppShortcuts = (
  onAddTask: () => void,
  onAddNote: () => void,
  onAddExpense: () => void,
  onToggleSidebar: () => void,
  onSearch: () => void
): KeyboardShortcut[] => [
  {
    key: 't',
    ctrlKey: true,
    action: onAddTask,
    description: 'Add new task'
  },
  {
    key: 'n',
    ctrlKey: true,
    action: onAddNote,
    description: 'Add new note'
  },
  {
    key: 'e',
    ctrlKey: true,
    action: onAddExpense,
    description: 'Add new expense'
  },
  {
    key: 'b',
    ctrlKey: true,
    action: onToggleSidebar,
    description: 'Toggle sidebar'
  },
  {
    key: 'k',
    ctrlKey: true,
    action: onSearch,
    description: 'Open search'
  },
  {
    key: '/',
    action: onSearch,
    description: 'Open search'
  }
];
