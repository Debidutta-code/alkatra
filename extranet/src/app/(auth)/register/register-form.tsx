"use client";

import { Button } from "../../../components/ui/button";
import { CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { ReloadIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { AtSign, Eye, EyeOff, Lock, User } from "lucide-react";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button as NextUIButton } from "@nextui-org/react";
import axios from "axios";

const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z
    .string()
    .min(1, "Email is required")
    .regex(gmailRegex, "Please provide a valid Gmail address"),
  password: z
    .string()
    .min(1, "Password is required")
    .regex(
      /^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*\d.*\d.*\d).{8,}$/,
      "Password must contain at least 8 characters including one uppercase letter, one lower case letter, one number and one special character"
    ),
});

type Inputs = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export default function RegisterForm() {
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  const form = useForm<Inputs>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
    resolver: zodResolver(registerSchema),
    mode: "onChange" // Validate on change for better UX
  });

  const { register, handleSubmit, formState } = form;
  const { errors, isSubmitting, isValid } = formState;

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/register`,
        data
      );
      toast.success("Registration successful!");
      router.push("/login");
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Registration failed";
      toast.error(errorMsg);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6 sm:p-8 bg-card rounded-xl shadow-lg border border-border">
      <div className="text-center space-y-2">
        <CardTitle className="text-3xl font-bold text-foreground">
          Create Your Account
        </CardTitle>
        <p className="text-muted-foreground">
          Join TripSwift to manage your properties
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-sm font-medium">
              First Name
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <Input
                id="firstName"
                placeholder="John"
                className="pl-10"
                {...register("firstName")}
                variant={errors.firstName ? "error" : undefined}
              />
            </div>
            {errors.firstName && (
              <p className="text-sm text-destructive">{errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-sm font-medium">
              Last Name
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <Input
                id="lastName"
                placeholder="Doe"
                className="pl-10"
                {...register("lastName")}
                variant={errors.lastName ? "error" : undefined}
              />
            </div>
            {errors.lastName && (
              <p className="text-sm text-destructive">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <AtSign className="h-5 w-5 text-muted-foreground" />
              </div>
              <Input
                id="email"
                placeholder="your@gmail.com"
                className="pl-10"
                {...register("email")}
                variant={errors.email ? "error" : undefined}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
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
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
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
            isLoading={isSubmitting}
            isDisabled={!isValid || isSubmitting}
          >
            {isSubmitting && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
          </NextUIButton>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Already have an account?
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => router.push("/login")}
          >
            Sign In
          </Button>
        </div>
      </form>
    </div>
  );
}