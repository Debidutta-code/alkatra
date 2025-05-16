"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "@/Redux/store";
import { useRouter } from "next/navigation";
import Image from "next/image";
import GuestBox from "./GuestBox";
import { getHotelsByCity } from '@/api/hotel';
import { Search, MapPin, Calendar, Users, Loader2 } from 'lucide-react';
import Home from "@/components/assets/popular/Home.jpg";
import toast from "react-hot-toast";
import DateRange from "./DateRange";

const HotelCard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dates, setDates] = useState<string[] | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const dispatch = useDispatch();
  const router = useRouter();
  const { guestDetails } = useSelector((state) => state.hotel);

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

  const fetchSearchedProperties = useCallback(async (location: string) => {
    if (!location) return;
    setLoading(true);
    setError(null);
    try {
      const hotelData = await getHotelsByCity(location);
      // If search is successful, proceed to destination page
      const checkinDate = encodeURIComponent(dates?.[0] || '');
      const checkoutDate = encodeURIComponent(dates?.[1] || '');
      const dateRangeQueryString = `checkin=${checkinDate}&checkout=${checkoutDate}`;
      
      router.push(`/destination?location=${searchQuery}&${dateRangeQueryString}`);
    } catch (error) {
      // setError("No hotels available for the selected location.");
      toast.error("No hotels available for the selected location.");
    } finally {
      setLoading(false);
    }
  }, [dates, router, searchQuery]);

  // Explicit search button handler, separate from form submission
  const handleSearchButtonClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    
    if (loading) return; // Don't do anything if already loading
    
    // Validation logic
    if (!searchQuery || searchQuery.length < 3) {
      toast.error("Please enter a valid location.");
      return;
    }

    if (!dates || dates.length !== 2 || !dates[0] || !dates[1]) {
      toast.error("Please select both check-in and check-out dates.");
      return;
    }

    // *** UPDATED CHILD AGE VALIDATION ***
    // Only perform this check if the children count is set and > 0
    if (guestDetails && guestDetails.children > 0) {
      // Skip the validation if the GuestBox hasn't completed its setup
      // This assumes that valid ages have been selected when the GuestBox's Apply button is clicked
      
      // All validations passed, proceed with search
      fetchSearchedProperties(searchQuery);
    } else {
      // No children or children count is 0, proceed with search
      fetchSearchedProperties(searchQuery);
    }
  };

  // Form submission handler - we'll prevent default and defer to the button click handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Always prevent default form submission
    // The actual search logic is in handleSearchButtonClick
  };

  return (
    <div className="relative w-full h-[400px] sm:h-[500px] overflow-hidden">
      {/* Hero Image with Parallax Effect */}
      <div 
        className="absolute inset-0 w-full h-full transition-transform duration-1000"
        style={{ transform: `translateY(${isScrolled ? '5%' : '0'})` }}
      >
        <Image
          src={Home}
          alt="Luxury Accommodation"
          className="object-cover w-full h-full"
          priority
          quality={95}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">
        {/* Hero Text */}
        <div className="max-w-3xl text-center mb-8">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 leading-tight tracking-tight drop-shadow-lg">
            Find the Perfect Stay for Your Journey
          </h1>
          <p className="text-lg md:text-xl text-white/90 font-light max-w-2xl mx-auto drop-shadow">
            Discover amazing accommodations at exclusive prices
          </p>
        </div>
        
        {/* Search Container */}
        <div className="w-full max-w-5xl">
          {/* Search Box */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-5">
            <form ref={formRef} onSubmit={handleSubmit} noValidate>
              <div className="flex flex-col lg:flex-row items-center gap-3">
                {/* Location Input */}
                <div className="w-full lg:w-auto lg:flex-1">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Where are you going?"
                      className="block w-full h-12 pl-10 pr-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-gray-700 transition duration-200 ease-in-out group-hover:border-blue-300"
                    />
                  </div>
                </div>
                
                {/* Date Range */}
                <div className="w-full lg:w-auto">
                  <div className="relative group border border-gray-200 rounded-lg focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 hover:border-blue-300 transition duration-200">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
                    </div>
                    <div className="pl-10 h-12 flex items-center">
                      <DateRange dates={dates} setDates={setDates} />
                    </div>
                  </div>
                </div>
                
                {/* Guest Selection */}
                <div className="w-full lg:w-auto">
                  <div className="relative group border border-gray-200 rounded-lg focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 hover:border-blue-300 transition duration-200 h-12">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <Users className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
                    </div>
                    <div 
                      className="pl-10 h-full"
                      onClick={(e) => {
                        // Prevent click from propagating to parent form
                        e.stopPropagation();
                      }}
                    >
                      <GuestBox />
                    </div>
                  </div>
                </div>
                
                {/* Search Button */}
                <div className="w-full lg:w-auto">
                  <button
                    type="button" // Important: Not "submit"
                    disabled={loading}
                    onClick={handleSearchButtonClick}
                    className="w-full lg:w-auto h-12 px-6 bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-lg flex items-center justify-center gap-2 transition-all duration-300 font-medium shadow-md hover:shadow-lg disabled:shadow-none"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Search className="w-5 h-5" />
                        <span>Search</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              {/* Error Message */}
              {error && (
                <div className="text-red-500 text-sm mt-2 flex items-center justify-center lg:justify-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}
            </form>
          </div>
          
          {/* Special Offers Bar */}
          <div className="mt-3 flex items-center justify-center">
            <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm flex items-center space-x-2">
              <span className="inline-block w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
              <p className="text-sm font-medium text-gray-700">
                Special offer: Get up to 25% off on your first booking!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;