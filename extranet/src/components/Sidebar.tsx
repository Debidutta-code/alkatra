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
  return (
    <>
    </>
  )
}