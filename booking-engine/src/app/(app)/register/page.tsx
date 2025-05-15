"use client";

import React from "react";
import Register from "./authRegister";
import RedirectIfAuthenticated from "@/components/check_authentication/RedirectIfAuthenticated";

const RegisterPage = () => {
  return (
    <RedirectIfAuthenticated>
      <div>
        <Register />
      </div>
    </RedirectIfAuthenticated>
  );
};

export default RegisterPage;