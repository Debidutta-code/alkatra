"use client";

import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams, useRouter } from "next/navigation";
import { getHotelsByCity } from "@/api/hotel";
import { FilterState } from "@/components/HotelBox/FilterModal";
import {
  setPropertyId,
  setCheckInDate,
  setCheckOutDate,
} from "@/Redux/slices/pmsHotelCard.slice";
import {
  Filter,
  Calendar,
  MapPin,
  Search,
  CreditCard,
  Check,
  Star,
  Shield,
  ChevronRight,
  MapIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

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

const HotelListing: React.FC = () => {
  const { t, i18n, ready } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const [params, setParams] = useState<{
    location?: string;
    destination?: string;
    url?: string;
  }>({});
  const [hotelData, setHotelData] = useState<HotelData>({
    success: false,
    message: "",
    data: [],
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [errorToastShown, setErrorToastShown] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterState>({
    amenities: {},
    sortOrder: "",
    rating: null,
  });
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
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

  // Fetch hotels when params change or language changes
  useEffect(() => {
    // Fetch hotels based on initial params
    if (params.location) {
      fetchHotels(params.location);
    } else if (params.destination) {
      fetchHotels(params.destination);
    }

    // Listen for language changes and refetch hotels
    const handleLanguageChange = () => {
      if (params.location) {
        fetchHotels(params.location);
      } else if (params.destination) {
        fetchHotels(params.destination);
      }
    };

    i18n.on("languageChanged", handleLanguageChange);

    // Cleanup the event listener on component unmount
    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [params, i18n.language]);

  // Fetch hotels data
  const fetchHotels = async (searchTerm: string) => {
    setIsLoading(true);
    setError(null);
    setErrorToastShown(false);

    const destination = searchParams.get("destination");
    const location = searchParams.get("location");
    const checkinDate = searchParams.get("checkin");
    const checkoutDate = searchParams.get("checkout");

    console.log("Search Params:", { destination, location, checkinDate, checkoutDate });

    try {
      const hotelsResponse = await getHotelsByCity(searchTerm);
      setHotelData(hotelsResponse);

      if (hotelsResponse.data.length === 0) {
        toast.error(t("HotelListing.noHotelsError", { defaultValue: "No hotels found." }));
      }
    } catch (error) {
      setError(error instanceof Error ? error : new Error("An unknown error occurred"));
      setHotelData({ success: false, message: "", data: [] });

      if (!errorToastShown) {
        toast.error(t("HotelListing.tryModifyingSearch", { defaultValue: "Try modifying your search." }));
        setErrorToastShown(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle new search from the search bar
  const handleSearch = (newLocation: string, checkin: string, checkout: string) => {
    router.push(
      `/destination?location=${encodeURIComponent(newLocation)}&checkin=${encodeURIComponent(
        checkin
      )}&checkout=${encodeURIComponent(checkout)}`
    );
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
      localStorage.setItem("property_id", hotelId);
    }
    if (checkinDate) {
      dispatch(setCheckInDate(checkinDate));
      localStorage.setItem("checkin_date", checkinDate);
    }
    if (checkoutDate) {
      dispatch(setCheckOutDate(checkoutDate));
      localStorage.setItem("checkout_date", checkoutDate);
    }
    window.location.href = `/hotel?id=${hotelId}&checkin=${checkinDate}&checkout=${checkoutDate}`;
  };

  // Apply filters to hotel data
  const applyFilters = (hotels: Hotel[]): Hotel[] => {
    let filteredHotels = hotels;

    if (Object.keys(filters.amenities).length > 0) {
      filteredHotels = filteredHotels.filter((hotel) =>
        Object.entries(filters.amenities).every(([amenityKey, isSelected]) =>
          !isSelected || hotel.amenities[amenityKey]
        )
      );
    }

    if (ratingFilter !== null) {
      filteredHotels = filteredHotels.filter((hotel) => {
        const hotelRating = Math.round(parseFloat(hotel.star_rating));
        return hotelRating === ratingFilter;
      });
    }

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

    if (searchQuery) {
      filteredHotels = filteredHotels.filter((hotel) =>
        hotel.property_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filteredHotels.reduce((acc: Hotel[], currentHotel: Hotel) => {
      if (!acc.find((hotel) => hotel.property_name === currentHotel.property_name)) {
        acc.push(currentHotel);
      }
      return acc;
    }, []);
  };

  const toggleAmenityFilter = (key: string) => {
    const newAmenities = { ...filters.amenities };
    newAmenities[key] = !newAmenities[key];
    setFilters({ ...filters, amenities: newAmenities });
  };

  const handleSortChange = (sortOrder: string) => {
    setFilters({ ...filters, sortOrder });
  };

  const resetFilters = () => {
    setFilters({ amenities: {}, sortOrder: "", rating: null });
    setSearchQuery("");
    setRatingFilter(null);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(i18n.language, {
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  const calculateNights = () => {
    if (!checkinDate || !checkoutDate) return 0;

    const checkIn = new Date(checkinDate);
    const checkOut = new Date(checkoutDate);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) return 0;

    const diffTime = checkOut.getTime() - checkIn.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const filteredHotels = applyFilters(hotelData.data);

  const activeFilterCount =
    Object.values(filters.amenities).filter(Boolean).length +
    (filters.sortOrder ? 1 : 0) +
    (searchQuery ? 1 : 0) +
    (ratingFilter !== null ? 1 : 0);

  // Show loading state if translations are not ready
  if (!ready) {
    return <div>{t("HotelListing.loadingTranslations", { defaultValue: "Loading translations..." })}</div>;
  }

  return (
    <div className="bg-[#F5F7FA] min-h-screen">
      <div className="bg-gradient-to-r from-tripswift-blue to-[#054B8F] relative">
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full bg-pattern-dots"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
          <div className="text-tripswift-off-white mb-6">
            <h1 className="text-2xl md:text-3xl font-tripswift-bold">
              {t("HotelListing.heroTitle", { defaultValue: "Find Your Perfect Stay" })}
            </h1>
            <p className="mt-2 font-tripswift-regular opacity-90">
              {t("HotelListing.heroSubtitle", { defaultValue: "Book accommodations at the best prices" })}
            </p>
          </div>

          <div className="">
            <CompactSearchBar
              initialLocation={location || destination || ""}
              initialCheckin={checkinDate || ""}
              initialCheckout={checkoutDate || ""}
              onSearch={handleSearch}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-tripswift-blue" />
              <h1 className="text-xl font-tripswift-bold text-tripswift-black">
                {t("HotelListing.hotelsIn", {
                  location:
                    params.location ||
                    params.destination ||
                    t("HotelListing.yourDestination", { defaultValue: "your destination" }),
                })}
              </h1>
            </div>

            <div className="flex flex-wrap items-center text-sm font-tripswift-regular text-tripswift-black/70 mt-2 ml-7">
              <div className="flex items-center mr-4">
                <Calendar className="h-4 w-4 mr-1 text-tripswift-blue" />
                {checkinDate && checkoutDate ? (
                  <span>
                    {formatDate(checkinDate)} - {formatDate(checkoutDate)}
                  </span>
                ) : (
                  <span>{t("HotelListing.selectDates", { defaultValue: "Select dates" })}</span>
                )}
              </div>
              <span className="mx-4 text-tripswift-black/40">•</span>
              <span>
                {filteredHotels.length} {t("HotelListing.propertiesFound", { defaultValue: "properties found" })}
              </span>
            </div>
          </div>
        </div>

        <div className="lg:hidden mb-5">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="w-full py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-tripswift-medium text-tripswift-black hover:bg-gray-50 transition-colors flex items-center justify-center"
          >
            <Filter className="h-4 w-4 mr-2 text-tripswift-blue" />
            <span>{t("HotelListing.filters", { defaultValue: "Filters" })}</span>
            {activeFilterCount > 0 && (
              <span className="ml-2 bg-tripswift-blue text-tripswift-off-white px-2 py-0.5 rounded-full text-xs font-tripswift-medium">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <ActiveFilters
          amenities={filters.amenities}
          sortOrder={filters.sortOrder}
          searchQuery={searchQuery}
          toggleAmenityFilter={toggleAmenityFilter}
          handleSortChange={handleSortChange}
          setSearchQuery={setSearchQuery}
          resetFilters={resetFilters}
        />

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="hidden lg:block lg:w-1/4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
              <div className="p-4 bg-tripswift-blue/5 border-b border-gray-200">
                <h3 className="font-tripswift-bold text-tripswift-black text-lg">
                  {t("HotelListing.filters", { defaultValue: "Filters" })}
                </h3>
                {activeFilterCount > 0 && (
                  <div className="mt-1 text-sm text-tripswift-black/60 flex items-center">
                    <span>
                      {activeFilterCount}{" "}
                      {activeFilterCount === 1
                        ? t("HotelListing.activeFilter", { defaultValue: "active filter" })
                        : t("HotelListing.activeFilters", { defaultValue: "active filters" })}
                    </span>
                    <button
                      onClick={resetFilters}
                      className="ml-2 text-tripswift-blue hover:underline font-tripswift-medium"
                    >
                      {t("HotelListing.clearAll", { defaultValue: "Clear all" })}
                    </button>
                  </div>
                )}
              </div>

              <div className="p-4">
                <FilterSidebar
                  amenities={filters.amenities}
                  sortOrder={filters.sortOrder}
                  ratingFilter={ratingFilter}
                  toggleAmenityFilter={toggleAmenityFilter}
                  handleSortChange={handleSortChange}
                  handleRatingChange={handleRatingChange}
                  resetFilters={resetFilters}
                  activeFilterCount={activeFilterCount}
                />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-4 p-4">
              <h3 className="font-tripswift-bold text-tripswift-black mb-3">
                {t("HotelListing.popularFilters", { defaultValue: "Popular Filters" })}
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => toggleAmenityFilter("free_wifi")}
                  className={`w-full text-left px-3 py-2 rounded flex justify-between items-center ${filters.amenities["free_wifi"]
                    ? "bg-tripswift-blue/10 text-tripswift-blue"
                    : "hover:bg-gray-50 text-tripswift-black/70"
                    }`}
                >
                  <span>{t("HotelListing.freeWifi", { defaultValue: "Free WiFi" })}</span>
                  {filters.amenities["free_wifi"] && <Check className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => toggleAmenityFilter("parking")}
                  className={`w-full text-left px-3 py-2 rounded flex justify-between items-center ${filters.amenities["parking"]
                    ? "bg-tripswift-blue/10 text-tripswift-blue"
                    : "hover:bg-gray-50 text-tripswift-black/70"
                    }`}
                >
                  <span>{t("HotelListing.parking", { defaultValue: "Parking" })}</span>
                  {filters.amenities["parking"] && <Check className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => toggleAmenityFilter("breakfast")}
                  className={`w-full text-left px-3 py-2 rounded flex justify-between items-center ${filters.amenities["breakfast"]
                    ? "bg-tripswift-blue/10 text-tripswift-blue"
                    : "hover:bg-gray-50 text-tripswift-black/70"
                    }`}
                >
                  <span>{t("HotelListing.breakfast", { defaultValue: "Breakfast" })}</span>
                  {filters.amenities["breakfast"] && <Check className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <MobileFilterDrawer
            isOpen={mobileFiltersOpen}
            onClose={() => setMobileFiltersOpen(false)}
            sidebarRef={sidebarRef}
            amenities={filters.amenities}
            sortOrder={filters.sortOrder}
            ratingFilter={ratingFilter}
            toggleAmenityFilter={toggleAmenityFilter}
            handleSortChange={handleSortChange}
            handleRatingChange={handleRatingChange}
            resetFilters={resetFilters}
            filteredHotelsCount={filteredHotels.length}
          />

          <div className="lg:w-3/4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-grow max-w-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-tripswift-black/50" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("HotelListing.searchPropertyName", { defaultValue: "Search property name" })}
                  className="pl-10 w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-tripswift-blue/20 focus:border-tripswift-blue"
                />
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-sm font-tripswift-medium text-tripswift-black/70">
                  {t("HotelListing.sortBy", { defaultValue: "Sort by" })}:
                </span>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="border border-gray-200 rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-tripswift-blue/20 focus:border-tripswift-blue"
                >
                  <option value="">{t("HotelListing.recommended", { defaultValue: "Recommended" })}</option>
                  <option value="rating_desc">{t("HotelListing.highestRating", { defaultValue: "Highest Rating" })}</option>
                  <option value="rating_asc">{t("HotelListing.lowestRating", { defaultValue: "Lowest Rating" })}</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <LoadingSkeleton />
            ) : filteredHotels.length === 0 ? (
              <EmptyState resetFilters={resetFilters} />
            ) : (
              <div className="space-y-5">
                {filteredHotels.map((hotel) => (
                  <div
                    key={hotel._id}
                    className="hotel-card-container transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]"
                  >
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

            {filteredHotels.length > 0 && !isLoading && (
              <div className="mt-10 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-tripswift-bold text-lg text-tripswift-black mb-4">
                  {t("HotelListing.whyBookWithTripSwift", { defaultValue: "Why Book With TripSwift" })}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-start">
                    <div className="bg-tripswift-blue/10 p-2 rounded-full mr-3">
                      <CreditCard className="h-5 w-5 text-tripswift-blue" />
                    </div>
                    <div>
                      <h4 className="font-tripswift-medium text-tripswift-black">
                        {t("HotelListing.freeCancellation", { defaultValue: "Free Cancellation" })}
                      </h4>
                      <p className="text-sm text-tripswift-black/60 mt-1">
                        {t("HotelListing.freeCancellationDesc", { defaultValue: "Cancel your booking without any charges." })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-tripswift-blue/10 p-2 rounded-full mr-3">
                      <Star className="h-5 w-5 text-tripswift-blue" />
                    </div>
                    <div>
                      <h4 className="font-tripswift-medium text-tripswift-black">
                        {t("HotelListing.bestPriceGuarantee", { defaultValue: "Best Price Guarantee" })}
                      </h4>
                      <p className="text-sm text-tripswift-black/60 mt-1">
                        {t("HotelListing.bestPriceGuaranteeDesc", { defaultValue: "Find a better price, and we'll match it." })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-tripswift-blue/10 p-2 rounded-full mr-3">
                      <Shield className="h-5 w-5 text-tripswift-blue" />
                    </div>
                    <div>
                      <h4 className="font-tripswift-medium text-tripswift-black">
                        {t("HotelListing.secureBooking", { defaultValue: "Secure Booking" })}
                      </h4>
                      <p className="text-sm text-tripswift-black/60 mt-1">
                        {t("HotelListing.secureBookingDesc", { defaultValue: "Your information is safe with us." })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelListing;