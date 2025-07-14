"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertTriangle, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import AuthLayout from "@/components/auth/AuthLayout";
import PasswordInput from "@/components/auth/PasswordInput";
import AuthButton from "@/components/auth/AuthButton";

interface UpdatePasswordProps {
  email: string;
  onBack: () => void;
}

const UpdatePassword: React.FC<UpdatePasswordProps> = ({ email, onBack }) => {
  const { t } = useTranslation();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [formFocus, setFormFocus] = useState<string | null>(null);
  const [errors, setErrors] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const router = useRouter();

  // Log email prop for debugging
  useEffect(() => {
    console.log("UpdatePassword rendered with email:", email);
  }, [email]);

  // Password validation regex: at least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const validatePassword = (password: string) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  // Form validation for newPassword and confirmPassword
  const validateForm = () => {
    const newErrors = {
      newPassword: "",
      confirmPassword: "",
    };
    let isValid = true;

    if (!newPassword.trim()) {
      newErrors.newPassword = t("Auth.Validation.passwordRequired");
      isValid = false;
    } else if (!validatePassword(newPassword)) {
      newErrors.newPassword = t("Auth.Validation.passwordComplexity");
      isValid = false;
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = t("Auth.Validation.confirmPasswordRequired");
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = t("Auth.Validation.passwordsDoNotMatch");
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle input changes and clear errors
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "newPassword") {
      setNewPassword(value);
      if (errors.newPassword) {
        setErrors((prev) => ({ ...prev, newPassword: "" }));
      }
    } else if (name === "confirmPassword") {
      setConfirmPassword(value);
      if (errors.confirmPassword) {
        setErrors((prev) => ({ ...prev, confirmPassword: "" }));
      }
    }

    if (error) {
      setError("");
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/customers/reset-password`,
        {
          email,
          newPassword,
        }
      );
      console.log("Reset Password API Response:", response.status);
      if (response.status === 200) {
        setMessage(t("Auth.UpdatePassword.successMessage"));
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          window.location.href = "/login?fromReset=true";
        }, 1500);
      }
      // if (response.status == 200) {
      //   setMessage(t("Auth.UpdatePassword.successMessage"));
      //   setNewPassword("");
      //   setConfirmPassword("");
      //     router.push("/login?fromReset=true");
      // } 
      else {
        setError(response.data.message || t("Auth.UpdatePassword.errors.generic"));
      }
    } catch (error: any) {
      console.error("Reset Password API Error:", error.response?.data || error.message);
      if (error.response) {
        if (error.response.status === 401) {
          setError(t("Auth.UpdatePassword.errors.unauthorized"));
        } else {
          setError(error.response.data?.message || t("Auth.UpdatePassword.errors.generic"));
        }
      } else {
        setError(t("Auth.UpdatePassword.errors.generic"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={t("Auth.UpdatePassword.title")}
      subtitle={t("Auth.UpdatePassword.subtitle", { email })}
      heroTitle={
        <>
          {t("Auth.UpdatePassword.heroTitle.create")}{" "}
          <span className="text-tripswift-blue">{t("Auth.UpdatePassword.heroTitle.newPassword")}</span>
        </>
      }
      heroSubtitle={t("Auth.UpdatePassword.heroSubtitle")}
      benefits={[
        t("Auth.UpdatePassword.benefits.strongerPassword"),
        t("Auth.UpdatePassword.benefits.protectInformation"),
        t("Auth.UpdatePassword.benefits.quickAccess"),
      ]}
      footerContent={
        <button
          onClick={onBack}
          className="w-full text-center text-tripswift-blue text-sm hover:text-[#054B8F] font-tripswift-medium flex items-center justify-center transition-colors duration-300"
        >
          <ArrowLeft size={16} className="mr-2" />
          {t("Auth.UpdatePassword.backToLogin")}
        </button>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <PasswordInput
          id="newPassword"
          name="newPassword"
          label={t("Auth.UpdatePassword.newPasswordLabel")}
          value={newPassword}
          onChange={handleChange}
          error={errors.newPassword}
          isFocused={formFocus === "newPassword"}
          onFocus={() => setFormFocus("newPassword")}
          onBlur={() => setFormFocus(null)}
          helpText={t("Auth.UpdatePassword.passwordHelp")}
        />

        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          label={t("Auth.UpdatePassword.confirmPasswordLabel")}
          value={confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          isFocused={formFocus === "confirmPassword"}
          onFocus={() => setFormFocus("confirmPassword")}
          onBlur={() => setFormFocus(null)}
        />

        <AuthButton loading={loading} text={t("Auth.UpdatePassword.resetPasswordButton")} />

        {message && (
          <div className="mt-4 text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200 flex items-center font-noto-sans">
            <CheckCircle size={16} className="mr-2 flex-shrink-0 text-green-500" />
            <span className="font-tripswift-medium">{message}</span>
          </div>
        )}

        {error && (
          <div className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200 flex items-center font-noto-sans">
            <AlertTriangle size={16} className="mr-2 flex-shrink-0" />
            <span className="font-tripswift-medium">{error}</span>
          </div>
        )}
      </form>
    </AuthLayout>
  );
};

export default UpdatePassword;