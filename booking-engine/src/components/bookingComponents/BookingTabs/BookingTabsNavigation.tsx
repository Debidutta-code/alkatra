// BookingTabsNavigation.tsx
import React from 'react';
import { FaTicketAlt, FaRegCalendarCheck, FaHistory, FaRegTimesCircle } from 'react-icons/fa';
import { BookingTabType } from './types';
import { useTranslation } from 'react-i18next'; // Import useTranslation

interface BookingTabsNavigationProps {
  activeTab: BookingTabType;
  setActiveTab: (tab: BookingTabType) => void;
}

const BookingTabsNavigation: React.FC<BookingTabsNavigationProps> = ({ activeTab, setActiveTab }) => {
  const { t } = useTranslation(); // Initialize useTranslation

  return (
    <div className="bg-white rounded-xl shadow-md mb-8 overflow-hidden">
      <div className="flex flex-wrap md:flex-nowrap">
        <button
          className={`flex-1 py-4 px-4 text-center font-tripswift-medium text-sm md:text-base transition-colors border-b-2 ${
            activeTab === 'all'
              ? 'border-tripswift-blue text-tripswift-blue'
              : 'border-transparent text-gray-500 hover:text-tripswift-blue/70'
          }`}
          onClick={() => setActiveTab('all')}
        >
          <span className="flex items-center justify-center">
            <FaTicketAlt className="mr-2 h-4 w-4" />
            {t('BookingTabs.BookingTabsNavigation.allBookings')} {/* Translated text */}
          </span>
        </button>
        <button
          className={`flex-1 py-4 px-4 text-center font-tripswift-medium text-sm md:text-base transition-colors border-b-2 ${
            activeTab === 'upcoming'
              ? 'border-tripswift-blue text-tripswift-blue'
              : 'border-transparent text-gray-500 hover:text-tripswift-blue/70'
          }`}
          onClick={() => setActiveTab('upcoming')}
        >
          <span className="flex items-center justify-center">
            <FaRegCalendarCheck className="mr-2 h-4 w-4" />
            {t('BookingTabs.BookingTabsNavigation.upcoming')} {/* Translated text */}
          </span>
        </button>
        <button
          className={`flex-1 py-4 px-4 text-center font-tripswift-medium text-sm md:text-base transition-colors border-b-2 ${
            activeTab === 'completed'
              ? 'border-tripswift-blue text-tripswift-blue'
              : 'border-transparent text-gray-500 hover:text-tripswift-blue/70'
          }`}
          onClick={() => setActiveTab('completed')}
        >
          <span className="flex items-center justify-center">
            <FaHistory className="mr-2 h-4 w-4" />
            {t('BookingTabs.BookingTabsNavigation.completed')} {/* Translated text */}
          </span>
        </button>
        <button
          className={`flex-1 py-4 px-4 text-center font-tripswift-medium text-sm md:text-base transition-colors border-b-2 ${
            activeTab === 'cancelled'
              ? 'border-tripswift-blue text-tripswift-blue'
              : 'border-transparent text-gray-500 hover:text-tripswift-blue/70'
          }`}
          onClick={() => setActiveTab('cancelled')}
        >
          <span className="flex items-center justify-center">
            <FaRegTimesCircle className="mr-2 h-4 w-4" />
            {t('BookingTabs.BookingTabsNavigation.cancelled')} {/* Translated text */}
          </span>
        </button>
      </div>
    </div>
  );
};

export default BookingTabsNavigation;