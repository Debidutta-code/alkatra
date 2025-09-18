"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Badge } from "../../../../components/ui/badge";
import { Triangle } from "react-loader-spinner";
import {
  Search,
  Eye,
  Building2,
  Users,
  Grid3X3,
  List
} from "lucide-react";
import Link from "next/link";

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

const Page = () => {
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const [loading, setLoading] = useState(false);
  const [groupedProperties, setGroupedProperties] = useState<GroupedHotels[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filteredProperties, setFilteredProperties] = useState<GroupedHotels[]>([]);
  const [loadingHotelId, setLoadingHotelId] = useState<string | null>(null);
  const handleViewDetails = (hotelId: string) => {
    setLoadingHotelId(hotelId);
    // The navigation will happen via Link, but we set loading state for UI feedback
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
        const groupedData = response?.data?.data?.grouped || [];
        setGroupedProperties(groupedData);
        setFilteredProperties(groupedData);
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
      const filtered = groupedProperties.map(group => ({
        ...group,
        hotels: group.hotels.filter(hotel =>
          hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          group.groupManagerName.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(group => group.hotels.length > 0);
      setFilteredProperties(filtered);
    } else {
      setFilteredProperties(groupedProperties);
    }
  }, [searchTerm, groupedProperties]);

  const totalHotels = groupedProperties.reduce((acc, group) => acc + group.hotels.length, 0);
  const totalGroups = groupedProperties.length;

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
        Loading your properties...
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
        {searchTerm ? `No properties match your search for "${searchTerm}"` : "No grouped hotels found in your portfolio."}
      </p>
    </div>
  );

  const HotelCard = ({ hotel, groupName }: { hotel: Hotel; groupName: string }) => (
    <div className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-tripswift-blue dark:hover:border-tripswift-blue hover:ring-1 hover:ring-tripswift-blue/20 transform hover:-translate-y-1">
      <div className="relative overflow-hidden">
        <img
          src={hotel.image[0]}
          alt={`No image available for ${hotel.name}`}
          className="w-full h-48 object-cover transition-transform duration-300 "
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?auto=compress&cs=tinysrgb&w=400&h=240&fit=crop`;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {hotel.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {groupName}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs">
              Active
            </Badge>
          </div>

          <Link href={`/app/property/propertyDetails?propertyId=${hotel._id}`}>
            <Button
              size="sm"
              onClick={() => handleViewDetails(hotel._id)}
              disabled={loadingHotelId === hotel._id}
              className="bg-tripswift-blue hover:bg-blue-700 text-white shadow-sm transition-all duration-200 hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-1"
            >
              {loadingHotelId === hotel._id ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                </>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );

  return (

    <div className="min-h-screen bg-gradient-to-br md:mx-8 from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 top-0 z-10 backdrop-blur-sm bg-white/95 dark:bg-gray-900/95">
        <div className="max-w-7xl mx-auto  px-4 sm:px-6 md:px-8  py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-2xl  font-bold text-gray-900 dark:text-white mb-2">
                Property Portfolio
              </h1>
              <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <Building2 className="w-4 h-4 mr-1" />
                  <span>{totalHotels} Properties</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  <span>{totalGroups} Groups</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search Input */}
              <div className="relative flex-grow min-w-[200px] sm:min-w-[250px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search properties or groups..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* View Mode Toggle */}
              <div className="flex gap-2 items-center dark:bg-gray-800 rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="px-3"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="px-3"
                >
                  <List className="w-4 h-4" />
                </Button>
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
          <div className="space-y-8 w-full">
            {filteredProperties.map((group) => (
              <div key={group.id} className="space-y-6">
                <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                          {group.groupManagerName}
                        </CardTitle>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                          {group.hotels.length} {group.hotels.length === 1 ? 'property' : 'properties'} in this group
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
                        {group.hotels.length}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className={`grid gap-2 md:gap-6 ${viewMode === 'grid'
                      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3'
                      : 'grid-cols-1 md:grid-cols-2'
                      }`}>
                      {group.hotels.map((hotel) => (
                        <HotelCard
                          key={hotel._id}
                          hotel={hotel}
                          groupName={group.groupManagerName}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
};

export default Page;