import React, { useState, useEffect } from 'react';
import Card from './Card';
import Button from './Button';
import toast from 'react-hot-toast';

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

interface EditProfileModalProps {
  user: UserProfile;
  onSave: (updatedUser: Partial<UserProfile> & { password?: string }) => Promise<void>;
  onClose: () => void;
  t: (key: string, options?: any) => string;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ user, onSave, onClose, t }) => {
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = t('Auth.Validation.firstNameRequired', { defaultValue: 'First Name is required' });
    } else if (!/^[a-zA-Z\s]+$/.test(formData.firstName)) {
      newErrors.firstName = t('Auth.Validation.firstNameInvalid', {
        defaultValue: 'First Name must contain only letters and spaces',
      });
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = t('Auth.Validation.lastNameRequired', { defaultValue: 'Last Name is required' });
    } else if (!/^[a-zA-Z\s]+$/.test(formData.lastName)) {
      newErrors.lastName = t('Auth.Validation.lastNameInvalid', {
        defaultValue: 'Last Name must contain only letters and spaces',
      });
    }

    if (!formData.email.trim()) {
      newErrors.email = t('Auth.Validation.emailRequired', { defaultValue: 'Email is required' });
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('Auth.Validation.emailInvalid', { defaultValue: 'Please enter a valid email address' });
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t('BookingComponents.GuestInformationModal.phoneError', {
        defaultValue: 'Phone number is required',
      });
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = t('BookingComponents.GuestInformationModal.phoneLengthError', {
        defaultValue: 'Phone number for India must be exactly 10 digits.',
      });
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
          ...(formData.password && { password: formData.password }),
        });
        onClose();
      } catch (error: any) {
        toast.error(error || t('Profile.profileUpdateFailed', { defaultValue: 'Failed to update profile' }));
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2">
      <Card className="w-full max-w-md p-4 sm:p-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg sm:text-xl font-semibold text-[var(--color-secondary-black)] mb-2">
          {t('Profile.editProfile', { defaultValue: 'Edit Profile' })}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-2">
          <div>
            <label className="block text-sm font-medium text-[var(--color-secondary-black)] mb-1">
              {t('Auth.Register.firstNameLabel', { defaultValue: 'First Name' })}
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)]"
            />
            {errors.firstName && <p className="text-xs text-red-600 mt-1">{errors.firstName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-secondary-black)] mb-1">
              {t('Auth.Register.lastNameLabel', { defaultValue: 'Last Name' })}
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)]"
            />
            {errors.lastName && <p className="text-xs text-red-600 mt-1">{errors.lastName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-secondary-black)] mb-1">
              {t('Auth.Register.emailLabel', { defaultValue: 'Email' })}
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)]"
            />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-secondary-black)] mb-1">
              {t('BookingComponents.GuestInformationModal.phoneLabel', { defaultValue: 'Phone Number' })}
            </label>
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
            />
            {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
            {formData.phone.length !== 10 && formData.phone.length > 0 && (
              <p className="text-xs text-red-600 mt-1">
                {t('BookingComponents.GuestInformationModal.phoneLengthError', {
                  defaultValue: 'Phone number for India must be exactly 10 digits.',
                })}
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button variant="primary" size="md" type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
              {isSubmitting
                ? t('Auth.Button.processing', { defaultValue: 'Processing...' })
                : t('Auth.Register.updateAccountButton', { defaultValue: 'Save Changes' })}
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={onClose}
              className="w-full sm:w-auto"
              disabled={isSubmitting}
            >
              {t('BookingComponents.GuestInformationModal.cancel', { defaultValue: 'Cancel' })}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditProfileModal;