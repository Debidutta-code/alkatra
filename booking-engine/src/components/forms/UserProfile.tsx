"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { getUser, updateProfile } from '../../Redux/slices/auth.slice';
import { AppDispatch, RootState } from '../../Redux/store';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import HelpCenterTab from '@/components/helpCenter/HelpCenterTab';
import {
  User,
  Heart,
  Lock,
  Bell,
  Calendar,
  Edit3,
  Bookmark,
  CheckCircle,
  Gift,
  Percent,
  Shield,
  HelpCircle,
  Star,
  Check
} from 'lucide-react';

import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  updateNotificationReadStatus,
} from '../../Redux/slices/notification.slice';

import {
  Avatar,
  Button,
  Card,
  ChangePasswordModal,
  EditProfileModal,
  NotificationItem,
  StatsCard
} from './UserProfileComponents';


/**
 * Interface for User Profile
 */
interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  joinDate: string;
  profilePicture: string | null;
  verified: boolean;
  location: string;
}

/**
 * Interface for Notification
 */
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

/**
 * @returns @UserProfile
 * Main function started from here
 */

const UserProfile: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user: authUser } = useSelector((state: RootState) => state.auth);
  const { notifications, unreadCount, isLoading } = useSelector((state: RootState) => state.notifications);
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'preferences' | 'security' | 'notifications' | 'help'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    sms: false,
    marketing: true,
    bookingUpdates: true,
    promotions: true,
  });

  const [user, setUser] = useState<UserProfile>({
    firstName: authUser?.firstName || 'Guest',
    lastName: authUser?.lastName || 'User',
    email: authUser?.email || '',
    phone: authUser?.phone || '',
    joinDate: authUser?.createdAt
      ? new Date(authUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      : 'March 2025',
    profilePicture: null,
    verified: true,
    location: 'New York, USA',
  });

  useEffect(() => {
    if (Cookies.get('accessToken')) {
      dispatch(getUser());
    }
  }, [dispatch]);

  useEffect(() => {
    if (authUser) {
      setUser((prev) => ({
        ...prev,
        firstName: authUser.firstName || prev.firstName,
        lastName: authUser.lastName || prev.lastName,
        email: authUser.email || prev.email,
        phone: authUser.phone || prev.phone,
      }));

      if (authUser._id) {
        dispatch(fetchNotifications(authUser._id));
      }
    }
  }, [authUser, dispatch]);

  const stats = [
    {
      icon: Calendar,
      title: t('Profile.tripsCompleted', { defaultValue: 'Trips Completed' }),
      value: '23',
      description: t('Profile.sinceJoining', { defaultValue: 'Since joining' }),
    },
    {
      icon: Star,
      title: t('Profile.averageRating', { defaultValue: 'Average Rating' }),
      value: '4.8',
      description: t('Profile.fromHosts', { defaultValue: 'From hosts' }),
    },
    {
      icon: Bookmark,
      title: t('Profile.savedPlaces', { defaultValue: 'Saved Places' }),
      value: '47',
      description: t('Profile.wishlisted', { defaultValue: 'Wishlisted' }),
    },
  ];

  const tabTranslationKeys: Record<typeof activeTab, string> = {
    overview: 'Profile.overview',
    bookings: 'Profile.myTrips',
    preferences: 'Profile.preferences',
    security: 'Profile.security',
    notifications: 'Profile.notifications',
    help: 'Profile.helpCenter',
  };

  const menuItems = [
    { id: 'overview' as const, label: t('Profile.overview', { defaultValue: 'Overview' }), icon: User },
    { id: 'preferences' as const, label: t('Profile.preferences', { defaultValue: 'Preferences' }), icon: Heart },
    { id: 'security' as const, label: t('Profile.security', { defaultValue: 'Security' }), icon: Shield },
    { id: 'notifications' as const, label: t('Profile.notifications', { defaultValue: 'Notifications' }), icon: Bell },
    { id: 'help' as const, label: t('Profile.helpCenter', { defaultValue: 'Help Center' }), icon: HelpCircle },
  ];

  const handleSaveProfile = async (updatedUser: Partial<UserProfile> & { password?: string }) => {
    try {
      await dispatch(
        updateProfile({
          firstName: updatedUser.firstName || user.firstName,
          lastName: updatedUser.lastName || user.lastName,
          email: updatedUser.email || user.email,
          phone: updatedUser.phone || user.phone,
          ...(updatedUser.password && { password: updatedUser.password }),
        })
      ).unwrap();
      await dispatch(getUser());
      setUser((prev) => ({
        ...prev,
        firstName: updatedUser.firstName || prev.firstName,
        lastName: updatedUser.lastName || prev.lastName,
        email: updatedUser.email || prev.email,
        phone: updatedUser.phone || prev.phone,
      }));
      toast.success(t('Profile.profileUpdatedSuccess', { defaultValue: 'Profile updated successfully' }));
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      toast.error(error || t('Profile.profileUpdateFailed', { defaultValue: 'Failed to update profile' }));
      if (error === 'Session expired. Please log in again.') {
        window.location.href = '/login';
      }
    }
  };

  const handleTabClick = (tabId: typeof activeTab) => {
    if (tabId === 'bookings') {
      router.push('/my-trip');
    } else {
      setActiveTab(tabId);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    if (authUser?._id) {
      try {
        await dispatch(updateNotificationReadStatus(authUser._id, id));
        dispatch(markAsRead(id));
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
  };

  const handleRemoveNotification = (id: string) => {
    dispatch(markAsRead(id));
  };

  const handleMarkAllAsRead = async () => {
    if (authUser?._id) {
      try {
        const unreadNotifications = notifications.filter((n) => !n.isRead);
        await Promise.all(
          unreadNotifications.map((n) => dispatch(updateNotificationReadStatus(authUser._id, n.id)))
        );
        dispatch(markAllAsRead());
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
      }
    }
  };

  const handleChangePassword = async (newPassword: string) => {
    try {
      await dispatch(
        updateProfile({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          password: newPassword,
        })
      ).unwrap();
      await dispatch(getUser());
      toast.success(t('Profile.passwordUpdatedSuccess', { defaultValue: 'Password updated successfully' }));
    } catch (error: any) {
      console.error('Failed to update password:', error);
      toast.error(error || t('Profile.passwordUpdateFailed', { defaultValue: 'Failed to update password' }));
      throw error;
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {stats.map((stat, index) => (
                <StatsCard key={index} {...stat} />
              ))}
            </div>
            <Card className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-[var(--color-secondary-black)] mb-4">
                {t('Profile.quickActions', { defaultValue: 'Quick Actions' })}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <Button
                  variant="outline"
                  size="md"
                  className="flex flex-col items-center p-3 sm:p-4 h-auto"
                  onClick={() => router.push('/')}
                >
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mb-2 text-[var(--color-secondary-black)]" />
                  <span className="text-xs text-[var(--color-secondary-black)]">
                    {t('Profile.bookTrip', { defaultValue: 'Book Trip' })}
                  </span>
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  className="flex flex-col items-center p-3 sm:p-4 h-auto"
                  onClick={() => { }}
                >
                  <Heart className="h-4 w-4 sm:h-5 sm:w-5 mb-2 text-[var(--color-secondary-black)]" />
                  <span className="text-xs text-[var(--color-secondary-black)]">
                    {t('Profile.savedPlacesAction', { defaultValue: 'Saved Places' })}
                  </span>
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  className="flex flex-col items-center p-3 sm:p-4 h-auto"
                  onClick={() => { }}
                >
                  <Gift className="h-4 w-4 sm:h-5 sm:w-5 mb-2 text-[var(--color-secondary-black)]" />
                  <span className="text-xs text-[var(--color-secondary-black)]">
                    {t('Profile.rewards', { defaultValue: 'Rewards' })}
                  </span>
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  className="flex flex-col items-center p-3 sm:p-4 h-auto"
                  onClick={() => { }}
                >
                  <Percent className="h-4 w-4 sm:h-5 sm:w-5 mb-2 text-[var(--color-secondary-black)]" />
                  <span className="text-xs text-[var(--color-secondary-black)]">
                    {t('Profile.deals', { defaultValue: 'Deals' })}
                  </span>
                </Button>
              </div>
            </Card>
          </div>
        );
      case 'bookings':
        return null;
      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-secondary-black)]">
                  {t('Profile.notifications', { defaultValue: 'Notifications' })}
                </h2>
                <p className="text-sm text-[var(--color-secondary-black)]/60 mt-1">
                  {t('Profile.notificationsDesc', {
                    defaultValue: 'Manage your notification preferences and view recent notifications',
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="flex items-center gap-2"
                    disabled={isLoading}
                  >
                    <Check className="h-4 w-4" />
                    {t('notifications.markAllRead', { defaultValue: 'Mark all read' })}
                  </Button>
                )}
              </div>
            </div>
            <Card className="overflow-hidden">
              <div className="p-4 sm:p-6 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-semibold text-[var(--color-secondary-black)]">
                    {t('Profile.recentNotifications', { defaultValue: 'Recent Notifications' })}
                  </h3>
                  {unreadCount > 0 && (
                    <span className="bg-[var(--color-primary-blue)] text-white text-xs px-2 py-1 rounded-full">
                      {unreadCount} {t('notifications.unread', { defaultValue: 'unread' })}
                    </span>
                  )}
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <div className="w-8 h-8 border-2 border-[var(--color-primary-blue)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-sm text-[var(--color-secondary-black)]/60">
                      {t('notifications.loading', { defaultValue: 'Loading notifications...' })}
                    </p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-[var(--color-primary-blue)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bell className="h-8 w-8 text-[var(--color-primary-blue)]/50" />
                    </div>
                    <p className="text-sm font-medium text-[var(--color-secondary-black)]/60">
                      {t('notifications.noNotifications', { defaultValue: 'No notifications yet' })}
                    </p>
                    <p className="text-xs text-[var(--color-secondary-black)]/40 mt-1">
                      {t('notifications.emptyDescription', {
                        defaultValue: 'When you have notifications, they will appear here',
                      })}
                    </p>
                  </div>
                ) : (
                  <div>
                    {notifications.map((notification, index) => (
                      <NotificationItem
                        key={notification.id || `notification-${index}`}
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                        onRemove={handleRemoveNotification}
                        t={t}
                      />
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-secondary-black)]">
              {t('Profile.securitySettings', { defaultValue: 'Security Settings' })}
            </h2>
            <Card className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-3 sm:space-y-0">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-[var(--color-secondary-black)]">
                    {t('Profile.password', { defaultValue: 'Password' })}
                  </h3>
                  <p className="text-sm text-[var(--color-secondary-black)]/60">
                    {t('Profile.updatePassword', { defaultValue: 'Update your account password' })}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="md"
                  className="flex items-center border-[var(--color-primary-blue)]/30 bg-[var(--color-primary-blue)]/5 text-[var(--color-primary-blue)] w-full sm:w-auto justify-center"
                  onClick={() => setIsChangingPassword(true)}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  {t('Profile.changePassword', { defaultValue: 'Change Password' })}
                </Button>
              </div>
            </Card>
            <Card className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-3 sm:space-y-0">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-[var(--color-secondary-black)]">
                    {t('Profile.twoFactorAuth', { defaultValue: 'Two-Factor Authentication' })}
                  </h3>
                  <p className="text-sm text-[var(--color-secondary-black)]/60">
                    {t('Profile.twoFactorDesc', { defaultValue: 'Add an extra layer of security to your account' })}
                  </p>
                </div>
                <Button variant="primary" size="md" onClick={() => { }} className="w-full sm:w-auto">
                  {t('Profile.enable2FA', { defaultValue: 'Enable 2FA' })}
                </Button>
              </div>
            </Card>
          </div>
        );
      case 'help':
        return <HelpCenterTab />;
      default:
        return (
          <div className="text-center py-12">
            <p className="text-[var(--color-secondary-black)]/60">
              {t('Profile.contentComingSoon', {
                defaultValue: 'Content for {{tab}} coming soon...',
                tab: t(tabTranslationKeys[activeTab], { defaultValue: activeTab }),
              })}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 sm:py-6">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <div className="relative flex-shrink-0">
                <Avatar
                  size="lg"
                  alt={t('Profile.avatarAlt', { defaultValue: 'User profile avatar' })}
                  fallback={
                    <span className="text-lg sm:text-xl font-bold text-[var(--color-primary-off-white)]">
                      {user.firstName.charAt(0)}{user.lastName?.charAt(0)}

                    </span>
                  }
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-2xl font-bold text-[var(--color-secondary-black)] truncate">
                    {user.firstName} {user.lastName}
                  </h1>
                  {user.verified && <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />}
                </div>
                <p className="text-xs sm:text-sm text-[var(--color-secondary-black)]/60 truncate">
                  {t('Profile.joined', { defaultValue: 'Joined {{date}}', date: user.joinDate })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex items-center border-[var(--color-primary-blue)]/30 bg-[var(--color-primary-blue)]/5 text-[var(--color-primary-blue)]"
                onClick={() => setIsEditing(true)}
              >
                <span className="hidden sm:inline">{t('Profile.editProfile', { defaultValue: 'Edit Profile' })}</span>
                <Edit3 className="w-4 h-4 sm:ml-2" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="sm:hidden flex items-center border-[var(--color-primary-blue)]/30 bg-[var(--color-primary-blue)]/5 text-[var(--color-primary-blue)]"
                onClick={() => setIsEditing(true)}
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="w-full mb-4">
          <div className="bg-white rounded-lg border border-gray-200 p-1">
            <div className="flex overflow-x-auto space-x-1 rtl:space-x-reverse">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const showBadge = item.id === 'notifications' && unreadCount > 0;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium rounded-md transition-colors min-w-[60px] relative ${activeTab === item.id
                      ? 'bg-[var(--color-primary-blue)]/10 text-[var(--color-primary-blue)]'
                      : 'text-[var(--color-secondary-black)]/60 hover:bg-gray-50 hover:text-[var(--color-secondary-black)]'
                      }`}
                  >
                    <div className="relative">
                      <Icon className="h-4 w-4" />
                      {showBadge && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full min-w-[16px] h-4 flex items-center justify-center font-bold">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </div>
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex-1 min-w-0">{renderContent()}</div>
      </div>
      {isEditing && (
        <EditProfileModal user={user} onSave={handleSaveProfile} onClose={() => setIsEditing(false)} t={t} />
      )}
      {isChangingPassword && (
        <ChangePasswordModal
          onClose={() => setIsChangingPassword(false)}
          onSave={handleChangePassword}
          t={t}
        />
      )}
    </div>
  );
};

export default UserProfile;