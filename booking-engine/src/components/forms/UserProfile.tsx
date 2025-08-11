"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Heart, Lock, Bell, Calendar, ChevronDown, Edit3, Bookmark, CheckCircle, ChevronRight, Gift, Percent, Shield, Star, HelpCircle, Eye, EyeOff, LogOut, Check, X, AlertTriangle, Volume2, VolumeX, Smartphone, Mail } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { logout, getUser, updateProfile } from "../../Redux/slices/auth.slice";
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  updateNotificationReadStatus,
  clearNotifications
} from "../../Redux/slices/notification.slice";
import { AppDispatch, RootState } from "../../Redux/store";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { formatDistanceToNow } from 'date-fns';

// Types
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

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

interface ButtonProps {
  children: React.ReactNode;
  variant: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size: "sm" | "md" | "lg";
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

interface StatsCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  description: string;
}

interface ProfileSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

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

// Avatar Component
const Avatar = ({
  size = "md",
  src,
  alt,
  fallback
}: {
  size?: "sm" | "md" | "lg";
  src?: string;
  alt?: string;
  fallback?: React.ReactNode;
}) => {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16"
  };

  return (
    <div className={`${sizes[size]} rounded-full overflow-hidden bg-[var(--color-primary-blue)] flex items-center justify-center border-2 border-[var(--color-primary-blue)]`}>
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        fallback
      )}
    </div>
  );
};

// Card Component
const Card = ({ children, className = "", hover = false }: CardProps) => (
  <div className={`bg-[var(--color-primary-off-white)] rounded-2xl shadow-sm border border-gray-100 ${hover ? 'hover:shadow-md transition-shadow duration-200' : ''} ${className}`}>
    {children}
  </div>
);

// Button Component
const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  onClick,
  disabled = false,
  type = "button"
}: ButtonProps) => {
  const variants: { [key in ButtonProps['variant']]: string } = {
    primary: "bg-[var(--color-primary-blue)] text-[var(--color-primary-off-white)] hover:bg-[#054B8F]",
    secondary: "bg-[var(--color-secondary-off-white)] text-[var(--color-secondary-black)] hover:bg-gray-200",
    outline: "border border-gray-300 text-[var(--color-secondary-black)] hover:bg-gray-50",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "text-[var(--color-secondary-black)] hover:bg-gray-100"
  };

  const sizes: { [key in ButtonProps['size']]: string } = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  return (
    <button
      type={type}
      className={`${variants[variant]} ${sizes[size]} rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

// Stats Card Component
const StatsCard = ({ icon: Icon, title, value, description }: StatsCardProps) => (
  <Card className="p-4 sm:p-6 text-center" hover>
    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[var(--color-primary-blue)]/10 rounded-full flex items-center justify-center mx-auto mb-3">
      <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-[var(--color-primary-blue)]" />
    </div>
    <h3 className="text-xl sm:text-2xl font-bold text-[var(--color-secondary-black)] mb-1">{value}</h3>
    <p className="text-xs sm:text-sm font-medium text-[var(--color-secondary-black)]/60 mb-1">{title}</p>
    <p className="text-xs text-[var(--color-secondary-black)]/50">{description}</p>
  </Card>
);

// Profile Section Component
const ProfileSection = ({ title, children, defaultOpen = true }: ProfileSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card className="overflow-hidden">
      <div
        className="flex items-center justify-between p-4 sm:p-6 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h2 className="text-base sm:text-lg font-semibold text-[var(--color-secondary-black)]">{title}</h2>
        {isOpen ? (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronRight className="h-5 w-5 text-gray-500" />
        )}
      </div>
      {isOpen && <div className="p-4 sm:p-6 pt-0">{children}</div>}
    </Card>
  );
};

// Notification Item Component
const NotificationItem = ({
  notification,
  onMarkAsRead,
  onRemove,
  t
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onRemove: (id: string) => void;
  t: (key: string, options?: any) => string;
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
              <p className="text-xs text-gray-600 mt-1">
                {notification.body}
              </p>
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
              {!notification.isRead && (
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
              )}
              <button
                onClick={() => onRemove(notification.id)}
                className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
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

// Edit Profile Modal Component
const EditProfileModal = ({
  user,
  onSave,
  onClose,
  t
}: {
  user: UserProfile;
  onSave: (updatedUser: Partial<UserProfile> & { password?: string }) => Promise<void>;
  onClose: () => void;
  t: (key: string, options?: any) => string;
}) => {
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.firstName.trim()) newErrors.firstName = t("Auth.Validation.firstNameRequired", { defaultValue: "First Name is required" });
    if (!formData.lastName.trim()) newErrors.lastName = t("Auth.Validation.lastNameRequired", { defaultValue: "Last Name is required" });
    if (!formData.email.trim()) {
      newErrors.email = t("Auth.Validation.emailRequired", { defaultValue: "Email is required" });
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t("Auth.Validation.emailInvalid", { defaultValue: "Please enter a valid email address" });
    }
    if (!formData.phone.trim()) {
      newErrors.phone = t("BookingComponents.GuestInformationModal.phoneError", { defaultValue: "Phone number is required" });
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = t("BookingComponents.GuestInformationModal.phoneLengthError", { defaultValue: "Phone number for India must be exactly 10 digits." });
    }
    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t("Auth.Validation.passwordsDoNotMatch", { defaultValue: "Passwords do not match" });
    }
    if (formData.password && formData.password.length < 6) {
      newErrors.password = t("Auth.Validation.minLength", { defaultValue: "Must be at least {{count}} characters", count: 6 });
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        await onSave({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          ...(formData.password && { password: formData.password })
        });
        onClose();
      } catch (error: any) {
        toast.error(error || t("Profile.profileUpdateFailed", { defaultValue: "Failed to update profile" }));
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2">
      <Card className="w-full max-w-md p-4 sm:p-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg sm:text-xl font-semibold text-[var(--color-secondary-black)] mb-2">{t("Profile.editProfile", { defaultValue: "Edit Profile" })}</h2>
        <form onSubmit={handleSubmit} className="space-y-2">
          <div>
            <label className="block text-sm font-medium text-[var(--color-secondary-black)] mb-1">{t("Auth.Register.firstNameLabel", { defaultValue: "First Name" })}</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)]"
            />
            {errors.firstName && <p className="text-xs text-red-600 mt-1">{errors.firstName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-secondary-black)] mb-1">{t("Auth.Register.lastNameLabel", { defaultValue: "Last Name" })}</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)]"
            />
            {errors.lastName && <p className="text-xs text-red-600 mt-1">{errors.lastName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-secondary-black)] mb-1">{t("Auth.Register.emailLabel", { defaultValue: "Email" })}</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)]"
            />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-secondary-black)] mb-1">{t("BookingComponents.GuestInformationModal.phoneLabel", { defaultValue: "Phone Number" })}</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                setFormData({ ...formData, phone: value });
              }}
              pattern="[0-9]{10}"
              maxLength={10}
              inputMode="numeric"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)]"
              required
            />
            {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
            {formData.phone.length !== 10 && formData.phone.length > 0 && (
              <p className="text-xs text-red-600 mt-1">{t("BookingComponents.GuestInformationModal.phoneLengthError", { defaultValue: "Phone number for India must be exactly 10 digits." })}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-secondary-black)] mb-1">{t("Profile.newPasswordOptional", { defaultValue: "New Password (optional)" })}</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500" />
                )}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-secondary-black)] mb-1">{t("Profile.confirmNewPassword", { defaultValue: "Confirm New Password" })}</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500" />
                )}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button variant="primary" size="md" type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
              {isSubmitting ? t("Auth.Button.processing", { defaultValue: "Processing..." }) : t("Auth.Register.createAccountButton", { defaultValue: "Save Changes" })}
            </Button>
            <Button variant="outline" size="md" onClick={onClose} className="w-full sm:w-auto" disabled={isSubmitting}>
              {t("BookingComponents.GuestInformationModal.cancel", { defaultValue: "Cancel" })}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

// Main Component
const UserProfile: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user: authUser } = useSelector((state: RootState) => state.auth);
  const { notifications, unreadCount, isLoading } = useSelector((state: RootState) => state.notifications);
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'preferences' | 'security' | 'notifications' | 'help'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    sms: false,
    marketing: true,
    bookingUpdates: true,
    promotions: true
  });

  const [user, setUser] = useState<UserProfile>({
    firstName: authUser?.firstName || "Guest",
    lastName: authUser?.lastName || "User",
    email: authUser?.email || "",
    phone: authUser?.phone || "",
    joinDate: authUser?.createdAt
      ? new Date(authUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      : "March 2025",
    profilePicture: null,
    verified: true,
    location: "New York, USA"
  });

  useEffect(() => {
    if (Cookies.get("accessToken")) {
      dispatch(getUser());
    }
  }, [dispatch]);

  useEffect(() => {
    if (authUser) {
      setUser(prev => ({
        ...prev,
        firstName: authUser.firstName || prev.firstName,
        lastName: authUser.lastName || prev.lastName,
        email: authUser.email || prev.email,
        phone: authUser.phone || prev.phone
      }));

      // Load notifications when user is available
      if (authUser._id) {
        dispatch(fetchNotifications(authUser._id));
      }
    }
  }, [authUser, dispatch]);

  const stats: StatsCardProps[] = [
    { icon: Calendar, title: t("Profile.tripsCompleted", { defaultValue: "Trips Completed" }), value: "23", description: t("Profile.sinceJoining", { defaultValue: "Since joining" }) },
    { icon: Star, title: t("Profile.averageRating", { defaultValue: "Average Rating" }), value: "4.8", description: t("Profile.fromHosts", { defaultValue: "From hosts" }) },
    { icon: Bookmark, title: t("Profile.savedPlaces", { defaultValue: "Saved Places" }), value: "47", description: t("Profile.wishlisted", { defaultValue: "Wishlisted" }) }
  ];

  const tabTranslationKeys: Record<typeof activeTab, string> = {
    overview: "Profile.overview",
    bookings: "Profile.myTrips",
    preferences: "Profile.preferences",
    security: "Profile.security",
    notifications: "Profile.notifications",
    help: "Profile.helpCenter"
  };

  const menuItems = [
    { id: 'overview' as const, label: t("Profile.overview", { defaultValue: "Overview" }), icon: User },
    // { id: 'bookings' as const, label: t("Profile.myTrips", { defaultValue: "My Trips" }), icon: Calendar },
    { id: 'preferences' as const, label: t("Profile.preferences", { defaultValue: "Preferences" }), icon: Heart },
    { id: 'security' as const, label: t("Profile.security", { defaultValue: "Security" }), icon: Shield },
    { id: 'notifications' as const, label: t("Profile.notifications", { defaultValue: "Notifications" }), icon: Bell },
    { id: 'help' as const, label: t("Profile.helpCenter", { defaultValue: "Help Center" }), icon: HelpCircle }
  ];

  const handleSaveProfile = async (updatedUser: Partial<UserProfile> & { password?: string }) => {
    try {
      await dispatch(updateProfile({
        firstName: updatedUser.firstName || user.firstName,
        lastName: updatedUser.lastName || user.lastName,
        email: updatedUser.email || user.email,
        phone: updatedUser.phone || user.phone,
        ...(updatedUser.password && { password: updatedUser.password })
      })).unwrap();
      await dispatch(getUser());
      setUser(prev => ({
        ...prev,
        firstName: updatedUser.firstName || prev.firstName,
        lastName: updatedUser.lastName || prev.lastName,
        email: updatedUser.email || prev.email,
        phone: updatedUser.phone || prev.phone
      }));
      toast.success(t("Profile.profileUpdatedSuccess", { defaultValue: "Profile updated successfully" }));
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      toast.error(error || t("Profile.profileUpdateFailed", { defaultValue: "Failed to update profile" }));
      if (error === "Session expired. Please log in again.") {
        window.location.href = "/login";
      }
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = "/login";
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
        const unreadNotifications = notifications.filter(n => !n.isRead);
        await Promise.all(
          unreadNotifications.map(n =>
            dispatch(updateNotificationReadStatus(authUser._id, n.id))
          )
        );
        dispatch(markAllAsRead());
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
      }
    }
  };

  const handleClearAllNotifications = () => {
    dispatch(clearNotifications());
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
              <h3 className="text-base sm:text-lg font-semibold text-[var(--color-secondary-black)] mb-4">{t("Profile.quickActions", { defaultValue: "Quick Actions" })}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <Button
                  variant="outline"
                  size="md"
                  className="flex flex-col items-center p-3 sm:p-4 h-auto"
                  onClick={() => router.push('/')}
                >
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mb-2 text-[var(--color-secondary-black)]" />
                  <span className="text-xs text-[var(--color-secondary-black)]">{t("Profile.bookTrip", { defaultValue: "Book Trip" })}</span>
                </Button>
                <Button variant="outline" size="md" className="flex flex-col items-center p-3 sm:p-4 h-auto" onClick={() => { }}>
                  <Heart className="h-4 w-4 sm:h-5 sm:w-5 mb-2 text-[var(--color-secondary-black)]" />
                  <span className="text-xs text-[var(--color-secondary-black)]">{t("Profile.savedPlacesAction", { defaultValue: "Saved Places" })}</span>
                </Button>
                <Button variant="outline" size="md" className="flex flex-col items-center p-3 sm:p-4 h-auto" onClick={() => { }}>
                  <Gift className="h-4 w-4 sm:h-5 sm:w-5 mb-2 text-[var(--color-secondary-black)]" />
                  <span className="text-xs text-[var(--color-secondary-black)]">{t("Profile.rewards", { defaultValue: "Rewards" })}</span>
                </Button>
                <Button variant="outline" size="md" className="flex flex-col items-center p-3 sm:p-4 h-auto" onClick={() => { }}>
                  <Percent className="h-4 w-4 sm:h-5 sm:w-5 mb-2 text-[var(--color-secondary-black)]" />
                  <span className="text-xs text-[var(--color-secondary-black)]">{t("Profile.deals", { defaultValue: "Deals" })}</span>
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
                  {t("Profile.notifications", { defaultValue: "Notifications" })}
                </h2>
                <p className="text-sm text-[var(--color-secondary-black)]/60 mt-1">
                  {t("Profile.notificationsDesc", { defaultValue: "Manage your notification preferences and view recent notifications" })}
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
                    {t("notifications.markAllRead", { defaultValue: "Mark all read" })}
                  </Button>
                )}
                {/* <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAllNotifications}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                  {t("Profile.clearAll", { defaultValue: "Clear all" })}
                </Button> */}
              </div>
            </div>

            {/* Notification Settings */}
            {/* <Card className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-[var(--color-secondary-black)] mb-4">
                {t("Profile.notificationSettings", { defaultValue: "Notification Settings" })}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-[var(--color-primary-blue)]" />
                    <div>
                      <p className="text-sm font-medium text-[var(--color-secondary-black)]">
                        {t("Profile.emailNotifications", { defaultValue: "Email Notifications" })}
                      </p>
                      <p className="text-xs text-[var(--color-secondary-black)]/60">
                        {t("Profile.emailNotificationsDesc", { defaultValue: "Receive notifications via email" })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setNotificationSettings(prev => ({ ...prev, email: !prev.email }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notificationSettings.email ? 'bg-[var(--color-primary-blue)]' : 'bg-gray-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notificationSettings.email ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-5 w-5 text-[var(--color-primary-blue)]" />
                    <div>
                      <p className="text-sm font-medium text-[var(--color-secondary-black)]">
                        {t("Profile.pushNotifications", { defaultValue: "Push Notifications" })}
                      </p>
                      <p className="text-xs text-[var(--color-secondary-black)]/60">
                        {t("Profile.pushNotificationsDesc", { defaultValue: "Receive push notifications on your device" })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setNotificationSettings(prev => ({ ...prev, push: !prev.push }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notificationSettings.push ? 'bg-[var(--color-primary-blue)]' : 'bg-gray-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notificationSettings.push ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Volume2 className="h-5 w-5 text-[var(--color-primary-blue)]" />
                    <div>
                      <p className="text-sm font-medium text-[var(--color-secondary-black)]">
                        {t("Profile.bookingUpdates", { defaultValue: "Booking Updates" })}
                      </p>
                      <p className="text-xs text-[var(--color-secondary-black)]/60">
                        {t("Profile.bookingUpdatesDesc", { defaultValue: "Get notified about booking confirmations and changes" })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setNotificationSettings(prev => ({ ...prev, bookingUpdates: !prev.bookingUpdates }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notificationSettings.bookingUpdates ? 'bg-[var(--color-primary-blue)]' : 'bg-gray-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notificationSettings.bookingUpdates ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Gift className="h-5 w-5 text-[var(--color-primary-blue)]" />
                    <div>
                      <p className="text-sm font-medium text-[var(--color-secondary-black)]">
                        {t("Profile.promotionsDeals", { defaultValue: "Promotions & Deals" })}
                      </p>
                      <p className="text-xs text-[var(--color-secondary-black)]/60">
                        {t("Profile.promotionsDealsDesc", { defaultValue: "Receive notifications about special offers and promotions" })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setNotificationSettings(prev => ({ ...prev, promotions: !prev.promotions }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notificationSettings.promotions ? 'bg-[var(--color-primary-blue)]' : 'bg-gray-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notificationSettings.promotions ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            </Card> */}

            {/* Recent Notifications */}
            <Card className="overflow-hidden">
              <div className="p-4 sm:p-6 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-semibold text-[var(--color-secondary-black)]">
                    {t("Profile.recentNotifications", { defaultValue: "Recent Notifications" })}
                  </h3>
                  {unreadCount > 0 && (
                    <span className="bg-[var(--color-primary-blue)] text-white text-xs px-2 py-1 rounded-full">
                      {unreadCount} {t("notifications.unread", { defaultValue: "unread" })}
                    </span>
                  )}
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <div className="w-8 h-8 border-2 border-[var(--color-primary-blue)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-sm text-[var(--color-secondary-black)]/60">
                      {t("notifications.loading", { defaultValue: "Loading notifications..." })}
                    </p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-[var(--color-primary-blue)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bell className="h-8 w-8 text-[var(--color-primary-blue)]/50" />
                    </div>
                    <p className="text-sm font-medium text-[var(--color-secondary-black)]/60">
                      {t("notifications.noNotifications", { defaultValue: "No notifications yet" })}
                    </p>
                    <p className="text-xs text-[var(--color-secondary-black)]/40 mt-1">
                      {t("notifications.emptyDescription", { defaultValue: "When you have notifications, they'll appear here" })}
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
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-secondary-black)]">{t("Profile.securitySettings", { defaultValue: "Security Settings" })}</h2>
            <Card className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-3 sm:space-y-0">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-[var(--color-secondary-black)]">{t("Profile.changePassword", { defaultValue: "Password" })}</h3>
                  <p className="text-sm text-[var(--color-secondary-black)]/60">{t("Profile.updatePassword", { defaultValue: "Update your password" })}</p>
                </div>
                <Button variant="outline" size="md" className="flex items-center border-[var(--color-primary-blue)]/30 bg-[var(--color-primary-blue)]/5 text-[var(--color-primary-blue)] w-full sm:w-auto justify-center" onClick={() => setIsEditing(true)}>
                  <Lock className="h-4 w-4 mr-2" />
                  {t("Profile.changePassword", { defaultValue: "Change Password" })}
                </Button>
              </div>
            </Card>
            <Card className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-3 sm:space-y-0">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-[var(--color-secondary-black)]">{t("Profile.twoFactorAuth", { defaultValue: "Two-Factor Authentication" })}</h3>
                  <p className="text-sm text-[var(--color-secondary-black)]/60">{t("Profile.twoFactorDesc", { defaultValue: "Add an extra layer of security to your account" })}</p>
                </div>
                <Button variant="primary" size="md" onClick={() => { }} className="w-full sm:w-auto">
                  {t("Profile.enable2FA", { defaultValue: "Enable 2FA" })}
                </Button>
              </div>
            </Card>
          </div>
        );
      default:
        return (
          <div className="text-center py-12">
            <p className="text-[var(--color-secondary-black)]/60">{t("Profile.contentComingSoon", { defaultValue: "Content for {{tab}} coming soon...", tab: t(tabTranslationKeys[activeTab], { defaultValue: activeTab }) })}</p>
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
                  alt={t("Profile.avatarAlt", { defaultValue: "User profile avatar" })}
                  fallback={
                    <span className="text-lg sm:text-xl font-bold text-[var(--color-primary-off-white)]">
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </span>
                  }
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-2xl font-bold text-[var(--color-secondary-black)] truncate">
                    {user.firstName} {user.lastName}
                  </h1>
                  {user.verified && (
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs sm:text-sm text-[var(--color-secondary-black)]/60 truncate">{t("Profile.joined", { defaultValue: "Joined {{date}}", date: user.joinDate })}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex items-center border-[var(--color-primary-blue)]/30 bg-[var(--color-primary-blue)]/5 text-[var(--color-primary-blue)]"
                onClick={() => setIsEditing(true)}
              >
                <span className="hidden sm:inline">{t("Profile.editProfile", { defaultValue: "Edit Profile" })}</span>
                <Edit3 className="w-4 h-4 sm:ml-2" />
              </Button>
              {/* <Button
                variant="outline"
                size="sm"
                className="flex items-center border-[var(--color-primary-blue)]/30 bg-[var(--color-primary-blue)]/5 text-[var(--color-primary-blue)]"
                onClick={handleLogout}
              >
                <span className="hidden sm:inline">{t("Profile.signOut", { defaultValue: "Sign Out" })}</span>
                <LogOut className="h-4 w-4 sm:ml-2" />
              </Button> */}
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
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
        <div className="flex-1 min-w-0">
          {renderContent()}
        </div>
      </div>
      {isEditing && (
        <EditProfileModal
          user={user}
          onSave={handleSaveProfile}
          onClose={() => setIsEditing(false)}
          t={t}
        />
      )}
    </div>
  );
};

export default UserProfile;