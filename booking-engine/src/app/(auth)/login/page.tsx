"use client";

import React, { Suspense } from "react";
import Login from "./authLogin";
import RedirectIfAuthenticated from "../../../components/checkAuthentication/RedirectIfAuthenticated";
import { GoogleOAuthProvider } from "@react-oauth/google";

const LoginPage = () => {
  return (
    <RedirectIfAuthenticated>
      <div>
        <Suspense fallback={<div>Loading...</div>}>
          <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ""}>
            <Login />
          </GoogleOAuthProvider>
        </Suspense>
      </div>
    </RedirectIfAuthenticated>
  );
};

export default LoginPage;