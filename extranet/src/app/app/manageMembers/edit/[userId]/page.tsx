"use client";

import React, { useEffect, useState } from "react";
import { Button } from "../../../../../components/ui/button";
import { CardTitle } from "../../../../../components/ui/card";
import { Input } from "../../../../../components/ui/input";
import { Label } from "../../../../../components/ui/label";
import { ReloadIcon } from "@radix-ui/react-icons/";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { AtSign, Eye, EyeOff, Lock, User, UserCog, ArrowLeft, UserCheck, Shield } from "lucide-react";
import { Button as NextUIButton } from "@nextui-org/react";
import axios from "axios";
import Cookies from "js-cookie";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../components/ui/select";

interface PageProps {
  params: {
    userId: string;
  };
}

const EditMember = ({ params }: PageProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const router = useRouter();
  const { userId } = params;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
  });

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const accessToken = Cookies.get("accessToken");

        if (!accessToken) {
          toast.error("You are not authenticated");
          router.push("/login");
          return;
        }

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/${userId}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        if (response.data && response.data.data && response.data.data.user) {
          const userData = response.data.data.user;
          setFormData({
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            role: userData.role,
            password: "",
            confirmPassword: "",
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to fetch user data");
        router.push("/app/manageMembers");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      role: value,
    }));

    // Clear role error when user selects a role
    if (errors.role) {
      setErrors((prev) => ({
        ...prev,
        role: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      firstName: "",
      lastName: "",
      email: "",
      role: "",
      password: "",
      confirmPassword: "",
    };

    let isValid = true;

    // Required field validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
      isValid = false;
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else {
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
        isValid = false;
      }
    }

    if (!formData.role) {
      newErrors.role = "Please select a role";
      isValid = false;
    }

    // Password validation - only if password is provided
    if (formData.password) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;
      if (!passwordRegex.test(formData.password)) {
        newErrors.password = "Password must contain at least 8 characters including one uppercase letter, one lower case letter, one number and one special character.";
        isValid = false;
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormSubmitted(true);

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const accessToken = Cookies.get("accessToken");

      if (!accessToken) {
        toast.error("You are not authenticated");
        router.push("/login");
        return;
      }

      // Prepare data to send - only include password if it's provided
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: formData.role,
        ...(formData.password && { password: formData.password }),
      };

      // Call the API to update a user
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/update/${userId}`,
        updateData,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      toast.success("Member updated successfully");
      router.push("/app/manageMembers");
    } catch (error) {
      console.error("Error updating member:", error);
      toast.error("Failed to update member");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-6 px-4 md:px-8 lg:px-16">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
            <div className="flex items-center justify-center space-x-2">
              <ReloadIcon className="h-5 w-5 animate-spin text-primary" />
              <span className="text-slate-600">Loading member data...</span>
            </div>
          </div>
        </div>
      </main>
    );
  }

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
              <div className="p-2 bg-blue-50 rounded-lg">
                <UserCheck className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-slate-800">
                  Edit Member
                </CardTitle>
                <p className="text-slate-600 text-sm">Update member information and credentials</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-2">
                <h3 className="text-lg font-semibold text-slate-800">Personal Information</h3>
                <p className="text-sm text-slate-600">Update the member's basic details</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="firstName" className="text-sm font-medium text-slate-700">
                    First Name
                  </Label>
                  <div className="relative">
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`h-10 pl-12 border-slate-300 focus:border-primary focus:ring-primary/20 rounded-lg transition-all ${
                        formSubmitted && errors.firstName ? 'border-red-500' : ''
                      }`}
                      placeholder="Enter first name"
                    />
                    <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
                  </div>
                  {formSubmitted && errors.firstName && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="lastName" className="text-sm font-medium text-slate-700">
                    Last Name
                  </Label>
                  <div className="relative">
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`h-10 pl-12 border-slate-300 focus:border-primary focus:ring-primary/20 rounded-lg transition-all ${
                        formSubmitted && errors.lastName ? 'border-red-500' : ''
                      }`}
                      placeholder="Enter last name"
                    />
                    <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
                  </div>
                  {formSubmitted && errors.lastName && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      {errors.lastName}
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
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`h-10 pl-12 border-slate-300 focus:border-primary focus:ring-primary/20 rounded-lg transition-all ${
                      formSubmitted && errors.email ? 'border-red-500' : ''
                    }`}
                    placeholder="Enter email address"
                  />
                  <AtSign size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
                </div>
                {formSubmitted && errors.email && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            {/* Role & Permissions Section */}
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-2">
                <h3 className="text-lg font-semibold text-slate-800">Role & Permissions</h3>
                <p className="text-sm text-slate-600">Update member's role and access level</p>
              </div>

              <div className="space-y-1">
                <Label htmlFor="role" className="text-sm font-medium text-slate-700">
                  Role & Permissions
                </Label>
                <div className="relative">
                  <div className="flex items-center">
                    <UserCog size={18} className="text-slate-500 absolute left-3 z-10" />
                    <Select value={formData.role} onValueChange={handleRoleChange}>
                      <SelectTrigger className={`h-10 pl-12 border-slate-300 focus:border-primary focus:ring-primary/20 rounded-lg transition-all ${
                        formSubmitted && errors.role ? 'border-red-500' : ''
                      }`}>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg border-slate-300">
                        <SelectItem value="groupManager" className="rounded-md">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            Group Manager
                          </div>
                        </SelectItem>
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
                    {errors.role}
                  </p>
                )}
                <p className="text-sm text-slate-500 mt-1">
                  The role determines what permissions the user will have
                </p>
              </div>
            </div>

            {/* Password Update Section */}
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-2">
                <h3 className="text-lg font-semibold text-slate-800">Password Update</h3>
                <p className="text-sm text-slate-600">Change the member's password (optional)</p>
              </div>

              <div className="space-y-1">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    className={`h-10 pl-12 pr-12 border-slate-300 focus:border-primary focus:ring-primary/20 rounded-lg transition-all ${
                      formSubmitted && errors.password ? 'border-red-500' : ''
                    }`}
                    placeholder="Leave blank to keep current password"
                  />
                  <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2 py-0 hover:bg-transparent h-auto"
                  >
                    {showPassword ? (
                      <Eye size={18} className="text-slate-500 hover:text-slate-700" />
                    ) : (
                      <EyeOff size={18} className="text-slate-500 hover:text-slate-700" />
                    )}
                  </Button>
                </div>
                {formSubmitted && errors.password && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    {errors.password}
                  </p>
                )}
                <p className="text-sm text-slate-500 mt-1">
                  Leave blank if you don't want to change the password
                </p>
              </div>

              <div className="space-y-1">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={!formData.password}
                    className={`h-10 pl-12 pr-12 border-slate-300 focus:border-primary focus:ring-primary/20 rounded-lg transition-all ${
                      formSubmitted && errors.confirmPassword ? 'border-red-500' : ''
                    } ${!formData.password ? 'bg-slate-50' : ''}`}
                    placeholder="Confirm new password"
                  />
                  <Shield size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2 py-0 hover:bg-transparent h-auto"
                    disabled={!formData.password}
                  >
                    {showConfirmPassword ? (
                      <Eye size={18} className="text-slate-500 hover:text-slate-700" />
                    ) : (
                      <EyeOff size={18} className="text-slate-500 hover:text-slate-700" />
                    )}
                  </Button>
                </div>
                {formSubmitted && errors.confirmPassword && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    {errors.confirmPassword}
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
                className="w-full h-10 bg-tripswift-blue text-white hover:bg-tripswift-dark-blue rounded-lg font-medium transition-all transform hover:scale-[1.02] disabled:hover:scale-100"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <ReloadIcon className="h-4 w-4 animate-spin" />
                    Updating Member...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <UserCheck size={18} />
                    Update Member
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

export default EditMember;