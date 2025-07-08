'use client';

import React, { useState, useEffect } from 'react';
import { Bell, X, Check, CheckCheck, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/Redux/store';
import { Notification } from './types/notification';
import { onMessage } from 'firebase/messaging';
import { messaging } from '@/utils/firebase.config';
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  updateNotificationReadStatus,
  clearNotifications,
  addNotification
} from '@/Redux/slices/notification.slice';
import toast from 'react-hot-toast';

interface NotificationBellProps {
  className?: string;
  userId: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  className = '',
  userId,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { notifications, unreadCount, isLoading } = useSelector(
    (state: RootState) => state.notifications
  );

  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (userId) {
      loadNotifications();
    }
  }, [userId]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!messaging) return;
  
    const unsubscribe = onMessage(messaging, (payload) => {
      const newNotification = {
        id: payload.messageId || Date.now().toString(),
        title: payload.notification?.title || 'New Notification',
        body: payload.notification?.body || '',
        type: payload.data?.type || 'general',
        isRead: false,
        timestamp: new Date().toISOString()
      };
  
      // Add the new notification to Redux store
      dispatch(addNotification(newNotification));
      
      // Show toast notification
      if (payload.notification?.title && payload.notification?.body) {
        showToast({
          title: payload.notification.title,
          message: payload.notification.body,
          type: 'info'
        });
      }
    });
  
    return () => unsubscribe(); // Cleanup on unmount
  }, [dispatch]);

  const loadNotifications = async () => {
    setError(null);
    try {
      const result = await dispatch(fetchNotifications(userId));
      if ((result as any)?.meta?.requestStatus === 'rejected') {
        throw new Error('Failed to fetch notifications');
      }
    } catch (err) {
      setError('Failed to load notifications');
      console.error('Error loading notifications:', err);
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
        unreadNotifications.map(n =>
          dispatch(updateNotificationReadStatus(userId, n.id))
        )
      );
      dispatch(markAllAsRead());
    } catch (err) {
      setError('Failed to mark all notifications as read');
      console.error('Error marking all notifications as read:', err);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await dispatch(updateNotificationReadStatus(userId, id));
    } catch (err) {
      setError('Failed to mark notification as read');
      console.error('Error marking notification as read:', err);
    }
  };


  const handleRemoveNotification = (id: string) => {
    dispatch(markAsRead(id));
  };

  const handleClearAll = () => {
    dispatch(clearNotifications());
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
        disabled={isLoading}
      >
        <Bell size={22} className={`text-tripswift-black group-hover:text-tripswift-blue transition-colors ${isLoading ? 'animate-pulse' : ''}`} />
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
              className="fixed inset-0 z-40 bg-black/10"
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
                    {isLoading && <div className="w-4 h-4 border-2 border-tripswift-blue border-t-transparent rounded-full animate-spin ml-2" />}
                  </h3>
                  <div className="flex items-center gap-3">
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-xs text-tripswift-blue hover:text-tripswift-blue/80 flex items-center gap-1 bg-white px-2 py-1 rounded-lg shadow-sm hover:shadow transition-all"
                        disabled={isLoading}
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
                    className={`px-3 py-1 text-sm font-medium transition-colors ${activeTab === 'all'
                      ? 'text-tripswift-blue border-b-2 border-tripswift-blue'
                      : 'text-gray-500 hover:text-tripswift-blue'
                      }`}
                  >
                    All ({notifications.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('unread')}
                    className={`px-3 py-1 text-sm font-medium transition-colors ${activeTab === 'unread'
                      ? 'text-tripswift-blue border-b-2 border-tripswift-blue'
                      : 'text-gray-500 hover:text-tripswift-blue'
                      }`}
                  >
                    Unread ({unreadCount})
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
                ) : isLoading ? (
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
                      isLoading={isLoading}
                    />
                  ))
                )}
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
  isLoading: boolean;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onRemove,
  isLoading,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'booking':
        return (
          <div className="bg-blue-100 text-blue-600 p-2 rounded-lg flex-shrink-0">
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
          <div className="bg-green-100 text-green-600 p-2 rounded-lg flex-shrink-0">
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
        );
      case 'promotion':
        return (
          <div className="bg-purple-100 text-purple-600 p-2 rounded-lg flex-shrink-0">
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
              <path d="M7 7h10v10l-3-3-2 2-2-2-3 3V7z"></path>
              <path d="M7 3h10v4l-3-3-2 2-2-2-3 3V3z"></path>
            </svg>
          </div>
        );
      default:
        return (
          <div className="bg-gray-100 text-gray-600 p-2 rounded-lg flex-shrink-0">
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
      className={`px-4 py-3 hover:bg-gray-50/50 transition-colors cursor-pointer ${notification.isRead ? 'bg-white' : 'bg-blue-50/30'
        }`}
      onClick={() => !notification.isRead && onMarkAsRead(notification.id)}
    >
      <div className="flex items-start gap-3">
        {getNotificationIcon()}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p
                className={`text-sm font-medium text-gray-900 ${!notification.isRead ? 'font-semibold' : ''
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
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            {!notification.isRead && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead(notification.id);
                }}
                className="text-xs bg-white border border-gray-200 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1 disabled:opacity-50"
                disabled={isLoading}
              >
                <Check size={12} />
                Mark as read
              </button>
            )}
            {/* <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDetails(!showDetails);
              }}
              className="text-xs bg-white border border-gray-200 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
              disabled={isLoading}
            >
              {showDetails ? 'Hide details' : 'View details'}
            </button> */}

            {/* {showDetails && notification.data && (
              <div className="mt-2 p-2 bg-gray-50 rounded-lg text-xs">
                {notification.data.type && (
                  <p className="text-gray-700">
                    <span className="font-medium">Type:</span> {notification.data.type}
                  </p>
                )}
                {notification.data.offerCode && (
                  <p className="text-gray-700 mt-1">
                    <span className="font-medium">Offer Code:</span> {notification.data.offerCode}
                  </p>
                )}
              </div>
            )} */}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationBell;

const showToast = ({ title, message, type }: { title: string; message: string; type: string }) => {
  toast.custom((t) => (
    <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} 
      max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            {type === 'info' && <Bell className="h-5 w-5 text-tripswift-blue" />}
            {type === 'success' && <Check className="h-5 w-5 text-green-500" />}
            {type === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
            {type === 'error' && <X className="h-5 w-5 text-red-500" />}
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">{title}</p>
            <p className="mt-1 text-sm text-gray-500">{message}</p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  ), {
    duration: 5000,
    position: 'top-right'
  });
};