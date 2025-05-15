// app/(app)/login/UpdatePassword.tsx
"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertTriangle } from "lucide-react";

// Import shared auth components
import AuthLayout from "@/components/auth/AuthLayout";
import PasswordInput from "@/components/auth/PasswordInput";
import AuthButton from "@/components/auth/AuthButton";

interface UpdatePasswordProps {
  email: string;
  onBack: () => void;
}

const UpdatePassword: React.FC<UpdatePasswordProps> = ({ email, onBack }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [formFocus, setFormFocus] = useState<string | null>(null);
  const [errors, setErrors] = useState({
    newPassword: "",
    confirmPassword: ""
  });
  
  const router = useRouter();

  // Password validation function
  const validatePassword = (password: string) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const validateForm = () => {
    const newErrors = {
      newPassword: "",
      confirmPassword: ""
    };
    let isValid = true;

    // Validate new password
    if (!newPassword.trim()) {
      newErrors.newPassword = "Password is required";
      isValid = false;
    } else if (!validatePassword(newPassword)) {
      newErrors.newPassword = "Password must contain at least 8 characters including one uppercase letter, one lower case letter, one number and one special character.";
      isValid = false;
    }

    // Validate confirm password
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'newPassword') {
      setNewPassword(value);
      if (errors.newPassword) {
        setErrors(prev => ({ ...prev, newPassword: "" }));
      }
    } else if (name === 'confirmPassword') {
      setConfirmPassword(value);
      if (errors.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: "" }));
      }
    }
    
    // Clear any general error message when typing
    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await axios.patch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/update/password`, {
        email,
        newPassword,
      });

      if (response.data.status === "success") {
        setMessage("Your password has been reset successfully.");
        
        // Clear form
        setNewPassword("");
        setConfirmPassword("");
        
        // Set a timeout to redirect to login with a query parameter
        setTimeout(() => {
          router.push("/login?fromReset=true");
        }, 2000);
      } else {
        setError(response.data.message || "An error occurred. Please try again.");
      }
    } catch (error: any) {
      if (error.response) {
        setError(error.response.data?.message || "An error occurred. Please try again.");
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset Password"
      subtitle={`Enter a new password for ${email}`}
      heroTitle={<>Create <span className="text-blue-200">New Password</span></>}
      heroSubtitle="Set a strong, secure password for your account to keep your travel plans safe."
      benefits={[
        "Create a stronger password to enhance security",
        "Protect your personal information and bookings",
        "Get back to exploring travel deals right away"
      ]}
      footerContent={
        <button 
          onClick={onBack} 
          className="w-full text-center text-blue-600 text-sm hover:text-blue-800 font-medium flex items-center justify-center"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Login
        </button>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* New Password Field */}
        <PasswordInput
          id="newPassword"
          name="newPassword"
          label="New Password"
          value={newPassword}
          onChange={handleChange}
          error={errors.newPassword}
          isFocused={formFocus === 'newPassword'}
          onFocus={() => setFormFocus('newPassword')}
          onBlur={() => setFormFocus(null)}
          helpText="Password must contain at least 8 characters including one uppercase letter, one lowercase letter, one number and one special character."
        />
        
        {/* Confirm Password Field */}
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm Password"
          value={confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          isFocused={formFocus === 'confirmPassword'}
          onFocus={() => setFormFocus('confirmPassword')}
          onBlur={() => setFormFocus(null)}
        />
        
        {/* Submit Button */}
        <AuthButton loading={loading} text="Reset Password" />
        
        {/* Success Message */}
        {message && (
          <div className="mt-4 text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
            {message}
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200 flex items-center">
            <AlertTriangle size={16} className="mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </form>
    </AuthLayout>
  );
};

export default UpdatePassword;