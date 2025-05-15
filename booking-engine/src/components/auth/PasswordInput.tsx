// components/auth/PasswordInput.tsx
import React, { useState } from "react";
import { Eye, EyeOff, Lock, AlertCircle } from "lucide-react";

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
  helpText
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        {showForgotPassword && (
          <button
            type="button"
            onClick={onForgotPasswordClick}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            Forgot password?
          </button>
        )}
      </div>
      
      <div className={`relative transition-all duration-300 ${isFocused ? 'scale-[1.01]' : ''}`}>
        {/* Lock Icon */}
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Lock size={18} className={`${error ? 'text-red-500' : isFocused ? 'text-blue-600' : 'text-gray-400'}`} />
        </div>
        
        {/* Password Input */}
        <input
          id={id}
          name={name}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder="••••••••"
          className={`w-full pl-11 pr-11 py-3.5 rounded-lg border ${
            error 
              ? 'border-red-300 bg-red-50' 
              : isFocused
                ? 'border-blue-300 ring-2 ring-blue-100'
                : 'border-gray-300'
          } focus:outline-none transition-all duration-200 text-gray-800`}
        />
        
        {/* Show/Hide Password Button */}
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="text-red-500 text-sm mt-1.5 flex items-start">
          <AlertCircle size={16} className="mr-1.5 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {/* Help Text */}
      {!error && helpText && (
        <div className="text-gray-500 text-xs mt-1.5">
          {helpText}
        </div>
      )}
    </div>
  );
};

export default PasswordInput;