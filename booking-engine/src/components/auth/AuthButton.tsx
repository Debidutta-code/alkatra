// components/auth/AuthButton.tsx
import React from "react";
import { Loader2 } from "lucide-react";

interface AuthButtonProps {
  loading: boolean;
  text: string;
  type?: "button" | "submit" | "reset";
}

const AuthButton: React.FC<AuthButtonProps> = ({ 
  loading, 
  text,
  type = "submit" 
}) => {
  return (
    <button
      type={type}
      disabled={loading}
      className="w-full flex justify-center items-center py-3.5 px-4 rounded-lg font-medium text-base
        bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700
        text-white shadow-md hover:shadow-lg transform transition-all duration-300
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70"
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        text
      )}
    </button>
  );
};

export default AuthButton;