import React from "react";
import RegisterForm from "./register-form";

export default function Register() {
  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen">
      {/* Background Image Section - Hidden on mobile, visible on desktop */}
      <div 
        className="hidden lg:block lg:w-1/2 bg-[url('/assets/login-bg.jpg')] bg-cover bg-center bg-no-repeat"
        style={{ minHeight: '100dvh' }}
      />
      
      {/* Form Section - Full width on mobile, half on desktop */}
      <div className="w-full lg:w-1/2 flex justify-center items-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}