"use client";
import React, { useState, useEffect } from "react";
import Navbar from "../../components/navbar/navbar";
import CheckAuthentication from "../../components/CheckAuthentication/CheckAuthentication";
import { Triangle } from "react-loader-spinner";
import AppSidebar from "../../components/Sidebar";
import { SidebarProvider, useSidebar } from "../../components/ui/sidebar";
import { RootState, useSelector } from "../../redux/store";
import { cn } from "../../lib/utils";

function MainContent({ children }: { children: React.ReactNode }) {
  const { open, isMobile } = useSidebar();

  return (
    <div
      className={cn(
        "h-full w-full overflow-auto transition-all duration-300 overflow-x-hidden",
        open && !isMobile && "w-[80vw] ml-[20vw]"
      )}
    >
      <Navbar />
      <div className="">{children}</div>
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
        <div className="h-screen w-[100vw] flex items-center justify-center">
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
          <div className="flex h-screen max-w-[100vw]">
            {/* Sidebar */}
            <AppSidebar role={currentUser?.role || "hotelManager"} />
            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <MainContent>{children}</MainContent>
            </div>
          </div>
        </SidebarProvider>
      )}
    </CheckAuthentication>
  );
}
