import React from 'react';
import { TrendingUp, Calendar, DollarSign, Target, Users, Award } from 'lucide-react';
import { OfferStats } from '../types/offer';

interface StatsCardsProps {
  stats: OfferStats;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const statItems = [
    {
      label: 'Total Offers',
      value: stats.totalOffers,
      icon: Calendar,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Active Offers',
      value: stats.activeOffers,
      icon: Target,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Total Bookings',
      value: stats.totalBookings.toLocaleString(),
      icon: Users,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      label: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      label: 'Avg Conversion',
      value: `${stats.avgConversionRate}%`,
      icon: TrendingUp,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      label: 'Top Performer',
      value: stats.topPerformingOffer,
      icon: Award,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      isText: true
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
      {statItems.map((item, index) => (
        <div key={index} className={`${item.bgColor} rounded-xl p-6 border border-gray-100`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{item.label}</p>
              <p className={`text-2xl font-bold ${item.textColor} ${item.isText ? 'text-sm' : ''}`}>
                {item.value}
              </p>
            </div>
            <div className={`${item.color} p-3 rounded-lg`}>
              <item.icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};