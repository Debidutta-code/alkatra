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
import { useRouter } from "next/navigation";
import { NextUIProvider } from "@nextui-org/react";
import { useSelector, useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import ReduxProvider from "../redux/ReduxProvider";
import { RootState, AppDispatch } from "../redux/store"; // Import AppDispatch
import { logout } from "../redux/slices/authSlice";

// Separate component to ensure Redux context is available before calling useSelector/useDispatch
function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>(); // Correctly typed dispatch
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  useEffect(() => {
    if (typeof window === "undefined") return; // Ensure this runs only on the client

    if (accessToken) {
      try {
        const decodedToken: any = jwtDecode(accessToken);
        const currentTime = Date.now() / 1000; // Convert to seconds

        if (decodedToken.exp < currentTime) {
          console.log("Token expired. Logging out...");
          dispatch(logout()).then(() => router.push("/login"));
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        dispatch(logout()).then(() => router.push("/login"));
      }
    } else {
      router.push("/login"); // Redirect if no token is found
    }
  }, [accessToken, router, dispatch]);

  return <>{children}</>;
}

// Main Providers component
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider>
      <NextUIProvider>
        <AuthProvider>{children}</AuthProvider>
      </NextUIProvider>
    </ReduxProvider>
  );
}
