import React, { useState, useEffect, useCallback } from 'react';
import { FilterBar } from '../components/analytics/FilterBar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend } from 'recharts';
import { WifiOff, DollarSign, Home, BookOpen, AlertCircle, RefreshCw, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useSelector } from "react-redux";
import { RootState } from "@src/redux/store";
import axios from "axios";
import toast from "react-hot-toast";
import { format } from 'date-fns';

interface AnalyticsData {
  overview: {
    totalReservations: number;
    totalRevenue: number;
    averageReservationValue: number;
    confirmedReservations: number;
    pendingReservations: number;
    cancelledReservations: number;
    totalRooms: number;
    averageRoomsPerReservation: number;
  };
  reservationsByStatus: Array<{
    status: string;
    count: number;
    totalRevenue: number;
    totalRooms: number;
  }>;
  monthlyTrends: Array<{
    _id: { year: number; month: number };
    totalReservations: number;
    totalRevenue: number;
    averageReservationValue: number;
    totalRooms: number;
  }>;
  topHotels: Array<{
    hotelName: string;
    totalReservations: number;
    totalRevenue: number;
    averageReservationValue: number;
    totalRooms: number;
    hotelCode: string;
  }>;
  customerAnalytics: {
    totalCustomers: number;
    averageReservationsPerCustomer: number;
    averageSpentPerCustomer: number;
    averageReservationValue: number;
    repeatCustomers: number;
    averageRoomsPerCustomer: number;
  };
  revenueByPaymentMethod: Array<{
    paymentMethod: string;
    _id: string | null;
    totalReservations: number;
    totalRevenue: number;
    averageReservationValue: number;
    totalRooms: number;
    name?: string;
    amount?: number;
  }>;
  cancellationAnalytics: {
    totalReservations: number;
    totalCancellations: number;
    cancelledRevenueLoss: number;
    cancellationRate: number;
  };
  occupancyAnalytics: Array<{
    hotelName: string;
    totalReservations: number;
    totalRevenue: number;
    totalRooms: number;
    averageStayDuration: number;
    hotelCode: string;
  }>;
}

interface ApiResponse {
  success: boolean;
  data?: AnalyticsData;
  message?: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ComponentType<any>;
  trend?: 'up' | 'down' | 'neutral';
  iconBgColor: string;
  iconColor: string;
  subtitle?: string;
  isLoading?: boolean;
}

interface ChartCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  className?: string;
  isLoading?: boolean;
}

const Analytics = () => {
  const userRole = useSelector((state: RootState) => state.auth.user?.role);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const [timeRange, setTimeRange] = useState<string>('90d');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  const [selectedHotel, setSelectedHotel] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      if (!accessToken) {
        return;
      }

      setIsLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (dateRange.startDate) queryParams.append('startDate', dateRange.startDate);
      if (dateRange.endDate) queryParams.append('endDate', dateRange.endDate);
      if (selectedHotel && (userRole === 'superAdmin' || userRole === 'groupManager')) queryParams.append('hotelName', selectedHotel);
      if (selectedYear) queryParams.append('year', selectedYear);

      const response = await axios.get<ApiResponse>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/analytics/getAnalytics?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success && response.data.data) {
        setAnalyticsData({
          ...response.data.data,
          monthlyTrends: response.data.data.monthlyTrends.map((item) => ({
            ...item,
            month: format(new Date(item._id.year, item._id.month - 1), 'MMM yyyy'),
            reservations: item.totalReservations,
            revenue: item.totalRevenue,
          })),
          occupancyAnalytics: response.data.data.occupancyAnalytics.map((item) => ({
            ...item,
            hotelName: item.hotelName,
            averageRevenuePerReservation: item.totalReservations > 0 ? item.totalRevenue / item.totalReservations : 0,
            roomNightsBooked: item.totalRooms,
          })),
          revenueByPaymentMethod: response.data.data.revenueByPaymentMethod.map((item) => ({
            ...item,
            name: item._id ?
              item._id.charAt(0).toUpperCase() + item._id.slice(1).toLowerCase() :
              'Other Methods',
            amount: item.totalRevenue,
          })),
        });
        setLastUpdated(new Date());
      } else {
        throw new Error(response.data.message || 'Failed to fetch analytics data');
      }
    } catch (err) {
      console.error('Analytics fetch error:', err);
      if (accessToken) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics data');
        toast.error('Failed to load analytics data');
      }
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, selectedHotel, selectedYear, accessToken, userRole]);

  const formatNumber = (num: number | undefined): string => {
    if (num === undefined || num === null) return '0';
    return num.toLocaleString();
  };

  const formatCurrency = (num: number | undefined): string => {
    if (num === undefined || num === null) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatPercentage = (num: number | undefined): string => {
    if (num === undefined || num === null) return '0%';
    return `${num.toFixed(1)}%`;
  };

  const handleRefresh = useCallback(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  const LoadingSkeleton = ({ className = '' }: { className?: string }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );

  const StatCard: React.FC<StatCardProps> = ({
    title, value, change, icon: Icon, trend = 'neutral', iconBgColor, iconColor, subtitle, isLoading = false
  }) => (
    <div className="relative group bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          {isLoading ? (
            <LoadingSkeleton className="h-8 w-20 mb-2" />
          ) : (
            <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
          )}
          {change && (
            <div className={`flex items-center gap-1 text-sm ${trend === 'up' ? 'text-green-600' :
              trend === 'down' ? 'text-red-600' : 'text-gray-500'
              }`}>
              {!isLoading && (
                <>
                  {trend === 'up' ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : trend === 'down' ? (
                    <ArrowDownRight className="w-4 h-4" />
                  ) : null}
                  <span>{change}</span>
                </>
              )}
              {isLoading && <LoadingSkeleton className="h-4 w-16" />}
            </div>
          )}
        </div>
        <div className={`p-2 rounded-lg ${iconBgColor}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
      {subtitle && (
        <p className="text-xs text-gray-400 mt-2">{subtitle}</p>
      )}
    </div>
  );

  const ChartCard: React.FC<ChartCardProps> = ({
    title, subtitle, children, className = '', isLoading = false
  }) => (
    <div className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        <button className="p-1 rounded-lg hover:bg-gray-50 text-gray-500">
          {/* <MoreVertical className="w-4 h-4" /> */}
        </button>
      </div>
      {isLoading ? (
        <LoadingSkeleton className="h-64 w-full" />
      ) : (
        children
      )}
    </div>
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'cancelled':
        return '#ef4444';
      case 'modified':
        return '#8b5cf6';
      default:
        return '#6b7280';
    }
  };

  const getPaymentMethodColor = (index: number) => {
    const colors = ['#076DB3', '#10b981', '#f59e0b', '#8b5cf6'];
    return colors[index % colors.length];
  };

  if (error && !analyticsData) {
    return (
      <div className="min-h-screen md:mx-8 bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load Analytics</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-tripswift-blue hover:bg-tripswift-dark-blue text-white rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
            {!isOnline && (
              <div className="flex items-center gap-2 text-red-600">
                <WifiOff className="w-4 h-4" />
                <span className="text-sm">No internet connection</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  const reservationStatusData = analyticsData?.reservationsByStatus || [];
  const monthlyTrendsData = analyticsData?.monthlyTrends || [];
  const occupancyData = analyticsData?.occupancyAnalytics || [];
  const paymentMethodData = analyticsData?.revenueByPaymentMethod || [];
  const topHotelsData = analyticsData?.topHotels || [];
  const isSuperAdmin = userRole === 'superAdmin';
  const isGroupManager = userRole === 'groupManager';

  return (
    <div className="md:mx-8 min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {isSuperAdmin ? 'Global Analytics' :
                  isGroupManager ? 'Group Analytics' :
                    'Property Analytics'}
              </h1>
              <p className="text-sm text-gray-500">
                Last updated: {format(lastUpdated, 'MMM d, yyyy h:mm a')}
                {!isOnline && (
                  <span className="ml-2 text-red-500 flex items-center gap-1">
                    <WifiOff className="w-3 h-3" />
                    <span>Offline</span>
                  </span>
                )}
              </p>
            </div>
            <FilterBar
              timeRange={timeRange}
              setTimeRange={setTimeRange}
              dateRange={dateRange}
              setDateRange={setDateRange}
              selectedHotel={selectedHotel}
              setSelectedHotel={setSelectedHotel}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
            />
          </div>
        </div>

        <div className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Reservations"
              value={formatNumber(analyticsData?.overview?.totalReservations)}
              icon={BookOpen}
              trend="up"
              iconBgColor="bg-blue-100"
              iconColor="text-tripswift-blue"
              subtitle={`${formatNumber(analyticsData?.overview?.confirmedReservations)} confirmed`}
              isLoading={isLoading}
            />
            <StatCard
              title="Total Revenue"
              value={formatCurrency(analyticsData?.overview?.totalRevenue)}
              icon={DollarSign}
              trend="up"
              iconBgColor="bg-green-100"
              iconColor="text-green-500"
              subtitle={`${formatCurrency(analyticsData?.overview?.averageReservationValue)} avg`}
              isLoading={isLoading}
            />
            <StatCard
              title="Cancellation Rate"
              value={formatPercentage(analyticsData?.cancellationAnalytics?.cancellationRate)}
              icon={AlertCircle}
              trend="down"
              iconBgColor="bg-red-100"
              iconColor="text-red-500"
              subtitle={`${formatNumber(analyticsData?.cancellationAnalytics?.totalCancellations)} cancelled`}
              isLoading={isLoading}
            />
            <StatCard
              title="Avg. Rooms/Booking"
              value={Math.round(analyticsData?.overview?.averageRoomsPerReservation || 0)}
              icon={Home}
              trend="neutral"
              iconBgColor="bg-purple-100"
              iconColor="text-purple-500"
              subtitle={`${formatNumber(analyticsData?.overview?.totalRooms)} total rooms`}
              isLoading={isLoading}
            />
          </div>
          <div className="mt-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Hotel Occupancy Summary</h3>
                <p className="text-sm text-gray-500">Detailed breakdown by property</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <th className="px-6 py-3 text-left">Hotel</th>
                      <th className="px-6 py-3 text-right">Reservations</th>
                      <th className="px-6 py-3 text-right">Revenue</th>
                      <th className="px-6 py-3 text-right">Rooms</th>
                      <th className="px-6 py-3 text-right">Avg Stay</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {occupancyData.map((hotel, index) => (
                      <tr
                        key={index}
                        className="transition-colors hover:bg-gray-50/50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                              <Home className="h-5 w-5 text-blue-500" />
                            </div>
                            <div className="ml-4">
                              <div className="font-medium text-gray-900">{hotel.hotelName}</div>
                              <div className="text-xs text-gray-500">{hotel.hotelCode}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-gray-900">
                          {formatNumber(hotel.totalReservations)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="font-medium text-gray-900">{formatCurrency(hotel.totalRevenue)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="font-medium text-gray-900">{formatNumber(hotel.totalRooms)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="font-medium text-gray-900">{hotel.averageStayDuration.toFixed(1)} days</div>
                          <div className="text-xs text-gray-500">
                            {Math.floor(hotel.averageStayDuration)}d {Math.round((hotel.averageStayDuration % 1) * 24)}h
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-500">
                Showing {occupancyData.length} properties • Updated {format(lastUpdated, 'MMM d, h:mm a')}
              </div>
            </div>
          </div>
          {/* Main Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title="Reservations by Status"
              subtitle="Breakdown of reservation statuses"
              isLoading={isLoading}
            >
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reservationStatusData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                    <XAxis
                      dataKey="status"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        padding: '8px 12px',
                        fontSize: '14px',
                      }}
                      formatter={(value, name, props) => [
                        formatNumber(value as number),
                        props.payload.status,
                      ]}
                    />
                    <Bar
                      dataKey="count"
                      radius={[4, 4, 0, 0]}
                      animationDuration={1500}
                    >
                      {reservationStatusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={getStatusColor(entry.status)}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
            <ChartCard
              title="Monthly Trends"
              subtitle="Reservations and revenue over time"
              isLoading={isLoading}
            >
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrendsData}>
                    <defs>
                      <linearGradient id="colorReservations" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#076DB3" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#076DB3" stopOpacity={0.05} />
                      </linearGradient>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        padding: '8px 12px',
                        fontSize: '14px',
                      }}
                      formatter={(value, name) => [
                        name === 'reservations' ? formatNumber(value as number) : formatCurrency(value as number),
                        name === 'reservations' ? 'Reservations' : 'Revenue',
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="reservations"
                      stroke="#076DB3"
                      fillOpacity={1}
                      fill="url(#colorReservations)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#8b5cf6"
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-tripswift-blue" />
                  <span className="text-sm text-gray-600">Reservations</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span className="text-sm text-gray-600">Revenue</span>
                </div>
              </div>
            </ChartCard>
            {/* Top Hotels Chart */}
            {(isSuperAdmin || isGroupManager) && !selectedHotel && (
              <ChartCard
                title="Top Hotels by Revenue"
                subtitle="Performance of highest earning properties"
                isLoading={isLoading}
              >
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topHotelsData.slice(0, 5)}
                      layout="vertical"
                      margin={{ left: 100 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis
                        type="number"
                        tickFormatter={(value) => formatCurrency(value)}
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                      />
                      <YAxis
                        dataKey="hotelName"
                        type="category"
                        width={120}
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                      />
                      <Tooltip
                        formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          padding: '8px 12px',
                          fontSize: '14px',
                        }}
                      />
                      <Bar
                        dataKey="totalRevenue"
                        fill="#8884d8"
                        radius={[0, 4, 4, 0]}
                        animationDuration={1500}
                      >
                        {topHotelsData.slice(0, 5).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getPaymentMethodColor(index)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            )}
            {(isSuperAdmin || isGroupManager) && !selectedHotel && (
              <ChartCard
                title="Top Performing Properties"
                subtitle="Highest performing hotels by revenue and reservations"
                isLoading={isLoading}
              >
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full text-sm text-gray-700 border-collapse">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-3 text-left font-semibold border-b border-gray-200">Hotel Name</th>
                        <th className="px-6 py-3 text-center font-semibold border-b border-gray-200">Reservations</th>
                        <th className="px-6 py-3 text-center font-semibold border-b border-gray-200">Revenue</th>
                        <th className="px-6 py-3 text-center font-semibold border-b border-gray-200">Avg Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topHotelsData &&
                        topHotelsData.map((hotel, index) => (
                          <tr
                            key={index}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4 border-b border-gray-100">{hotel.hotelName}</td>
                            <td className="px-6 py-4 border-b border-gray-100 text-center">{formatNumber(hotel.totalReservations)}</td>
                            <td className="px-6 py-4 border-b border-gray-100 text-center">{formatCurrency(hotel.totalRevenue)}</td>
                            <td className="px-6 py-4 border-b border-gray-100 text-center">{formatCurrency(hotel.averageReservationValue)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </ChartCard>
            )}
            {/* Payment Method Chart */}
            <ChartCard
              title="Revenue by Payment Method"
              subtitle="Detailed breakdown of payment types"
              isLoading={isLoading}
            >
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentMethodData.map((item) => ({
                        name: item.paymentMethod === 'payAtHotel' ? 'Pay at Hotel' : item.paymentMethod === 'crypto' ? 'Crypto' : 'Other',
                        value: item.totalRevenue,
                        totalReservations: item.totalReservations,
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value }) => {
                        const totalRevenue = paymentMethodData.reduce((sum, item) => sum + item.totalRevenue, 0);
                        const percentage = (value / totalRevenue * 100).toFixed(1);
                        return `${name} ${percentage}%`;
                      }}
                    >
                      {paymentMethodData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={getPaymentMethodColor(index)}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name, props) => [
                        formatCurrency(Number(value)),
                        props.payload.name,
                        `Reservations: ${props.payload.totalReservations}`
                      ]}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        padding: '8px 12px',
                        fontSize: '14px',
                      }}
                    />
                    <Legend
                      formatter={(value, entry, index) => (
                        <span className="text-gray-700 text-sm">
                          {paymentMethodData[index]?.paymentMethod === 'payAtHotel' ? 'Pay at Hotel' : paymentMethodData[index]?.paymentMethod === 'crypto' ? 'Crypto' : 'Other'}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
            {/* Occupancy Analytics - Fixed Version */}
            <ChartCard
              title="Hotel Occupancy Details"
              subtitle="Performance metrics by property"
              isLoading={isLoading}
            >
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={occupancyData}
                    margin={{ top: 20, right: 60, left: 20, bottom: 100 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis
                      dataKey="hotelName"
                      angle={-45}
                      textAnchor="end"
                      height={90}
                      interval={0}
                      tick={{ fontSize: 10, fill: '#6b7280' }}
                      tickFormatter={(value) => {
                        // Truncate long hotel names
                        return value.length > 15 ? `${value.substring(0, 15)}...` : value;
                      }}
                    />
                    <YAxis
                      yAxisId="left"
                      orientation="left"
                      tickFormatter={(value) => `${value}`}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tickFormatter={(value) => formatCurrency(value)}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <Tooltip
                      formatter={(value, name, props) => {
                        const dataKey = props.dataKey;
                        const label = dataKey === 'totalReservations' ? 'Total Reservations' : 'Total Revenue';
                        const formattedValue = dataKey === 'totalReservations'
                          ? formatNumber(value as number)
                          : formatCurrency(Number(value));

                        return [formattedValue, label];
                      }}
                      labelFormatter={(label) => `Hotel: ${label}`}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        padding: '8px 12px',
                        fontSize: '14px',
                      }}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="rect"
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="totalReservations"
                      name="Total Reservations"
                      fill="#076DB3"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="totalRevenue"
                      name="Total Revenue"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
            {/* Customer Analytics */}
            <ChartCard
              title="Customer Metrics"
              subtitle="Key customer statistics"
              isLoading={isLoading}
            >
              <div className="grid grid-cols-2 gap-4 p-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Total Customers</p>
                  <p className="text-2xl font-bold">
                    {formatNumber(analyticsData?.customerAnalytics?.totalCustomers)}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Repeat Customers</p>
                  <p className="text-2xl font-bold">
                    {formatNumber(analyticsData?.customerAnalytics?.repeatCustomers)}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Avg. Reservations/Customer</p>
                  <p className="text-2xl font-bold">
                    {analyticsData?.customerAnalytics?.averageReservationsPerCustomer?.toFixed(1)}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Avg. Spend/Customer</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(analyticsData?.customerAnalytics?.averageSpentPerCustomer)}
                  </p>
                </div>
              </div>
            </ChartCard>
            {/* Cancellation Analysis */}
            <ChartCard
              title="Cancellation Analysis"
              subtitle="Impact of cancelled reservations"
              isLoading={isLoading}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-red-500">Total Cancellations</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatNumber(analyticsData?.cancellationAnalytics?.totalCancellations)}
                  </p>
                  <p className="text-sm text-red-500 mt-2">
                    {formatPercentage(analyticsData?.cancellationAnalytics?.cancellationRate)} rate
                  </p>
                </div>
                <div className="bg-amber-50 p-4 rounded-lg">
                  <p className="text-sm text-amber-500">Potential Revenue Loss</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {formatCurrency(analyticsData?.cancellationAnalytics?.cancelledRevenueLoss)}
                  </p>
                  <p className="text-sm text-amber-500 mt-2">
                    Based on average reservation value
                  </p>
                </div>
              </div>
            </ChartCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;