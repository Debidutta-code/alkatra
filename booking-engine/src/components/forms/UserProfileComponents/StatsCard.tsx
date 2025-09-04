import React from 'react';
import Card from './Card';

interface StatsCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  description: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ icon: Icon, title, value, description }) => (
  <Card className="p-4 sm:p-6 text-center" hover>
    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[var(--color-primary-blue)]/10 rounded-full flex items-center justify-center mx-auto mb-3">
      <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-[var(--color-primary-blue)]" />
    </div>
    <h3 className="text-xl sm:text-2xl font-bold text-[var(--color-secondary-black)] mb-1">{value}</h3>
    <p className="text-xs sm:text-sm font-medium text-[var(--color-secondary-black)]/60 mb-1">{title}</p>
    <p className="text-xs text-[var(--color-secondary-black)]/50">{description}</p>
  </Card>
);

export default StatsCard;