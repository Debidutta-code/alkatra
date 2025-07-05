export interface Notification {
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
  
export interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    lastFetched: number | null;
    error: string | null;
  }