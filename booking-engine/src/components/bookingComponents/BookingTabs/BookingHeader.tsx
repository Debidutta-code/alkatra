// BookingHeader.tsx
import React from 'react';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const BookingHeader: React.FC = () => {
  const { t } = useTranslation(); // Initialize useTranslation

  return (
    <div className="bg-gradient-to-r from-tripswift-blue to-[#054B8F] text-tripswift-off-white">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-tripswift-bold mb-2">
            {t('BookingTabs.BookingHeader.yourBookings')} {/* Translated text */}
          </h1>
          <p className="text-tripswift-off-white/80 text-lg max-w-2xl mx-auto">
            {t('BookingTabs.BookingHeader.viewManageTrack')} {/* Translated text */}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingHeader;