"use client";

import { Button } from "../../../components/ui/button";
import { CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { ReloadIcon } from "@radix-ui/react-icons/";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { AtSign, Eye, EyeOff, Lock, User } from "lucide-react";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button as NextUIButton,
} from "@nextui-org/react";
import axios from "axios";

type Props = {};
const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

const registerSchema = z.object({
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  email: z
    .string()
    .min(1, "Email is required")
    .regex(gmailRegex, "Please provide a valid Email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .regex(
      /^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*\d.*\d.*\d).{8,}$/,
      "Password must contain at least 8 characters including one uppercase letter, one lower case letter, one number and one special character."
    ),
});

type Inputs = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export default function RegisterForm({ }: Props) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const router = useRouter();

  const form = useForm<Inputs>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
    resolver: zodResolver(registerSchema),
    mode: "onSubmit" // Only validate on submit
  });

  const { register, handleSubmit, formState } = form;
  const { errors, isSubmitting } = formState;

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/register`,
        {
          ...data,
        }
      );
      toast.success("Registration successful!");
      router.push("/login");
    } catch (err: any) {
      console.log("Axios Error - ", err.response?.data?.message);
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message);
      }
      return;
    }
  };

  const handleFormSubmit = () => {
    setFormSubmitted(true);
    handleSubmit(onSubmit)();
  };

  return (
    <div className="w-[500px]">
      <div className="mb-10">
        <CardTitle className="text-5xl">
          Register | <span className="font-normal text-xl">TripSwift</span>
        </CardTitle>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); handleFormSubmit(); }} className="flex flex-col">
        <div className="mb-10 space-y-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              withIcon
              startIcon={<User size={20} />}
              size={"lg"}
              type="text"
              variant={formSubmitted && errors.firstName ? "error" : undefined}
              {...register("firstName")}
            />
            {formSubmitted && errors.firstName && (
              <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              withIcon
              startIcon={<User size={20} />}
              size={"lg"}
              variant={formSubmitted && errors.lastName ? "error" : undefined}
              {...register("lastName")}
              type="text"
            />
            {formSubmitted && errors.lastName && (
              <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              withIcon
              startIcon={<AtSign size={20} />}
              size={"lg"}
              {...register("email")}
              variant={formSubmitted && errors.email ? "error" : undefined}
              type="email"
            />
            {formSubmitted && errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              {...register("password")}
              withIcon
              startIcon={<Lock size={20} />}
              variant={formSubmitted && errors.password ? "error" : undefined}
              endIcon={
                <Button
                  variant={"ghost"}
                  onClick={() => setIsVisible((prev) => !prev)}
                  className="px-0 py-0 hover:bg-transparent"
                  type="button"
                >
                  {isVisible ? <Eye size={20} /> : <EyeOff size={20} />}
                </Button>
              }
              size={"lg"}
              type={isVisible ? "text" : "password"}
            />
            {formSubmitted && errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-center">
          <span>
            Already have an account?{" "}
            <Button
              type="button"
              className="px-0"
              onClick={() => router.push("/login")}
              variant={"link"}
            >
              Login
            </Button>
          </span>
          <SubmitButton loading={isSubmitting} />
        </div>
      </form>
    </div>
  );
}

function SubmitButton({ loading }: { loading: boolean }) {
  return (
    <NextUIButton
      size="lg"
      type="submit"
      variant="solid"
      className="bg-primary text-primary-foreground hover:bg-primary/90 w-full"
    >
      {loading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
      Register
    </NextUIButton>
  );
}