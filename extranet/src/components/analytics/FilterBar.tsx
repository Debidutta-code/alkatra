// components/analytics/FilterBar.tsx
import React, { useState, useEffect } from 'react';
import { ChevronDown, Building } from 'lucide-react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '@src/redux/store';
import toast from 'react-hot-toast';
import { subDays, subYears, format } from 'date-fns';

interface FilterBarProps {
    timeRange: string;
    setTimeRange: (range: string) => void;
    dateRange: { startDate: string; endDate: string };
    setDateRange: (range: { startDate: string; endDate: string }) => void;
    selectedHotel: string | null;
    setSelectedHotel: (hotel: string | null) => void;
    selectedYear: string | null;
    setSelectedYear: (year: string | null) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
    timeRange,
    setTimeRange,
    dateRange,
    setDateRange,
    selectedHotel,
    setSelectedHotel,
    selectedYear,
    setSelectedYear,
}) => {
    const accessToken = useSelector((state: RootState) => state.auth.accessToken);
    const userRole = useSelector((state: RootState) => state.auth.user?.role);
    const [hotels, setHotels] = useState<string[]>([]);
    const [isLoadingHotels, setIsLoadingHotels] = useState(false);
    const calculateDateRange = (range: string) => {
        const today = new Date();
        const todayFormatted = format(today, 'yyyy-MM-dd');
        
        switch (range) {
            case '7d':
                return {
                    startDate: format(subDays(today, 7), 'yyyy-MM-dd'),
                    endDate: todayFormatted
                };
            case '30d':
                return {
                    startDate: format(subDays(today, 30), 'yyyy-MM-dd'),
                    endDate: todayFormatted
                };
            case '90d':
                return {
                    startDate: format(subDays(today, 90), 'yyyy-MM-dd'),
                    endDate: todayFormatted
                };
            case '1y':
                return {
                    startDate: format(subYears(today, 1), 'yyyy-MM-dd'),
                    endDate: todayFormatted
                };
            default:
                return { startDate: '', endDate: '' };
        }
    };

    useEffect(() => {
        if (timeRange !== 'custom') {
            const newDateRange = calculateDateRange(timeRange);
            setDateRange(newDateRange);
        }
    }, [timeRange]);

    useEffect(() => {
        if (userRole === 'superAdmin' || userRole === 'groupManager') {
            const fetchHotels = async () => {
                setIsLoadingHotels(true);
                try {
                    const response = await axios.get(
                        `${process.env.NEXT_PUBLIC_BACKEND_URL}/booking/hotelname`,
                        {
                            headers: {
                                Authorization: `Bearer ${accessToken}`,
                            },
                        }
                    );
                    setHotels(response.data.hotelNames || []);
                } catch (error) {
                    console.error('Error fetching hotels:', error);
                    toast.error('Failed to load hotel list');
                } finally {
                    setIsLoadingHotels(false);
                }
            };
            fetchHotels();
        }
    }, [accessToken, userRole]);

    // Generate years for dropdown (last 5 years)
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

    return (
        <div className="flex flex-col md:flex-row items-center gap-3 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            {/* Time Range Dropdown */}
            <div className="relative w-full md:w-auto">
                <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 pr-8 w-full md:w-40 transition-colors cursor-pointer"
                >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                    <option value="1y">Last year</option>
                    <option value="custom">Custom range</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500" />
            </div>

            {/* Custom Date Range Inputs */}
            {timeRange === 'custom' && (
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative">
                        <input
                            type="date"
                            value={dateRange.startDate}
                            max={dateRange.endDate || new Date().toISOString().split('T')[0]}
                            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full md:w-40"
                        />
                    </div>
                    <span className="text-gray-500">to</span>
                    <div className="relative">
                        <input
                            type="date"
                            value={dateRange.endDate}
                            min={dateRange.startDate}
                            max={new Date().toISOString().split('T')[0]}
                            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full md:w-40"
                        />
                    </div>
                </div>
            )}

            {/* Hotel Dropdown (superAdmin and groupManager only) */}
            {(userRole === 'superAdmin' || userRole === 'groupManager') && (
                <div className="relative w-full md:w-auto">
                    <select
                        value={selectedHotel || ''}
                        onChange={(e) => setSelectedHotel(e.target.value || null)}
                        disabled={isLoadingHotels}
                        className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 pr-8 w-full md:w-48 transition-colors cursor-pointer disabled:bg-gray-100"
                    >
                        <option value="">All Hotels</option>
                        {hotels.map((hotel) => (
                            <option key={hotel} value={hotel}>
                                {hotel}
                            </option>
                        ))}
                    </select>
                    <Building className="w-4 h-4 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500" />
                </div>
            )}

            {/* Year Dropdown */}
            {/* <div className="relative w-full md:w-auto">
                <select
                    value={selectedYear || ''}
                    onChange={(e) => setSelectedYear(e.target.value || null)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 pr-8 w-full md:w-32 transition-colors cursor-pointer"
                >
                    <option value="">All Years</option>
                    {years.map((year) => (
                        <option key={year} value={year}>
                            {year}
                        </option>
                    ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500" />
            </div> */}
        </div>
    );
};

export default FilterBar;