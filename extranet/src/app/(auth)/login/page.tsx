import React from "react";
import LoginComponent from '../../../components/Authentication/Login'; // Rename the imported component to avoid conflicts

type Props = {};

export default function LoginPage({}: Props) {
  return (
   <>
    <LoginComponent />
   </>
  );
}
