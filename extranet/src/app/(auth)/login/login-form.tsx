"use client";

import React from "react";
import LoginForm from "../../../components/Authentication/Login-form";
import Image from "next/image";

export default function Login() {
  return (
    <div className="relative w-full min-h-screen flex flex-col lg:flex-row">
      <div className="absolute inset-0 lg:relative lg:w-1/2 overflow-hidden">
        <Image
          src="/assets/login-bg.jpg"
          alt="Burj Al Arab"
          fill
          className="object-cover absolute inset-0 z-10"
          priority
        />

        <div className="absolute inset-0  z-20" />

        <div className="hidden lg:block absolute top-6 left-6 z-30">
          <div className="bg-gradient-to-br from-white/10 to-yellow-500/20 backdrop-blur-lg p-4 rounded-xl shadow-lg">
            <Image
              src="/assets/ALHAJZ.png"
              alt="Al HaJz Logo"
              width={120}
              height={60}
              className="object-contain"
            />
          </div>
        </div>
      </div>

      <div className="absolute inset-0 lg:hidden bg-black/40 z-10" />

      <div className="relative z-40 w-full lg:w-1/2 flex justify-center items-center p-4 sm:p-8 min-h-screen">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-md p-6 rounded-xl shadow-lg">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
