"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import axios from "axios";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Badge } from "../../../../components/ui/badge";
import {
  Eye,
  Building2,
  Grid3X3,
  List,
  Search,
} from "lucide-react";
import { Triangle } from "react-loader-spinner";
import Link from "next/link";

interface Hotel {
  _id: string;
  name: string;
  image: string[];
}

const Page = () => {
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const [loading, setLoading] = useState(false);
  const [directProperties, setDirectProperties] = useState<Hotel[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [filteredProperties, setFilteredProperties] = useState<Hotel[]>([]);
  const [loadingHotelId, setLoadingHotelId] = useState<string | null>(null);
  const handleViewDetails = (hotelId: string) => {
    setLoadingHotelId(hotelId);
  };
  const fetchAllProperties = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/property/getAdminProperties`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response?.data?.status === "success") {
        const directData = response?.data?.data?.direct || [];
        setDirectProperties(directData);
        setFilteredProperties(directData);
      }
    } catch (error: any) {
      console.log("Error fetching properties:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchAllProperties();
    }
  }, [accessToken]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = directProperties.filter(hotel =>
        hotel.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProperties(filtered);
    } else {
      setFilteredProperties(directProperties);
    }
  }, [searchTerm, directProperties]);

  const LoadingState = () => (
    <div className="flex flex-col items-center justify-center py-24">
      <Triangle
        visible={true}
        height={80}
        width={80}
        color="#076DB3"
        ariaLabel="triangle-loading"
      />
      <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">
        Loading your hotels...
      </p>
    </div>
  );
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
        <Building2 className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Properties Found</h3>
      <p className="text-gray-600 dark:text-gray-400 text-center max-w-sm">
        {searchTerm ? `No properties match your search for "${searchTerm}"` : "No direct hotels found in your portfolio."}
      </p>
    </div>
  );

  const HotelCard = ({ hotel }: { hotel: Hotel }) => (
    <div className="group relative bg-white dark:bg-gray-850 rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-tripswift-blue dark:hover:border-tripswift-blue ring-0 hover:ring-1 hover:ring-tripswift-blue/20 dark:hover:ring-tripswift-blue/30">

      {/* Image Section */}
      <div className="relative overflow-hidden aspect-video">
        <img
          src={hotel.image[0] || "/api/placeholder/400/240"}
          alt={hotel.name}
          className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&fit=crop";
          }}
        />
        {/* Overlay badge or status could go here */}
      </div>

      {/* Content */}
      <div className="p-5 sm:p-6">
        <h3 className="font-bold text-gray-900 dark:text-white text-lg sm:text-xl mb-2 line-clamp-1 group-hover:text-tripswift-blue dark:group-hover:text-tripswift-blue transition-colors duration-200">
          {hotel.name}
        </h3>

        <div className="flex items-center gap-2 mb-4">
          <Badge variant="secondary" className="text-xs px-2 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-none">
            Active
          </Badge>
          {/* Add rating, location, etc. here if needed */}
        </div>

        <div className="flex justify-end">
          <Link href={`/app/property/propertyDetails?propertyId=${hotel._id}`}>
            <Button
              size="sm"
              onClick={() => handleViewDetails(hotel._id)}
              disabled={loadingHotelId === hotel._id}
              className="bg-tripswift-blue hover:bg-tripswift-blue-600 text-white shadow-sm transition-all duration-200 hover:shadow-md flex items-center gap-2 px-4 py-2 rounded-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loadingHotelId === hotel._id ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-medium">Loading...</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  <span className="text-sm font-medium">View Details</span>
                </>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );

  const HotelListItem = ({ hotel }: { hotel: Hotel }) => (
    <div className="group bg-white dark:bg-gray-850 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-tripswift-blue dark:hover:border-tripswift-blue">
      <div className="flex flex-col sm:flex-row hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">

        {/* Image */}
        <div className="relative sm:w-48 sm:h-36 flex-shrink-0">
          <img
            src={hotel.image[0] || "/api/placeholder/400/240"}
            alt={hotel.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&fit=crop";
            }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg sm:text-xl mb-1 line-clamp-1 group-hover:text-tripswift-blue dark:group-hover:text-tripswift-blue transition-colors">
                {hotel.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs px-2 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-none">
                  Active
                </Badge>
              </div>
            </div>

            {/* Action Button */}
            <div className="sm:ml-4 flex-shrink-0 flex justify-end">
              <Link href={`/app/property/propertyDetails?propertyId=${hotel._id}`}>
                <Button
                  size="sm"
                  onClick={() => handleViewDetails(hotel._id)}
                  disabled={loadingHotelId === hotel._id}
                  className="bg-tripswift-blue hover:bg-tripswift-blue-600 text-white shadow-sm transition-all duration-200 hover:shadow flex items-center gap-2 px-4 py-2.5 rounded-lg min-w-28 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loadingHotelId === hotel._id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm font-medium">Loading...</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      <span className="text-sm font-medium">View</span>
                    </>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br md:mx-8 from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header Section */}
      <div className="bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700 top-0 z-10 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Title and Stats Section */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-3 h-3 bg-tripswift-blue rounded-full animate-pulse"></div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Direct Properties
                </h1>
              </div>
              <div className="flex items-center space-x-4 sm:space-x-6 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <Building2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span>{directProperties.length} Direct {directProperties.length === 1 ? 'Property' : 'Properties'}</span>
                </div>
              </div>
            </div>

            {/* Search and Controls Section */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              {/* Search Input */}
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-900 w-4 h-4" />
                <Input
                  placeholder="Search direct properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64 bg-white/70 dark:bg-gray-800/70 border-gray-200 dark:border-gray-700 focus:border-tripswift-blue focus:ring-tripswift-blue backdrop-blur-sm text-sm"
                />
              </div>

              {/* Controls Container */}
              <div className="flex items-center justify-between sm:justify-end space-x-3 sm:space-x-4">
                {/* View Mode Toggle */}
                <div className="flex items-center bg-gray-100/70 dark:bg-gray-800/70 rounded-lg p-1 backdrop-blur-sm">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="px-2 sm:px-3"
                    title="Grid View"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="px-2 sm:px-3"
                    title="List View"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <LoadingState />
        ) : filteredProperties.length > 0 ? (
          <div className="space-y-6">


            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProperties.map((hotel) => (
                  <HotelCard key={hotel._id} hotel={hotel} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProperties.map((hotel) => (
                  <HotelListItem key={hotel._id} hotel={hotel} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
};

export default Page;