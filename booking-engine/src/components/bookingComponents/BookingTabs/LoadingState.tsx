// LoadingState.tsx
import React from 'react';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const LoadingState: React.FC = () => {
  const { t } = useTranslation(); // Initialize useTranslation

  return (
    <div className="flex flex-col items-center justify-center py-16 bg-tripswift-off-white rounded-xl shadow-md font-noto-sans">
      <div className="w-16 h-16 border-4 border-tripswift-blue/30 border-t-tripswift-blue rounded-full animate-spin mb-6"></div>
      <h3 className="text-xl font-tripswift-medium text-tripswift-black mb-2">
        {t('BookingTabs.LoadingState.retrievingBookings')} {/* Translated text */}
      </h3>
      <p className="text-tripswift-black/70">
        {t('BookingTabs.LoadingState.fetchingDetails')} {/* Translated text */}
      </p>
    </div>
  );
};

export default LoadingState;