"use client";

import React, { useEffect, useState } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "./../../components/ui/avatar";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./../ui/navigation-menu";

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarShortcut,
  MenubarTrigger,
} from "./../ui/menubar";

import { getUser, logout } from "../../redux/slices/authSlice";

import Link from "next/link";
import { Button } from "../ui/button";
import { LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { RootState, useSelector, useDispatch } from "../../redux/store";
import Cookies from "js-cookie";
import { SidebarTrigger, useSidebar } from "@src/components/ui/sidebar";
import toast from "react-hot-toast";

type Props = {};

// Create a separate component for the sidebar toggle logic
function NavbarSidebarToggle() {
  const { open, isMobile } = useSidebar();

  // Show toggle in navbar only when sidebar is closed (desktop) or always on mobile
  if (open && !isMobile) return null;

  return (
    <div className="ml-2">
      <SidebarTrigger />
    </div>
  );
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [noNav, setNoNav] = useState(false);
  useSidebar();

  const { user } = useSelector(
    (state: RootState) => state.auth
  );
  const dispatch = useDispatch();
  
  const handleLogout = () => {
    dispatch(logout());
    Cookies.remove("accessToken");
    toast.success("Logged out successfully!");
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

  return (
    <nav
      className={`md:h-[14vh] h-[12vh] border-b px-10 ${noNav ? "hidden" : "flex items-center justify-between"
      } `}
    >
      <div className="flex md:px-8  items-center gap-2 min-w-0">
        <NavbarSidebarToggle />
      </div>

      {/* Right: Menus and Avatar */}
      <div className="flex items-center sm:gap-2 flex-wrap justify-end min-w-0">
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
                  {/* <Link href="/app/revenue">
                    <Button variant="ghost" className="w-full justify-start">
                      Revenue
                    </Button>
                  </Link> */}
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
            <MenubarTrigger className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              <Avatar className="h-7 w-7 border">
                <AvatarImage
                  src={"https://avatar.vercel.sh"}
                  alt={`${user?.firstName}'s avatar`}
                />
                <AvatarFallback className="bg-gradient-to-br from-tripswift-blue to-purple-600 text-primary-foreground font-medium">
                  {user?.firstName?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-sm font-medium">
                  {user &&
                    user.firstName.charAt(0).toUpperCase() +
                    user.firstName.slice(1).toLowerCase()}
                </span>
              </div>
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