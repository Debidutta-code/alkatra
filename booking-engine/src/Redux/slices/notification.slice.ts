// Redux/slices/notification.slice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk } from '../store';
import axios from 'axios';
import { Notification, NotificationState } from '../../components/notifications/types/notification';

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  lastFetched: null,
  error: null,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications(state, action: PayloadAction<Notification[]>) {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(n => !n.isRead).length;
      state.lastFetched = Date.now();
      state.error = null;
    },
    addNotification(state, action: PayloadAction<Notification>) {
      if (!state.notifications.some(n => n.id === action.payload.id)) {
        state.notifications.unshift(action.payload);
        if (!action.payload.isRead) {
          state.unreadCount += 1;
        }
      }
    },
    markAsRead(state, action: PayloadAction<string>) {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllAsRead(state) {
      state.notifications = state.notifications.map(n => ({
        ...n,
        isRead: true
      }));
      state.unreadCount = 0;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
      if (action.payload) state.error = null;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    clearNotifications(state) {
      state.notifications = [];
      state.unreadCount = 0;
      state.error = null;
    }
  },
});

const isValidMongoId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

// Thunks
export const fetchNotifications = (userId: string): AppThunk => async (dispatch) => {
  dispatch(setLoading(true));

  if (!isValidMongoId(userId)) {
    dispatch(setError('Invalid user ID format'));
    dispatch(setLoading(false));
    return;
  }

  try {
    const response = await axios.get<{
      notifications: any[],
      message: string
    }>(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/notification/user-notifications-get/${userId}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000
      }
    );

    const notifications = response.data.notifications.map(notification => ({
      id: notification._id,
      title: notification.title,
      body: notification.body,
      type: notification.data?.type || 'general',
      isRead: notification.markedAs,
      timestamp: notification.sentAt,
      data: {
        type: notification.data?.type,
        offerCode: notification.data?.offerCode,
        ...notification.data 
      }
    }));

    dispatch(setNotifications(notifications));
  } catch (error: any) {
    const errorMessage = error.response?.data?.message ||
      error.message ||
      'Failed to fetch notifications';
    dispatch(setError(errorMessage));
  } finally {
    dispatch(setLoading(false));
  }
};

export const updateNotificationReadStatus = (
  userId: string,
  notificationId: string
): AppThunk => async (dispatch) => {
  try {
    if (!userId || !notificationId) {
      throw new Error('Both userId and notificationId are required');
    }
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/notification/update-notification-user?userId=${userId}&notificationId=${notificationId}`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    if (response.status === 200) {
      dispatch(markAsRead(notificationId));
    } else {
      throw new Error(response.data.message || 'Update failed');
    }
  } catch (error: any) {
    dispatch(setError(error.response?.data?.message || 'Failed to update notification'));
  }
};

export const markMultipleAsRead = (
  userId: string,
  notificationIds: string[]
): AppThunk => async (dispatch) => {
  if (!isValidMongoId(userId)) {
    dispatch(setError('Invalid user ID format'));
    return;
  }

  try {
    for (const id of notificationIds) {
      if (!isValidMongoId(id)) {
        console.warn(`Skipping invalid notification ID: ${id}`);
        continue;
      }

      try {
        await dispatch(updateNotificationReadStatus(userId, id));
      } catch (error) {
        console.error(`Failed to mark notification ${id} as read:`, error);
      }
    }
  } catch (error) {
    console.error('Error in markMultipleAsRead:', error);
  }
};

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  clearNotifications,
  setLoading,
  setNotifications,
  setError
} = notificationSlice.actions;

export default notificationSlice.reducer;