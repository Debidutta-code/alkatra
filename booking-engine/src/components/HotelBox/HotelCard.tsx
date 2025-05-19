'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from '@/Redux/store';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getHotelsByCity } from '@/api/hotel';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import i18next from '../../i18n/Index'; // Import i18n configuration
import Home from '@/components/assets/popular/Home.jpg';
import CompactSearchBar from '../HotelBox/CompactSearchBar'; // Update with correct path
import { format, addDays } from 'date-fns';

const HotelCard = () => {
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const dispatch = useDispatch();
  const router = useRouter();

  // Set default dates (tomorrow and day after tomorrow)
  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
  const dayAfterTomorrow = format(addDays(new Date(), 2), 'yyyy-MM-dd');

  // Monitor scroll position for subtle parallax effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Add animation class after component mount
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Ensure document direction is set
  useEffect(() => {
    document.documentElement.dir = i18next.language === 'ar' ? 'rtl' : 'ltr';
    const handleLanguageChange = () => {
      document.documentElement.dir = i18next.language === 'ar' ? 'rtl' : 'ltr';
    };
    i18next.on('languageChanged', handleLanguageChange);
    return () => {
      i18next.off('languageChanged', handleLanguageChange);
    };
  }, []);

  // Handle search from CompactSearchBar
  const handleSearch = useCallback(async (location: string, checkin: string, checkout: string) => {
    try {
      await getHotelsByCity(location);
      router.push(`/destination?location=${encodeURIComponent(location)}&checkin=${encodeURIComponent(checkin)}&checkout=${encodeURIComponent(checkout)}`);
    } catch (error) {
      toast.error(t('HotelCard.errorNoHotels'));
    }
  }, [router, t]);

  return (
    <div className="relative w-full h-[400px] sm:h-[500px] overflow-hidden">
      {/* Hero Image with Parallax Effect */}
      <div 
        className="absolute inset-0 w-full h-full transition-transform duration-1000"
        style={{ transform: `translateY(${isScrolled ? '5%' : '0'})` }}
      >
        <Image
          src={Home}
          alt="Luxury Accommodation - TripSwift"
          className="object-cover w-full h-full"
          priority
          quality={95}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-tripswift-black/50 via-tripswift-black/30 to-tripswift-black/60" />
      </div>
      
     {/* Main Content */}
     <div className={`relative z-10 h-full flex flex-col items-center justify-center px-4 transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0 translate-y-10'}`}>
        {/* Hero Text */}
        <div className="max-w-3xl text-center mb-10 animate-in slide-in-from-bottom duration-700">
          <div className="bg-tripswift-blue/20 backdrop-blur-sm text-tripswift-off-white/90 text-sm font-tripswift-medium px-4 py-1.5 rounded-full inline-flex items-center mb-6 shadow-lg">
            <span className="inline-block w-2 h-2 bg-tripswift-blue rounded-full mr-2 animate-pulse"></span>
            <span>Exclusive Offers Available</span>
          </div>
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-tripswift-extrabold text-tripswift-off-white mb-5 leading-tight tracking-tight drop-shadow-lg">
            {t('HotelCard.heroTitle')}
          </h1>
          
          <p className="text-lg md:text-xl text-tripswift-off-white font-tripswift-regular max-w-2xl mx-auto drop-shadow-md">
            {t('HotelCard.heroSubtitle')}
          </p>
        </div>
        
        {/* Search Container */}
        <div className="w-full max-w-5xl animate-in slide-in-from-bottom duration-700 delay-200">
          {/* Search Box */}
          <CompactSearchBar 
            initialLocation="Bhubaneswar" 
            initialCheckin={tomorrow} 
            initialCheckout={dayAfterTomorrow}
            onSearch={handleSearch}
          />
          
          {/* Special Offers Bar */}
          <div className="mt-5 flex items-center justify-center animate-in slide-in-from-bottom duration-700 delay-300">
            <div className="bg-white/20 backdrop-blur-lg px-5 py-2.5 rounded-full shadow-lg flex items-center gap-4">
              <div className="flex items-center">
                <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></span>
                <span className="text-sm font-tripswift-medium text-white">Free Cancellation</span>
              </div>
              
              <div className="w-1 h-1 rounded-full bg-white/40"></div>
              
              <div className="flex items-center">
                <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full animate-pulse mr-2"></span>
                <span className="text-sm font-tripswift-medium text-white">Best Price Guarantee</span>
              </div>
              
              <div className="w-1 h-1 rounded-full bg-white/40 hidden sm:block"></div>
              
              <div className="hidden sm:flex items-center">
                <span className="inline-block w-2 h-2 bg-tripswift-blue rounded-full animate-pulse mr-2"></span>
                <span className="text-sm font-tripswift-medium text-white">{t('HotelCard.specialOffer')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;