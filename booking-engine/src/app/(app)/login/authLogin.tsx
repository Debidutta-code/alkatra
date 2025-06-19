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
import { useTranslation } from "react-i18next";

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
  const { t ,i18n } = useTranslation();
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
      // Wait for login to complete and store the result
      const loginResult = await dispatch(login({ email: values.email, password: values.password }));

      // Check if login was successful - this is the key fix
      // If loginResult is undefined or null, it means login failed
      if (!loginResult) {
        throw new Error("Login failed");
      }

      // Only if we get here, login was successful
      if (rememberMe) {
        Cookies.set("rememberMe", "true", { expires: 7 });
      }

      toast.success(t('Auth.Login.successMessage'), {
        icon: '👋',
        duration: 3000,
      });

      const redirectUrl = Cookies.get("redirectAfterLogin") || "/";
      await dispatch(getUser());
      Cookies.remove("redirectAfterLogin");

      router.replace(redirectUrl);
    } catch (error: any) {
      toast.error(t('Auth.Login.errorMessage'), {
        icon: '❌',
      });
    } finally {
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
      title={t('Auth.Login.title')}
      subtitle={t('Auth.Login.subtitle')}
      heroTitle={<>{t('Auth.Login.heroTitle.welcome')} <span className="text-tripswift-blue">{t('Auth.Login.heroTitle.back')}</span></>}
      heroSubtitle={t('Auth.Login.heroSubtitle')}
      benefits={[
        t('Auth.Login.benefits.exclusiveRates'),
        t('Auth.Login.benefits.freeCancellation'),
        t('Auth.Login.benefits.priorityService')
      ]}
      footerContent={
        <p className="text-center text-tripswift-black/60">
          {t('Auth.Login.noAccountYet')}{" "}
          <Link
            href="/register"
            className="font-tripswift-medium text-tripswift-blue hover:text-[#054B8F] transition-colors"
          >
            {t('Auth.Login.createAccount')}
          </Link>
        </p>
      }
    >
      <form className="space-y-[0.6rem]" onSubmit={handleSubmit}>
        {/* Email Field */}
        <FormInput
          id="email"
          name="email"
          label={t('Auth.Login.emailLabel')}
          type="email"
          value={values.email}
          onChange={handleChange}
          placeholder={t('Auth.Login.emailPlaceholder')}
          error={errors.email}
          icon={<Mail className="text-tripswift-blue" />}
          isFocused={formFocus === 'email'}
          onFocus={() => handleFocus('email')}
          onBlur={() => handleBlur('email')}
        />

        {/* Password Field */}
        <PasswordInput
          id="password"
          name="password"
          label={t('Auth.Login.passwordLabel')}
          value={values.password}
          onChange={handleChange}
          error={errors.password}
          isFocused={formFocus === 'password'}
          onFocus={() => handleFocus('password')}
          onBlur={() => handleBlur('password')}
          showForgotPassword={false}
          onForgotPasswordClick={() => setIsForgotPassword(false)}
        />

        {/* Remember Me */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
              className="w-4 h-4 rounded-md border-tripswift-black/20 text-tripswift-blue focus:ring-tripswift-blue/20 transition-colors duration-300 mb-2"
            />
            <label htmlFor="remember" className={` text-sm text-tripswift-black/70 font-tripswift-medium ${i18n.language==="ar"?"mr-2":"ml-2"} `}>
              {t('Auth.Login.rememberMe')}
            </label>
          </div>

          {/* Forgot Password Link */}
          <button
            type="button"
            onClick={() => setIsForgotPassword(true)}
            className="text-sm text-tripswift-blue hover:text-[#054B8F] font-tripswift-medium transition-colors mb-2"
          >
            {t('Auth.ForgotPassword.title')}
          </button>
        </div>

        {/* Submit Button */}
        <AuthButton loading={loading} text={t('Auth.Login.signInButton')} />
      </form>
    </AuthLayout>
  );
};

export default Login;