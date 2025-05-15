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
    <div>
      {/* <Navbar/> */}
      {children}
    </div>
  )
}



