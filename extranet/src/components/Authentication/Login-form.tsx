"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AtSign, Eye, EyeOff, Lock } from "lucide-react";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, RootState, store, useSelector } from "../../redux/store";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Button as NextUIButton } from "@nextui-org/react";
import VerifyEmailForm from "./ForgotPassword";
import toast from "react-hot-toast";
import { login, getUser } from "../../redux/slices/authSlice";
import { getProperties } from "../../redux/slices/propertySlice";
import { CardTitle } from "../ui/card";

type Props = {};

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please provide a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .regex(
      /^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*\d.*\d.*\d).{8,}$/,
      "Password must contain at least 8 characters including one uppercase letter, one lower case letter, one number and one special character."
    ),
});

type Inputs = {
  email: string;
  password: string;
};

const LoginForm = () => {
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  const form = useForm<Inputs>({
    defaultValues: { email: "", password: "" },
    resolver: zodResolver(loginSchema),
  });

  const { register, handleSubmit, formState } = form;
  const { errors } = formState;

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setLoading(true);
    try {
      await dispatch(login(data));
      await dispatch(getUser());
      await dispatch(getProperties());
      toast.success("Login successful!");
      console.log("Login data",data)
      // Get the current user from the store after login
      const state = store.getState();
      const currentUser = state.auth.user;
      if (currentUser) {
        if (currentUser.role === "hotelManager"&&currentUser.noOfProperties==0) {
          router.push("/app/property/create");
        }else if(currentUser.role === "hotelManager"&&currentUser.noOfProperties>0){
          router.push("/app");

        } else {
          // superAdmin and groupManager go to the property management page
          router.push("/app");
        }
      } else {
        // Fallback if user not available yet
        router.push("/app");
      }
    } catch (err:any) {
      console.log("error ",err.message)
      toast.error("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  if (isForgotPassword) {
    return <VerifyEmailForm onBack={() => setIsForgotPassword(false)} />;
  }

  return (
    <div className="w-[500px]">
      <div className="mb-10">
        <CardTitle className="text-5xl">
          Login | <span className="font-normal text-xl">TripSwift</span>
        </CardTitle>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
        <div className="mb-10 space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              withIcon
              startIcon={<AtSign size={20} />}
              size={"lg"}
              {...register("email")}
              type="email"
            />
            {errors.email && (
              <p className="text-red-500">{errors.email.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              {...register("password")}
              withIcon
              startIcon={<Lock size={20} />}
              endIcon={
                <Button
                  variant={"ghost"}
                  onClick={() => setIsVisible(!isVisible)}
                  className="px-0 py-0 hover:bg-transparent"
                  type="button"
                >
                  {isVisible ? <Eye size={20} /> : <EyeOff size={20} />}
                </Button>
              }
              size={"lg"}
              type={isVisible ? "text" : "password"}
            />
            {errors.password && (
              <p className="text-red-500">{errors.password.message}</p>
            )}
          </div>
          <div>
            <Button
              type="button" // Explicitly set to type="button" to prevent form submission
              className="underline hover:text-foreground transition-all duration-200 text-black dark:text-white"
              onClick={() => setIsForgotPassword(true)}
              variant={"link"}
            >
              Forgot your password?
            </Button>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <span>
            Don't have an account?{" "}
            <Button
              type="button"
              className="px-0"
              onClick={() => router.push("/register")}
              variant={"link"}
            >
              Register
            </Button>
          </span>
          <SubmitButton loading={loading} />
        </div>
      </form>
    </div>
  );
};

interface SubmitButtonProps {
  loading: boolean;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ loading }) => {
  return (
    <NextUIButton
      size="lg"
      type="submit"
      variant="solid"
      className="bg-primary text-primary-foreground hover:bg-primary/90 w-full"
      isLoading={loading}
    >
      Login
    </NextUIButton>
  );
};

export default LoginForm;
