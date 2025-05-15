// components/auth/FormInput.tsx
import React from "react";
import { Check, AlertCircle } from "lucide-react";

interface FormInputProps {
  id: string;
  name: string;
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  error?: string;
  icon: React.ReactNode;
  showCheckmark?: boolean;
  isFocused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  helpText?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  id,
  name,
  label,
  type,
  value,
  onChange,
  placeholder,
  error,
  icon,
  showCheckmark = true,
  isFocused,
  onFocus,
  onBlur,
  helpText
}) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      <div className={`relative transition-all duration-300 ${isFocused ? 'scale-[1.01]' : ''}`}>
        {/* Icon */}
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          {React.cloneElement(icon as React.ReactElement, { 
            size: 18, 
            className: `${error ? 'text-red-500' : isFocused ? 'text-blue-600' : 'text-gray-400'}` 
          })}
        </div>
        
        {/* Input */}
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`w-full pl-11 pr-${showCheckmark ? '11' : '4'} py-3.5 rounded-lg border ${
            error 
              ? 'border-red-300 bg-red-50' 
              : isFocused
                ? 'border-blue-300 ring-2 ring-blue-100'
                : 'border-gray-300'
          } focus:outline-none transition-all duration-200 text-gray-800`}
        />
        
        {/* Success checkmark */}
        {value && !error && showCheckmark && (
          <div className="absolute inset-y-0 right-3 flex items-center">
            <Check size={18} className="text-green-500" />
          </div>
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <div className="text-red-500 text-sm mt-1.5 flex items-center">
          <AlertCircle size={16} className="mr-1.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {/* Optional help text */}
      {!error && helpText && (
        <div className="text-gray-500 text-xs mt-1.5">
          {helpText}
        </div>
      )}
    </div>
  );
};

export default FormInput;