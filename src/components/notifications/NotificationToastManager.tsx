import React, { useState, useCallback } from 'react';
import { NotificationToast } from './NotificationToast';

interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
}

interface NotificationToastManagerProps {
  children: React.ReactNode;
}

export const NotificationToastManager: React.FC<NotificationToastManagerProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Expose addToast function globally
  React.useEffect(() => {
    (window as any).showNotificationToast = addToast;
    return () => {
      delete (window as any).showNotificationToast;
    };
  }, [addToast]);

  return (
    <>
      {children}
      {toasts.map(toast => (
        <NotificationToast
          key={toast.id}
          {...toast}
          onClose={removeToast}
        />
      ))}
    </>
  );
};

// Helper function to show toast notifications
export const showNotificationToast = (
  title: string,
  message: string,
  type: 'success' | 'info' | 'warning' | 'error' = 'info',
  duration?: number
) => {
  if (typeof window !== 'undefined' && (window as any).showNotificationToast) {
    (window as any).showNotificationToast({ title, message, type, duration });
  }
};
