// Enhanced AppSidebar component with modern UI design
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
  Car,
  Hotel,
  Sparkles,
  ArrowRight,
  Search
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

interface DirectProperty extends Hotel { }

export default function AppSidebar({ role }: { role: string }) {
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
  const [searchTerm, setSearchTerm] = useState("");

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

  // Filter navigation items based on role
  const getNavigationItems = () => {
    interface NavigationItem {
      title: string;
      icon: any;
      hasSubmenu: boolean;
      submenuItems: DirectProperty[] | GroupedHotels[];
      gradient: string;
      bgColor: string;
      iconColor: string;
      type: 'direct' | 'grouped';
    }

    const baseItems: NavigationItem[] = [
      {
        title: "Single Properties",
        icon: Building2,
        hasSubmenu: true,
        submenuItems: directProperties,
        gradient: "from-blue-500 to-indigo-600",
        bgColor: "bg-blue-50 dark:bg-blue-950/20",
        iconColor: "text-blue-600 dark:text-blue-400",
        type: 'direct'
      }
    ];

    // Only add Grouped Properties if user is superAdmin
    if (role === "superAdmin") {
      baseItems.push({
        title: "Grouped Properties",
        icon: Hotel,
        hasSubmenu: true,
        submenuItems: groupedProperties,
        gradient: "from-emerald-500 to-teal-600",
        bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        type: 'grouped'
      });
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  const handleMouseEnter = (itemTitle: string) => {
    if (isMobile) return;

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

  const filterProperties = (properties: any[], term: string) => {
    if (!term) return properties;
    return properties.filter(property =>
      property.name.toLowerCase().includes(term.toLowerCase())
    );
  };

  const renderDirectProperties = () => {
    const filteredProperties = filterProperties(directProperties, searchTerm);

    return filteredProperties.map((property, index) => {
      const propertyUrl = `/app/property/${property._id}`;
      const isSubActive = pathname === propertyUrl;

      return (
        <Link
          key={property._id}
          href={propertyUrl}
          className="block"
          onClick={() => isMobile && toggleSidebar()}
        >
          <div className={cn(
            "group relative overflow-hidden rounded-lg p-3 transition-all duration-300 hover:scale-[1.02] hover:shadow-md",
            isSubActive
              ? "bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-200 dark:border-blue-800"
              : "hover:bg-blue-50/50 dark:hover:bg-blue-950/20"
          )}>
            <div className="flex items-center gap-3 relative z-10">
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300",
                isSubActive
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                  : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:scale-110"
              )}>
                <Building className="h-4 w-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-sm font-semibold truncate transition-colors",
                    isSubActive ? "text-blue-700 dark:text-blue-300" : "text-gray-900 dark:text-gray-100"
                  )}>
                    {property.name}
                  </span>
                  {isSubActive && <Sparkles className="h-3 w-3 text-blue-500 animate-pulse" />}
                </div>
                {/* <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                  Direct Property
                </span> */}
              </div>

              <ArrowRight className={cn(
                "h-4 w-4 transition-all duration-300",
                isSubActive
                  ? "text-blue-600 dark:text-blue-400 translate-x-0 opacity-100"
                  : "text-gray-400 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
              )} />
            </div>

            {/* Animated background gradient */}
            <div className={cn(
              "absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 transition-opacity duration-300",
              "group-hover:opacity-100"
            )} />
          </div>
        </Link>
      );
    });
  };

  const renderGroupedProperties = () => {
    return groupedProperties.map((group) => (
      <div key={group.id} className="mb-4">
        <div className="flex items-center gap-2 px-3 py-2 mb-2 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"></div>
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
            {group.groupManagerName}
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-emerald-200 to-transparent dark:from-emerald-800"></div>
        </div>

        <div className="space-y-1 pl-2">
          {group.hotels.filter(hotel =>
            !searchTerm || hotel.name.toLowerCase().includes(searchTerm.toLowerCase())
          ).map((hotel) => {
            const hotelUrl = `/app/property/${hotel._id}`;
            const isSubActive = pathname === hotelUrl;

            return (
              <Link
                key={hotel._id}
                href={hotelUrl}
                className="block"
                onClick={() => isMobile && toggleSidebar()}
              >
                <div className={cn(
                  "group relative overflow-hidden rounded-lg p-3 transition-all duration-300 hover:scale-[1.02] hover:shadow-md",
                  isSubActive
                    ? "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-200 dark:border-emerald-800"
                    : "hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20"
                )}>
                  <div className="flex items-center gap-3 relative z-10">
                    <div className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300",
                      isSubActive
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg"
                        : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 group-hover:scale-110"
                    )}>
                      <Hotel className="h-4 w-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-sm font-semibold truncate transition-colors",
                          isSubActive ? "text-emerald-700 dark:text-emerald-300" : "text-gray-900 dark:text-gray-100"
                        )}>
                          {hotel.name}
                        </span>
                        {isSubActive && <Sparkles className="h-3 w-3 text-emerald-500 animate-pulse" />}
                      </div>
                    </div>

                    <ArrowRight className={cn(
                      "h-4 w-4 transition-all duration-300",
                      isSubActive
                        ? "text-emerald-600 dark:text-emerald-400 translate-x-0 opacity-100"
                        : "text-gray-400 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                    )} />
                  </div>

                  {/* Animated background gradient */}
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 opacity-0 transition-opacity duration-300",
                    "group-hover:opacity-100"
                  )} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    ));
  };

  return (
    <div className="">
      <Sidebar className="border-r border-gray-200 dark:border-gray-800">
        <SidebarHeader className="border-b border-gray-200 dark:border-gray-800 h-[10vh] bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Image
                  src="/assets/TRIP-1.png"
                  alt="Logo"
                  width={120}
                  height={40}
                  className="rounded-lg shadow-sm"
                />
              </div>
            </div>

            {open && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent className="bg-gradient-to-b from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950/50">
          <SidebarGroup>
            
            <SidebarGroupContent className="px-2">
              <SidebarMenu className="space-y-2">
                {navigationItems.map((item) => {
                  const hasItems = item.submenuItems && item.submenuItems.length > 0;
                  const totalCount = item.title === "Single Properties"
                    ? directProperties.length
                    : groupedProperties.reduce((acc, group) => acc + group.hotels.length, 0);

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
                            "w-full group relative overflow-hidden rounded-xl p-3 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg",
                            hoveredItem === item.title
                              ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                              : `${item.bgColor} hover:shadow-md`
                          )}
                        >
                          <div className="flex items-center justify-between w-full cursor-pointer relative z-10">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300",
                                hoveredItem === item.title
                                  ? "bg-white/20 text-white"
                                  : `${item.iconColor} group-hover:scale-110`
                              )}>
                                <item.icon className="h-4 w-4" />
                              </div>
                              <div className="flex flex-col">
                                <span className={cn(
                                  "font-semibold text-sm transition-colors",
                                  hoveredItem === item.title ? "text-white" : "text-gray-900 dark:text-gray-100"
                                )}>
                                  {item.title}
                                </span>
                                {loading ? (
                                  <span className="text-xs opacity-70">Loading...</span>
                                ) : hasItems && (
                                  <span className="text-xs opacity-70">
                                    {totalCount} {totalCount === 1 ? 'property' : 'properties'}
                                  </span>
                                )}
                              </div>
                            </div>

                            {hasItems && (
                              <div className="flex items-center gap-2">
                                {!loading && totalCount > 0 && (
                                  <div className={cn(
                                    "px-2 py-1 rounded-full text-xs font-bold transition-colors",
                                    hoveredItem === item.title
                                      ? "bg-white/20 text-white"
                                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                                  )}>
                                    {totalCount}
                                  </div>
                                )}
                                {isMobile ? (
                                  <ChevronDown className={cn(
                                    "h-4 w-4 transition-all duration-300",
                                    hoveredItem === item.title && "rotate-180"
                                  )} />
                                ) : (
                                  <ChevronRight className={cn(
                                    "h-4 w-4 transition-all duration-300",
                                    hoveredItem === item.title && "translate-x-1"
                                  )} />
                                )}
                              </div>
                            )}
                          </div>

                          {/* Hover effect background */}
                          <div className={cn(
                            "absolute inset-0 bg-gradient-to-r opacity-0 transition-opacity duration-300",
                            `${item.gradient} group-hover:opacity-10`
                          )} />
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
            "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl z-50 rounded-r-2xl overflow-hidden backdrop-blur-sm",
            isMobile ? "w-full relative" : "fixed w-96"
          )}
          style={!isMobile ? {
            top: `${submenuPosition.top}px`,
            left: open ? "256px" : "64px",
            maxHeight: 'calc(100vh - 120px)',
          } : {}}
          onMouseEnter={() => !isMobile && setHoveredItem(hoveredItem)}
          onMouseLeave={() => !isMobile && setHoveredItem(null)}
        >
          {/* Header with search */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-900">
            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-3">
              {hoveredItem}
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-4 overflow-y-auto max-h-96 space-y-2">
            {hoveredItem === "Single Properties" && (
              <>
                {directProperties.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No direct properties found</p>
                  </div>
                ) : (
                  renderDirectProperties()
                )}
              </>
            )}
            {hoveredItem === "Grouped Properties" && (
              <>
                {groupedProperties.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    <Hotel className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No grouped properties found</p>
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