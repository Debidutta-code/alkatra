// components/auth/FormInput.tsx
import React from "react";
import { Check, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

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
  disabled?: boolean;
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
  helpText,
  disabled = false
}) => {
  const { t } = useTranslation();

  return (
    <div className="group font-noto-sans">
      <label htmlFor={id} className="block text-sm font-tripswift-medium text-tripswift-black/80 mb-2 transition-colors group-hover:text-tripswift-black">
        {label}
      </label>
      <div className={`relative transition-all duration-300 ${isFocused ? 'scale-[1.01]' : ''}`}>
        {/* Left accent bar that appears on focus */}
        <div className={`absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-tripswift-blue transition-opacity duration-300 ${isFocused ? 'opacity-100' : 'opacity-0'}`}></div>

        {/* Icon with improved styling */}
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          {React.cloneElement(icon as React.ReactElement, {
            ...(icon as any).props,
            size: 18,
            className: `transition-colors duration-300 ${error ? 'text-red-500'
                : disabled ? 'text-tripswift-black/30'
                  : isFocused ? 'text-tripswift-blue'
                    : 'text-tripswift-black/40 group-hover:text-tripswift-black/60'
              }`
          } as any)}
        </div>

        {/* Enhanced input styling */}
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : helpText ? `${id}-help` : undefined}
          className={`w-full pl-12 pr-${showCheckmark ? '12' : '4'} py-2.5 rounded-lg border-[1.5px] ${error
              ? 'border-red-300 bg-red-50/50'
              : isFocused
                ? 'border-tripswift-blue/50 bg-tripswift-blue/[0.02] shadow-[0_0_0_3px_rgba(7,109,179,0.1)]'
                : 'border-tripswift-black/10 hover:border-tripswift-blue/30'
            } focus:outline-none transition-all duration-300 text-tripswift-black/90 placeholder:text-tripswift-black/40
          disabled:bg-tripswift-off-white/50 disabled:text-tripswift-black/40 disabled:border-tripswift-black/5 disabled:cursor-not-allowed`}
        />

        {/* Success checkmark with enhanced styling */}
        {value && !error && showCheckmark && (
          <div className="absolute inset-y-0 right-4 flex items-center">
            <div className="bg-green-500/10 p-1 rounded-full">
              <Check size={14} className="text-green-500" />
            </div>
          </div>
        )}
      </div>

      {/* Error message with improved styling */}
      {error && (
        <div id={`${id}-error`} className="text-red-500 text-[13px] mt-1 flex items-center rounded-md ">
          <AlertCircle size={14} className="mr-1.5 flex-shrink-0" />
          <span className="font-tripswift-medium">{error}</span>
        </div>
      )}

      {/* Help text with improved styling */}
      {!error && helpText && (
        <div id={`${id}-help`} className="text-tripswift-black/50 text-xs mt-2 ml-1">
          {helpText}
        </div>
      )}
    </div>
  );
};

export default FormInput;