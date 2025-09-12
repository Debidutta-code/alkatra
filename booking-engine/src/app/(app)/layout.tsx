'use client';
import React from "react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import '../../i18n/Index';
import { useNetworkStatus } from "../../services";
import { Chatbot } from "../../components/forms/ChatBotComponents";
import { useSelector } from 'react-redux';
import { RootState } from '../../Redux/store';
import { usePathname } from 'next/navigation';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isOnline = useNetworkStatus();
  const pathname = usePathname();
  const { user } = useSelector((state: RootState) => state.auth);
  const shouldShowChatbot = !['/login', '/register'].some(page => pathname.startsWith(page));
  return (
    <div className="min-h-screen bg-tripswift-off-white text-tripswift-black font-primary">
      <Navbar />
      {children}
      {shouldShowChatbot && <Chatbot userFirstName={user?.firstName || 'Guest'} isOnline={isOnline} />}
      <Footer />
    </div>
  );
}
