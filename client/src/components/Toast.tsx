/**
 * Toast Notification Component
 * Displays individual toast notifications with animations
 */

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Notification, getNotificationIcon, getNotificationStyles } from '@/contexts/NotificationContext';

interface ToastProps {
  notification: Notification;
  onClose: (id: string) => void;
}

export function Toast({ notification, onClose }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => {
          onClose(notification.id);
        }, 300);
      }, notification.duration);

      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(notification.id);
    }, 300);
  };

  return (
    <div
      className={`
        transform transition-all duration-300 ease-out
        ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
      `}
    >
      <div
        className={`
          flex items-start gap-3 rounded-lg border p-4 shadow-lg backdrop-blur-sm
          ${getNotificationStyles(notification.type)}
        `}
      >
        {/* Icon */}
        <div className="flex-shrink-0 pt-0.5">
          {getNotificationIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm leading-tight">
            {notification.title}
          </h3>
          {notification.message && (
            <p className="text-xs opacity-90 mt-1 leading-tight">
              {notification.message}
            </p>
          )}
          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className="text-xs font-medium mt-2 hover:underline transition-all"
            >
              {notification.action.label}
            </button>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="flex-shrink-0 hover:opacity-70 transition-opacity"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
