"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, MapPin, Calendar, Loader2, X, ChevronRight } from 'lucide-react';
import toast from "react-hot-toast";
import DateRange from "../hotelBox/DateRange";
import GuestBox from "../hotelBox/GuestBox";
import { getHotelsByCity } from '../../api/hotel';
import { format, addDays } from 'date-fns';
import { useSelector } from "../../Redux/store";
import { t } from "i18next";
import { useTranslation } from "react-i18next";

interface CompactSearchBarProps {
  initialLocation?: string;
  initialCheckin?: string;
  initialCheckout?: string;
  onSearch?: (location: string, checkin: string, checkout: string, guestDetails?: any) => void;
  onGuestChange?: (guestDetails: any) => void;
}

const CompactSearchBar: React.FC<CompactSearchBarProps> = ({
  initialLocation = "Manama",
  initialCheckin = "",
  initialCheckout = "",
  onSearch,
  onGuestChange
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Get guest details from Redux store
  const { guestDetails } = useSelector((state) => state.hotel);
  const { i18n } = useTranslation();
  // Set default dates (tomorrow and day after tomorrow)
  const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");
  const dayAfterTomorrow = format(addDays(new Date(), 2), "yyyy-MM-dd");

  // Get current search parameters from URL or props or defaults
  const currentLocation =
    initialLocation ||
    searchParams.get("location") ||
    searchParams.get("destination") ||
    "Manama";
  const checkinDate = initialCheckin || searchParams.get("checkin") || tomorrow;
  const checkoutDate =
    initialCheckout || searchParams.get("checkout") || dayAfterTomorrow;

  // Set initial states with current search parameters
  const [searchQuery, setSearchQuery] = useState(currentLocation);
  const [dates, setDates] = useState<string[] | undefined>([
    checkinDate,
    checkoutDate,
  ]);
  const [loading, setLoading] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Update state when props change
  useEffect(() => {
    if (initialLocation) setSearchQuery(initialLocation);
    if (initialCheckin && initialCheckout) {
      setDates([initialCheckin, initialCheckout]);
    }
  }, [initialLocation, initialCheckin, initialCheckout]);

  const clearSearch = () => {
    setSearchQuery("");
  };


  const handleSearchButtonClick = async (e: React.MouseEvent) => {
    e.preventDefault();
  
    if (loading) return;
  
    // Validation logic
    if (!searchQuery || searchQuery.length < 3) {
      toast.error(t("HotelListing.CompactSearchBar.errorInvalidLocation"));
      return;
    }
  
    if (!dates || dates.length !== 2 || !dates[0] || !dates[1]) {
      toast.error(t("HotelListing.CompactSearchBar.errorSelectDates"));
      return;
    }
  
    if (dates[0] === dates[1]) {
      toast.error(t("HotelListing.CompactSearchBar.errorSameDates"));
      return;
    }
  
    console.log("guest details", guestDetails); // This will now only show applied guest details
    setLoading(true);
    try {
      await getHotelsByCity(searchQuery);
      const checkinDate = encodeURIComponent(dates[0] || "");
      const checkoutDate = encodeURIComponent(dates[1] || "");
  
      // Use the onSearch callback if provided, otherwise use router
      if (onSearch) {
        onSearch(searchQuery, dates[0], dates[1], guestDetails);
      } else {
        // Build guest details query parameters
        const guestParams = guestDetails
          ? `&rooms=${guestDetails.rooms || 1}&adults=${guestDetails.guests || 1}&children=${guestDetails.children || 0}&infant=${guestDetails.infants || 0}`
          : "&rooms=1&adults=1&children=0&infant=0";
  
        router.push(`/destination?location=${encodeURIComponent(searchQuery)}&checkin=${checkinDate}&checkout=${checkoutDate}${guestParams}`);
      }
    } catch (error) {
      toast.error(t("HotelListing.CompactSearchBar.errorNoHotels"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/95  backdrop-blur-sm mb-16 sm:mb-0  rounded-xl shadow-lg border border-tripswift-black/5 p-3 font-noto-sans">
      <div className="flex flex-col gap-2 md:flex-row items-center md:gap-3.5 ">
        {/* Location Input */}
        <div className="w-full sm:w-auto sm:flex-1" ref={searchContainerRef}>
          <div className="relative group">
            <div
              className={`absolute inset-y-0 ${i18n.language === "ar" ? "right-3" : "left-3"} flex items-center pointer-events-none transition-colors duration-200 ${isSearchFocused ? "text-tripswift-blue" : "text-tripswift-black/40"
                }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${isSearchFocused ? "bg-tripswift-blue/10" : "bg-transparent"
                  }`}
              >
                <MapPin className="h-4 w-4" />
              </div>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder={t("HotelListing.CompactSearchBar.locationPlaceholder")}
              className={`block w-[262px] md:w-full h-11 pl-10 pr-8 sm:pr-10 py-2 rounded-md border ${isSearchFocused
                ? "border-tripswift-blue ring-2 ring-tripswift-blue/10"
                : "border-tripswift-black/10 hover:border-tripswift-blue/30"
                } outline-none text-tripswift-black transition duration-200 ease-in-out shadow-sm font-tripswift-medium text-[16px] px-2 tracking-normal`}
              style={{ textIndent: "16px " }} // Match input:placeholder-shown style
              aria-label={t("HotelListing.CompactSearchBar.locationPlaceholder")}
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className={`absolute inset-y-0 ${i18n.language === "ar" ? "left-3" : "right-3"} flex items-center text-tripswift-black/40 hover:text-tripswift-black transition-colors`}
                aria-label={t("HotelListing.CompactSearchBar.ariaClearSearch")}
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-tripswift-black/5">
                  <X className="h-4 w-4" />
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Date Range */}
        <div className=" w-[262px] sm:flex-1">
          <div className="relative group">
            <div className={`absolute inset-y-0 ${i18n.language === "ar" ? "right-3" : "left-3"} flex items-center pointer-events-none`}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-tripswift-blue/10 transition-colors duration-300">
                <Calendar className="h-4 w-4 text-tripswift-black/40 group-hover:text-tripswift-blue transition-colors duration-200" />
              </div>
            </div>
            <div className={`bg-tripswift-off-white border border-tripswift-black/10 text-[16px] hover:border-tripswift-blue/30 rounded-md shadow-sm transition-all duration-200 h-11 ${i18n.language === "ar" ? "pr-12" : "pl-12"} flex items-center`}>
              <DateRange dates={dates} setDates={setDates} />
            </div>
          </div>
        </div>

        <div className="w-[262px] sm:flex-1">
          <GuestBox />
        </div>

        {/* Search Button */}
        <div className="w-full sm:w-auto">
          <button
            type="button"
            disabled={loading}
            onClick={handleSearchButtonClick}
            className="btn-tripswift-primary  w-[262px] md:w-auto  h-11 px-6 flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg relative overflow-hidden group"
            aria-label={
              loading
                ? t("HotelListing.CompactSearchBar.ariaSearching")
                : t("HotelListing.CompactSearchBar.ariaSearchHotels")
            }
          >
            <span className="relative z-10 flex items-center gap-2.5">
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span className="font-tripswift-semibold text-[14px]">
                    {t("HotelListing.CompactSearchBar.searchButton")}
                  </span>
                  <ChevronRight className={`w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300 ${i18n.language === "ar" ? "rotate-180" : ""}`} />
                </>
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompactSearchBar;