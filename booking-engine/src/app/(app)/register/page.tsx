"use client";

import React from "react";
import Register from "./authRegister";
import RedirectIfAuthenticated from "@/components/check_authentication/RedirectIfAuthenticated";
import { GoogleOAuthProvider } from "@react-oauth/google";

const RegisterPage = () => {
  return (
    <RedirectIfAuthenticated>
      <div>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ""}>
          <Register />
        </GoogleOAuthProvider>
      </div>
    </RedirectIfAuthenticated>
  );
};

export default RegisterPage;