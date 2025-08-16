"use client";

import { useState } from "react";
import axios from "axios";
import { Mail, ArrowLeft, AlertTriangle, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import FormInput from "../../../components/auth/FormInput";
import AuthButton from "../../../components/auth/AuthButton";
import AuthLayout from "../../../components/auth/AuthLayout";

interface ForgotPasswordProps {
  onBack: () => void;
  onEmailVerified: (email: string) => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack, onEmailVerified }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");
  const [formFocus, setFormFocus] = useState<string | null>(null);

  const validateEmail = () => {
    if (!email.trim()) {
      setValidationError(t('Auth.Validation.emailRequired'));
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setValidationError(t('Auth.Validation.emailInvalid'));
      return false;
    }
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (validationError) {
      setValidationError("");
    }
    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateEmail()) {
      return;
    }
    
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/customers/verify-email`, { email });
      console.log("API Response:", response.data);
      if (response.status === 200) {
        setMessage(t('Auth.ForgotPassword.successMessage'));
        console.log("Calling onEmailVerified with email:", email);
        onEmailVerified(email);
      } else {
        setError(response.data.message || t('Auth.ForgotPassword.errors.emailNotFound'));
      }
    } catch (error: any) {
      console.error("API Error:", error.response?.data || error.message);
      if (error.response) {
        if (error.response.status === 404) {
          setError(t('Auth.ForgotPassword.errors.emailNotFound'));
        } else if (error.response.status === 401) {
          setError(t('Auth.ForgotPassword.errors.emailNotVerified'));
        } else {
          setError(error.response.data?.message || t('Auth.ForgotPassword.errors.generic'));
        }
      } else {
        setError(t('Auth.ForgotPassword.errors.generic'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={t('Auth.ForgotPassword.title')}
      subtitle={t('Auth.ForgotPassword.subtitle')}
      heroTitle={<>{t('Auth.ForgotPassword.heroTitle.reset')} <span className="text-tripswift-blue">{t('Auth.ForgotPassword.heroTitle.password')}</span></>}
      heroSubtitle={t('Auth.ForgotPassword.heroSubtitle')}
      benefits={[
        t('Auth.ForgotPassword.benefits.quickRecovery'),
        t('Auth.ForgotPassword.benefits.secureReset'),
        t('Auth.ForgotPassword.benefits.quickAccess'),
      ]}
      footerContent={
        <button 
          onClick={() => {
            console.log("Back to login clicked");
            onBack();
          }}
          className="w-full text-center text-tripswift-blue text-sm hover:text-[#054B8F] font-tripswift-medium flex items-center justify-center transition-colors duration-300"
        >
          <ArrowLeft size={16} className="mr-2" />
          {t('Auth.ForgotPassword.backToLogin')}
        </button>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormInput
          id="email"
          name="email"
          label={t('Auth.ForgotPassword.emailLabel')}
          type="email"
          value={email}
          onChange={handleEmailChange}
          placeholder={t('Auth.ForgotPassword.emailPlaceholder')}
          error={validationError}
          icon={<Mail className="text-tripswift-blue" />}
          isFocused={formFocus === 'email'}
          onFocus={() => setFormFocus('email')}
          onBlur={() => setFormFocus(null)}
        />
        
        <AuthButton loading={loading} text={t('Auth.ForgotPassword.sendResetLinkButton')} />
        
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

export default ForgotPassword;