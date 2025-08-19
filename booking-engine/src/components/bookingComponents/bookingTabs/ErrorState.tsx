// ErrorState.tsx
'use client';

import React from 'react';
import { FaRegTimesCircle } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';

interface ErrorStateProps {
  errorMessage: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({ errorMessage }) => {
  const { t } = useTranslation();
  const router = useRouter();

  const handleButtonClick = () => {
    router.push('/');
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-10 max-w-md mx-auto text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
        <FaRegTimesCircle className="h-8 w-8 text-red-500" />
      </div>
      <h3 className="text-xl font-tripswift-bold text-gray-800 mb-3">{errorMessage}</h3>
      <p className="text-gray-500 mb-6">
        {t('BookingTabs.ErrorState.noBookingsFound')}
      </p>
      <button
        onClick={handleButtonClick}
        className="bg-tripswift-blue text-tripswift-off-white px-6 py-3 rounded-lg hover:bg-[#054B8F] transition-colors shadow-md hover:shadow-lg font-tripswift-medium"
      >
        {t('BookingTabs.ErrorState.startBookingNow')}
      </button>
    </div>
  );
};

export default ErrorState;