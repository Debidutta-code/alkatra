"use client";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { CardTitle, CardDescription } from "../ui/card";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AtSign, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import UpdatePasswordForm from "./UpdatePassword";

const verifyEmailSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
});

type VerifyInputs = {
  email: string;
};

interface VerifyEmailFormProps {
  onBack: (screen?: "login") => void;
}

export default function VerifyEmailForm({ onBack }: VerifyEmailFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showUpdatePasswordForm, setShowUpdatePasswordForm] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const form = useForm<VerifyInputs>({
    defaultValues: { email: "" },
    resolver: zodResolver(verifyEmailSchema),
  });

  const { register, handleSubmit, formState: { errors }, reset } = form;

  const onSubmit = async (data: VerifyInputs) => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await verifyEmail(data);
      if (response.status === "success") {
        setMessage({ text: "Verification email sent! Check your inbox.", type: "success" });
        setVerifiedEmail(data.email);
        reset();
        setTimeout(() => setShowUpdatePasswordForm(true), 1500);
      } else {
        setMessage({ text: "Email not found. Please try again.", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Verification failed. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (showUpdatePasswordForm && verifiedEmail) {
    return <UpdatePasswordForm email={verifiedEmail} onBack={onBack} />;
  }

  return (
    <div className="w-full max-w-md space-y-6 p-6 sm:p-8 bg-card rounded-xl shadow-lg border border-border mx-auto">
      {/* <div className="text-center space-y-2">
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-4 md:left-8 md:top-8"
          onClick={() => onBack("login")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <CardTitle className="text-3xl font-bold">Forgot Password?</CardTitle>
        <CardDescription className="text-muted-foreground">
          Enter your email to reset your password
        </CardDescription>
      </div> */}

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
          <Label htmlFor="email">Email Address</Label>
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

        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={loading}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Continue"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            size="lg"
            onClick={() => onBack("login")}
          >
            Cancel
          </Button>
        </div>
      </form>
      <div className="space-y-2 pt-1">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="px-2 text-muted-foreground bg-background">
              Or
            </span>
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Button
            variant="link"
            className="px-0 text-primary h-auto"
            onClick={() => router.push("/register")}
          >
            Sign up
          </Button>
        </div>
      </div>
    </div>
  );
}

async function verifyEmail(data: VerifyInputs) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/verify/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Verification failed");
  }

  return response.json();
}