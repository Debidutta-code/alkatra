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
    Filter,
    Grid3X3,
    List,
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

    const HotelCard: any = ({ hotel }: { hotel: Hotel }) => (
        <div className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-tripswift-blue dark:hover:border-tripswift-dark-blue">
            <div className="relative overflow-hidden">
                <img
                    src={hotel.image[0] || "/api/placeholder/400/240"}
                    alt={hotel.name}
                    className="w-full h-56 object-cover transition-transform duration-500"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=400&h=240&fit=crop`;
                    }}
                />
            </div>

            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h3 className="font-bold text-gray-900 dark:text-white text-xl mb-2 group-hover:text-tripswift-blue dark:group-hover:text-tripswift-dark-blue transition-colors line-clamp-1">
                            {hotel.name}
                        </h3>
                    </div>
                </div>



                <div className="flex items-center justify-between">


                    <Link href={`/app/property/${hotel._id}`}>
                        <Button
                            className="bg-blue-500 hover:bg-indigo-600 text-white shadow-sm transition-all duration-200 hover:shadow-lg "
                        >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );

    const HotelListItem = ({ hotel }: { hotel: Hotel }) => (
        <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-tripswift-blue dark:hover:border-tripswift-dark-blue">
            <div className="flex">
                <div className="relative w-48 h-32 overflow-hidden">
                    <img
                        src={hotel.image[0] || "/api/placeholder/400/240"}
                        alt={hotel.name}
                        className="w-full h-full object-cover transition-transform duration-300 "
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=400&h=240&fit=crop`;
                        }}
                    />
                </div>

                <div className="flex-1 p-6 flex items-center justify-between">
                    <div className="flex-1">
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2 group-hover:text-tripswift-dark-blue dark:group-hover:text-tripswift-blue transition-colors">
                            {hotel.name}
                        </h3>

                        <div className="flex items-center space-x-4">

                            <Badge variant="outline" className="text-xs">
                                Active
                            </Badge>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Link href={`/app/property/${hotel._id}`}>
                            <Button className="bg-tripswift-blue hover:bg-tripswift-blue-600 text-white">
                                <Eye className="w-4 h-4 mr-1" />
                                View
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br md:mx-8 from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Header Section */}
            <div className="bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700  top-0 z-10 backdrop-blur-lg">
                <div className="max-w-7xl mx-auto sm:px-6 md:px-8 px-4 py-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                        <div>
                            <div className="flex items-center space-x-3 mb-2">
                                <div className="w-3 h-3 bg-tripswift-blue rounded-full animate-pulse"></div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Direct Properties
                                </h1>
                            </div>
                            <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center">
                                    <Building2 className="w-4 h-4 mr-2" />
                                    <span>{directProperties.length} Direct {directProperties.length === 1 ? 'Property' : 'Properties'}</span>
                                </div>

                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                {/* <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" /> */}
                                <Input
                                    placeholder="Search direct properties..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 w-64 bg-white/70 dark:bg-gray-800/70 border-gray-200 dark:border-gray-700 focus:border-tripswift-blue focus:ring-tripswift-blue backdrop-blur-sm"
                                />
                            </div>

                            <Button variant="outline" size="sm" className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                                <Filter className="w-4 h-4 mr-1" />
                                Filter
                            </Button>

                            <div className="flex items-center bg-gray-100/70 dark:bg-gray-800/70 rounded-lg p-1 backdrop-blur-sm">
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