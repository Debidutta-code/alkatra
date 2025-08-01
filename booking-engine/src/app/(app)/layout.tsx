'use client';
import React, { useState } from "react";
// import Navbar from "@/components/layout/Navbar";
import { Triangle } from "react-loader-spinner";
import CheckAuthentication from "@/components/checkAuthentication/CheckAuth";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-tripswift-off-white text-tripswift-black font-primary">
      <Navbar />
      {/* <CheckAuthentication> */}
        {children}
      {/* </CheckAuthentication> */}
      <Footer />
    </div>
  );
}



