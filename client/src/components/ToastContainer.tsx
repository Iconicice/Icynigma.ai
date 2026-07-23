/**
 * Toast Container Component
 * Displays all active toast notifications
 */

import { useNotification } from '@/contexts/NotificationContext';
import { Toast } from './Toast';

export function ToastContainer() {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {notifications.map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <Toast
            notification={notification}
            onClose={removeNotification}
          />
        </div>
      ))}
    </div>
  );
}
