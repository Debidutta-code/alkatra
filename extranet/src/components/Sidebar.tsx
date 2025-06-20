// Updated AppSidebar component with mobile-friendly positioning
"use client";
import Image from "next/image"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarTrigger,
  useSidebar
} from "../components/ui/sidebar";
import {
  Home,
  Building2,
  Calendar,
  DollarSign,
  Users,
  Settings,
  ChevronRight,
  ChevronDown,
  User,
  X,
  PanelLeft,
  Building,
  MapPin,
  Bed,
  Bath,
  Car
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../lib/utils";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { Button } from "../components/ui/button";
import { useState, useRef, useEffect } from "react";
import axios from "axios";

// TypeScript interfaces
interface Hotel {
  _id: string;
  name: string;
  image: string[];
}

interface GroupedHotels {
  groupManagerName: string;
  id: string;
  hotels: Hotel[];
}

interface DirectProperty extends Hotel {}

export default function AppSidebar() {
  const pathname = usePathname();
  const { user } = useSelector((state: RootState) => state.auth);
  const { isMobile, open, toggleSidebar } = useSidebar();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [submenuPosition, setSubmenuPosition] = useState({ top: 0 });
  const menuItemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const [directProperties, setDirectProperties] = useState<DirectProperty[]>([]);
  const [groupedProperties, setGroupedProperties] = useState<GroupedHotels[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) {
      setHoveredItem(null);
    }
  }, [open]);

  const fetchAllProperties = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/property/getAdminProperties`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`
        }
      });

      console.log(response?.data);
      if (response?.data?.status === "success") {
        setDirectProperties(response?.data?.data?.direct || []);
        setGroupedProperties(response?.data?.data?.grouped || []);
      }
    } catch (error: any) {
      console.log("Error fetching properties:", error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (accessToken) {
      fetchAllProperties();
    }
  }, [accessToken]);

  const navigationItems = [
    {
      title: "Single Properties",
      icon: Building2,
      hasSubmenu: true,
      submenuItems: directProperties
    },
    {
      title: "Grouped Properties",
      icon: Building2,
      hasSubmenu: true,
      submenuItems: groupedProperties
    },
  ];

  const handleMouseEnter = (itemTitle: string) => {
    if (isMobile) return; // Disable hover on mobile
    
    setHoveredItem(itemTitle);
    
    const menuItemElement = menuItemRefs.current[itemTitle];
    if (menuItemElement) {
      const rect = menuItemElement.getBoundingClientRect();
      setSubmenuPosition({ top: rect.top });
    }
  };

  const handleItemClick = (itemTitle: string) => {
    if (isMobile) {
      setHoveredItem(hoveredItem === itemTitle ? null : itemTitle);
    }
  };

 

  const renderDirectProperties = () => {
    return directProperties.map((property, index) => {
      const propertyUrl = `app/property/${property._id}`;
      const isSubActive = pathname === propertyUrl;

      return (
        <Link
          key={property._id}
          href={propertyUrl}
          className="block mb-1"
          onClick={() => isMobile && toggleSidebar()}
        >
          <Button
            variant={isSubActive ? "secondary" : "ghost"}
            className="w-full justify-start p-3 h-auto"
          >
            <div className="flex items-center gap-3 w-full">
              <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/20">
                <Building className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 text-left">
                <span className="text-sm font-medium block truncate">{property.name}</span>
                <span className="text-xs text-muted-foreground">Direct Property</span>
              </div>
            </div>
          </Button>
        </Link>
      );
    });
  };

  const renderGroupedProperties = () => {
    return groupedProperties.map((group) => (
      <div key={group.id} className="mb-3">
        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {group.groupManagerName}
        </div>
        {group.hotels.map((hotel) => {
          const hotelUrl = `app/property/grouped/${hotel._id}`;
          const isSubActive = pathname === hotelUrl;

          return (
            <Link
              key={hotel._id}
              href={hotelUrl}
              className="block mb-1"
              onClick={() => isMobile && toggleSidebar()}
            >
              <Button
                variant={isSubActive ? "secondary" : "ghost"}
                className="w-full justify-start p-3 h-auto ml-2"
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="p-1.5 rounded-md bg-green-100 dark:bg-green-900/20">
                    <Building className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="text-sm font-medium block truncate">{hotel.name}</span>
                  </div>
                </div>
              </Button>
            </Link>
          );
        })}
      </div>
    ));
  };

  return (
    <div className="">
      <Sidebar>
        <SidebarHeader className="border-b p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image
                src="/assets/TRIP-1.png"
                alt="Logo"
                width={32}
                height={32}
                className="rounded"
              />
              <span className="font-semibold text-lg">Trip Swift</span>
            </div>

            {open && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => {
                  const hasItems = item.submenuItems && item.submenuItems.length > 0;

                  return (
                    <SidebarMenuItem key={item.title}>
                      <div
                        ref={(el) => (menuItemRefs.current[item.title] = el)}
                        className="relative"
                        onMouseEnter={() => handleMouseEnter(item.title)}
                        onClick={() => handleItemClick(item.title)}
                      >
                        <SidebarMenuButton
                          className={cn(
                            "w-full justify-between",
                            hoveredItem === item.title && "bg-accent text-accent-foreground"
                          )}
                        >
                          <div className="flex items-center justify-between w-full cursor-pointer">
                            <div className="flex items-center gap-3">
                              <item.icon className="h-4 w-4" />
                              <span>{item.title}</span>
                              {loading && <span className="text-xs text-muted-foreground">(Loading...)</span>}
                              {!loading && hasItems && (
                                <span className="text-xs text-muted-foreground">
                                  ({item.title === "Single Properties" ? directProperties.length : 
                                    groupedProperties.reduce((acc, group) => acc + group.hotels.length, 0)})
                                </span>
                              )}
                            </div>
                            {hasItems && (
                              isMobile ? (
                                <ChevronDown className={cn(
                                  "h-4 w-4 transition-transform",
                                  hoveredItem === item.title && "rotate-180"
                                )} />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )
                            )}
                          </div>
                        </SidebarMenuButton>
                      </div>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      {hoveredItem && !loading && (
        <div
          className={cn(
            "bg-background border-r border-border shadow-lg z-50 rounded-r-lg overflow-y-auto",
            isMobile ? "w-full relative" : "fixed w-80"
          )}
          style={!isMobile ? { 
            top: `${submenuPosition.top}px`,
            left: open ? "256px" : "64px",
            maxHeight: 'calc(100vh - 120px)',
          } : {}}
          onMouseEnter={() => !isMobile && setHoveredItem(hoveredItem)}
          onMouseLeave={() => !isMobile && setHoveredItem(null)}
        >
          <div className="p-2">
            {hoveredItem === "Single Properties" && (
              <>
                {directProperties.length === 0 ? (
                  <div className="text-center text-muted-foreground py-4">
                    No direct properties found
                  </div>
                ) : (
                  renderDirectProperties()
                )}
              </>
            )}

            {hoveredItem === "Grouped Properties" && (
              <>
                {groupedProperties.length === 0 ? (
                  <div className="text-center text-muted-foreground py-4">
                    No grouped properties found
                  </div>
                ) : (
                  renderGroupedProperties()
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}