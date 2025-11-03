// BookingHeader.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home } from 'lucide-react';

const BookingHeader: React.FC = () => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';

  const handleBackToHome = () => {
    router.push('/');
  };

  return (
    <div className="bg-gradient-to-r from-tripswift-blue to-[#054B8F] text-tripswift-off-white font-noto-sans">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-2 sm:py-4 lg:py-6">
        {/* Compact Back Button */}
        <div className="flex items-start justify-between mb-4">
          <button
            onClick={handleBackToHome}
            className={`
              group relative inline-flex items-center gap-2 px-3 py-2 
              bg-white/10 backdrop-blur-sm rounded-lg border border-white/20
              text-tripswift-off-white hover:bg-white/20 hover:border-white/30
              transition-all duration-200 ease-out
              hover:shadow-md hover:shadow-black/15
              active:scale-95 active:bg-white/30
              focus:outline-none focus:ring-1 focus:ring-white/50 focus:ring-offset-1 focus:ring-offset-transparent
              ${isRTL ? 'flex-row-reverse' : ''}
            `}
            aria-label={t('BookingTabs.BookingHeader.backToHome')}
          >
            <div className="relative">
              <ArrowLeft 
                size={16} 
                className={`
                  transition-all duration-200 ease-out
                  group-hover:${isRTL ? 'translate-x-1' : '-translate-x-1'}
                  ${isRTL ? 'rotate-180' : ''}
                `} 
              />
              <div className="absolute inset-0 bg-white/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
            
            <span className="text-sm font-tripswift-medium tracking-wide">
              {t('BookingTabs.BookingHeader.backToHome')}
            </span>
            
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>
      </div>
      
      {/* Compact header content */}
      <div className="container mx-auto px-4 pb-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl md:text-3xl font-tripswift-bold mb-2 text-tripswift-off-white leading-snug">
            {t('BookingTabs.BookingHeader.yourBookings')}
          </h1>
          <p className="text-tripswift-off-white/80 text-base md:text-lg max-w-xl mx-auto leading-normal">
            {t('BookingTabs.BookingHeader.viewManageTrack')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingHeader;