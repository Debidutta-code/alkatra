"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "./../../components/ui/avatar";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from "./../ui/navigation-menu";

import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "./../ui/menubar";

import { getUser, logout } from "../../redux/slices/authSlice";

import { cn } from "../../lib/utils";
import Link from "next/link";
import { Button } from "../ui/button";
import { Settings, User, LogOut, Users } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { RootState, store, useSelector, useDispatch } from "../../redux/store";
import { ModeToggle } from "./../mode-toggle";
import Cookies from "js-cookie";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { SidebarTrigger, useSidebar  } from "@src/components/ui/sidebar";

type Props = {};

// Create a separate component for the sidebar toggle logic
function NavbarSidebarToggle() {
  const { open, isMobile } = useSidebar();

  // Show toggle in navbar only when sidebar is closed (desktop) or always on mobile
  if (open && !isMobile) return null;

  return (
    <div className="">
      <SidebarTrigger />
    </div>
  );
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [noNav, setNoNav] = useState(false);
  const { open , isMobile } = useSidebar();

  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const dispatch = useDispatch();
  // const { theme } = useTheme();
  // const [logoSrc, setLogoSrc] = useState("/assets/ALHAJZ.png");


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
  // useEffect(() => {
  //   if (theme === "dark") {
  //     setLogoSrc("/assets/TRIP-2.png");
  //   } else {
  //     setLogoSrc("/assets/ALHAJZ.png");
  //   }
  // }, [theme]);

  return (
   <nav
  className={cn(
    "md:h-[14vh] h-[12vh] border-b flex items-center justify-between px-6 transition-all duration-300",
    noNav && "hidden",
    open && !isMobile
      ? " w-[calc(100vw-16rem)] md:pr-16 lg:pr-20"
      : " w-[calc(100vw-4rem)]",
    isMobile && "w-full ml-0"
  )}
>
  {/* Left: Toggle + Logo */}
  <div className="flex md:px-8  items-center gap-2 min-w-0">
    <NavbarSidebarToggle />
    {/* <Image ... /> */}
  </div>

  {/* Right: Menus and Avatar */}
  <div className="flex items-center md:pr-6 lg:pr-10  flex-wrap justify-end min-w-0">
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Properties</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="p-4 w-[200px] space-y-2">
              <Link href="/app/bookings">
                <Button variant="ghost" className="w-full justify-start">
                  Manage Bookings
                </Button>
              </Link>
              <Link href="/app/revenue">
                <Button variant="ghost" className="w-full justify-start">
                  Revenue
                </Button>
              </Link>
              {user && (user.role === "superAdmin" || user.role === "groupManager") && (
                <Link href="/app/manageMembers">
                  <Button variant="ghost" className="w-full justify-start">
                    Manage Members
                  </Button>
                </Link>
              )}
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>

    <Menubar>
      <MenubarMenu>
        <MenubarTrigger className="sm:space-x-2 space-x-1">
          <Avatar className="h-6 w-6">
            <AvatarImage src="https://www.flaticon.com/free-icons/user" />
            <AvatarFallback>{user?.firstName?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          {user &&
            user.firstName.charAt(0).toUpperCase() +
              user.firstName.slice(1).toLowerCase()}
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={handleLogout}>
            Logout
            <MenubarShortcut>
              <LogOut size={20} />
            </MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  </div>
</nav>

  );
}

