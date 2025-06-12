"use client";

import React, { useState } from "react";
import { Button } from "../../../../components/ui/button";
import { CardTitle } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { ReloadIcon } from "@radix-ui/react-icons/";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { AtSign, Eye, EyeOff, Lock, User, UserCog } from "lucide-react";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button as NextUIButton } from "@nextui-org/react";
import axios from "axios";
import Cookies from "js-cookie";
import { RootState, useSelector, useDispatch, store } from "../../../../redux/store";

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
  password: z.string().min(8, "Password must be at least 8 characters long"),
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
    mode: "onSubmit", // Only validate on submit
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
    <main className="py-8 px-10 md:px-20 lg:px-56 flex justify-center items-center">
      <div className="w-[500px]">
        <div className="mb-6">
          <Button
            variant="ghost"
            className="p-0"
            onClick={() => router.push("/app/manageMembers")}
          >
            &larr; Back to Members
          </Button>
        </div>
        <div className="mb-10">
          <CardTitle className="text-3xl">
            Create Member |{" "}
            <span className="font-normal text-xl">TripSwift</span>
          </CardTitle>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleFormSubmit();
          }}
          className="flex flex-col"
        >
          <div className="mb-10 space-y-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                withIcon
                startIcon={<User size={20} />}
                size={"lg"}
                type="text"
                variant={
                  formSubmitted && errors.firstName ? "error" : undefined
                }
                {...register("firstName")}
              />
              {formSubmitted && errors.firstName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.firstName.message}
                </p>
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
                <p className="text-red-500 text-sm mt-1">
                  {errors.lastName.message}
                </p>
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
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
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
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <div className="flex items-center">
                <UserCog size={20} className="mr-2" />
                <Select value={selectedRole} onValueChange={handleRoleChange}>
                  <SelectTrigger className="flex-1 h-[42px]">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {
                      isDisabled() && (
                        <>
                          <SelectItem value="groupManager">Group Manager</SelectItem>
                        </>
                      )
                    }
                    <SelectItem value="hotelManager">Hotel Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formSubmitted && errors.role && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.role.message}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-center">
            <NextUIButton
              size="lg"
              type="submit"
              variant="solid"
              className="bg-primary text-primary-foreground hover:bg-primary/90 w-full"
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Member
            </NextUIButton>
          </div>
        </form>
      </div>
    </main>
  );
};

export default CreateMember;
