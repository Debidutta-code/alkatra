"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AtSign, Eye, EyeOff, Lock } from "lucide-react";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch } from "../../redux/store";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Button as NextUIButton } from "@nextui-org/react";
import VerifyEmailForm from "./ForgotPassword";
import toast from "react-hot-toast";
import { login, getUser } from "../../redux/slices/authSlice";
import { getProperties } from "../../redux/slices/propertySlice";
import { CardTitle } from "../ui/card";
import { ReloadIcon } from "@radix-ui/react-icons";

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
      "Password must contain at least 8 characters including one uppercase letter, one lower case letter, one number and one special character."    ),
});

type Inputs = {
  email: string;
  password: string;
};

const LoginForm: React.FC = () => {
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  const form = useForm<Inputs>({
    defaultValues: { email: "", password: "" },
    resolver: zodResolver(loginSchema),
    mode: "onChange"
  });

  const { register, handleSubmit, formState } = form;
  const { errors, isValid } = formState;

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setLoading(true);
    try {
      await dispatch(login(data));
      await dispatch(getUser());
      await dispatch(getProperties());
      toast.success("Login successful!");
      router.push("/app/property");
    } catch (err) {
      toast.error("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  if (isForgotPassword) {
    return <VerifyEmailForm onBack={() => setIsForgotPassword(false)} />;
  }  

  return (
    <div className="w-full max-w-md p-6 sm:p-8 bg-card rounded-xl shadow-lg border border-border mx-auto my-8">
      <div className="text-center space-y-2 mb-6">
        <CardTitle className="text-3xl font-bold text-foreground">
          Welcome Back
        </CardTitle>
        <p className="text-muted-foreground">Sign in to your TripSwift account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <AtSign className="h-5 w-5 text-muted-foreground" />
              </div>
              <Input
                id="email"
                placeholder="your@email.com"
                className="pl-10"
                {...register("email")}
                variant={errors.email ? "error" : undefined}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Button
                type="button"
                variant="link"
                size="sm"
                className="text-primary hover:text-primary/80 px-0"
                onClick={() => setIsForgotPassword(true)}
              >
                Forgot password?
              </Button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-muted-foreground" />
              </div>
              <Input
                id="password"
                placeholder="••••••••"
                className="pl-10 pr-10"
                {...register("password")}
                type={isVisible ? "text" : "password"}
                variant={errors.password ? "error" : undefined}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-1 hover:bg-transparent"
                onClick={() => setIsVisible(!isVisible)}
              >
                {isVisible ? (
                  <EyeOff className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Eye className="h-5 w-5 text-muted-foreground" />
                )}
                <span className="sr-only">
                  {isVisible ? "Hide password" : "Show password"}
                </span>
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <NextUIButton
            type="submit"
            size="lg"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
            isDisabled={!isValid || loading}
          >
            {loading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </NextUIButton>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Don't have an account?
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => router.push("/register")}
          >
            Create Account
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;