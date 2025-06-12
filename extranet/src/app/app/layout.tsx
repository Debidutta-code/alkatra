"use client";
import React, { useState, useEffect } from "react";
import Navbar from "../../components/navbar/navbar";
import CheckAuthentication from "../../components/CheckAuthentication/CheckAuthentication";
import { Triangle } from "react-loader-spinner";
import AppSidebar from "../../components/Sidebar";
import { RootState, store, useSelector, useDispatch } from "../../redux/store";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setSuperAdmin] = useState<boolean>(false)
  const currentUser = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (currentUser?.role === "superAdmin") {
      setSuperAdmin(true);
    } else {
      setSuperAdmin(false);
    }
  }, [currentUser]);
  useEffect(() => {
    // Simulate authentication check completion

    const timeout = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <CheckAuthentication setLoading={setLoading}>
      {loading ? (
        <div className="h-screen w-screen flex justify-center items-center overflow-hidden">
          <Triangle
            visible={true}
            height={100}
            width={100}
            color="#282D4D"
            ariaLabel="triangle-loading"
          />
        </div>
      ) : (
        <>

          <div className="h-screen w-screen overflow-y-auto overflow-x-hidden">
            {isSuperAdmin && (
                <AppSidebar />
            )}
            <div>

              <Navbar />
              {children}
            </div>
          </div>
        </>
      )}
    </CheckAuthentication>
  );
}
