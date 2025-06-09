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
import { LogOut, User, Settings, ChevronDown, Building2, Menu, X } from "lucide-react";
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const [logoSrc, setLogoSrc] = useState("/assets/TRIP-1.png");

  const handleLogout = () => {
    dispatch(logout());
    Cookies.remove("accessToken");
    setIsMenuOpen(false); // Close mobile menu on logout
    return router.push("/login");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
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
    <>
      <nav
        className={`h-[10vh] min-h-[60px] w-full border-b border-gray-100 dark:border-gray-600 px-4 sm:px-6 md:px-8 lg:px-10 bg-gray-100 dark:bg-tripswift-black ${noNav ? "hidden" : "flex items-center justify-between"}`}
      >
        {/* Logo */}
        <div className="flex-shrink-0">
          <Image
            src={logoSrc}
            height={150}
            width={150}
            alt="Trip swift logo"
          />
        </div>

        {/* Hamburger Menu Button for Mobile */}
        <div
          role="button"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="lg:hidden cursor-pointer z-50 relative"
          onClick={toggleMenu}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-tripswift-off-white ${isMenuOpen ? 'shadow-inner' : 'shadow-sm'} transition-all duration-300`}>
            {isMenuOpen ? (
              <X size={20} className="text-tripswift-blue" />
            ) : (
              <Menu size={20} className="text-tripswift-black" />
            )}
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex gap-2">
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
                <div className="hidden xl:block text-left">
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
              <DropdownMenuItem
                onClick={handleLogout}
                className="px-3 py-2 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors duration-200 cursor-pointer text-red-600 dark:text-red-400"
              >
                <LogOut className="w-4 h-4 mr-3" />
                <span className="font-tripswift-medium">Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-gray-100 dark:bg-tripswift-black border-t border-gray-100 dark:border-gray-600 py-4 px-4 shadow-md absolute w-full left-0 top-[10vh] z-40 transition-all duration-300 animate-in slide-in-from-top-5">
          <div className="flex flex-col space-y-4">
            {/* User Profile Section - Mobile */}
            <div className="flex items-center gap-3 py-3 border-b border-gray-200 dark:border-gray-600">
              <Avatar className="h-10 w-10 ring-2 ring-tripswift-blue/20">
                <AvatarImage src="https://www.flaticon.com/free-icons/user" />
                <AvatarFallback className="bg-gradient-to-br from-tripswift-blue to-[#054B8F] text-tripswift-off-white font-tripswift-semibold text-sm">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-tripswift-medium text-foreground truncate">
                  {getUserDisplayName()}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email || "user@tripswift.com"}
                </p>
              </div>
            </div>

            {/* Properties Section - Mobile */}
            <div className="py-2">
              <div className="flex items-center gap-2 px-2 py-2 mb-3">
                <Building2 className="w-5 h-5 text-tripswift-blue" />
                <span className="text-sm font-tripswift-medium text-foreground">Properties</span>
              </div>
              
              <div className="ml-4 space-y-2">
                <Link 
                  href="/app/property" 
                  className="block py-2 px-3 text-sm text-foreground hover:bg-tripswift-blue/10 rounded-lg transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Manage Properties
                </Link>
                <Link 
                  href="/app/bookings" 
                  className="block py-2 px-3 text-sm text-foreground hover:bg-tripswift-blue/10 rounded-lg transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Manage Bookings
                </Link>
                <Link 
                  href="/app/revenue" 
                  className="block py-2 px-3 text-sm text-foreground hover:bg-tripswift-blue/10 rounded-lg transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Revenue
                </Link>
              </div>
            </div>

            {/* Logout - Mobile */}
            <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 py-3 px-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors duration-200"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-tripswift-medium text-sm">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default dynamic(() => Promise.resolve(Navbar), { ssr: false });