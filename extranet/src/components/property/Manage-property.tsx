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
    <main className="min-h-screen bg-tripswift-off-white">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-tripswift-blue to-[#054B8F] px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="text-tripswift-off-white">
              <div className="flex items-center gap-3 mb-2">
                <Building2 size={32} className="text-tripswift-off-white" />
                <h1 className="text-3xl font-tripswift-bold">My Properties</h1>
              </div>
              <p className="text-lg font-tripswift-regular opacity-90">
                Manage and monitor your property portfolio
              </p>
            </div>
            <Link href="/app/property/add">
              <button className="btn-tripswift-secondary flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300">
                <Plus size={20} />
                Add Property
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Properties Section */}
      <div className="px-8 mt-4">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-white shadow-lg border-0 rounded-xl">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-property-title text-tripswift-black flex items-center gap-2">
                    <Building2 size={24} className="text-tripswift-blue" />
                    Properties Overview
                  </CardTitle>
                  <CardDescription className="text-description mt-1">
                    View and manage your property listings
                  </CardDescription>
                </div>
                <Link href="/app/property">
                  <button className="btn-tripswift-primary flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-300">
                    View All Properties
                    <ChevronRight size={18} />
                  </button>
                </Link>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              {/* Draft Properties Section */}
              {draftProperties.length > 0 && (
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-tripswift-blue rounded-full"></div>
                    <h3 className="text-section-heading">Properties</h3>
                    <span className="bg-blue-100 text-tripswift-blue px-2 py-1 rounded-full text-xs font-tripswift-medium">
                      {draftProperties.length}
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
              {properties.length === 0 && draftProperties.length === 0 && (
                <div className="p-12 text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building2 size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-xl font-tripswift-semibold text-gray-800 mb-2">
                    No Properties Yet
                  </h3>
                  <p className="text-description mb-6 max-w-md mx-auto">
                    Start building your property portfolio by adding your first property listing.
                  </p>
                  <Link href="/app/property/create">
                    <button className="btn-tripswift-primary flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl transition-all duration-300">
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