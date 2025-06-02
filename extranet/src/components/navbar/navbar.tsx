"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "./../../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./../ui/dropdown-menu";
import { getUser, logout } from "../../redux/slices/authSlice";
import Link from "next/link";
import { Button } from "../ui/button";
import { LogOut, User, Settings, ChevronDown, Building2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { RootState, useSelector, useDispatch } from "../../redux/store";
import { ModeToggle } from "./../mode-toggle";
import Cookies from "js-cookie";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";

type Props = {};

function Navbar({ }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [noNav, setNoNav] = useState(false);
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const [logoSrc, setLogoSrc] = useState("/assets/TRIP-1.png");

  const handleLogout = () => {
    dispatch(logout());
    Cookies.remove("accessToken");
    return router.push("/login");
  };

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  useEffect(() => {
    const isLoginORregisterPath =
      pathname === "/login" || pathname === "/register";
    setNoNav(isLoginORregisterPath);
  }, [pathname]);

  // Update logo when theme changes
  useEffect(() => {
    if (theme === "dark") {
      setLogoSrc("/assets/TRIP-1.png");
    } else {
      setLogoSrc("/assets/TRIP-1.png");
    }
  }, [theme]);

  const getUserDisplayName = () => {
    if (!user?.firstName) return "User";
    return user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1).toLowerCase();
  };

  const getUserInitials = () => {
    if (!user?.firstName) return "U";
    return user.firstName.charAt(0).toUpperCase();
  };

  return (
    <nav
      className={`h-[10vh] w-screen border-b px-10 bg-gray-100 dark:bg-tripswift-black ${noNav ? "hidden" : "flex items-center justify-between"}`}
    >
      <div>
        <Image
          src={logoSrc}
          height={150}
          width={150}
          alt="Trip swift logo"
        />
      </div>
      <div className="flex gap-2">
        {/* Properties Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="text-sm font-tripswift-medium text-foreground flex items-center space-x-2 px-3 py-2 h-auto hover:bg-tripswift-blue/10 border border-transparent hover:border-tripswift-blue/20 transition-all duration-200"
            >
              <Building2 className="w-4 h-4" />
              <span>Properties</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 bg-card border border-tripswift-blue/20 p-2"
          >
            <DropdownMenuItem className="p-0">
              <Link href="/app/property" className="w-full">
                <Button variant="ghost" className="w-full justify-start">
                  Manage Properties
                </Button>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="p-0">
              <Link href="/app/bookings" className="w-full">
                <Button variant="ghost" className="w-full justify-start">
                  Manage Bookings
                </Button>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="p-0">
              <Link href="/app/revenue" className="w-full">
                <Button variant="ghost" className="w-full justify-start">
                  Revenue
                </Button>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center space-x-3 px-3 py-2 h-auto hover:bg-tripswift-blue/10 border border-transparent hover:border-tripswift-blue/20 transition-all duration-200 ml-2"
            >
              <Avatar className="h-8 w-8 ring-2 ring-tripswift-blue/20">
                <AvatarImage src="https://www.flaticon.com/free-icons/user" />
                <AvatarFallback className="bg-gradient-to-br from-tripswift-blue to-[#054B8F] text-tripswift-off-white font-tripswift-semibold text-sm">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-tripswift-medium text-foreground">
                  {getUserDisplayName()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user?.email || "user@tripswift.com"}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 bg-card border border-tripswift-blue/20 p-2"
          >
            <DropdownMenuLabel className="px-3 py-2">
              <div className="flex items-center space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-tripswift-blue text-white text-xs">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-tripswift-medium">{getUserDisplayName()}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email || "user@tripswift.com"}
                  </p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-tripswift-blue/20" />
            <DropdownMenuItem className="px-3 py-2 hover:bg-tripswift-blue/10 rounded-lg transition-colors duration-200 cursor-pointer">
              <User className="w-4 h-4 mr-3 text-tripswift-blue" />
              <span className="font-tripswift-medium">Profile Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="px-3 py-2 hover:bg-tripswift-blue/10 rounded-lg transition-colors duration-200 cursor-pointer">
              <Settings className="w-4 h-4 mr-3 text-tripswift-blue" />
              <span className="font-tripswift-medium">Account Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-tripswift-blue/20" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="px-3 py-2 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors duration-200 cursor-pointer text-red-600 dark:text-red-400"
            >
              <LogOut className="w-4 h-4 mr-3" />
              <span className="font-tripswift-medium">Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {/* Theme Toggle */}
        <div className="ml-2 pt-2">
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
}

export default dynamic(() => Promise.resolve(Navbar), { ssr: false });