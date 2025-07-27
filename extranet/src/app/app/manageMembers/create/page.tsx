"use client";

import React, { useState } from "react";
import { Button } from "../../../../components/ui/button";
import { CardTitle } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { ReloadIcon } from "@radix-ui/react-icons/";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { AtSign, Eye, EyeOff, Lock, User, UserCog, ArrowLeft, UserPlus } from "lucide-react";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button as NextUIButton } from "@nextui-org/react";
import axios from "axios";
import Cookies from "js-cookie";
import { RootState, useSelector, store } from "../../../../redux/store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";

const createUserSchema = z.object({
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please provide a valid Email address"),
  password: z.string()
    .min(1, "Password is required")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/,
    "Password must contain at least 8 characters including one uppercase letter, one lower case letter, one number and one special character."),
  role: z.string().min(1, "Role is required"),
});

type Inputs = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
};

const CreateMember = () => {
  useSelector((state: RootState) => state.propertyReducer);
  const { user } = useSelector((state: RootState) => state.auth);
  const [isVisible, setIsVisible] = React.useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const router = useRouter();

  const isDisabled = () => {
    const state = store.getState();
    const currentUser = state.auth.user;
    return currentUser?.role === "superAdmin" ? true : false;
  }

  const form = useForm<Inputs>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "hotelManager",
    },
    resolver: zodResolver(createUserSchema),
    mode: "onSubmit",
  });

  const { register, handleSubmit, formState, setValue, watch } = form;
  const { errors, isSubmitting } = formState;
  const selectedRole = watch("role");

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      const accessToken = Cookies.get("accessToken");

      if (!accessToken) {
        toast.error("You are not authenticated");
        router.push("/login");
        return;
      }

      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/create-user`,
        data,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      toast.success("Member created successfully!");
      router.push("/app/manageMembers");
    } catch (err: any) {
      console.log("Axios Error - ", err.response?.data?.message);
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || "Failed to create member");
      } else {
        toast.error("An error occurred. Please try again.");
      }
    }
  };

  const handleFormSubmit = () => {
    setFormSubmitted(true);
    handleSubmit(onSubmit)();
  };

  const handleRoleChange = (value: string) => {
    setValue("role", value);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-6 px-4 md:px-8 lg:px-16">
      <div className="max-w-2xl mx-auto">
        {/* Header Section */}
        <div className="mb-6">
          <Button
            variant="ghost"
            className="mb-4 p-2 hover:bg-slate-200 rounded-lg transition-colors group"
            onClick={() => router.push("/app/manageMembers")}
          >
            <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Members
          </Button>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <UserPlus className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-slate-800">
                  Create New Member
                </CardTitle>
                <p className="text-slate-600 text-sm">Add a new team member to Al Hajz</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleFormSubmit();
            }}
            className="space-y-4"
          >
            {/* Personal Information Section */}
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-2">
                <h3 className="text-lg font-semibold text-slate-800">Personal Information</h3>
                <p className="text-sm text-slate-600">Enter the member's basic details</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="firstName" className="text-sm font-medium text-slate-700">
                    First Name
                  </Label>
                  <div className="relative">
                    <Input
                      withIcon
                      startIcon={<User size={18} className="text-slate-500" />}
                      size="lg"
                      type="text"
                      className="h-10 pl-12 border-slate-300 focus:border-primary focus:ring-primary/20 rounded-lg transition-all"
                      variant={formSubmitted && errors.firstName ? "error" : undefined}
                      {...register("firstName")}
                      placeholder="Enter first name"
                    />
                  </div>
                  {formSubmitted && errors.firstName && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="lastName" className="text-sm font-medium text-slate-700">
                    Last Name
                  </Label>
                  <div className="relative">
                    <Input
                      withIcon
                      startIcon={<User size={18} className="text-slate-500" />}
                      size="lg"
                      type="text"
                      className="h-10 pl-12 border-slate-300 focus:border-primary focus:ring-primary/20 rounded-lg transition-all"
                      variant={formSubmitted && errors.lastName ? "error" : undefined}
                      {...register("lastName")}
                      placeholder="Enter last name"
                    />
                  </div>
                  {formSubmitted && errors.lastName && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    withIcon
                    startIcon={<AtSign size={18} className="text-slate-500" />}
                    size="lg"
                    type="email"
                    className="h-10 pl-12 border-slate-300 focus:border-primary focus:ring-primary/20 rounded-lg transition-all"
                    variant={formSubmitted && errors.email ? "error" : undefined}
                    {...register("email")}
                    placeholder="Enter email address"
                  />
                </div>
                {formSubmitted && errors.email && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            {/* Account Security Section */}
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-2">
                <h3 className="text-lg font-semibold text-slate-800">Account Security</h3>
                <p className="text-sm text-slate-600">Set up login credentials and permissions</p>
              </div>

              <div className="space-y-1">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    {...register("password")}
                    withIcon
                    startIcon={<Lock size={18} className="text-slate-500" />}
                    variant={formSubmitted && errors.password ? "error" : undefined}
                    endIcon={
                      <Button
                        variant="ghost"
                        onClick={() => setIsVisible((prev) => !prev)}
                        className="px-2 py-0 hover:bg-transparent h-auto"
                        type="button"
                      >
                        {isVisible ? (
                          <Eye size={18} className="text-slate-500 hover:text-slate-700" />
                        ) : (
                          <EyeOff size={18} className="text-slate-500 hover:text-slate-700" />
                        )}
                      </Button>
                    }
                    size="lg"
                    type={isVisible ? "text" : "password"}
                    className="h-10 pl-12 pr-12 border-slate-300 focus:border-primary focus:ring-primary/20 rounded-lg transition-all"
                    placeholder="Enter password (min. 8 characters)"
                  />
                </div>
                {formSubmitted && errors.password && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="role" className="text-sm font-medium text-slate-700">
                  Role & Permissions
                </Label>
                <div className="relative">
                  <div className="flex items-center">
                    <UserCog size={18} className="text-slate-500 absolute left-3 z-10" />
                    <Select value={selectedRole} onValueChange={handleRoleChange}>
                      <SelectTrigger className="h-10 pl-12 border-slate-300 focus:border-primary focus:ring-primary/20 rounded-lg transition-all">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg border-slate-300">
                        {isDisabled() && (
                          <SelectItem value="groupManager" className="rounded-md">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              Group Manager
                            </div>
                          </SelectItem>
                        )}
                        <SelectItem value="hotelManager" className="rounded-md">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Hotel Manager
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {formSubmitted && errors.role && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    {errors.role.message}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-200">
              <NextUIButton
                size="lg"
                type="submit"
                variant="solid"
                className="w-full h-10 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium transition-all transform hover:scale-[1.02] disabled:hover:scale-100"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <ReloadIcon className="h-4 w-4 animate-spin" />
                    Creating Member...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <UserPlus size={18} />
                    Create Member
                  </div>
                )}
              </NextUIButton>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default CreateMember;