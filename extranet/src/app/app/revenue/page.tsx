"use client";
import { ChartData } from "chart.js";
import { TrendingUp, Home, DollarSign, Table, Eye, ChevronRight as Chevron } from "lucide-react";
import React, { useEffect, useState } from "react";
import { fetchOwnerRevenue } from "./api";
import Link from "next/link";

import { Pie } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from "chart.js";
import { useRouter } from 'next/navigation';
import { useSelector } from "react-redux";
import { RootState } from "@src/redux/store";

ChartJS.register(
    CategoryScale,
    LinearScale,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

export interface Room {
    _id: string;
    room_name: string;
    room_type: string;
}

interface LatestBooking {
    _id: string;
    booking_user_name: string;
    amount: number;
    booking_dates: string;
    status: string;
    checkInDate?: string;
    checkOutDate?: string;
    property?: { _id: string; property_name: string };
    room?: { _id: string; room_name: string; room_type: string };
}

interface RevenueDetail {
    _id: string;
    totalAmount: number;
    status: string[];
    property_name: string;
}

interface RevenueData {
    totalRevenue: number;
    latestBookings: LatestBooking[];
    revenueDetails: RevenueDetail[];
}

const RevenuePage: React.FC = () => {
    const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [topProperty, setTopProperty] = useState<{ name: string; revenue: number } | null>(null);
    const [topProperties, setTopProperties] = useState<{ name: string; revenue: number }[]>([]);
    const [filters, setFilters] = useState({
        startDate: "",
        endDate: "",
        guestName: "",
        roomId: ""
    });
    const router = useRouter();
    const [filterCriteria, setFilterCriteria] = useState({ property: "", minAmount: "", maxAmount: "" });
    const accessToken = useSelector((state: RootState) => state.auth.accessToken);

    useEffect(() => {
        const fetchData = async () => {
            const data = await fetchOwnerRevenue(filters, accessToken);
            if (data) {
                setRevenueData({
                    totalRevenue: data.totalRevenue,
                    latestBookings: data.latestBookings || [],
                    revenueDetails: data.revenueDetails || [],
                });
                calculateTopProperties(data.revenueDetails);
            }
            setIsLoading(false);
        };
        fetchData();
    }, [filters]);

    const filteredRevenueDetails = revenueData?.revenueDetails
        ? revenueData.revenueDetails.filter((property) => {
            const matchesProperty = filterCriteria.property
                ? property.property_name.toLowerCase().includes(filterCriteria.property.toLowerCase())
                : true;
            const matchesMinAmount = filterCriteria.minAmount ? property.totalAmount >= Number(filterCriteria.minAmount) : true;
            const matchesMaxAmount = filterCriteria.maxAmount ? property.totalAmount <= Number(filterCriteria.maxAmount) : true;
            return matchesProperty && matchesMinAmount && matchesMaxAmount;
        })
        : [];

    const calculateTopProperties = (revenueDetails: RevenueDetail[]) => {
        const sortedProperties = revenueDetails
            .map((item) => ({ name: item.property_name, revenue: item.totalAmount }))
            .sort((a, b) => b.revenue - a.revenue);
        setTopProperty(sortedProperties[0] || null);
        setTopProperties(sortedProperties.slice(0, 3));
    };

    const fetchPropertyData = (propertyId: string, propertyName: string) => {
        router.push(`/app/revenue/${propertyId}?propertyName=${encodeURIComponent(propertyName)}`);
    };

    const generatePieChartData = (): ChartData<"pie", number[], string> => {
        return {
            labels: revenueData?.revenueDetails.map((property) => property.property_name) || [],
            datasets: [
                {
                    label: "Revenue ($)",
                    data: revenueData?.revenueDetails.map((property) => property.totalAmount) || [],
                    backgroundColor: [
                        "rgba(59, 130, 246, 0.5)", // Blue
                        "rgba(34, 197, 94, 0.5)", // Green
                        "rgba(168, 85, 247, 0.5)", // Purple
                        "rgba(234, 179, 8, 0.5)", // Yellow
                        "rgba(239, 68, 68, 0.5)"  // Red
                    ],
                    borderColor: [
                        "rgba(59, 130, 246, 1)",
                        "rgba(34, 197, 94, 1)",
                        "rgba(168, 85, 247, 1)",
                        "rgba(234, 179, 8, 1)",
                        "rgba(239, 68, 68, 1)"
                    ],
                    borderWidth: 1,
                },
            ],
        };
    };

    const pieChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: "bottom" as const,
            },
            tooltip: {
                enabled: true,
            },
        },
    };

    const content = revenueData && !isLoading;

    return (
        <div className="min-h-screen bg-white dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] dark:from-gray-900 dark:via-gray-950 dark:to-black px-4 py-6">
            <div className="max-w-7xl mx-auto">
                {/* Breadcrumb */}
                <nav className="flex mb-2" aria-label="Breadcrumb">
                    <ol className="inline-flex items-center space-x-1 md:space-x-3">
                        <li className="inline-flex items-center">
                            <Link
                                href="/app"
                                className="inline-flex items-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                            >
                                <Home className="w-4 h-4 mr-2" />
                                Home
                            </Link>
                        </li>
                        <li>
                            <div className="flex items-center">
                                <Chevron className="w-4 h-4 text-gray-500" />
                                <span className="ml-1 text-sm font-medium text-blue-600 dark:text-blue-400 md:ml-2">
                                    Revenue
                                </span>
                            </div>
                        </li>
                    </ol>
                </nav>
                {/* Header Section */}
                <div className="text-center mb-6">
                    <h3 className="text-3xl font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 dark:from-blue-400 dark:via-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
                        Revenue Dashboard
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">Track and analyze your business revenue performance</p>
                </div>

                {content && (
                    <>
                        <div className="grid md:grid-cols-3 gap-4">
                            {/* Total Revenue */}
                            <div className="p-4 bg-gray-100/80 dark:bg-gray-900/40 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 hover:shadow-[0_0_15px_rgba(34,197,94,0.2)] hover:-translate-y-0.5">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-md font-medium text-gray-700 dark:text-gray-300">Total Revenue</h2>
                                    <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                                </div>
                                <p className="text-2xl font-semibold text-green-600 dark:text-green-400 mt-3">
                                    ${revenueData?.totalRevenue.toLocaleString() || "0"}
                                </p>
                            </div>

                            {/* Monthly Growth */}
                            <div className="p-4 bg-gray-100/80 dark:bg-gray-900/40 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] hover:-translate-y-0.5">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-md font-medium text-gray-700 dark:text-gray-300">Monthly Growth</h2>
                                    <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <p className="text-xl font-semibold text-blue-600 dark:text-blue-400 mt-3">+8.5% this month</p>
                            </div>

                            {/* Top Property Revenue */}
                            <div className="p-4 bg-gray-100/80 dark:bg-gray-900/40 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 hover:shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:-translate-y-0.5">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-md font-medium text-gray-700 dark:text-gray-300">Top Property</h2>
                                    <Home className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                {topProperty ? (
                                    <>
                                        <p className="text-lg font-semibold text-purple-600 dark:text-purple-400 mt-3">{topProperty.name}</p>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">Revenue: ${topProperty.revenue.toLocaleString()}</p>
                                    </>
                                ) : (
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-3">No top property available</p>
                                )}
                            </div>
                        </div>

                        {/* Revenue Breakdown Table */}
                        <div className="mt-6">
                            <h2 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                                <Table className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-2" />
                                Revenue Breakdown
                            </h2>

                            <div className="flex flex-wrap items-center gap-4 pb-4">
                                <input
                                    type="text"
                                    placeholder="Filter by Property"
                                    className="p-2 w-1/4 min-w-[150px] bg-white dark:bg-gray-800/40 text-gray-700 dark:text-gray-200 rounded-md border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    value={filterCriteria.property}
                                    onChange={(e) => setFilterCriteria({ ...filterCriteria, property: e.target.value })}
                                />
                                <input
                                    type="number"
                                    placeholder="Min Amount ($)"
                                    className="p-2 w-1/4 min-w-[150px] bg-white dark:bg-gray-800/40 text-gray-700 dark:text-gray-200 rounded-md border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                                    value={filterCriteria.minAmount}
                                    onChange={(e) => setFilterCriteria({ ...filterCriteria, minAmount: e.target.value })}
                                />
                                <input
                                    type="number"
                                    placeholder="Max Amount ($)"
                                    className="p-2 w-1/4 min-w-[150px] bg-white dark:bg-gray-800/40 text-gray-700 dark:text-gray-200 rounded-md border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                                    value={filterCriteria.maxAmount}
                                    onChange={(e) => setFilterCriteria({ ...filterCriteria, maxAmount: e.target.value })}
                                />
                            </div>

                            <div className="bg-gray-100/80 dark:bg-gray-900/40 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-700 shadow-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                                <div className="overflow-x-auto">
                                    {filteredRevenueDetails?.length > 0 ? (
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400">
                                                    <th className="px-6 py-4 text-left text-sm font-semibold">Property</th>
                                                    <th className="px-6 py-4 text-left text-sm font-semibold">Amount</th>
                                                    <th className="py-3 px-4 text-left text-sm font-semibold">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredRevenueDetails.map((property, index) => (
                                                    <tr key={property._id}
                                                        className="group border-b border-gray-200 dark:border-gray-800 last:border-0 hover:bg-gray-200/20 dark:hover:bg-gray-800/20 transition-colors duration-200">
                                                        <td className="px-6 py-4 text-gray-800 dark:text-gray-200">{property.property_name}</td>
                                                        <td className="px-6 py-4 text-green-600 dark:text-green-400 font-medium">${property.totalAmount.toLocaleString()}</td>
                                                        <td className="py-3 px-4">
                                                            <button
                                                                className="text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                                                                onClick={() => fetchPropertyData(property._id, property.property_name)}
                                                            >
                                                                <Eye className="w-4 h-4 mr-1" /> View More
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div className="py-8 text-center text-gray-600 dark:text-gray-400">
                                            <p className="text-lg font-medium">No revenue data available</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 mt-10">
                            {/* Pie Chart */}
                            <div className="p-6 bg-gray-100/80 dark:bg-gray-900/40 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg transition-all duration-300 hover:shadow-xl">
                                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Revenue Distribution</h3>
                                <div className="h-72">
                                    {revenueData.revenueDetails.length > 0 ? (
                                        <Pie data={generatePieChartData()} options={pieChartOptions} />
                                    ) : (
                                        <p className="text-gray-600 dark:text-gray-400 text-center">No revenue data available</p>
                                    )}
                                </div>
                            </div>

                            {/* Recent Transactions */}
                            <div className="p-6 bg-gray-100/80 dark:bg-gray-900/40 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg transition-all duration-300 hover:shadow-xl">
                                <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Recent Transactions</h2>
                                <div className="space-y-4">
                                    {revenueData.latestBookings.length > 0 ? (
                                        revenueData.latestBookings.slice(0, 3).map((transaction) => (
                                            <div
                                                key={transaction._id}
                                                className="flex justify-between items-center p-4 bg-white/40 dark:bg-gray-800/40 rounded-xl border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-300 hover:shadow-lg"
                                            >
                                                <div>
                                                    <p className="text-gray-800 dark:text-gray-300 font-medium">{transaction.booking_user_name}</p>
                                                    <p className="text-gray-500 dark:text-gray-500 text-xs">
                                                        {new Date(transaction.booking_dates).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <span className="text-green-600 dark:text-green-400 font-medium">${transaction.amount.toFixed(2)}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center text-gray-600 dark:text-gray-400">
                                            No recent transactions found.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Top-Performing Properties */}
                        <div className="mt-10">
                            <h2 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-4">Top-Performing Properties</h2>
                            <div className="grid md:grid-cols-3 gap-4">
                                {topProperties.length > 0 ? (
                                    topProperties.map((property, index) => (
                                        <div key={index} className="p-6 bg-gray-100/80 dark:bg-gray-900/40 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 hover:shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:-translate-y-0.5">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center">
                                                    <Home className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-2" />
                                                    <span className="text-gray-800 dark:text-gray-300">{property.name}</span>
                                                </div>
                                                <span className="text-green-600 dark:text-green-400 font-medium">${property.revenue.toLocaleString()}</span>
                                            </div>
                                            <div className="h-2 bg-gray-300 dark:bg-gray-700 rounded-full">
                                                <div className="h-full bg-green-600 dark:bg-green-400 rounded-full" style={{ width: `${(property.revenue / 100000) * 100}%` }}></div>
                                            </div>
                                            <div className="mt-1 text-gray-600 dark:text-gray-400 text-sm">
                                                {index + 1 === 1 ? "1st" : index + 1 === 2 ? "2nd" : "3rd"} Highest Property
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 bg-gray-100/80 dark:bg-gray-900/40 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-800 text-center text-gray-600 dark:text-gray-400 col-span-3">
                                        No top-performing properties found.
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default RevenuePage;