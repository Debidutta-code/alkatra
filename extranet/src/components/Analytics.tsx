import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Users, TrendingUp, Activity, DollarSign, Eye, UserCheck, Settings, Bell, Search, Filter, Download, RefreshCw } from 'lucide-react';

const Analytics = () => {
  const [userRole, setUserRole] = useState('superadmin');
  const [timeRange, setTimeRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(false);

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
    { name: 'Premium Users', value: 35, color: '#8b5cf6' },
    { name: 'Basic Users', value: 45, color: '#06b6d4' },
    { name: 'Trial Users', value: 20, color: '#10b981' }
  ];

  const activityData = [
    { time: '00:00', active: 120 },
    { time: '04:00', active: 80 },
    { time: '08:00', active: 350 },
    { time: '12:00', active: 450 },
    { time: '16:00', active: 380 },
    { time: '20:00', active: 280 }
  ];

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500);
  };

  const StatCard = ({ title, value, change, icon: Icon, trend, color }:{title:string,value:string,change:any,icon:any,trend:any,color:any}) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <p className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'} flex items-center mt-2`}>
            <TrendingUp className={`w-4 h-4 mr-1 ${trend === 'down' ? 'rotate-180' : ''}`} />
            {change}
          </p>
        </div>
        <div className={`p-4 rounded-2xl ${color}`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
              
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                <Search className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                <Filter className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                <Download className="w-5 h-5" />
              </button>
              <button 
                onClick={handleRefresh}
                className={`p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors ${isLoading ? 'animate-spin' : ''}`}
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value="24,583"
            change="+12.5%"
            icon={Users}
            trend="up"
            color="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <StatCard
            title={userRole === 'superadmin' ? 'Revenue' : 'Group Performance'}
            value={userRole === 'superadmin' ? '$89,247' : '94.2%'}
            change={userRole === 'superadmin' ? '+23.1%' : '+8.7%'}
            icon={userRole === 'superadmin' ? DollarSign : TrendingUp}
            trend="up"
            color="bg-gradient-to-br from-green-500 to-green-600"
          />
          <StatCard
            title="Active Sessions"
            value="1,429"
            change="+5.8%"
            icon={Activity}
            trend="up"
            color="bg-gradient-to-br from-purple-500 to-purple-600"
          />
          <StatCard
            title="Conversion Rate"
            value="3.2%"
            change="+0.4%"
            icon={UserCheck}
            trend="up"
            color="bg-gradient-to-br from-orange-500 to-orange-600"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* User Growth Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">User Growth</h3>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Total Users</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Active Users</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={userGrowthData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: 'none', 
                    borderRadius: '12px', 
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                  }} 
                />
                <Area type="monotone" dataKey="users" stroke="#6366f1" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={3} />
                <Area type="monotone" dataKey="active" stroke="#10b981" fillOpacity={1} fill="url(#colorActive)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue/Performance Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {userRole === 'superadmin' ? 'Revenue Overview' : 'Group Performance'}
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: 'none', 
                    borderRadius: '12px', 
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                  }} 
                />
                <Bar dataKey="revenue" fill="url(#barGradient)" radius={8} />
                <Bar dataKey="profit" fill="url(#barGradient2)" radius={8} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                  <linearGradient id="barGradient2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#0891b2" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          

          {/* Activity Timeline */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Daily Activity</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: 'none', 
                    borderRadius: '12px', 
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="active" 
                  stroke="#f59e0b" 
                  strokeWidth={3}
                  dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#f59e0b', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;