"use client";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { CardTitle, CardDescription } from "../ui/card";
import { Loader2, CheckCircle2, AlertCircle, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const updatePasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  newPassword: z
    .string()
    .min(1, "Password is required")
    .regex(
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/,
      "Password must contain at least 8 characters including one uppercase letter, one lower case letter, one number and one special character."
    ),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
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

export default function UpdatePasswordForm({ email, onBack }: UpdatePasswordFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<UpdatePasswordInputs>({
    defaultValues: { email, newPassword: "", confirmPassword: "" },
    resolver: zodResolver(updatePasswordSchema),
    mode: "onChange"
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = async (data: UpdatePasswordInputs) => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await updatePassword(data);
      if (response.status === "success") {
        setMessage({ text: "Password updated successfully!", type: "success" });
        toast.success("Password updated successfully!");
        setTimeout(() => onBack("login"), 1500);
      } else {
        throw new Error("Unexpected response");
      }
    } catch (err) {
      const errorMsg = "Failed to update password. Please try again.";
      setMessage({ text: errorMsg, type: "error" });
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field: "new" | "confirm") => {
    field === "new"
      ? setShowNewPassword(!showNewPassword)
      : setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="w-full max-w-md space-y-6 p-6 sm:p-8 bg-card rounded-xl shadow-lg border border-border mx-auto">
      <div className="text-center space-y-2">
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-4 md:left-8 md:top-8"
          onClick={() => onBack()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <CardTitle className="text-3xl font-bold">Reset Password</CardTitle>
        <CardDescription className="text-muted-foreground">
          Create a new password for your account
        </CardDescription>
      </div>

      {message && (
        <div className={`rounded-lg p-4 flex items-start gap-3 ${message.type === "success"
            ? "bg-green-50 text-green-800"
            : "bg-red-50 text-red-800"
          }`}>
          {message.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 mt-0.5 text-green-600" />
          ) : (
            <AlertCircle className="h-5 w-5 mt-0.5 text-red-600" />
          )}
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="newPassword">New Password</Label>
          <div className="relative">
            <Input
              id="newPassword"
              className="pr-10"
              placeholder="••••••••"
              {...register("newPassword")}
              type={showNewPassword ? "text" : "password"}
              variant={errors.newPassword ? "error" : undefined}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => togglePasswordVisibility("new")}
            >
              {showNewPassword ? (
                <EyeOff className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Eye className="h-5 w-5 text-muted-foreground" />
              )}
              <span className="sr-only">
                {showNewPassword ? "Hide password" : "Show password"}
              </span>
            </Button>
          </div>
          {errors.newPassword && (
            <p className="text-sm text-destructive">{errors.newPassword.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              className="pr-10"
              placeholder="••••••••"
              {...register("confirmPassword")}
              type={showConfirmPassword ? "text" : "password"}
              variant={errors.confirmPassword ? "error" : undefined}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => togglePasswordVisibility("confirm")}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Eye className="h-5 w-5 text-muted-foreground" />
              )}
              <span className="sr-only">
                {showConfirmPassword ? "Hide password" : "Show password"}
              </span>
            </Button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={loading}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Reset Password"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            size="lg"
            onClick={() => onBack()}
          >
            Cancel
          </Button>
        </div>
      </form>
{/* 
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="px-2 text-muted-foreground bg-background">
            Or continue with
          </span>
        </div>
      </div> */}
      <div className="space-y-2 pt-1">
        <div className="flex justify-center">
          <Button
            variant="link"
            className="px-0 text-primary h-auto font-medium"
            onClick={() => onBack("login")}
          >
            Back to Login
          </Button>
        </div>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="px-2 text-muted-foreground bg-background">
            Or
            </span>
          </div>
        </div>

        <div className="text-center">
          <span className="text-sm text-muted-foreground">
            Don't have an account?{" "}
          </span>
          <Button
            variant="link"
            className="px-0 text-primary h-auto font-medium"
            onClick={() => router.push("/register")}
          >
            Create one
          </Button>
        </div>
      </div>
    </div>
  );
}

async function updatePassword(data: UpdatePasswordInputs) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/update/password`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: data.email,
      newPassword: data.newPassword
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update password");
  }

  return response.json();
}