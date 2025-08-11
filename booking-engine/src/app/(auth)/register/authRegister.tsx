"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Mail, User } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

// Import shared components
import AuthLayout from "../../../components/auth/AuthLayout";
import FormInput from "../../../components/auth/FormInput";
import PasswordInput from "../../../components/auth/PasswordInput";
import AuthButton from "../../../components/auth/AuthButton";
import { useFormValidation } from "../../../components/auth/hooks/useFormValidation";
import { useSearchParams } from "next/navigation";

const Register: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [referralCode, setReferralCode] = useState<string | null>("");
  const [referralId, setReferralId] = useState<string | null>(null);

  useEffect(() => {
    const referrerId = searchParams.get("referrerId");
    const referralCode = searchParams.get("referralCode");
    // if (referralCode && referrerId) {
    //   console.log(">>>>>>>>>>>>>", referralCode, referrerId);
    // } else {
    //   console.log(">>>>>>>>>>>>>not found", referralCode);
    // }
    setReferralCode(referralCode);
    setReferralId(referrerId);
  }, []);

  const {
    values,
    errors,
    formFocus,
    handleChange,
    handleFocus,
    handleBlur,
    validateForm,
  } = useFormValidation(
    {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
    {
      firstName: { required: true },
      lastName: { required: true },
      email: { required: true, email: true },
      password: { required: true, passwordStrength: true },
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    try {
      let apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/customers/register`;

      if (referralCode && referralId) {
        const params = new URLSearchParams({
          referrerId: referralId,
          referralCode: referralCode,
        });
        apiUrl += `?${params.toString()}`;
      }

      const response = await axios.post(apiUrl, {
        ...values,
      });

      if (response.status === 201) {
        setLoading(false);
        toast.success(t("Auth.Register.successMessage"));
        router.push("/login");
      } else {
        toast.error(t("Auth.Register.genericError"));
        setLoading(false);
      }
    } catch (error: any) {
      setLoading(false);
      toast.error(
        error.response?.data?.message || t("Auth.Register.registrationFailed")
      );
    }
  };

  return (
    <AuthLayout
      title={t("Auth.Register.title")}
      subtitle={t("Auth.Register.subtitle")}
      heroTitle={
        <>
          {t("Auth.Register.heroTitle.join")}{" "}
          <span className="text-blue-200">
            {t("Auth.Register.heroTitle.now")}
          </span>
        </>
      }
      heroSubtitle={t("Auth.Register.heroSubtitle")}
      benefits={[
        t("Auth.Register.benefits.memberPricing"),
        t("Auth.Register.benefits.personalizedRecommendations"),
        t("Auth.Register.benefits.manageBookings"),
      ]}
      footerContent={
        <p className="text-center text-gray-600">
          {t("Auth.Register.alreadyHaveAccount")}{" "}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            {t("Auth.Register.signIn")}
          </Link>
        </p>
      }
    >
      <form className="space-y-2" onSubmit={handleSubmit}>
        {/* First Name Field */}
        <FormInput
          id="firstName"
          name="firstName"
          label={t("Auth.Register.firstNameLabel")}
          type="text"
          value={values.firstName}
          onChange={handleChange}
          placeholder={t("Auth.Register.firstNamePlaceholder")}
          error={errors.firstName}
          icon={<User />}
          isFocused={formFocus === "firstName"}
          onFocus={() => handleFocus("firstName")}
          onBlur={() => handleBlur("firstName")}
        />

        {/* Last Name Field */}
        <FormInput
          id="lastName"
          name="lastName"
          label={t("Auth.Register.lastNameLabel")}
          type="text"
          value={values.lastName}
          onChange={handleChange}
          placeholder={t("Auth.Register.lastNamePlaceholder")}
          error={errors.lastName}
          icon={<User />}
          isFocused={formFocus === "lastName"}
          onFocus={() => handleFocus("lastName")}
          onBlur={() => handleBlur("lastName")}
        />

        {/* Email Field */}
        <FormInput
          id="email"
          name="email"
          label={t("Auth.Register.emailLabel")}
          type="email"
          value={values.email}
          onChange={handleChange}
          placeholder={t("Auth.Register.emailPlaceholder")}
          error={errors.email}
          icon={<Mail />}
          isFocused={formFocus === "email"}
          onFocus={() => handleFocus("email")}
          onBlur={() => handleBlur("email")}
        />

        {/* Password Field */}
        <PasswordInput
          id="password"
          name="password"
          label={t("Auth.Register.passwordLabel")}
          value={values.password}
          onChange={handleChange}
          error={errors.password}
          isFocused={formFocus === "password"}
          onFocus={() => handleFocus("password")}
          onBlur={() => handleBlur("password")}
          helpText={t("Auth.Register.passwordHelp")}
        />

        {/* Submit Button */}
        <AuthButton
          loading={loading}
          text={t("Auth.Register.createAccountButton")}
        />
      </form>
    </AuthLayout>
  );
};

export default Register;
