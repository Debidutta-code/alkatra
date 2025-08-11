'use client';
import React from "react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import '../../i18n/Index';

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



