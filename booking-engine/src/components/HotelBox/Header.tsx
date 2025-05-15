"use client";

import React, { useState, useEffect } from "react";
import { MapPin, Settings2, X } from "lucide-react";
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
  const [filters, setFilters] = useState<FilterState>({
    amenities: {},
    sortOrder: "",
  });

  const fetchLocationSuggestions = async (query: string) => {
    const mockSuggestions: LocationSuggestion[] = [
      { id: "1", name: "New York", country: "United States" },
      { id: "2", name: "London", country: "United Kingdom" },
      { id: "3", name: "Paris", country: "France" },
      { id: "4", name: "Tokyo", country: "Japan" },
    ].filter(loc =>
      loc.name.toLowerCase().includes(query.toLowerCase()) ||
      loc.country.toLowerCase().includes(query.toLowerCase())
    );

    return mockSuggestions;
  };

  useEffect(() => {
    const handleSearch = async () => {
      if (searchQuery.length >= 2) {
        const results = await fetchLocationSuggestions(searchQuery);
        setSuggestions(results);
        setShowSuggestions(true);
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

  const selectedFiltersCount = Object.values(filters.amenities).filter(Boolean).length;

  return (
    <div className="sticky top-20 z-50 w-full bg-white shadow-sm p-4 flex items-center justify-between">
      <div className="relative w-full sm:w-96">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onSearchQueryChange?.(e.target.value);
            }}
            placeholder="Search Hotel..."
            className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <Card className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="py-1">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2"
                  onClick={() => handleLocationSelect(suggestion)}
                >
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <div>
                    <span className="font-medium">{suggestion.name}</span>
                    <span className="text-sm text-gray-500">, {suggestion.country}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
      >
        <Settings2 className="h-5 w-5" />
        <span>Filters {selectedFiltersCount > 0 && `(${selectedFiltersCount})`}</span>
      </button>

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