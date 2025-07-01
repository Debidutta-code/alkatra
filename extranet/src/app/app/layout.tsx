"use client";
import React, { useState, useEffect } from "react";
import Navbar from "../../components/navbar/navbar";
import CheckAuthentication from "../../components/CheckAuthentication/CheckAuthentication";
import { Triangle } from "react-loader-spinner";
import AppSidebar from "../../components/Sidebar";
import { SidebarProvider, useSidebar } from "../../components/ui/sidebar";
import { RootState, useSelector } from "../../redux/store";

function MainContent({ children }: { children: React.ReactNode }) {
  const { open, isMobile } = useSidebar();

  return (
    <div
      className={`h-full  overflow-x-hidden transition-all duration-300 ${
        open && !isMobile ? "ml-[220px]" : ""
      }`}
    >
      <Navbar />
      <div>{children}</div>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const currentUser = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <CheckAuthentication setLoading={setLoading}>
      {loading ? (
        <div className="h-screen w-screen flex items-center justify-center">
          <Triangle
            height="80"
            width="80"
            color="#4fa94d"
            ariaLabel="triangle-loading"
            visible={true}
          />
        </div>
      ) : (
        <SidebarProvider>
          <div className="relative min-h-screen w-full overflow-x-hidden">
            {/* Sidebar only shown when open */}
            <AppSidebar role={currentUser?.role || "hotelManager"} />
            {/* Main content */}
            <MainContent>{children}</MainContent>
          </div>
        </SidebarProvider>
      )}
    </CheckAuthentication>
  );
}
