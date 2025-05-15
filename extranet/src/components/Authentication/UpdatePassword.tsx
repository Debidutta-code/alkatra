"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { CardTitle } from "../ui/card";
import { Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";
import router from "next/router";

const updatePasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  newPassword: z
    .string()
    .min(1, "Password is required")
    .regex(
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/,
      "Password must contain at least 8 characters including one uppercase letter, one lower case letter, one number and one special character."
    ),
  confirmPassword: z
    .string()
    .min(1, "Password is required")
    .regex(
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/,
      "Password must contain at least 8 characters including one uppercase letter, one lower case letter, one number and one special character."
    ),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type UpdatePasswordInputs = {
  email: string;
  newPassword: string;
  confirmPassword: string;
};

interface UpdatePasswordFormProps {
  email: string;
  onBack: (screen?: "login") => void;
}

const UpdatePasswordForm: React.FC<UpdatePasswordFormProps> = ({ email, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<UpdatePasswordInputs>({
    defaultValues: { email, newPassword: "", confirmPassword: "" },
    resolver: zodResolver(updatePasswordSchema),
  });

  const { register, handleSubmit, formState, reset } = form;
  const { errors } = formState;

  const onSubmit = async (data: UpdatePasswordInputs) => {
    setLoading(true);
    setMessage(null);
    setMessageType(null);
    try {
      const response = await updatePassword(data);
      if (response.status === "success") {
        toast.success("Your password has been reset successfully!");
        reset();
        onBack("login"); // Switch to LoginForm
      } else {
        throw new Error("Unexpected response");
      }
    } catch (err) {
      console.error("Failed to update password!", err);
      const errorMessage = "Failed to update password. Please try again.";
      setMessage(errorMessage);
      setMessageType("error");
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    onBack("login"); // Go to LoginForm
  };

  const handleBackToLogin = () => {
    onBack("login"); // Go to LoginForm
  };

  const togglePasswordVisibility = (field: "new" | "confirm") => {
    if (field === "new") {
      setShowNewPassword(!showNewPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  return (
    <div className="w-[500px]">
      <div className="mb-10">
        <CardTitle className="text-5xl">Reset Password</CardTitle>
      </div>

      {message && (
        <div
          className={`
            flex items-center p-4 mb-4 rounded-lg 
            ${messageType === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}
          `}
        >
          {messageType === "success" ? (
            <CheckCircle2 className="mr-2 text-green-600" />
          ) : (
            <AlertCircle className="mr-2 text-red-600" />
          )}
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
        <div className="mb-10 space-y-4">
          <div className="relative">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                {...register("newPassword")}
                size={"lg"}
                type={showNewPassword ? "text" : "password"}
                variant={errors.newPassword ? "error" : undefined}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("new")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 focus:outline-none"
              >
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.newPassword && <p className="text-red-500">{errors.newPassword.message}</p>}
          </div>

          <div className="relative">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                {...register("confirmPassword")}
                size={"lg"}
                type={showConfirmPassword ? "text" : "password"}
                variant={errors.confirmPassword ? "error" : undefined}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("confirm")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-500">{errors.confirmPassword.message}</p>}
          </div>
        </div>

        <div className="flex gap-4">
          <SubmitButton loading={loading} />
          <Button type="button" variant="outline" onClick={handleCancel} size="lg" className="w-full">
            Cancel
          </Button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <span>
          Back to{" "}
          <Button type="button" className="px-0" onClick={handleBackToLogin} variant={"link"}>
            Login
          </Button>
        </span>
        <div className="relative flex items-center justify-center w-full mt-9 border border-t">
          <div className="absolute px-5 bg-transparent">Or</div>
        </div>
        <span>
          Don't have an account?{" "}
          <Button type="button" className="px-0" onClick={() => router.push("/register")} variant={"link"}>
            Register
          </Button>
        </span>
      </div>
    </div>
  );
};

async function updatePassword(data: UpdatePasswordInputs) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/update/password`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: data.email, newPassword: data.newPassword }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to update password with response:", errorData);
    throw new Error("Failed to update password");
  }

  return response.json();
}

function SubmitButton({ loading }: { loading: boolean }) {
  return (
    <Button
      size="lg"
      type="submit"
      variant="default"
      className="bg-primary text-primary-foreground hover:bg-primary/90 w-full"
      disabled={loading}
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Reset Password"}
    </Button>
  );
}

export default UpdatePasswordForm;
