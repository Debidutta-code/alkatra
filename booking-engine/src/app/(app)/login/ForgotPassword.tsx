// app/(app)/login/ForgotPassword.tsx
"use client";

import { useState } from "react";
import axios from "axios";
import { Mail, ArrowLeft, AlertTriangle, CheckCircle } from "lucide-react";
import FormInput from "@/components/auth/FormInput";
import AuthButton from "@/components/auth/AuthButton";
import AuthLayout from "@/components/auth/AuthLayout";

interface ForgotPasswordProps {
  onBack: () => void;
  onEmailVerified: (email: string) => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack, onEmailVerified }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");
  const [formFocus, setFormFocus] = useState<string | null>(null);

  const validateEmail = () => {
    if (!email.trim()) {
      setValidationError("Email is required");
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setValidationError("Please enter a valid email address");
      return false;
    }
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (validationError) {
      setValidationError("");
    }
    // Clear any previous errors when user is typing
    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate email before submission
    if (!validateEmail()) {
      return;
    }
    
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/verify/email`, { email });

      if (response.data.status === "success") {
        setMessage(response.data.message);
        onEmailVerified(email); // Send the verified email to the parent component
      } else {
        // Handle specific error for unverified or non-existent email
        setError(response.data.message || "Email not found. Please check your email address.");
      }
    } catch (error: any) {
      // More specific error handling
      if (error.response) {
        if (error.response.status === 404) {
          setError("Email not found. Please check your email address.");
        } else if (error.response.status === 401) {
          setError("Email not verified. Please verify your email first.");
        } else {
          setError(error.response.data?.message || "An error occurred. Please try again.");
        }
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot Password?"
      subtitle="Enter your registered email address to reset your password."
      heroTitle={<>Reset <span className="text-tripswift-blue">Password</span></>}
      heroSubtitle="We'll help you get back into your account safely and securely."
      benefits={[
        "Quick and easy password recovery process",
        "Secure password reset via email verification",
        "Access your account again within minutes"
      ]}
      footerContent={
        <button 
          onClick={onBack} 
          className="w-full text-center text-tripswift-blue text-sm hover:text-[#054B8F] font-tripswift-medium flex items-center justify-center"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Login
        </button>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormInput
          id="email"
          name="email"
          label="Email address"
          type="email"
          value={email}
          onChange={handleEmailChange}
          placeholder="you@example.com"
          error={validationError}
          icon={<Mail className="text-tripswift-blue" />}
          isFocused={formFocus === 'email'}
          onFocus={() => setFormFocus('email')}
          onBlur={() => setFormFocus(null)}
        />
        
        {/* Submit Button */}
        <AuthButton loading={loading} text="Send Reset Link" />
        
        {/* Success Message */}
        {message && (
          <div className="mt-4 text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200 flex items-center">
            <CheckCircle size={16} className="mr-2 flex-shrink-0 text-green-500" />
            <span className="font-tripswift-medium">{message}</span>
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200 flex items-center">
            <AlertTriangle size={16} className="mr-2 flex-shrink-0" />
            <span className="font-tripswift-medium">{error}</span>
          </div>
        )}
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;