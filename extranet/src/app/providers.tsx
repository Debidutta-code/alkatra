// "use client";
// import React, { useState } from "react";
// import { NextUIProvider } from "@nextui-org/react";
// import ReduxProvider from "../redux/ReduxProvider";

// export function Providers({ children }: { children: React.ReactNode }) {

//   return (
//     <NextUIProvider>
//       <ReduxProvider>
//         {children}
//       </ReduxProvider>
//     </NextUIProvider>
//   );
// }


"use client";
import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { NextUIProvider } from "@nextui-org/react";
import { useSelector, useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import ReduxProvider from "../redux/ReduxProvider";
import { RootState, AppDispatch } from "../redux/store";
import { logout } from "../redux/slices/authSlice";
import Cookies from "js-cookie";

// Auth Checker
function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  useEffect(() => {
    const cookieToken = Cookies.get("accessToken");

    // 1. Token mismatch
    if (accessToken && cookieToken && accessToken !== cookieToken) {
      console.warn("Token mismatch. Logging out...");
      dispatch(logout()).then(() => router.push("/login"));
      return;
    }

    // 2. Cookie deleted
    if (accessToken && !cookieToken) {
      console.warn("Access token cookie missing. Logging out...");
      dispatch(logout()).then(() => router.push("/login"));
      return;
    }

    // 3. Expired token
    if (accessToken && cookieToken && accessToken === cookieToken) {
      try {
        const decoded: any = jwtDecode(cookieToken);
        const now = Date.now() / 1000;

        if (decoded.exp < now) {
          console.warn("Token expired. Logging out...");
          dispatch(logout()).then(() => router.push("/login"));
        }
      } catch (err) {
        console.error("Failed to decode token. Logging out...");
        dispatch(logout()).then(() => router.push("/login"));
      }
    }
  }, [pathname, accessToken, dispatch, router]);

  return <>{children}</>;
}

// Main Providers
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider>
      <NextUIProvider>
        <AuthProvider>{children}</AuthProvider>
      </NextUIProvider>
    </ReduxProvider>
  );
}

