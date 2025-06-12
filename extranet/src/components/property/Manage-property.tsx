'use client'
import React, { useState, useEffect } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import Link from "next/link";
import { ChevronRight, Plus, Building2, MapPin } from "lucide-react";
import PropertySlide from "../../components/property/property-slide";
import axios from "axios";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { RootState } from "@src/redux/store";

const Home: React.FC = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [draftProperties, setDraftProperties] = useState<any[]>([]);

  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  useEffect(() => {
    const fetchProperties = async (accessToken: string) => {
      try {
        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/property/me`, {
          headers: {
            Authorization: "Bearer " + accessToken,
          },
        });
        const { properties, draftProperties } = data.data;
        setProperties(properties);
        setDraftProperties(draftProperties);
      } catch (error) {
        console.error("Error fetching properties:", error);
        toast.error("Something went wrong");
      }
    };

    if (!accessToken) {
      console.log("Access token not found in cookies");
    } else {
      fetchProperties(accessToken);
    }
  }, [accessToken]);

  return (
    <main className="min-h-screen bg-tripswift-off-white dark:bg-tripswift-black">
      {/* Header Section */}
      
      <div className="bg-gradient-to-r from-tripswift-blue to-[#054B8F] px-4 sm:px-6 md:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="text-tripswift-off-white mb-4 sm:mb-0">
              <div className="flex items-center gap-3 mb-2">
                <Building2 size={32} className="text-tripswift-off-white" />
                <h1 className="text-2xl sm:text-3xl font-tripswift-bold">My Properties</h1>
              </div>
              <p className="text-base sm:text-lg font-tripswift-regular opacity-90">
                Manage and monitor your property portfolio
              </p>
            </div>
            {/* <Link href="/app/property/add">
              <button className="btn-tripswift-secondary flex items-center gap-2 bg-white dark:bg-gray-800 text-tripswift-blue dark:text-blue-300 shadow-lg hover:shadow-xl dark:hover:bg-gray-700 transition-all duration-300 px-4 py-2 rounded-md">
                <Plus size={20} />
                Add Property
              </button>
            </Link> */}
          </div>
        </div>
      </div>

      {/* Properties Section */}
      <div className="px-4 sm:px-6 md:px-8 mt-4">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-white dark:bg-gray-800 shadow-lg border-0 rounded-xl">
            <CardHeader className="border-b border-gray-100 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-900/50 rounded-xl">
              <div className="flex flex-col sm:flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg sm:text-xl font-tripswift-semibold text-tripswift-black dark:text-gray-200 flex items-center gap-2">
                    <Building2 size={24} className="text-tripswift-blue" />
                    Properties Overview
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    View and manage your property listings
                  </CardDescription>
                </div>
                <Link href="/app/property">
                  <button className="btn-tripswift-primary flex items-center gap-2 bg-tripswift-blue dark:bg-tripswift-blue/80 text-white dark:text-gray-100 shadow-md hover:shadow-lg dark:hover:bg-tripswift-blue transition-all duration-300 px-4 py-2 rounded-md mt-4 sm:mt-0">
                    View All Properties
                    <ChevronRight size={18} />
                  </button>
                </Link>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {/* Draft Properties Section */}
              {draftProperties?.length > 0 && (
                <div className="p-6 border-b border-gray-100 dark:border-gray-600">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-tripswift-blue rounded-full"></div>
                    <h3 className="text-base sm:text-lg font-tripswift-semibold text-tripswift-black dark:text-gray-200">Properties</h3>
                    <span className="bg-blue-100 dark:bg-blue-900 text-tripswift-blue dark:text-blue-300 px-2 py-1 rounded-full text-xs font-tripswift-medium">
                      {draftProperties?.length}
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <div className="flex gap-4 min-w-max">
                      <PropertySlide properties={draftProperties} />
                    </div>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {properties?.length === 0 && draftProperties?.length === 0 && (
                <div className="p-12 text-center">
                  <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building2 size={32} className="text-gray-400 dark:text-gray-300" />
                  </div>
                  <h3 className="text-xl font-tripswift-semibold text-gray-800 dark:text-gray-200 mb-2">
                    No Properties Yet
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    Start building your property portfolio by adding your first property listing.
                  </p>
                  <Link href="/app/property/create">
                    <button className="btn-tripswift-primary flex items-center gap-2 mx-auto bg-tripswift-blue dark:bg-tripswift-blue/80 text-white dark:text-gray-100 shadow-lg hover:shadow-xl dark:hover:bg-tripswift-blue transition-all duration-300 px-4 py-2 rounded-md">
                      <Plus size={20} />
                      Add Your First Property
                    </button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default Home;