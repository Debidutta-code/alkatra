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
import { AtSign, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
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
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null);

  const form = useForm<VerifyInputs>({
    defaultValues: { email: "" },
    resolver: zodResolver(verifyEmailSchema),
  });

  const { register, handleSubmit, formState, reset } = form;
  const { errors } = formState;

  const onSubmit = async (data: VerifyInputs) => {
    setLoading(true);
    setMessage(null);
    setMessageType(null);
    try {
      const response = await verifyEmail(data);
      if (response.status === "success") {
        setMessage("Email verification successful!");
        setMessageType("success");
        setVerifiedEmail(data.email);
        reset();
        setShowUpdatePasswordForm(true);
        setTimeout(() => {
          setMessage(null);
          setMessageType(null);
        }, 1500);
      } else {
        setMessage("Email not found. Please try again.");
        setMessageType("error");
      }
    } catch (err) {
      console.error("Verification failed!", err);
      setMessage("Email verification failed. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  if (showUpdatePasswordForm && verifiedEmail) {
    return <UpdatePasswordForm email={verifiedEmail} onBack={onBack} />;
  }

  return (
    <div className="">
      <div className="mb-10 text-center">
        <CardTitle className="text-5xl">Forgot Password?</CardTitle>
        <CardDescription>Enter your email</CardDescription>
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
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              withIcon
              startIcon={<AtSign size={20} />}
              size="lg"
              {...register("email")}
              variant={errors.email ? "error" : undefined}
              type="email"
            />
            {errors.email && <p className="text-red-500">{errors.email.message}</p>}
          </div>
        </div>
        <div className="flex gap-4">
          <SubmitButton loading={loading} />
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              reset();
              onBack("login");
            }}
            size="lg"
            className="w-full py-3 px-6"
          >
            Cancel
          </Button>
        </div>
      </form>
      <div className="mt-6 text-center">
        <span>
          Back to{" "}
          <Button type="button" className="px-0" onClick={() => onBack("login")} variant="link">
            Login
          </Button>
        </span>
        <div className="relative flex items-center justify-center w-full mt-9 border border-t">
          <div className="absolute px-5 bg-transparent">Or</div>
        </div>
        <span>
          Don't have an account?{" "}
          <Button type="button" className="px-0" onClick={() => router.push("/register")} variant="link">
            Register
          </Button>
        </span>
      </div>
    </div>
  );
}

function SubmitButton({ loading }: { loading: boolean }) {
  return (
    <Button
      size="lg"
      type="submit"
      variant="default"
      className="bg-primary text-primary-foreground hover:bg-primary/90 w-full py-3 px-6"
      disabled={loading}
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send"}
    </Button>
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
    console.error("Verification failed with response:", errorData);
    throw new Error("Verification failed");
  }

  return response.json();
}
