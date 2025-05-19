// components/auth/PasswordInput.tsx
import React, { useState } from "react";
import { Eye, EyeOff, Lock, AlertCircle, Info } from "lucide-react";

interface PasswordInputProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  isFocused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  showForgotPassword?: boolean;
  onForgotPasswordClick?: () => void;
  helpText?: string;
  disabled?: boolean;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  id,
  name,
  label,
  value,
  onChange,
  error,
  isFocused,
  onFocus,
  onBlur,
  showForgotPassword = false,
  onForgotPasswordClick,
  helpText,
  disabled = false
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="group">
      <div className="flex justify-between items-center mb-2">
        <label htmlFor={id} className="block text-sm font-tripswift-medium text-tripswift-black/80 transition-colors group-hover:text-tripswift-black">
          {label}
        </label>
        {showForgotPassword && (
          <button
            type="button"
            onClick={onForgotPasswordClick}
            className="text-sm font-tripswift-medium text-tripswift-blue hover:text-[#054B8F] transition-colors flex items-center"
          >
            <span>Forgot password?</span>
          </button>
        )}
      </div>
      
      <div className={`relative transition-all duration-300 ${isFocused ? 'scale-[1.01]' : ''}`}>
        {/* Left accent bar that appears on focus */}
        <div className={`absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-tripswift-blue transition-opacity duration-300 ${isFocused ? 'opacity-100' : 'opacity-0'}`}></div>
        
        {/* Lock Icon with improved styling */}
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Lock size={18} className={`transition-colors duration-300 ${
            error ? 'text-red-500' 
            : disabled ? 'text-tripswift-black/30' 
            : isFocused ? 'text-tripswift-blue' 
            : 'text-tripswift-black/40 group-hover:text-tripswift-black/60'
          }`} />
        </div>
        
        {/* Enhanced password input */}
        <input
          id={id}
          name={name}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          disabled={disabled}
          placeholder="••••••••"
          className={`w-full pl-12 pr-12 py-4 rounded-lg border-[1.5px] ${
            error 
              ? 'border-red-300 bg-red-50/50' 
              : isFocused
                ? 'border-tripswift-blue/50 bg-tripswift-blue/[0.02] shadow-[0_0_0_3px_rgba(7,109,179,0.1)]'
                : 'border-gray-200 hover:border-gray-300'
          } focus:outline-none transition-all duration-200 text-tripswift-black/90 placeholder:text-tripswift-black/40
          disabled:bg-gray-50 disabled:text-tripswift-black/40 disabled:border-gray-100 disabled:cursor-not-allowed`}
        />
        
        {/* Enhanced show/hide password button */}
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          disabled={disabled}
          className={`absolute inset-y-0 right-4 flex items-center transition-colors duration-200 ${
            disabled 
              ? 'text-tripswift-black/30 cursor-not-allowed' 
              : isFocused
                ? 'text-tripswift-blue hover:text-tripswift-blue/80'
                : 'text-tripswift-black/50 hover:text-tripswift-black/70'
          }`}
        >
          {showPassword ? (
            <div className="p-1.5 rounded-full bg-tripswift-blue/10 group-hover:bg-tripswift-blue/15 transition-colors">
              <EyeOff size={16} />
            </div>
          ) : (
            <div className="p-1.5 rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors">
              <Eye size={16} />
            </div>
          )}
        </button>
      </div>
      
      {/* Error message with improved styling */}
      {error && (
        <div className="text-red-500 text-[13px] mt-2 flex items-start bg-red-50/50 p-2 rounded border border-red-100">
          <AlertCircle size={14} className="mr-1.5 mt-0.5 flex-shrink-0" />
          <span className="font-tripswift-medium">{error}</span>
        </div>
      )}
      
      {/* Help text with improved styling */}
      {!error && helpText && (
        <div className="text-tripswift-black/50 text-xs mt-2 flex items-start">
          <Info size={12} className="mr-1.5 mt-0.5 flex-shrink-0 text-tripswift-blue/60" />
          <span>{helpText}</span>
        </div>
      )}
    </div>
  );
};

export default PasswordInput;