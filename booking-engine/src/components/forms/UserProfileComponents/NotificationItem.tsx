import React from 'react';
import { Calendar, CheckCircle, Gift, Bell, Check, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  timestamp: string;
  data?: {
    type?: string;
    offerCode?: string;
  };
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onRemove: (id: string) => void;
  t: (key: string, options?: any) => string;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onRemove,
  t,
}) => {
  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'booking':
        return (
          <div className="bg-blue-100 text-blue-600 p-2 rounded-lg flex-shrink-0">
            <Calendar className="h-4 w-4" />
          </div>
        );
      case 'payment':
        return (
          <div className="bg-green-100 text-green-600 p-2 rounded-lg flex-shrink-0">
            <CheckCircle className="h-4 w-4" />
          </div>
        );
      case 'promotion':
        return (
          <div className="bg-purple-100 text-purple-600 p-2 rounded-lg flex-shrink-0">
            <Gift className="h-4 w-4" />
          </div>
        );
      default:
        return (
          <div className="bg-gray-100 text-gray-600 p-2 rounded-lg flex-shrink-0">
            <Bell className="h-4 w-4" />
          </div>
        );
    }
  };

  const isValidDate = (dateString: string): boolean => {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  };

  return (
    <div className={`p-4 border-b border-gray-100 last:border-b-0 ${!notification.isRead ? 'bg-blue-50/30' : 'bg-white'}`}>
      <div className="flex items-start gap-3">
        {getNotificationIcon()}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className={`text-sm font-medium text-gray-900 leading-5 ${!notification.isRead ? 'font-semibold' : ''}`}>
                {notification.title}
              </p>
              <p className="text-xs text-gray-600 mt-1">{notification.body}</p>
              {notification.data?.offerCode && (
                <div className="mt-2 flex items-center">
                  <span className="text-xs font-medium text-gray-600">
                    {t('notifications.offerCode', { defaultValue: 'Offer Code' })}:
                  </span>
                  <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-md border border-green-100 ml-1">
                    {notification.data.offerCode}
                  </span>
                </div>
              )}
              <p className="text-xs text-gray-400 mt-2">
                {isValidDate(notification.timestamp)
                  ? formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })
                  : t('notifications.unknownTime', { defaultValue: 'Unknown time' })}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {!notification.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
              {/* <button
                onClick={() => onRemove(notification.id)}
                className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-3 w-3" />
              </button> */}
            </div>
          </div>
          {!notification.isRead && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => onMarkAsRead(notification.id)}
                className="text-xs bg-white border border-gray-200 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
              >
                <Check className="h-3 w-3" />
                {t('notifications.markAsRead', { defaultValue: 'Mark as read' })}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;