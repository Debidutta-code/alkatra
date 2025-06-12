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
import { SidebarTrigger, useSidebar } from "@src/components/ui/sidebar";

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

function Navbar({}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [noNav, setNoNav] = useState(false);
  const [isSuperAdmin, setSuperAdmin] = useState<boolean>(false);

  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const [logoSrc, setLogoSrc] = useState("/assets/TRIP-1.png");
  const currentUser = useSelector((state: RootState) => state.auth.user);

    useEffect(() => {
      if (currentUser?.role === "superAdmin") {
        setSuperAdmin(true);
      } else {
        setSuperAdmin(false);
      }
    }, [currentUser]);

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
      setLogoSrc("/assets/TRIP-2.png");
    } else {
      setLogoSrc("/assets/TRIP-1.png");
    }
  }, [theme]);

  return (
    <nav
      className={`h-[10vh] w-screen border-b px-10 ${
        noNav ? "hidden" : "flex items-center justify-between"
      }`}
    >
      <div className="flex items-center">
        <Image src={logoSrc} height={100} width={100} alt="Trip swift logo" />
        {isSuperAdmin && (
          <>
            <NavbarSidebarToggle />
          </>
        )}
      </div>
      <div className="flex gap-2">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Properties</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="p-4 w-[200px] space-y-2">
                  <Link href={`/app/property`}>
                    <Button variant={"ghost"} className="w-full justify-start">
                      Manage Properties
                    </Button>
                  </Link>

                  <Link href="/app/bookings">
                    <Button variant={"ghost"} className="w-full justify-start">
                      Manage Bookings
                    </Button>
                  </Link>

                  <Link href="/app/revenue">
                    <Button variant={"ghost"} className="w-full justify-start">
                      Revenue
                    </Button>
                  </Link>

                  {user &&
                    (user.role === "superAdmin" ||
                      user.role === "groupManager") && (
                      <Link href="/app/manageMembers">
                        <Button
                          variant={"ghost"}
                          className="w-full justify-start"
                        >
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
            <MenubarTrigger className="space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src="https://www.flaticon.com/free-icons/user" />
                <AvatarFallback>
                  {user?.firstName?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {user &&
                user.firstName.charAt(0).toUpperCase() +
                  user.firstName.slice(1).toLowerCase()}
            </MenubarTrigger>
            <MenubarContent className="">
              <MenubarItem onClick={handleLogout}>
                Logout
                <MenubarShortcut>
                  <LogOut size={20} />
                </MenubarShortcut>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
        <ModeToggle />
      </div>
    </nav>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 list-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100 dark:hover:bg-slate-700 dark:focus:bg-slate-700",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-slate-500 dark:text-slate-400">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

export default dynamic(() => Promise.resolve(Navbar), { ssr: false });