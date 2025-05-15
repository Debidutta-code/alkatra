// components/auth/AuthLayout.tsx
import React, { ReactNode } from "react";
import Image from "next/image";
import { CheckCircle } from "lucide-react";
import LoginImg from "@/components/assets/login.jpg";
import LoginIcon from "@/components/assets/TRIP-2-Copy.png";
import LoginIconMob from "@/components/assets/TRIP-1-Copy.png";

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
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      {/* Left Side Image Panel */}
      <div className="lg:w-1/2 relative hidden lg:block overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/80 via-blue-800/60 to-blue-700/30 z-10" />
        
        <div className="absolute inset-0 transition-transform duration-10000 hover:scale-105">
          <Image 
            src={LoginImg} 
            alt="Travel destination" 
            layout="fill" 
            objectFit="cover" 
            className="object-center"
            priority
            quality={90}
          />
        </div>
        
        <div className="absolute inset-0 flex flex-col justify-center items-start z-20 p-16">
          <div className="mb-10 drop-shadow-lg">
            <Image 
              src={LoginIcon} 
              width={140} 
              height={70} 
              alt="TripWift" 
              className="filter drop-shadow-md"
            />
          </div>
          
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight drop-shadow-lg">
            {heroTitle}
          </h1>
          
          <p className="text-xl text-white/90 max-w-md leading-relaxed mb-8 drop-shadow">
            {heroSubtitle}
          </p>
          
          <div className="bg-white/15 backdrop-blur-md p-5 rounded-xl border border-white/20 shadow-xl w-full max-w-md transform hover:scale-102 transition-all duration-300">
            <p className="text-white font-semibold text-lg mb-3">Member Benefits:</p>
            <ul className="text-white/95 space-y-3">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-center">
                  <CheckCircle size={18} className="mr-3 text-blue-300 flex-shrink-0" /> 
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Right Side Form */}
      <div className="w-full lg:w-1/2 flex justify-center items-center p-5 lg:p-10 bg-gradient-to-b from-gray-50 to-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex justify-center mb-10 lg:hidden">
            <Image 
              src={LoginIconMob} 
              width={120} 
              height={60} 
              alt="TripWift" 
              className="drop-shadow-md"
            />
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 transform hover:shadow-xl">
            <div className="p-8 rounded-t-xl">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
              <p className="text-gray-500 mb-8">{subtitle}</p>
              
              {children}
            </div>

            {/* Footer Area */}
            <div className="px-8 py-5 bg-gray-50 border-t border-gray-100">
              {footerContent}
            </div>
          </div>
          
          {/* Trust & Security Section */}
          <div className="mt-8 bg-blue-50/50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-start">
              <div className="bg-blue-100 p-2 rounded-full mr-3 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-800">Your Privacy Matters</h3>
                <p className="text-xs text-gray-600">
                  Your personal information is kept secure and will never be shared with third parties without your permission.
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