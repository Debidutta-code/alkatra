"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapPin, Settings2, X, Search, Star } from "lucide-react";
import { FilterModal, FilterState } from "./FilterModal";
import { Card } from "@/components/ui/card";

interface HeaderProps {
  onFilterChange?: (filters: FilterState) => void;
  onLocationChange?: (location: string) => void;
  onSearchQueryChange?: (query: string) => void;
}

interface LocationSuggestion {
  id: string;
  name: string;
  country: string;
}

export const Header: React.FC<HeaderProps> = ({ onFilterChange, onLocationChange, onSearchQueryChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("");
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fix the TypeScript error by including the required 'rating' property
  const [filters, setFilters] = useState<FilterState>({
    amenities: {},
    sortOrder: "",
    rating: null // Add the missing property
  });

  // Real API fetch function - replace with your actual implementation
  const fetchLocationSuggestions = async (query: string) => {
    // This should be replaced with your actual API call
    setIsLoading(true);
    try {
      // Example of how you would integrate a real API:
      // const response = await fetch(`/api/locations?query=${encodeURIComponent(query)}`);
      // const data = await response.json();
      // return data.locations;
      
      // For now, return an empty array since we're removing static data
      return [];
    } catch (error) {
      console.error("Error fetching location suggestions:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Handle clicks outside the search container
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setIsSearchFocused(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleSearch = async () => {
      if (searchQuery.length >= 2) {
        const results = await fetchLocationSuggestions(searchQuery);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const timeoutId = setTimeout(handleSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleLocationSelect = (location: LocationSuggestion) => {
    setSelectedLocation(`${location.name}, ${location.country}`);
    setSearchQuery(`${location.name}, ${location.country}`);
    setShowSuggestions(false);
    onLocationChange?.(`${location.name}, ${location.country}`);
  };

  const handleFilterSave = (newFilters: FilterState) => {
    setFilters(newFilters);
    setIsModalOpen(false);
    onFilterChange?.(newFilters);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSelectedLocation("");
    setShowSuggestions(false);
    onLocationChange?.("");
  };

  const selectedFiltersCount = Object.values(filters.amenities).filter(Boolean).length + 
    (filters.rating !== null ? 1 : 0);

  return (
    <div className="sticky top-20 z-50 w-full bg-white shadow-md p-4 flex flex-col sm:flex-row items-center gap-4">
      <div className="relative w-full sm:max-w-md" ref={searchContainerRef}>
        <div className="relative group">
          <div className={`absolute inset-y-0 left-3 flex items-center pointer-events-none transition-colors duration-200 ${isSearchFocused ? 'text-tripswift-blue' : 'text-tripswift-black/40'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${isSearchFocused ? 'bg-tripswift-blue/10' : 'bg-transparent'}`}>
              <Search className="h-4 w-4" />
            </div>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onSearchQueryChange?.(e.target.value);
            }}
            onFocus={() => {
              setIsSearchFocused(true);
              if (searchQuery.length >= 2) {
                setShowSuggestions(true);
              }
            }}
            placeholder="Search hotels, destinations..."
            className={`w-full h-12 pl-12 pr-10 py-2 rounded-xl border ${
              isSearchFocused 
                ? 'border-tripswift-blue ring-2 ring-tripswift-blue/10'
                : 'border-tripswift-black/10 hover:border-tripswift-blue/30'
            } outline-none text-tripswift-black transition duration-200 ease-in-out shadow-sm font-tripswift-medium text-[15px]`}
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-3 flex items-center text-tripswift-black/40 hover:text-tripswift-black transition-colors"
              aria-label="Clear search"
            >
              <div className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-gray-100">
                <X className="h-4 w-4" />
              </div>
            </button>
          )}
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <Card className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-tripswift-black/5 overflow-hidden animate-in fade-in duration-200">
            <div className="py-2 max-h-[300px] overflow-y-auto">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  onClick={() => handleLocationSelect(suggestion)}
                  className="px-3 py-2 hover:bg-tripswift-blue/5 cursor-pointer flex items-center mx-1 rounded-lg"
                  role="option"
                >
                  <div className="w-8 h-8 rounded-full bg-tripswift-blue/10 flex items-center justify-center mr-2">
                    <MapPin className="h-4 w-4 text-tripswift-blue" />
                  </div>
                  <div>
                    <span className="font-tripswift-medium text-tripswift-black">{suggestion.name}</span>
                    <span className="text-sm text-tripswift-black/60">, {suggestion.country}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
        
        {/* Loading indicator */}
        {isLoading && searchQuery.length >= 2 && (
          <div className="absolute right-12 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-tripswift-blue/20 border-t-tripswift-blue rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full sm:w-auto h-12 px-5 bg-gradient-to-r from-tripswift-blue to-[#054B8F] hover:from-[#054B8F] hover:to-tripswift-blue text-white rounded-xl flex items-center justify-center gap-2.5 transition-all duration-300 font-tripswift-medium text-[14px] shadow-md hover:shadow-lg relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-tripswift-blue to-[#054B8F] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <span className="relative z-10 flex items-center gap-2">
          <Settings2 className="h-4 w-4" />
          <span>Filters</span>
          {selectedFiltersCount > 0 && (
            <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
              {selectedFiltersCount}
            </span>
          )}
        </span>
      </button>

      {/* Active filters display */}
      {selectedFiltersCount > 0 && (
        <div className="hidden sm:flex items-center gap-2 ml-2">
          {filters.rating !== null && (
            <div className="bg-tripswift-blue/10 text-tripswift-blue text-sm px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <Star className="h-3 w-3" />
              <span>{filters.rating}+ rating</span>
              <X 
                className="h-3 w-3 ml-1 cursor-pointer hover:text-tripswift-black"
                onClick={() => {
                  const newFilters = {...filters, rating: null};
                  setFilters(newFilters);
                  onFilterChange?.(newFilters);
                }}
              />
            </div>
          )}
          
          {Object.entries(filters.amenities)
            .filter(([_, isSelected]) => isSelected)
            .map(([amenity]) => (
              <div key={amenity} className="bg-tripswift-blue/10 text-tripswift-blue text-sm px-2.5 py-1 rounded-full flex items-center gap-1.5">
                <span>{amenity}</span>
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer hover:text-tripswift-black"
                  onClick={() => {
                    const newFilters = {
                      ...filters,
                      amenities: {
                        ...filters.amenities,
                        [amenity]: false
                      }
                    };
                    setFilters(newFilters);
                    onFilterChange?.(newFilters);
                  }}
                />
              </div>
            ))
          }
        </div>
      )}

      <FilterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleFilterSave}
        initialFilters={filters}
      />
    </div>
  );
};

export default Header;