/**
 * Notification Context
 * Manages toast notifications throughout the application
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  removeNotification: (id: string) => void;
  success: (title: string, message?: string) => string;
  error: (title: string, message?: string) => string;
  info: (title: string, message?: string) => string;
  warning: (title: string, message?: string) => string;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id'>) => {
      const id = `notification-${Date.now()}-${Math.random()}`;
      const fullNotification: Notification = {
        ...notification,
        id,
        duration: notification.duration ?? 4000,
      };

      setNotifications((prev) => [...prev, fullNotification]);

      // Auto-remove after duration
      if (fullNotification.duration && fullNotification.duration > 0) {
        setTimeout(() => {
          removeNotification(id);
        }, fullNotification.duration);
      }

      return id;
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const success = useCallback(
    (title: string, message?: string) =>
      addNotification({ type: 'success', title, message }),
    [addNotification]
  );

  const error = useCallback(
    (title: string, message?: string) =>
      addNotification({ type: 'error', title, message }),
    [addNotification]
  );

  const info = useCallback(
    (title: string, message?: string) =>
      addNotification({ type: 'info', title, message }),
    [addNotification]
  );

  const warning = useCallback(
    (title: string, message?: string) =>
      addNotification({ type: 'warning', title, message }),
    [addNotification]
  );

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        success,
        error,
        info,
        warning,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}

export function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case 'success':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'error':
      return <XCircle className="h-5 w-5 text-red-500" />;
    case 'warning':
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    case 'info':
      return <Info className="h-5 w-5 text-blue-500" />;
    default:
      return null;
  }
}

export function getNotificationStyles(type: NotificationType) {
  switch (type) {
    case 'success':
      return 'bg-green-500/10 border-green-500/30 text-green-100';
    case 'error':
      return 'bg-red-500/10 border-red-500/30 text-red-100';
    case 'warning':
      return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-100';
    case 'info':
      return 'bg-blue-500/10 border-blue-500/30 text-blue-100';
    default:
      return 'bg-foreground/10 border-foreground/30';
  }
}
