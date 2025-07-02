import React from "react";
import LoginForm from "./Login-form";

export default function Login() {
  return (
    <div className="flex  flex-col lg:flex-row w-full max-h-screen">
      {/* Background Image Section - Hidden on mobile, visible on lg+ */}
      <div 
        className="hidden lg:block lg:w-1/2 bg-[url('/assets/login-bg.jpg')] bg-cover bg-center"
        style={{
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          minHeight: '100vh'
        }}
      />
      
      {/* Form Section - Full width on mobile, half on desktop */}
      <div className="w-full lg:w-1/2 flex justify-center items-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}