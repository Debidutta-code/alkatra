// File: src/components/AppComponent/hotelListing.tsx

"use client";

import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from 'react-redux';
import { useSearchParams, useRouter } from 'next/navigation';
import { getHotelsByCity } from '@/api/hotel';
import { FilterState } from "@/components/HotelBox/FilterModal";
import { setPropertyId, setCheckInDate, setCheckOutDate } from "@/Redux/slices/pmsHotelCard.slice";
import { Filter, Calendar } from 'lucide-react';
import toast from "react-hot-toast";

// Import refactored components
import CompactSearchBar from "@/components/HotelBox/CompactSearchBar";
import HotelCardItem from "@/components/hotelListingComponents/HotelCardItem";
import ActiveFilters from "@/components/hotelListingComponents/ActiveFilters";
import FilterSidebar from "@/components/hotelListingComponents/FilterSidebar";
import MobileFilterDrawer from "@/components/hotelListingComponents/MobileFilterDrawer";
import LoadingSkeleton from "@/components/hotelListingComponents/LoadingSkeleton";
import EmptyState from "@/components/hotelListingComponents/EmptyState";

interface Hotel {
  _id: string;
  property_name: string;
  property_email: string;
  property_contact: string;
  star_rating: string;
  property_code: string;
  description: string;
  image: string[];
  amenities: { [key: string]: boolean };
}

interface HotelData {
  success: boolean;
  message: string;
  data: Hotel[];
}

const hotelListing: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const [params, setParams] = useState<{ location?: string; destination?: string; url?: string }>({});
  const [hotelData, setHotelData] = useState<HotelData>({ success: false, message: '', data: [] });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [errorToastShown, setErrorToastShown] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterState>({ amenities: {}, sortOrder: "" });
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [ratingFilter, setRatingFilter] = useState<number | null>(null); // Added for rating filter
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const destination = searchParams.get("destination");
  const location = searchParams.get("location");
  const checkinDate = searchParams.get("checkin");
  const checkoutDate = searchParams.get("checkout");

  // Initialize search params
  useEffect(() => {
    if (location) {
      setParams({ location, url: "search" });
    } else if (destination) {
      setParams({ destination, url: "search-amenities" });
    }
  }, [destination, location]);

  // Fetch hotels when params change
  useEffect(() => {
    if (params.location) {
      fetchHotels(params.location);
    } else if (params.destination) {
      fetchHotels(params.destination);
    }
  }, [params]);

  // Fetch hotels data
  const fetchHotels = async (searchTerm: string) => {
    setIsLoading(true);
    setError(null);
    setErrorToastShown(false);

    try {
      const hotelsResponse = await getHotelsByCity(searchTerm);
      setHotelData(hotelsResponse);

      if (hotelsResponse.data.length === 0) {
        toast.error('No hotels found for the given search criteria.');
      }
    } catch (error) {
      setError(error instanceof Error ? error : new Error("An unknown error occurred"));
      setHotelData({ success: false, message: '', data: [] });

      if (!errorToastShown) {
        toast.error('Please try modifying the search');
        setErrorToastShown(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle new search from the search bar
  const handleSearch = (newLocation: string, checkin: string, checkout: string) => {
    router.push(`/destination?location=${encodeURIComponent(newLocation)}&checkin=${encodeURIComponent(checkin)}&checkout=${encodeURIComponent(checkout)}`);
  };

  // Function to handle filters
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleSearchQueryChange = (query: string) => {
    setSearchQuery(query);
  };

  // Function to handle rating filter changes
  const handleRatingChange = (rating: number | null) => {
    setRatingFilter(rating);
  };

  // Function to handle the View Room button click
  const handleViewRoom = (hotelId: string) => {
    if (hotelId) {
      dispatch(setPropertyId(hotelId));
      localStorage.setItem('property_id', hotelId);
    }
    if (checkinDate) {
      dispatch(setCheckInDate(checkinDate));
      localStorage.setItem('checkin_date', checkinDate);
    }
    if (checkoutDate) {
      dispatch(setCheckOutDate(checkoutDate));
      localStorage.setItem('checkout_date', checkoutDate);
    }
    // Navigate programmatically
    window.location.href = `/hotel?id=${hotelId}&checkin=${checkinDate}&checkout=${checkoutDate}`;
  };

  // Apply filters to hotel data
  const applyFilters = (hotels: Hotel[]): Hotel[] => {
    let filteredHotels = hotels;

    // Apply amenity filters
    if (Object.keys(filters.amenities).length > 0) {
      filteredHotels = filteredHotels.filter(hotel =>
        Object.entries(filters.amenities).every(([amenityKey, isSelected]) =>
          !isSelected || hotel.amenities[amenityKey]
        )
      );
    }

    // Apply rating filter
    if (ratingFilter !== null) {
      filteredHotels = filteredHotels.filter(hotel => {
        const hotelRating = Math.round(parseFloat(hotel.star_rating));
        return hotelRating === ratingFilter;
      });
    }

    // Apply sort order
    if (filters.sortOrder) {
      filteredHotels = filteredHotels.sort((a, b) => {
        if (filters.sortOrder === "rating_desc") {
          return parseFloat(b.star_rating) - parseFloat(a.star_rating);
        } else if (filters.sortOrder === "rating_asc") {
          return parseFloat(a.star_rating) - parseFloat(b.star_rating);
        }
        return 0;
      });
    }

    // Apply search query
    if (searchQuery) {
      filteredHotels = filteredHotels.filter(hotel =>
        hotel.property_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Ensure each hotel name is displayed only once
    return filteredHotels.reduce((acc: Hotel[], currentHotel: Hotel) => {
      if (!acc.find(hotel => hotel.property_name === currentHotel.property_name)) {
        acc.push(currentHotel);
      }
      return acc;
    }, []);
  };

  // Toggle an amenity filter
  const toggleAmenityFilter = (key: string) => {
    const newAmenities = { ...filters.amenities };
    newAmenities[key] = !newAmenities[key];
    setFilters({ ...filters, amenities: newAmenities });
  };

  // Change sort order
  const handleSortChange = (sortOrder: string) => {
    setFilters({ ...filters, sortOrder });
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({ amenities: {}, sortOrder: "" });
    setSearchQuery("");
    setRatingFilter(null); // Reset rating filter as well
  };

  // Format date helper
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
      });
    } catch (e) {
      return dateString;
    }
  };

  // Get filtered hotels
  const filteredHotels = applyFilters(hotelData.data);
  
  // Update activeFilterCount to include the rating filter
  const activeFilterCount = Object.values(filters.amenities).filter(Boolean).length +
    (filters.sortOrder ? 1 : 0) +
    (searchQuery ? 1 : 0) +
    (ratingFilter !== null ? 1 : 0);

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Search bar at the top - removed bg-white class */}
      <div className="">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <CompactSearchBar 
            initialLocation={location || destination || ""}
            initialCheckin={checkinDate || ""}
            initialCheckout={checkoutDate || ""}
            onSearch={handleSearch}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Search information */}
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-800">
            Hotels in {params.location || params.destination || "your destination"}
          </h1>
          <div className="flex flex-wrap items-center text-sm text-gray-500 mt-1">
            <div className="flex items-center mr-4">
              <Calendar className="h-4 w-4 mr-1" />
              {checkinDate && checkoutDate ? (
                <span>{formatDate(checkinDate)} - {formatDate(checkoutDate)}</span>
              ) : (
                <span>Select dates</span>
              )}
            </div>
            <span className="mr-4">•</span>
            <span>{filteredHotels.length} properties found</span>
          </div>
        </div>

        {/* Mobile filter button */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="w-full py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center"
          >
            <Filter className="h-4 w-4 mr-2" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Active filters display */}
        <ActiveFilters 
          amenities={filters.amenities}
          sortOrder={filters.sortOrder}
          searchQuery={searchQuery}
          toggleAmenityFilter={toggleAmenityFilter}
          handleSortChange={handleSortChange}
          setSearchQuery={setSearchQuery}
          resetFilters={resetFilters}
        />

        {/* Main Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar filters - Desktop */}
          <div className="hidden lg:block lg:w-1/4">
            <FilterSidebar 
              amenities={filters.amenities}
              sortOrder={filters.sortOrder}
              ratingFilter={ratingFilter} // Pass the rating filter
              toggleAmenityFilter={toggleAmenityFilter}
              handleSortChange={handleSortChange}
              handleRatingChange={handleRatingChange} // Pass the rating change handler
              resetFilters={resetFilters}
              activeFilterCount={activeFilterCount}
            />
          </div>

          {/* Mobile sidebar - should also be updated to support rating filter */}
          <MobileFilterDrawer 
            isOpen={mobileFiltersOpen}
            onClose={() => setMobileFiltersOpen(false)}
            sidebarRef={sidebarRef}
            amenities={filters.amenities}
            sortOrder={filters.sortOrder}
            toggleAmenityFilter={toggleAmenityFilter}
            handleSortChange={handleSortChange}
            resetFilters={resetFilters}
            filteredHotelsCount={filteredHotels.length}
          />

          {/* Main content - Hotel listings */}
          <div className="lg:w-3/4">
            {/* Hotel results */}
            {isLoading ? (
              <LoadingSkeleton />
            ) : filteredHotels.length === 0 ? (
              <EmptyState resetFilters={resetFilters} />
            ) : (
              <div className="space-y-4">
                {filteredHotels.map((hotel) => (
                  <div key={hotel._id} className="hotel-card-container">
                    <HotelCardItem
                      hotel={hotel}
                      location={params.location || params.destination || ""}
                      onViewRoom={handleViewRoom}
                      checkinDate={checkinDate}
                      checkoutDate={checkoutDate}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default hotelListing;