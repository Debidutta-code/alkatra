import React from "react";
import LoginForm from "./Login-form";
type Props = {};
export default function Login({}: Props) {
  return (
    <div className="flex ">
      <div className="bg-[url('/assets/login-bg.jpg')] repeat-0 bg-cover h-screen lg:w-1/2 hidden lg:flex justify-center items-center min-h-screen" >
      </div>
      <div className="px-4 py-24 md:px-14 lg:px-24 mx-8 my-8 md:place-content-center place-self-center md:place-items-center lg:w-1/2 md:w-1/2 lg:grid-cols-2 grid-cols-1 ">
        <LoginForm />
      </div>
       </div>
  );
}