// components/auth/AuthLayout.tsx
import React, { ReactNode } from "react";
import Image from "next/image";
import { CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
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
  
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-br from-gray-50 to-tripswift-off-white font-noto-sans">
      {/* Left Side Image Panel */}
      <div className="lg:w-1/2 relative hidden lg:block overflow-hidden">
        {/* Stylized overlay with brand gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#054B8F]/90 via-tripswift-blue/75 to-tripswift-blue/60 z-10" />
        
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[url('/patterns/dot-pattern.png')] opacity-10 z-20"></div>
        
        {/* Image with subtle zoom effect */}
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
        
        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col justify-center items-start z-30 p-16">
          {/* Logo with enhanced drop shadow */}
          <div className="mb-12 drop-shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <Image 
              src={LoginIcon} 
              width={160} 
              height={80} 
              alt="TripSwift" 
              className="filter brightness-105"
            />
          </div>
          
          {/* Hero title with animated gradient text */}
          <h1 className="text-5xl font-tripswift-extrabold text-tripswift-off-white mb-5 tracking-tight drop-shadow-lg">
            {heroTitle}
          </h1>
          
          <p className="text-xl text-tripswift-off-white max-w-md leading-relaxed mb-10 drop-shadow">
            {heroSubtitle}
          </p>
          
          {/* Premium glass card for benefits */}
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

      {/* Right Side Form */}
      <div className="w-full lg:w-1/2 flex justify-center items-center p-6 lg:p-14">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex justify-center mb-12 lg:hidden">
            <Image 
              src={LoginIconMob} 
              width={140} 
              height={70} 
              alt="TripSwift" 
              className="drop-shadow-lg"
            />
          </div>

          {/* Enhanced Form Card with subtle shadow and animation */}
          <div className="bg-tripswift-off-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden transition-all duration-300 hover:shadow-[0_20px_80px_rgba(7,109,179,0.07)]">
            {/* Card Header with brand accent */}
            <div className="h-2 bg-gradient-to-r from-tripswift-blue to-[#054B8F]"></div>
            
            <div className="p-10 rounded-t-xl">
              <h2 className="text-2xl font-tripswift-bold text-tripswift-black mb-2 tracking-tight">{title}</h2>
              <p className="text-tripswift-black/60 mb-8">{subtitle}</p>
              
              {children}
            </div>

            {/* Footer Area with subtle pattern */}
            <div className="px-10 py-6 bg-tripswift-off-white/70 border-t border-gray-100 relative overflow-hidden">
              {/* <div className="absolute inset-0 bg-[url('/patterns/subtle-dots.png')] opacity-5"></div> */}
              <div className="relative z-10">
                {footerContent}
              </div>
            </div>
          </div>
          
          {/* Trust & Security Section with enhanced design */}
          <div className="mt-10 bg-gradient-to-r from-tripswift-blue/5 to-tripswift-blue/10 rounded-xl p-5 border border-tripswift-blue/10 transform transition-all duration-300 hover:from-tripswift-blue/10 hover:to-tripswift-blue/15">
            <div className="flex items-start">
              <div className="bg-tripswift-blue p-2 rounded-full mr-4 mt-0.5 shadow-md shadow-tripswift-blue/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-tripswift-off-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
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