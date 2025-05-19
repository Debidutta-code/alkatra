// components/auth/AuthButton.tsx
import React from "react";
import { Loader2 } from "lucide-react";

interface AuthButtonProps {
  loading: boolean;
  text: string;
  type?: "button" | "submit" | "reset";
  className?: string;
}

const AuthButton: React.FC<AuthButtonProps> = ({ 
  loading, 
  text,
  type = "submit",
  className = ""
}) => {
  // Base classes that will always be applied
  const baseClasses = `
    w-full flex justify-center items-center py-4 px-6 rounded-xl font-tripswift-bold text-base
    relative overflow-hidden
    text-white shadow-lg hover:shadow-xl transform
    transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tripswift-blue
    disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0
  `;

  return (
    <button
      type={type}
      disabled={loading}
      className={`${baseClasses} ${className}`}
    >
      {/* Background gradient with animated hover effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-tripswift-blue to-[#054B8F] transition-transform duration-500 hover:scale-110"></div>
      
      {/* Content */}
      <div className="relative flex items-center justify-center">
        {loading ? (
          <div className="flex items-center">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            <span>Processing...</span>
          </div>
        ) : (
          <div className="flex items-center">
            <span>{text}</span>
            <svg className="w-5 h-5 ml-2 transform transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </div>
        )}
      </div>
    </button>
  );
};

export default AuthButton;