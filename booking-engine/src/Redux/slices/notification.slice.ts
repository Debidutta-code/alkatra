import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'booking' | 'payment' | 'general';
  isRead: boolean;
  timestamp: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications(state, action: PayloadAction<Notification[]>) {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(n => !n.isRead).length;
    },
    markAsRead(state, action: PayloadAction<string>) {
      state.notifications = state.notifications.map(n =>
        n.id === action.payload ? { ...n, isRead: true } : n
      );
      state.unreadCount = state.notifications.filter(n => !n.isRead).length;
    },
    markAllAsRead(state) {
      state.notifications = state.notifications.map(n => ({ ...n, isRead: true }));
      state.unreadCount = 0;
    },
    removeNotification(state, action: PayloadAction<string>) {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
      state.unreadCount = state.notifications.filter(n => !n.isRead).length;
    },
  },
});

export const { setNotifications, markAsRead, markAllAsRead, removeNotification } = notificationSlice.actions;
export default notificationSlice.reducer;