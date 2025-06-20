"use client";
import React, { useState, useEffect } from "react";
import Navbar from "../../components/navbar/navbar";
import CheckAuthentication from "../../components/CheckAuthentication/CheckAuthentication";
import { Triangle } from "react-loader-spinner";
import AppSidebar from "../../components/Sidebar";
import {
  SidebarProvider,
  useSidebar,
} from "../../components/ui/sidebar";
import { RootState, useSelector } from "../../redux/store";
import { cn } from "../../lib/utils";

function MainContent({ children }: { children: React.ReactNode }) {
  const { open, isMobile } = useSidebar();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const isSuperAdmin = currentUser?.role === "superAdmin";

  return (
    <div className="flex flex-1">
      {isSuperAdmin && <AppSidebar />}
      <div
        className={cn(
          "flex-1 overflow-auto transition-all duration-300",
          open && !isMobile&&isSuperAdmin ? "ml-[250px]" : "ml-0"
        )}
      >
        {children}
      </div>
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
          <div className="flex flex-col h-screen">
            <Navbar />
            <div className="flex flex-1 overflow-hidden">
              <MainContent>{children}</MainContent>
            </div>
          </div>
        </SidebarProvider>
      )}
    </CheckAuthentication>
  );
}