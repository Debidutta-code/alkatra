import React, { ReactNode } from "react";
import Image from "next/image";
import { CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePathname } from "next/navigation";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import LoginImg from "@/components/assets/login.jpg";
import LoginIcon from "@/components/assets/TRIP-1.png";
import LoginIconMob from "@/components/assets/TRIP-1.png";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  footerContent: ReactNode;
  heroTitle: ReactNode;
  heroSubtitle: string;
  benefits: string[];
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  footerContent,
  heroTitle,
  heroSubtitle,
  benefits,
}) => {
  const { t } = useTranslation();
  const pathname = usePathname();

  const responseGoogle = async (authResult: any) => {
  try {
    console.log("Google login response:", authResult);
    if (authResult?.code) {
      const response = await fetch('/api/v1/google/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ code: authResult.code }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Response status:", response.status, errorData);
        throw new Error(`Failed to login with Google: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      console.log("Login successful:", data);
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        window.location.href = '/';
      }
    } else {
      console.error("Google login failed: No auth code received");
    }
  } catch (error) {
    console.error("Google login error:", error);
  }
};

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: (error) => console.error("Google login error:", error),
    flow: 'auth-code',
    redirect_uri: 'http://localhost:3004/auth/google/callback',
  });

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-br from-gray-50 to-tripswift-off-white font-noto-sans">
      <div className="lg:w-1/2 relative hidden lg:block overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-tripswift-blue/75 to-tripswift-blue/60 z-10" />
        <div className="absolute inset-0 bg-[url('/patterns/dot-pattern.png')] opacity-10 z-20"></div>
        <div className="absolute inset-0 transition-transform duration-3000 hover:scale-105">
          <Image
            src={LoginImg}
            alt={t('Auth.Layout.travelDestinationAlt')}
            layout="fill"
            objectFit="cover"
            className="object-center filter saturate-110"
            priority
            quality={95}
          />
        </div>
        <div className="absolute inset-0 flex flex-col justify-center items-start z-30 p-16">
          <div className="mb-6 drop-shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <Image
              src={LoginIcon}
              width={160}
              height={80}
              alt="TripSwift"
              className="filter brightness-105"
            />
          </div>
          <h1 className="text-5xl font-tripswift-extrabold text-tripswift-off-white mb-5 tracking-tight drop-shadow-lg">
            {heroTitle}
          </h1>
          <p className="text-xl text-tripswift-off-white max-w-md leading-relaxed mb-10 drop-shadow">
            {heroSubtitle}
          </p>
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-2xl w-full max-w-md transform transition-all duration-300 hover:bg-white/15">
            <p className="text-tripswift-off-white font-tripswift-bold text-lg mb-5">
              {t('Auth.Layout.memberBenefits')}
            </p>
            <ul className="text-white/95 space-y-4">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <div className="bg-tripswift-off-white/20 p-1.5 rounded-full mr-3 mt-0.5">
                    <CheckCircle size={16} className="text-tripswift-off-white" />
                  </div>
                  <span className="text-[15px]">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex justify-center items-center p-6 lg:px-14">
        <div className="w-full max-w-[410px]">
          <div className="flex justify-center mb-6 lg:hidden">
            <Image
              src={LoginIconMob}
              width={140}
              height={70}
              alt="TripSwift"
              className="drop-shadow-lg"
            />
          </div>
          <div className="bg-tripswift-off-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden transition-all duration-300 hover:shadow-[0_20px_80px_rgba(7,109,179,0.07)]">
            <div className="h-2 bg-gradient-to-r from-tripswift-blue to-[#054B8F]"></div>
            <div className="px-10 py-6 rounded-t-xl">
              <h2 className="text-2xl font-tripswift-bold text-tripswift-black mb-2 tracking-tight">{title}</h2>
              <p className="text-tripswift-black/60 mb-6">{subtitle}</p>
              {children}
            </div>
            <button
              onClick={() => googleLogin()}
              className="w-full h-12 flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg px-4 mb-4 hover:bg-gray-50 transition-colors duration-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" fill="#EA4335" />
                <path d="M46.98 24.55c0-1.7-.15-3.34-.43-4.91H24v9.28h12.88c-.56 2.97-2.25 5.49-4.78 7.17l7.98 6.19c4.64-4.29 7.34-10.62 7.34-17.73z" fill="#4285F4" />
                <path d="M10.54 28.28l-7.98-6.19C.95 25.35 0 29.06 0 33.5c0 4.44.95 8.15 2.56 11.41l7.98-6.19c-1.12-1.78-1.81-3.85-1.81-6.22 0-1.38.21-2.71.58-3.98z" fill="#FBBC05" />
                <path d="M24 48c6.48 0 11.93-2.15 15.89-5.85l-7.98-6.19c-2.22 1.49-5.03 2.38-7.91 2.38-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" fill="#34A853" />
              </svg>
              <span className="text-tripswift-black font-tripswift-medium text-sm">
                Sign in with Google
              </span>
            </button>
            <div className="px-10 py-3 bg-tripswift-off-white/70 border-t border-gray-100 relative overflow-hidden">
              <div className="relative z-10">{footerContent}</div>
            </div>
          </div>
          <div
            className={
              pathname === '/register'
                ? 'hidden'
                : 'mt-6 bg-gradient-to-r from-tripswift-blue/5 to-tripswift-blue/10 rounded-xl p-5 border border-tripswift-blue/10 transform transition-all duration-300 hover:from-tripswift-blue/10 hover:to-tripswift-blue/15'
            }
          >
            <div className="flex items-start">
              <div className="bg-tripswift-blue p-2 rounded-full mr-4 mt-0.5 shadow-md shadow-tripswift-blue/20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-tripswift-off-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-tripswift-bold text-tripswift-black">
                  {t('Auth.Layout.privacySecurity.title')}
                </h3>
                <p className="text-xs leading-relaxed text-tripswift-black/60 mt-1 max-w-xs">
                  {t('Auth.Layout.privacySecurity.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;