//src/app/(app)/register/authRegister.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Mail, User } from "lucide-react";
import toast from "react-hot-toast";

// Import shared components
import AuthLayout from "@/components/auth/AuthLayout";
import FormInput from "@/components/auth/FormInput";
import PasswordInput from "@/components/auth/PasswordInput";
import AuthButton from "@/components/auth/AuthButton";
import { useFormValidation } from "@/components/auth/hooks/useFormValidation";

const Register: React.FC = () => {
  const [loading, setLoading] = useState(false);
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
    {
      firstName: "",
      lastName: "",
      email: "",
      password: ""
    },
    {
      firstName: { required: true },
      lastName: { required: true },
      email: { required: true, email: true },
      password: { required: true, passwordStrength: true }
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/customers/register`,
        {
          ...values,
          bookings: []
        }
      );
      if (response.status === 201) {
        setLoading(false);
        toast.success("Registration successful! Please sign in.");
        router.push("/login");
      } else {
        toast.error("Something went wrong");
        setLoading(false);
      }
    } catch (error: any) {
      setLoading(false);
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };


  return (
    <AuthLayout
      title="Create an account"
      subtitle="Fill in your details to get started."
      heroTitle={<>Join <span className="text-blue-200">Now</span></>}
      heroSubtitle="Create an account to unlock exclusive travel deals and manage your trips with ease."
      benefits={[
        "Book your travels with special member pricing",
        "Receive personalized travel recommendations",
        "Manage all your bookings in one place"
      ]}
      footerContent={
        <p className="text-center text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {/* First Name Field */}
        <FormInput
          id="firstName"
          name="firstName"
          label="First Name"
          type="text"
          value={values.firstName}
          onChange={handleChange}
          placeholder="John"
          error={errors.firstName}
          icon={<User />}
          isFocused={formFocus === 'firstName'}
          onFocus={() => handleFocus('firstName')}
          onBlur={() => handleBlur('firstName')}
        />

        {/* Last Name Field */}
        <FormInput
          id="lastName"
          name="lastName"
          label="Last Name"
          type="text"
          value={values.lastName}
          onChange={handleChange}
          placeholder="Doe"
          error={errors.lastName}
          icon={<User />}
          isFocused={formFocus === 'lastName'}
          onFocus={() => handleFocus('lastName')}
          onBlur={() => handleBlur('lastName')}
        />

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
          helpText="Password must contain at least 8 characters including one uppercase letter, one special character, and three numbers."
        />

        {/* Submit Button */}
        <AuthButton loading={loading} text="Create Account" />
      </form>
    </AuthLayout>
  );
};

export default Register;