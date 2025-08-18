// src/components/ui/custom-dropdown.tsx
import React, { useState, useRef, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
  description?: string;
}

interface CustomDropdownProps {
  name: string;
  value: string;
  onChange: (event: { target: { name: string; value: string; type: string } }) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  name,
  value,
  onChange,
  options,
  placeholder = "Select an option...",
  disabled = false,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue: string) => {
    if (!disabled) {
      onChange({
        target: {
          name,
          value: optionValue,
          type: 'select'
        }
      });
      setIsOpen(false);
    }
  };

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full p-2 border border-slate-300 rounded-md text-sm text-left
          focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 
          transition-all duration-200 bg-white
          ${disabled 
            ? 'bg-slate-50 text-slate-400 cursor-not-allowed' 
            : 'hover:border-slate-400 cursor-pointer'
          }
          ${isOpen ? 'ring-2 ring-emerald-500 border-emerald-500' : ''}
        `}
      >
        <div className="flex items-center justify-between">
          <span className={selectedOption ? 'text-slate-900' : 'text-slate-500'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <div className={`transition-transform duration-200 flex-shrink-0 ml-2 ${isOpen ? 'transform rotate-180' : ''}`}>
            <svg className={`w-4 h-4 ${disabled ? 'text-slate-400' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`
                w-full px-3 py-2.5 text-left text-sm transition-colors duration-150
                hover:bg-emerald-50 hover:text-emerald-900
                ${value === option.value 
                  ? 'bg-emerald-100 text-emerald-900 font-medium' 
                  : 'text-slate-700'
                }
                first:rounded-t-lg last:rounded-b-lg
              `}
            >
              <div className="flex items-center justify-between">
                <span>{option.label}</span>
                {value === option.value && (
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              {option.description && (
                <div className="text-xs text-slate-500 mt-1">
                  {option.description}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export { CustomDropdown };