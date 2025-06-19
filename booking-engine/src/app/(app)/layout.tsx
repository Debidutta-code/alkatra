'use client';
import React, { useState } from "react";
// import Navbar from "@/components/layout/Navbar";
import { Triangle } from "react-loader-spinner";
import CheckAuthentication from "@/components/check_authentication/CheckAuth";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-h-screen bg-tripswift-off-white text-tripswift-black font-primary">
      {/* <Navbar /> */}
      {/* <CheckAuthentication> */}
        {children}
      {/* </CheckAuthentication> */}
    </div>
  );
}



