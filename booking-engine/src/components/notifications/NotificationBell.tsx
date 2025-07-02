'use client';

import React, { useState, useEffect } from 'react';
import { Bell, X, Check, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';

interface NotificationBellProps {
  className?: string;
  userId: string;
}

interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'booking' | 'payment' | 'general' | 'promotion';
  isRead: boolean;
  timestamp: string;
}

const fetchUserNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/notification/user-notifications-get/${userId}`,
    );

    const data = response.data;
    const notifications = Array.isArray(data.notifications) ? data.notifications : [];

    return notifications.map((item: any, index: number) => ({
      id: item._id || `fallback-${index}-${userId}`,
      title: item.title || 'Untitled Notification',
      body: item.body || 'No description available',
      type: item.data?.type || 'general',
      isRead: item.markedAs ?? false,
      timestamp: item.sentAt || new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

const markNotificationAsRead = async (userId: string, notificationId: string): Promise<void> => {
  try {
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/notification/update-notification-user?userId=${userId}&notificationId=${notificationId}`,
      {},
    );

    if (response.status !== 200) {
      throw new Error(`Failed to mark notification as read: ${response.status}`);
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const NotificationBell: React.FC<NotificationBellProps> = ({
  className = '',
  userId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all'); // New state for active tab
  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    if (userId) {
      loadNotifications();
    }
  }, [userId]);

  const loadNotifications = async () => {
    setLoading(true);
    setError(null);

    try {
      const notificationsData = await fetchUserNotifications(userId);
      console.log('Fetched notifications:', notificationsData);
      setNotifications(notificationsData);
    } catch (err) {
      setError('Failed to load notifications');
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBellClick = () => {
    setIsOpen(!isOpen);
    if (!isOpen && userId) {
      loadNotifications();
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      await Promise.all(
        unreadNotifications.map(n => markNotificationAsRead(userId, n.id))
      );
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      setError('Failed to mark all notifications as read');
      console.error('Error marking all notifications as read:', err);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(userId, id);
      setNotifications(notifications.map(n =>
        n.id === id ? { ...n, isRead: true } : n
      ));
    } catch (err) {
      setError('Failed to mark notification as read');
      console.error('Error marking notification as read:', err);
    }
  };

  const handleRemoveNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  // Filter notifications based on active tab
  const displayedNotifications = activeTab === 'unread'
    ? notifications.filter(n => !n.isRead)
    : notifications;

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleBellClick}
        className="relative p-2.5 rounded-full hover:bg-tripswift-blue/10 transition-colors duration-300 group"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        disabled={loading}
      >
        <Bell size={22} className={`text-tripswift-black group-hover:text-tripswift-blue transition-colors ${loading ? 'animate-pulse' : ''}`} />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-[20px] flex items-center justify-center font-bold shadow-md"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.div>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/10 "
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 400 }}
              className="absolute right-0 mt-3 w-96 bg-white rounded-xl shadow-xl border border-tripswift-black/5 z-50 max-h-[32rem] overflow-hidden flex flex-col"
            >
              <div className="bg-gradient-to-r from-tripswift-blue/10 to-tripswift-blue/5 p-4 border-b border-tripswift-black/10">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-tripswift-black text-lg flex items-center gap-2">
                    <Bell size={18} className="text-tripswift-blue" />
                    Notifications
                    {loading && <div className="w-4 h-4 border-2 border-tripswift-blue border-t-transparent rounded-full animate-spin ml-2" />}
                  </h3>
                  <div className="flex items-center gap-3">
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-xs text-tripswift-blue hover:text-tripswift-blue/80 flex items-center gap-1 bg-white px-2 py-1 rounded-lg shadow-sm hover:shadow transition-all"
                        disabled={loading}
                      >
                        <CheckCheck size={14} />
                        Mark all read
                      </button>
                    )}
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-1 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex mt-3 border-b border-gray-200 -mb-px">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-3 py-1 text-sm font-medium ${
                      activeTab === 'all'
                        ? 'text-tripswift-blue border-b-2 border-tripswift-blue'
                        : 'text-gray-500 hover:text-tripswift-blue'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setActiveTab('unread')}
                    className={`px-3 py-1 text-sm font-medium ${
                      activeTab === 'unread'
                        ? 'text-tripswift-blue border-b-2 border-tripswift-blue'
                        : 'text-gray-500 hover:text-tripswift-blue'
                    }`}
                  >
                    Unread
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-tripswift-black/10">
                {error ? (
                  <div className="p-8 text-center text-red-500 flex flex-col items-center">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                      <X size={24} className="text-red-400" />
                    </div>
                    <p className="text-sm font-medium text-red-600">Error loading notifications</p>
                    <p className="text-xs text-red-400 mt-1">{error}</p>
                    <button
                      onClick={loadNotifications}
                      className="mt-3 px-3 py-1 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                ) : loading ? (
                  <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                    <div className="w-8 h-8 border-2 border-tripswift-blue border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-sm font-medium text-gray-600">Loading notifications...</p>
                  </div>
                ) : displayedNotifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                    <div className="w-16 h-16 bg-tripswift-blue/10 rounded-full flex items-center justify-center mb-4">
                      <Bell size={24} className="text-tripswift-blue/50" />
                    </div>
                    <p className="text-sm font-medium text-gray-600">
                      {activeTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">We'll notify you when something arrives</p>
                  </div>
                ) : (
                  displayedNotifications.map((notification, index) => (
                    <NotificationItem
                      key={notification.id || `fallback-${index}`}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                      onRemove={handleRemoveNotification}
                    />
                  ))
                )}
              </div>

              <div className="p-3 bg-gray-50 border-t border-tripswift-black/10 text-center">
                <button className="text-xs text-tripswift-blue hover:text-tripswift-blue/80 font-medium">
                  View all notifications
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onRemove: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onRemove,
}) => {
  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'booking':
        return (
          <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8"></path>
              <path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"></path>
              <path d="M2 20h20"></path>
            </svg>
          </div>
        );
      case 'payment':
        return (
          <div className="bg-green-100 text-green-600 p-2 rounded-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
              <line x1="1" y1="10" x2="23" y2="10"></line>
            </svg>
          </div>
        )
      default:
        return (
          <div className="bg-gray-100 text-gray-600 p-2 rounded-lg">
            <Bell size={16} />
          </div>
        );
    }
  };

  const isValidDate = (dateString: string): boolean => {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ duration: 0.2 }}
      className={`px-4 py-3 hover:bg-gray-50/50 transition-colors cursor-pointer ${
        notification.isRead ? 'bg-white' : 'bg-gray-50'
      }`}
      onClick={() => !notification.isRead && onMarkAsRead(notification.id)}
    >
      <div className="flex items-start gap-3">
        {getNotificationIcon()}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p
                className={`text-sm font-medium text-gray-900 ${
                  !notification.isRead ? 'font-semibold' : ''
                }`}
              >
                {notification.title}
              </p>
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                {notification.body}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {isValidDate(notification.timestamp)
                  ? formatDistanceToNow(new Date(notification.timestamp), {
                      addSuffix: true,
                    })
                  : 'Unknown time'}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {!notification.isRead && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"
                />
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(notification.id);
                }}
                className="p-1 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Remove notification"
              >
                <X size={14} />
              </button>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            {!notification.isRead && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead(notification.id);
                }}
                className="text-xs bg-white border border-gray-200 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
              >
                <Check size={12} />
                Mark as read
              </button>
            )}
            <button className="text-xs bg-white border border-gray-200 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1">
              View details
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationBell;