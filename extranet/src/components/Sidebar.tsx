"use client";
import Image from "next/image"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  useSidebar
} from "../components/ui/sidebar";
import {
  X,
  Building2,
  Users,
  BarChart3,
  Settings,
  Home,
  ChevronRight,
  Layers,
  Crown,
  Shield
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../lib/utils";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

interface NavigationItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  description?: string;
  restricted?: boolean;
}

export default function AppSidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const { user } = useSelector((state: RootState) => state.auth);
  const { isMobile, open, toggleSidebar } = useSidebar();

  const navigationItems: NavigationItem[] = [
    
    {
      title: "Grouped Properties",
      href: "/app/property/grouped",
      icon: Layers,
      description: "Managed property groups"
    },
    {
      title: "Direct Properties",
      href: "/app/property/single",
      icon: Building2,
      description: "Individual properties",
      restricted: role !== "superAdmin"
    },
    
  ];

  const visibleItems = navigationItems.filter(item => !item.restricted);

  const NavItem = ({ item }: { item: NavigationItem }) => {
    const isActive = pathname === item.href;
    
    return (
      <Link href={item.href} className="block">
        <div className={cn(
          "group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 ",
          isActive 
            ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25" 
            : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        )}>
          
          {/* Active indicator */}
          {isActive && (
            <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-white shadow-sm" />
          )}
          
          {/* Icon */}
          <div className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
            isActive 
              ? "bg-white/20 text-white" 
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400   "
          )}>
            <item.icon className="h-4 w-4" />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="truncate">{item.title}</span>
              {item.badge && (
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "ml-2 text-xs",
                    isActive 
                      ? "bg-white/20 text-white border-white/30" 
                      : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  )}
                >
                  {item.badge}
                </Badge>
              )}
            </div>
            {item.description && (
              <p className={cn(
                "text-xs mt-0.5 truncate",
                isActive 
                  ? "text-white/80" 
                  : "text-gray-500 dark:text-gray-400"
              )}>
                {item.description}
              </p>
            )}
          </div>
          {isActive && (
            <ChevronRight className="h-4 w-4 text-white/80" />
          )}
        </div>
      </Link>
    );
  };

  return (
    <div className="">
      <Sidebar className="border-r-2 border-gray-400">
        <SidebarHeader className="border-b border-gray-200/60 dark:border-gray-800/60 h-[10vh] bg-gradient-to-r from-white via-gray-50/50 to-white dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg blur opacity-25  transition duration-200"></div>
                <div className="relative bg-white dark:bg-gray-900 rounded-lg p-1">
                  <Image
                    src="/assets/TRIP-1.png"
                    alt="Logo"
                    width={100}
                    height={32}
                    className="rounded-md"
                  />
                </div>
              </div>
            </div>

            {open && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="h-8 w-8 p-0  hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors rounded-lg"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent className="bg-gradient-to-b from-white via-gray-50/30 to-white dark:from-gray-900 dark:via-gray-800/30 dark:to-gray-900 p-4">
       

          {/* Navigation Items */}
          <nav className="space-y-2">
            <div className="mb-4">
              <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Navigation
              </h3>
              <div className="space-y-1">
                {visibleItems.map((item) => (
                  <NavItem key={item.href} item={item} />
                ))}
              </div>
            </div>
          </nav>

          
        </SidebarContent>
      </Sidebar>
    </div>
  );
}