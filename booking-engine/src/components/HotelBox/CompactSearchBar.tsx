import React, { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, MapPin, Calendar, Users, Loader2, X } from 'lucide-react';
import toast from "react-hot-toast";
import DateRange from "../HotelBox/DateRange";
import GuestBox from "../HotelBox/GuestBox";
import { getHotelsByCity } from '@/api/hotel';

interface CompactSearchBarProps {
  initialLocation?: string;
  initialCheckin?: string;
  initialCheckout?: string;
  onSearch?: (location: string, checkin: string, checkout: string) => void;
}

const CompactSearchBar: React.FC<CompactSearchBarProps> = ({
  initialLocation = "",
  initialCheckin = "",
  initialCheckout = "",
  onSearch
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchContainerRef = useRef<HTMLDivElement>(null);
  
  // Get current search parameters from URL or props
  const currentLocation = initialLocation || searchParams.get("location") || searchParams.get("destination") || "";
  const checkinDate = initialCheckin || searchParams.get("checkin") || "";
  const checkoutDate = initialCheckout || searchParams.get("checkout") || "";
  
  // Set initial states with current search parameters
  const [searchQuery, setSearchQuery] = useState(currentLocation);
  const [dates, setDates] = useState<string[] | undefined>(
    checkinDate && checkoutDate ? [checkinDate, checkoutDate] : undefined
  );
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Update state when props change
  useEffect(() => {
    if (initialLocation) setSearchQuery(initialLocation);
    if (initialCheckin && initialCheckout) {
      setDates([initialCheckin, initialCheckout]);
    }
  }, [initialLocation, initialCheckin, initialCheckout]);
  
  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  // Handle search input change with location suggestions
  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value);
    
    if (value.length >= 2) {
      // Mock suggestions - in real app would come from API
      const mockSuggestions = [
        "New York, USA",
        "London, UK",
        "Paris, France",
        "Tokyo, Japan",
        "Sydney, Australia",
        "Dubai, UAE",
        "Rome, Italy",
        "Singapore"
      ].filter(loc => loc.toLowerCase().includes(value.toLowerCase()));
      
      setSuggestions(mockSuggestions);
      setShowSuggestions(mockSuggestions.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
  };
  
  const clearSearch = () => {
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
  };
  
  const handleSearchButtonClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (loading) return;
    
    // Validation logic
    if (!searchQuery || searchQuery.length < 3) {
      toast.error("Please enter a valid location.");
      return;
    }

    if (!dates || dates.length !== 2 || !dates[0] || !dates[1]) {
      toast.error("Please select both check-in and check-out dates.");
      return;
    }

    setLoading(true);
    try {
      await getHotelsByCity(searchQuery);
      const checkinDate = encodeURIComponent(dates[0] || '');
      const checkoutDate = encodeURIComponent(dates[1] || '');
      
      // Use the onSearch callback if provided, otherwise use router
      if (onSearch) {
        onSearch(searchQuery, dates[0], dates[1]);
      } else {
        router.push(`/destination?location=${encodeURIComponent(searchQuery)}&checkin=${checkinDate}&checkout=${checkoutDate}`);
      }
    } catch (error) {
      toast.error("No hotels available for the selected location.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-3">
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Location Input with Suggestions */}
        <div className="w-full sm:w-auto sm:flex-1" ref={searchContainerRef}>
          <div className="relative group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              placeholder="Where are you going?"
              className="block w-full h-12 pl-10 pr-10 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-gray-700 transition duration-200 ease-in-out group-hover:border-blue-300"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
            
            {/* Location Suggestions Dropdown */}
            {showSuggestions && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-700">{suggestion}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Date Range */}
        <div className="w-full sm:w-auto sm:flex-1">
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
        <div className="w-full sm:w-auto sm:flex-[0.7]">
          <div className="relative group border border-gray-200 rounded-lg focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 hover:border-blue-300 transition duration-200 h-12">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Users className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
            </div>
            <div className="pl-10 h-full">
              <GuestBox />
            </div>
          </div>
        </div>
        
        {/* Search Button */}
        <div className="w-full sm:w-auto">
          <button
            type="button"
            disabled={loading}
            onClick={handleSearchButtonClick}
            className="w-full sm:w-auto h-12 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg flex items-center justify-center gap-2 transition-all duration-300 font-medium"
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
    </div>
  );
};

export default CompactSearchBar;