"use client";

import React, { useState } from "react";
import { User, Heart, Lock, Bell, Calendar, ChevronDown, Edit3, Award, Bookmark, Camera, CheckCircle, ChevronRight, Gift, HelpCircle, LogOut, Percent, Shield, Star, Menu, X } from "lucide-react";

// Types
interface Booking {
  id: string;
  hotelName: string;
  location: string;
  checkIn: string;
  checkOut: string;
  status: "Confirmed" | "Pending" | "Cancelled" | "Completed";
  amount: number;
  rating: number;
}

interface User {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  joinDate: string;
  membershipLevel: string;
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

interface BookingCardProps {
  booking: Booking;
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

// Booking Card Component
const BookingCard = ({ booking }: BookingCardProps) => {
  const statusColors: { [key in Booking['status']]: string } = {
    Confirmed: "bg-green-100 text-green-800",
    Pending: "bg-yellow-100 text-yellow-800",
    Cancelled: "bg-red-100 text-red-800",
    Completed: "bg-[var(--color-primary-blue)]/10 text-[var(--color-primary-blue)]"
  };

  return (
    <Card className="p-4 sm:p-6" hover>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 space-y-4 sm:space-y-0">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[var(--gradient)] rounded-xl flex items-center justify-center flex-shrink-0">
            <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-tripswift-blue" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-lg font-semibold text-[var(--color-secondary-black)] mb-1 truncate">{booking.hotelName}</h3>
            <p className="text-sm text-[var(--color-secondary-black)]/80 mb-2 truncate">{booking.location}</p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-[var(--color-secondary-black)]/60">
              <span>Check-in: {booking.checkIn}</span>
              <span>Check-out: {booking.checkOut}</span>
            </div>
          </div>
        </div>
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start text-right">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[booking.status]}`}>
            {booking.status}
          </span>
          <p className="text-lg font-semibold text-[var(--color-secondary-black)] sm:mt-2">${booking.amount}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-gray-100 space-y-3 sm:space-y-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`h-4 w-4 ${i < booking.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
            ))}
          </div>
          <span className="text-sm text-[var(--color-secondary-black)]/80">({booking.rating}/5)</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { }}>
            View Details
          </Button>
        </div>
      </div>
    </Card>
  );
};

// Edit Profile Modal Component
const EditProfileModal = ({
  user,
  onSave,
  onClose
}: {
  user: User;
  onSave: (updatedUser: Partial<User> & { password?: string }) => void;
  onClose: () => void;
}) => {
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        ...(formData.password && { password: formData.password })
      });
      onClose();
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
            <label className="block text-sm font-medium text-[var(--color-secondary-black)] mb-1">New Password (optional)</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)]"
            />
            {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-secondary-black)] mb-1">Confirm New Password</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)]"
            />
            {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button variant="primary" size="md" type="submit" className="w-full sm:w-auto">
              Save Changes
            </Button>
            <Button variant="outline" size="md" onClick={onClose} className="w-full sm:w-auto">
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
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'preferences' | 'security' | 'notifications' | 'help'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User>({
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@example.com",
    phone: "+1 (555) 123-4567",
    joinDate: "March 2022",
    membershipLevel: "Gold Member",
    profilePicture: null,
    verified: true,
    location: "New York, USA"
  });

  const stats: StatsCardProps[] = [
    { icon: Calendar, title: "Trips Completed", value: "23", description: "Since joining" },
    { icon: Star, title: "Average Rating", value: "4.8", description: "From hosts" },
    { icon: Award, title: "Member Level", value: "Gold", description: "Elite status" },
    { icon: Bookmark, title: "Saved Places", value: "47", description: "Wishlisted" }
  ];

  const recentBookings: Booking[] = [
    {
      id: "1",
      hotelName: "The Ritz-Carlton",
      location: "New York, NY",
      checkIn: "Dec 15, 2024",
      checkOut: "Dec 18, 2024",
      status: "Completed",
      amount: 1299,
      rating: 5
    },
    {
      id: "2",
      hotelName: "Grand Hyatt",
      location: "San Francisco, CA",
      checkIn: "Jan 22, 2025",
      checkOut: "Jan 25, 2025",
      status: "Confirmed",
      amount: 890,
      rating: 4
    },
    {
      id: "3",
      hotelName: "Marriott Downtown",
      location: "Chicago, IL",
      checkIn: "Feb 10, 2025",
      checkOut: "Feb 12, 2025",
      status: "Pending",
      amount: 450,
      rating: 4
    }
  ];

  const menuItems = [
    { id: 'overview' as const, label: 'Overview', icon: User },
    { id: 'bookings' as const, label: 'My Trips', icon: Calendar },
    { id: 'preferences' as const, label: 'Preferences', icon: Heart },
    { id: 'security' as const, label: 'Security', icon: Shield },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'help' as const, label: 'Help Center', icon: HelpCircle }
  ];

  const handleSaveProfile = (updatedUser: Partial<User> & { password?: string }) => {
    setUser((prev) => ({
      ...prev,
      firstName: updatedUser.firstName || prev.firstName,
      lastName: updatedUser.lastName || prev.lastName,
      email: updatedUser.email || prev.email,
    }));
    console.log("Updated user:", updatedUser);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {stats.map((stat, index) => (
                <StatsCard key={index} {...stat} />
              ))}
            </div>
            <Card className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-[var(--color-secondary-black)] mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <Button variant="outline" size="md" className="flex flex-col items-center p-3 sm:p-4 h-auto" onClick={() => { }}>
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
            <ProfileSection title="Recent Bookings" defaultOpen={true}>
              <div className="space-y-4 mt-4">
                {recentBookings.slice(0, 2).map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            </ProfileSection>
          </div>
        );

      case 'bookings':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-secondary-black)]">My Trips</h2>
            </div>
            <div className="flex gap-2 sm:gap-4 border-b border-gray-200 overflow-x-auto">
              {['All', 'Upcoming', 'Past', 'Cancelled'].map((tab) => (
                <button
                  key={tab}
                  className={`pb-3 px-2 sm:px-1 text-sm font-medium whitespace-nowrap border-b-2 ${
                    tab === 'All' 
                      ? 'border-[var(--color-primary-blue)] text-[var(--color-primary-blue)]' 
                      : 'border-transparent text-[var(--color-secondary-black)]/60 hover:text-[var(--color-secondary-black)] hover:border-gray-300'
                  }`}
                  onClick={() => { }}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-secondary-black)]">Security Settings</h2>
            <Card className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-3 sm:space-y-0">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-[var(--color-secondary-black)]">Password</h3>
                  <p className="text-sm text-[var(--color-secondary-black)]/60">Last updated 3 months ago</p>
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
            <Card className="p-4 sm:p-6">
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
            </Card>
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
                <button className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full shadow-md flex items-center justify-center border border-gray-200 hover:bg-gray-50">
                  <Camera className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-[var(--color-secondary-black)]" />
                </button>
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
                <p className="text-xs sm:text-sm text-[var(--color-secondary-black)]/60 truncate">{user.membershipLevel} • Joined {user.joinDate}</p>
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
              <Button
                variant="outline"
                size="sm"
                className="flex items-center border-[var(--color-primary-blue)]/30 bg-[var(--color-primary-blue)]/5 text-[var(--color-primary-blue)]"
                onClick={() => { }}
              >
                <span className="hidden sm:inline">Sign Out</span>
                <LogOut className="h-4 w-4 sm:ml-2" />
              </Button>
              {/* Mobile Edit Button */}
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
                    onClick={() => setActiveTab(item.id)}
                    className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium rounded-md transition-colors min-w-[60px] ${
                      activeTab === item.id
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