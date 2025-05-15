// src/app/(app)/login/authLogin.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "@/Redux/store";
import { login } from "@/Redux/slices/auth.slice";
import { Mail } from "lucide-react";
import toast from "react-hot-toast";
import Cookies from "js-cookie";

// Import shared components
import AuthLayout from "@/components/auth/AuthLayout";
import FormInput from "@/components/auth/FormInput";
import PasswordInput from "@/components/auth/PasswordInput";
import AuthButton from "@/components/auth/AuthButton";
import { useFormValidation } from "@/components/auth/hooks/useFormValidation";
import { getUser } from "@/Redux/slices/pmsHotelCard.slice";
import ForgotPassword from "./ForgotPassword";
import UpdatePassword from "./UpdatePassword";

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isUpdatePassword, setIsUpdatePassword] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");
  
  const dispatch = useDispatch();
  const router = useRouter();
  
  const { 
    values, 
    errors, 
    formFocus, 
    handleChange, 
    handleFocus, 
    handleBlur,
    validateForm 
  } = useFormValidation(
    { email: "", password: "" },
    {
      email: { required: true, email: true },
      password: { required: true }
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
  
    try {
      await dispatch(login({ email: values.email, password: values.password }));
      
      if (rememberMe) {
        Cookies.set("rememberMe", "true", { expires: 14 });
      }
      
      toast.success("Login successful! Welcome back.", {
        icon: '👋',
        duration: 3000,
      });
      
      setLoading(false);
  
      const redirectUrl = Cookies.get("redirectAfterLogin") || "/";
      await dispatch(getUser());
      Cookies.remove("redirectAfterLogin");
  
      router.replace(redirectUrl);
    } catch (error: any) {
      toast.error("Incorrect email or password. Please try again.", {
        icon: '❌',
      });
      setLoading(false);
    }
  };

  // Show different components based on state
  if (isForgotPassword) {
    return (
      <ForgotPassword
        onBack={() => setIsForgotPassword(false)}
        onEmailVerified={(email) => {
          setVerifiedEmail(email);
          setIsForgotPassword(false);
          setIsUpdatePassword(true);
        }}
      />
    );
  }
  
  if (isUpdatePassword) {
    return (
      <UpdatePassword 
        email={verifiedEmail} 
        onBack={() => setIsUpdatePassword(false)} 
      />
    );
  }

  return (
    <AuthLayout
      title="Sign in to your account"
      subtitle="Welcome back! Please enter your credentials."
      heroTitle={<>Welcome <span className="text-blue-200">Back</span></>}
      heroSubtitle="Sign in to access exclusive deals and manage your upcoming adventures with ease."
      benefits={[
        "Access to exclusive member-only rates and offers",
        "Free cancellation on most bookings with flexible options",
        "Priority customer service and travel support"
      ]}
      footerContent={
        <p className="text-center text-gray-600">
          Don&#39;t have an account yet?{" "}
          <Link 
            href="/register" 
            className="font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            Create an account
          </Link>
        </p>
      }
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Email Field */}
        <FormInput
          id="email"
          name="email"
          label="Email address"
          type="email"
          value={values.email}
          onChange={handleChange}
          placeholder="you@example.com"
          error={errors.email}
          icon={<Mail />}
          isFocused={formFocus === 'email'}
          onFocus={() => handleFocus('email')}
          onBlur={() => handleBlur('email')}
        />

        {/* Password Field */}
        <PasswordInput
          id="password"
          name="password"
          label="Password"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
          isFocused={formFocus === 'password'}
          onFocus={() => handleFocus('password')}
          onBlur={() => handleBlur('password')}
          showForgotPassword={true}
          onForgotPasswordClick={() => setIsForgotPassword(true)}
        />

        {/* Remember Me */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="remember"
            checked={rememberMe}
            onChange={() => setRememberMe(!rememberMe)}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
            Remember me
          </label>
        </div>

        {/* Submit Button */}
        <AuthButton loading={loading} text="Sign in" />
      </form>
    </AuthLayout>
  );
};

export default Login;