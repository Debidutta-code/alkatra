"use client";

import React, { useEffect, useState } from "react";
import { Button } from "../../../../../components/ui/button";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../../components/ui/card";
import { Input } from "../../../../../components/ui/input";
import { Label } from "../../../../../components/ui/label";
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
  };

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      role: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.role
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Password validation - only if password is provided
    if (formData.password) {
      if (formData.password.length < 8) {
        toast.error("Password must be at least 8 characters long");
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
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
      <main className="py-8 px-10 md:px-20 lg:px-56">
        <div className="text-center py-8">Loading...</div>
      </main>
    );
  }
  return (
    <main className="py-8 px-4 flex flex-col items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-[500px]">
        <div className="mb-6">
          <Link href="/app/manageMembers">
            <Button variant="ghost" className="p-0">
              <ArrowLeft className="mr-2" size={16} />
              Back to Members
            </Button>
          </Link>
        </div>

        <div className="mb-10">
          <h1 className="text-4xl font-bold">Edit Member</h1>
          <p className="text-gray-500 mt-2">
            Update member information and credentials
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
                required
                // size="lg"
                className="mt-1 pl-2"
              />
            </div>

            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
                required
                // size="lg"
                // className="mt-1"
                className="mt-1 pl-2"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john.doe@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                // size="lg"
                // className="mt-1"
                className="mt-1 pl-2"
              />
            </div>

            <div>
              <Label htmlFor="role">Role</Label>
              <div className="mt-1">
                <Select value={formData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* <SelectItem value="superAdmin">Super Admin</SelectItem> */}
                    <SelectItem value="groupManager">Group Manager</SelectItem>
                    <SelectItem value="hotelManager">Hotel Manager</SelectItem>
                  </SelectContent>
                </Select>{" "}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                The role determines what permissions the user will have
              </p>
            </div>

            <div>
              <Label htmlFor="password">New Password (Optional)</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Leave blank to keep current password"
                  value={formData.password}
                  onChange={handleChange}
                  //   size="lg"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Leave blank if you don't want to change the password
              </p>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative mt-1">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={!formData.password}
                  //   size="lg"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-8 h-11 text-base"
          >
            {isSubmitting ? "Updating..." : "Update Member"}
          </Button>
        </form>
      </div>
    </main>
  );
};

export default EditMember;
