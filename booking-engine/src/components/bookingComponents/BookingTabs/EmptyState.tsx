// EmptyState.tsx
import React from 'react';
import { FaRegTimesCircle, FaTicketAlt } from 'react-icons/fa';
import { useRouter } from 'next/navigation'; 
import { BookingTabType } from './types';
import { useTranslation } from 'react-i18next';

interface EmptyStateProps {
  activeTab: BookingTabType;
}

const EmptyState: React.FC<EmptyStateProps> = ({ activeTab }) => {
  const { t } = useTranslation(); 
  const router = useRouter();

  // Determine which translation keys to use based on activeTab
  const headingKey = `BookingTabs.EmptyState.heading.${activeTab}`;
  const paragraphKey = `BookingTabs.EmptyState.paragraph.${activeTab}`;

  // Handle button click to navigate to home page
  const handleBookHotelClick = () => {
    router.push('/');
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-10 max-w-lg mx-auto text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 rounded-full mb-6">
        {activeTab === 'cancelled' ? (
          <FaRegTimesCircle className="h-10 w-10 text-tripswift-blue/70" />
        ) : (
          <FaTicketAlt className="h-10 w-10 text-tripswift-blue/70" />
        )}
      </div>
      <h3 className="text-xl font-tripswift-bold text-gray-800 mb-3">
        {t(headingKey)} {/* Translated heading */}
      </h3>
      <p className="text-gray-500 mb-6">
        {t(paragraphKey)} {/* Translated paragraph */}
      </p>
      <button 
        onClick={handleBookHotelClick}
        className="bg-tripswift-blue text-tripswift-off-white px-6 py-3 rounded-lg hover:bg-[#054B8F] transition-colors shadow-md hover:shadow-lg font-tripswift-medium"
      >
        {t('BookingTabs.EmptyState.bookHotelButton')} {/* Translated button text */}
      </button>
    </div>
  );
};

export default EmptyState;