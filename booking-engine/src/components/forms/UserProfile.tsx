"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Heart, Lock, Bell, Calendar, ChevronDown, Edit3, Bookmark, CheckCircle, ChevronRight, Gift, Percent, Shield, Star, HelpCircle, Eye, EyeOff, LogOut } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { logout, getUser, updateProfile } from "@/Redux/slices/auth.slice";
import { AppDispatch, RootState } from "@/Redux/store";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

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

// Edit Profile Modal Component
const EditProfileModal = ({
  user,
  onSave,
  onClose
}: {
  user: UserProfile;
  onSave: (updatedUser: Partial<UserProfile> & { password?: string }) => Promise<void>;
  onClose: () => void;
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

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone number must be 10 digits";
    }
    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
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
        toast.error(error || "Failed to update profile");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg sm:text-xl font-semibold text-[var(--color-secondary-black)] mb-4">Edit Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-secondary-black)] mb-1">First Name</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)]"
            />
            {errors.firstName && <p className="text-xs text-red-600 mt-1">{errors.firstName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-secondary-black)] mb-1">Last Name</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)]"
            />
            {errors.lastName && <p className="text-xs text-red-600 mt-1">{errors.lastName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-secondary-black)] mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)]"
            />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-secondary-black)] mb-1">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => {
                // Only allow numbers and limit to 10 digits
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
              <p className="text-xs text-red-600 mt-1">Phone number must be 10 digits</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-secondary-black)] mb-1">
              New Password (optional)
            </label>
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

          {/* Updated Confirm Password Field */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-secondary-black)] mb-1">
              Confirm New Password
            </label>
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
            <Button
              variant="primary"
              size="md"
              type="submit"
              className="w-full sm:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={onClose}
              className="w-full sm:w-auto"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

// Main Component
const UserProfile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter(); // Add useRouter
  const { user: authUser } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'preferences' | 'security' | 'notifications' | 'help'>('overview');
  const [isEditing, setIsEditing] = useState(false);

  // Initialize with Redux user data or fallback to default
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
    // Fetch user data when component mounts
    if (Cookies.get("accessToken")) {
      dispatch(getUser());
    }
  }, [dispatch]);

  useEffect(() => {
    // Update local state when Redux user data changes
    if (authUser) {
      setUser(prev => ({
        ...prev,
        firstName: authUser.firstName || prev.firstName,
        lastName: authUser.lastName || prev.lastName,
        email: authUser.email || prev.email,
        phone: authUser.phone || prev.phone
      }));
    }
  }, [authUser]);

  const stats: StatsCardProps[] = [
    { icon: Calendar, title: "Trips Completed", value: "23", description: "Since joining" },
    { icon: Star, title: "Average Rating", value: "4.8", description: "From hosts" },
    { icon: Bookmark, title: "Saved Places", value: "47", description: "Wishlisted" }
  ];

  const menuItems = [
    { id: 'overview' as const, label: 'Overview', icon: User },
    { id: 'bookings' as const, label: 'My Trips', icon: Calendar },
    { id: 'preferences' as const, label: 'Preferences', icon: Heart },
    { id: 'security' as const, label: 'Security', icon: Shield },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'help' as const, label: 'Help Center', icon: HelpCircle }
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
  
      // Refresh user data from server
      await dispatch(getUser());
  
      setUser(prev => ({
        ...prev,
        firstName: updatedUser.firstName || prev.firstName,
        lastName: updatedUser.lastName || prev.lastName,
        email: updatedUser.email || prev.email,
        phone: updatedUser.phone || prev.phone
      }));
      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      toast.error(error || "Failed to update profile");
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
              <h3 className="text-base sm:text-lg font-semibold text-[var(--color-secondary-black)] mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <Button
                  variant="outline"
                  size="md"
                  className="flex flex-col items-center p-3 sm:p-4 h-auto"
                  onClick={() => router.push('/')}
                >
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mb-2 text-[var(--color-secondary-black)]" />
                  <span className="text-xs text-[var(--color-secondary-black)]">Book Trip</span>
                </Button>
                <Button variant="outline" size="md" className="flex flex-col items-center p-3 sm:p-4 h-auto" onClick={() => { }}>
                  <Heart className="h-4 w-4 sm:h-5 sm:w-5 mb-2 text-[var(--color-secondary-black)]" />
                  <span className="text-xs text-[var(--color-secondary-black)]">Saved Places</span>
                </Button>
                <Button variant="outline" size="md" className="flex flex-col items-center p-3 sm:p-4 h-auto" onClick={() => { }}>
                  <Gift className="h-4 w-4 sm:h-5 sm:w-5 mb-2 text-[var(--color-secondary-black)]" />
                  <span className="text-xs text-[var(--color-secondary-black)]">Rewards</span>
                </Button>
                <Button variant="outline" size="md" className="flex flex-col items-center p-3 sm:p-4 h-auto" onClick={() => { }}>
                  <Percent className="h-4 w-4 sm:h-5 sm:w-5 mb-2 text-[var(--color-secondary-black)]" />
                  <span className="text-xs text-[var(--color-secondary-black)]">Deals</span>
                </Button>
              </div>
            </Card>
            {/* Remove Recent Bookings section since it's handled on /my-trip */}
          </div>
        );

      case 'bookings':
        return null; // No content needed since redirect happens

      case 'security':
        return (
          <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-secondary-black)]">Security Settings</h2>
            <Card className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-3 sm:space-y-0">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-[var(--color-secondary-black)]">Password</h3>
                  <p className="text-sm text-[var(--color-secondary-black)]/60"> Update your password</p>
                </div>
                <Button variant="outline" size="md" className="flex items-center border-[var(--color-primary-blue)]/30 bg-[var(--color-primary-blue)]/5 text-[var(--color-primary-blue)] w-full sm:w-auto justify-center" onClick={() => setIsEditing(true)}>
                  <Lock className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
              </div>
            </Card>
            <Card className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-3 sm:space-y-0">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-[var(--color-secondary-black)]">Two-Factor Authentication</h3>
                  <p className="text-sm text-[var(--color-secondary-black)]/60">Add an extra layer of security to your account</p>
                </div>
                <Button variant="primary" size="md" onClick={() => { }} className="w-full sm:w-auto">
                  Enable 2FA
                </Button>
              </div>
            </Card>
            {/* <Card className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-[var(--color-secondary-black)] mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {[
                  { action: "Logged in", location: "New York, NY", time: "2 hours ago" },
                  { action: "Password changed", location: "New York, NY", time: "3 months ago" },
                  { action: "New device login", location: "Boston, MA", time: "6 months ago" }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[var(--color-secondary-black)] truncate">{activity.action}</p>
                      <p className="text-sm text-[var(--color-secondary-black)]/60 truncate">{activity.location}</p>
                    </div>
                    <span className="text-xs sm:text-sm text-[var(--color-secondary-black)]/60 ml-2 flex-shrink-0">{activity.time}</span>
                  </div>
                ))}
              </div>
            </Card> */}
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <p className="text-[var(--color-secondary-black)]/60">Content for {activeTab} coming soon...</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 sm:py-6">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <div className="relative flex-shrink-0">
                <Avatar
                  size="lg"
                  alt="User profile avatar"
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
                <p className="text-xs sm:text-sm text-[var(--color-secondary-black)]/60 truncate">Joined {user.joinDate}</p>
                {/* {user.phone && (
                  <p className="text-xs sm:text-sm text-[var(--color-secondary-black)]/60 truncate mt-1">{user.phone}</p>
                )} */}
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex items-center border-[var(--color-primary-blue)]/30 bg-[var(--color-primary-blue)]/5 text-[var(--color-primary-blue)]"
                onClick={() => setIsEditing(true)}
              >
                <span className="hidden sm:inline">Edit Profile</span>
                <Edit3 className="w-4 h-4 sm:ml-2" />
              </Button>
              {/* <Button
                variant="outline"
                size="sm"
                className="flex items-center border-[var(--color-primary-blue)]/30 bg-[var(--color-primary-blue)]/5 text-[var(--color-primary-blue)]"
                onClick={handleLogout}
              >
                <span className="hidden sm:inline">Sign Out</span>
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Mobile Tab Navigation */}
        <div className="w-full mb-4">
          <div className="bg-white rounded-lg border border-gray-200 p-1">
            <div className="flex overflow-x-auto space-x-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium rounded-md transition-colors min-w-[60px] ${activeTab === item.id
                      ? 'bg-[var(--color-primary-blue)]/10 text-[var(--color-primary-blue)]'
                      : 'text-[var(--color-secondary-black)]/60 hover:bg-gray-50 hover:text-[var(--color-secondary-black)]'
                      }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="truncate">{item.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {renderContent()}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <EditProfileModal
          user={user}
          onSave={handleSaveProfile}
          onClose={() => setIsEditing(false)}
        />
      )}
    </div>
  );
};

export default UserProfile;