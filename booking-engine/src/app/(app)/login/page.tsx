"use client";

import React, { Suspense } from "react";
import Login from "./authLogin";
import RedirectIfAuthenticated from "@/components/check_authentication/RedirectIfAuthenticated";

const LoginPage = () => {
  return (
    <RedirectIfAuthenticated>
      <div>
        <Suspense fallback={<div>Loading...</div>}>
          <Login />
        </Suspense>
      </div>
    </RedirectIfAuthenticated>
  );
};

export default LoginPage;