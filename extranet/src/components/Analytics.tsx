import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Users, TrendingUp, Activity, DollarSign, Eye, UserCheck, Settings, Bell, Search, Filter, Download, RefreshCw, ArrowUpRight, ArrowDownRight, MoreVertical, Calendar, Zap, ChevronDown, Clock, PieChart as PieChartIcon, BarChart2, LineChart as LineChartIcon, Home, BookOpen } from 'lucide-react';

const Analytics = () => {
  const [userRole, setUserRole] = useState('superadmin');
  const [timeRange, setTimeRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data
  const userGrowthData = [
    { name: 'Jan', users: 1200, active: 980 },
    { name: 'Feb', users: 1900, active: 1580 },
    { name: 'Mar', users: 2800, active: 2380 },
    { name: 'Apr', users: 3908, active: 3200 },
    { name: 'May', users: 4800, active: 4100 },
    { name: 'Jun', users: 6200, active: 5300 }
  ];

  const revenueData = [
    { name: 'Week 1', revenue: 4000, profit: 2400 },
    { name: 'Week 2', revenue: 3000, profit: 1398 },
    { name: 'Week 3', revenue: 2000, profit: 9800 },
    { name: 'Week 4', revenue: 2780, profit: 3908 }
  ];

  const categoryData = [
    { name: 'Premium', value: 35, color: '#8b5cf6' },
    { name: 'Basic', value: 45, color: '#06b6d4' },
    { name: 'Trial', value: 20, color: '#f59e0b' },
  ];

  const activityData = [
    { time: '00:00', active: 120 },
    { time: '04:00', active: 80 },
    { time: '08:00', active: 350 },
    { time: '12:00', active: 450 },
    { time: '16:00', active: 380 },
    { time: '20:00', active: 280 }
  ];

  const bookingData = [
    { day: 'Mon', bookings: 120 },
    { day: 'Tue', bookings: 210 },
    { day: 'Wed', bookings: 180 },
    { day: 'Thu', bookings: 240 },
    { day: 'Fri', bookings: 320 },
    { day: 'Sat', bookings: 400 },
    { day: 'Sun', bookings: 380 }
  ];

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500);
  };

  const StatCard = ({ title, value, change, icon: Icon, trend, color, subtitle }: { title: string, value: string, change: any, icon: any, trend: any, color: any, subtitle?: string }) => (
    <div className="relative group bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white via-white to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
          <div className={`flex items-center gap-1 text-sm ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
            {trend === 'up' ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
            <span>{change}</span>
            <span className="text-gray-400 ml-1">vs last month</span>
          </div>
        </div>
        <div className={`p-3 rounded-lg ${color} shadow-xs`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      {subtitle && <p className="text-xs text-gray-400 mt-3">{subtitle}</p>}
    </div>
  );

  const ChartCard = ({ title, subtitle, children, className = '' }: { title: string, subtitle: string, children: React.ReactNode, className?: string }) => (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-500">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen md:mx-8 bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-gradient-to-br from-tripswift-blue to-tripswift-dark-blue rounded-lg flex items-center justify-center shadow-xs">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">Hotel Analytics</h1>
              </div>

              <div className="hidden md:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                {['overview', 'guests', 'revenue', 'bookings'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 text-sm rounded-md capitalize ${activeTab === tab ? 'bg-white shadow-sm text-tripswift-blue' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors">
                  <span>Last 7 days</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={handleRefresh}
                className={`p-2 rounded-lg hover:bg-gray-100 text-gray-500 ${isLoading ? 'animate-spin' : ''}`}
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <StatCard
            title="Total Guests"
            value="24,583"
            change="+7.5%"
            icon={Users}
            trend="up"
            color="bg-blue-500"
            subtitle="Active this month"
          />
          <StatCard
            title={userRole === 'superadmin' ? 'Revenue' : 'Occupancy'}
            value={userRole === 'superadmin' ? '$89,247' : '82.4%'}
            change={userRole === 'superadmin' ? '+6.1%' : '+8.7%'}
            icon={userRole === 'superadmin' ? DollarSign : TrendingUp}
            trend="up"
            color="bg-emerald-500"
            subtitle="Monthly target: 85%"
          />
          <StatCard
            title="Active Hotels"
            value="1,429"
            change="+5.8%"
            icon={Home}
            trend="up"
            color="bg-purple-500"
            subtitle="Peak: 1,650"
          />
          <StatCard
            title="Total Bookings"
            value="8,742"
            change="+8.2%"
            icon={BookOpen}
            trend="up"
            color="bg-amber-500"
            subtitle="Current month"
          />
        </div>

        {/* Main Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* User Growth Chart */}
          <ChartCard
            title="Guest Growth"
            subtitle="Monthly active guest progression"
            className="lg:col-span-2"
          >
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userGrowthData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis
                    dataKey="name"
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
                      fontSize: '14px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorUsers)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="active"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorActive)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-tripswift-blue rounded-full"></div>
                <span className="text-sm text-gray-600">Total Guests</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Active Guests</span>
              </div>
            </div>
          </ChartCard>

          {/* Guest Distribution Chart */}
          <ChartCard
            title="Guest Distribution"
            subtitle="Breakdown by membership type"
          >
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      padding: '8px 12px',
                      fontSize: '14px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {categoryData.map((item, index) => (
                <div key={index} className="flex flex-col items-center p-2">
                  <div className="w-3 h-3 rounded-full mb-1" style={{ backgroundColor: item.color }}></div>
                  <span className="text-xs font-medium text-gray-600">{item.name}</span>
                  <span className="text-sm font-bold text-gray-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Secondary Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Revenue/Performance Chart */}
          <ChartCard
            title={userRole === 'superadmin' ? 'Revenue' : 'Occupancy Rate'}
            subtitle="Weekly breakdown and trends"
            className="lg:col-span-2"
          >
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis
                    dataKey="name"
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
                      fontSize: '14px'
                    }}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="#8b5cf6"
                    radius={[4, 4, 0, 0]}
                    animationDuration={1500}
                  />
                  <Bar
                    dataKey="profit"
                    fill="#06b6d4"
                    radius={[4, 4, 0, 0]}
                    animationDuration={1500}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-violet-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Profit</span>
              </div>
            </div>
          </ChartCard>

          {/* Bookings Chart */}
          <ChartCard
            title="Daily Bookings"
            subtitle="Number of bookings per day"
          >
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bookingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis
                    dataKey="day"
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
                      fontSize: '14px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="bookings"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-tripswift-blue rounded-full"></div>
                <span className="text-sm text-gray-600">Bookings</span>
              </div>
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

export default Analytics;