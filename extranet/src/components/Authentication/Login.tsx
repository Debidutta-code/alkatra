"use client";

import React, { useEffect, useState } from "react";
import LoginForm from "./Login-form";
import Image from "next/image";

// const slideTexts = [
//   {
//     title: "Welcome to Seamless Hospitality",
//     subtitle: "Manage properties, guests, and bookings — all from one place.",
//   },
//   {
//     title: "Strength by the Seaside",
//     subtitle: "Stand strong in a changing world with reliable tools.",
//   },
//   {
//     title: "Elegance Meets Innovation",
//     subtitle: "Serve luxury experiences backed by smart tech.",
//   },
// ];

export default function Login() {
  // const [currentIndex, setCurrentIndex] = useState(0);
  // const [hasMounted, setHasMounted] = useState(false);

  // useEffect(() => {
  //   setHasMounted(true);
  //   const timer = setInterval(() => {
  //     setCurrentIndex((prev) => (prev + 1) % slideTexts.length);
  //   }, 5000);
  //   return () => clearInterval(timer);
  // }, []);

  return (
    <div className="relative w-full min-h-screen flex flex-col lg:flex-row">
      {/* Static Background Image (login-bg-3.jpg only) */}
      <div className="absolute inset-0 lg:relative lg:w-1/2 overflow-hidden">
        <Image
          src="/assets/login-bg-3.jpg"
          alt="Burj Al Arab"
          fill
          className="object-cover absolute inset-0 z-10"
          priority
        />

        {/* Dark overlay */}
        <div className="absolute inset-0  z-20" />

        {/* Logo top-left for lg screens */}
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

        {/* Rotating text centered (unchanged) */}
        {/* {hasMounted && (
          <div className="absolute z-30 hidden lg:flex w-full h-full items-center justify-center px-6">
            <div className="w-full max-w-md bg-gradient-to-br from-white/10 to-green-500/20 border border-white/20 backdrop-blur-xl p-6 rounded-2xl shadow-xl text-center">
              <h2 className="text-3xl font-bold text-white drop-shadow-md leading-tight">
                {slideTexts[currentIndex].title}
              </h2>
              <p className="text-base text-white/80 mt-3 leading-snug">
                {slideTexts[currentIndex].subtitle}
              </p>
            </div>
          </div>
        )} */}
      </div>

      {/* Mobile dark overlay */}
      <div className="absolute inset-0 lg:hidden bg-black/40 z-10" />

      {/* Login form section (unchanged) */}
      <div className="relative z-40 w-full lg:w-1/2 flex justify-center items-center p-4 sm:p-8 min-h-screen">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-md p-6 rounded-xl shadow-lg">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
