// components/auth/hooks/useFormValidation.ts
import { useState } from "react";

interface ValidationRules {
  required?: boolean;
  email?: boolean;
  minLength?: number;
  passwordStrength?: boolean;
}

interface FieldConfig {
  [key: string]: ValidationRules;
}

export function useFormValidation(
  initialValues: Record<string, string>,
  fieldConfig: FieldConfig
) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formFocus, setFormFocus] = useState<string | null>(null);

  const validateField = (name: string, value: string): string => {
    const rules = fieldConfig[name] || {};
    
    if (rules.required && !value.trim()) {
      return `${name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1').trim()} is required`;
    }
    
    if (rules.email && value && !/\S+@\S+\.\S+/.test(value)) {
      return "Please enter a valid email address";
    }
    
    if (rules.minLength && value.length < rules.minLength) {
      return `Must be at least ${rules.minLength} characters`;
    }
    
    if (rules.passwordStrength && value) {
      if (!/^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*\d.*\d.*\d).{8,}$/.test(value)) {
        return "Password must contain at least 8 characters including one uppercase letter, one special character, and three numbers";
      }
    }
    
    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleFocus = (field: string) => setFormFocus(field);
  
  const handleBlur = (field: string) => {
    setFormFocus(null);
    
    // Validate on blur
    const error = validateField(field, values[field]);
    setErrors(prev => ({ ...prev, [field]: error }));
  };
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;
    
    // Validate all fields
    Object.keys(fieldConfig).forEach((field) => {
      const error = validateField(field, values[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });
    
    setErrors(newErrors);
    return isValid;
  };

  return {
    values,
    errors,
    formFocus,
    handleChange,
    handleFocus,
    handleBlur,
    validateForm,
    setValues
  };
}