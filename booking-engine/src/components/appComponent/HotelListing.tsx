"use client";

import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams, useRouter } from "next/navigation";
import { getHotelsByCity } from "../../api/hotel";
import { FilterState } from "../../components/hotelBox/FilterModal";
import {
  setPropertyId,
  setCheckInDate,
  setCheckOutDate,
} from "../../Redux/slices/pmsHotelCard.slice";
import {
  Filter,
  Calendar,
  MapPin,
  Search,
  CreditCard,
  Star,
  Shield,
} from "lucide-react";
import toast from "react-hot-toast";
import { useSelector } from "../../Redux/store";
import { formatDate, calculateNights } from "../../utils/dateUtils";
import { useTranslation } from "react-i18next";

import CompactSearchBar from "../../components/hotelBox/CompactSearchBar";
import HotelCardItem from "../../components/hotelListingComponents/HotelCardItem";
import ActiveFilters from "../../components/hotelListingComponents/ActiveFilters";
import FilterSidebar from "../../components/hotelListingComponents/FilterSidebar";
import MobileFilterDrawer from "../../components/hotelListingComponents/MobileFilterDrawer";
import LoadingSkeleton from "../../components/hotelListingComponents/LoadingSkeleton";
import EmptyState from "../../components/hotelListingComponents/EmptyState";

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
  const { t, i18n } = useTranslation();
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
  // const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { guestDetails } = useSelector((state) => state.hotel);
  const destination = searchParams.get("destination");
  const location = searchParams.get("location");
  const checkinDate = searchParams.get("checkin");
  const checkoutDate = searchParams.get("checkout");
  const [viewRoomLoading, setViewRoomLoading] = useState<string | null>(null);

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
  }, [params]);

  const handleGuestChange = (guestData: any) => {
    // If you need to handle guest details changes from the search bar
    console.log("Guest details updated:", guestData);
  };
  // Fetch hotels data
  const fetchHotels = async (searchTerm: string) => {
    setIsLoading(true);
    setError(null);
    setErrorToastShown(false);

    try {
      const hotelsResponse = await getHotelsByCity(searchTerm);
      setHotelData(hotelsResponse);
      console.log(`Hotels fetched for ${searchTerm}:`, hotelsResponse.data);
      if (hotelsResponse.data.length === 0) {
        toast.error(
          t("HotelListing.noHotelsError", { defaultValue: "No hotels found." })
        );
      }
    } catch (error) {
      setError(
        error instanceof Error ? error : new Error("An unknown error occurred")
      );
      setHotelData({ success: false, message: "", data: [] });

      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unknown error occurred";

      if (!errorToastShown) {
        let toastMessage = t("HotelListing.tryModifyingSearch", {
          defaultValue: "Try modifying your search.",
        });

        if (errorMessage.includes("No hotels found")) {
          toastMessage = t("HotelCard.errorNoHotels", {
            defaultValue: "No hotels available for the selected location.",
          });
        }

        toast.error(toastMessage);
        setErrorToastShown(true);
      }
    } finally {
      setIsLoading(false);
    }
  };
  // console.log("guest details",guestDetails)
  const handleSearch = (
    newLocation: string,
    checkin: string,
    checkout: string,
    guestData?: any
  ) => {
    const guestToUse = guestData || guestDetails;
    const guestParams = guestToUse
      ? `&rooms=${guestToUse.rooms || 1}&adults=${guestToUse.guests || 1
      }&children=${guestToUse.children || 0}&infant=${guestToUse.infants || 0
      }`
      : "";
    router.push(
      `/destination?location=${encodeURIComponent(
        newLocation
      )}&checkin=${encodeURIComponent(checkin)}&checkout=${encodeURIComponent(
        checkout
      )}${guestParams}`
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

  const handleViewRoom = async (hotelId: string) => {
    try {
      // Set loading state for this specific hotel
      setViewRoomLoading(hotelId);

      if (hotelId) {
        dispatch(setPropertyId(hotelId));
      }
      if (checkinDate) {
        dispatch(setCheckInDate(checkinDate));
      }
      if (checkoutDate) {
        dispatch(setCheckOutDate(checkoutDate));
      }

      if (guestDetails && Object.keys(guestDetails).length > 0) {
        localStorage.setItem("guest_details", JSON.stringify(guestDetails));
        if (guestDetails.rooms) {
          localStorage.setItem("rooms", guestDetails.rooms.toString());
        }
      }

      const guestParams = guestDetails
        ? `&rooms=${guestDetails.rooms || 1}&adults=${guestDetails.guests || 1}&children=${guestDetails.children || 0}&infant=${guestDetails.infants || 0}`
        : "";

      // Add a small delay to show loading state (optional)
      await new Promise(resolve => setTimeout(resolve, 500));

      router.push(`/hotel?${guestParams}`);
    } catch (error) {
      console.error("Error navigating to hotel:", error);
      toast.error("Failed to view room. Please try again.");
    } finally {
      // Reset loading state after navigation
      setViewRoomLoading(null);
    }
  };

  // Apply filters to hotel data
  const applyFilters = (hotels: Hotel[]): Hotel[] => {
    let filteredHotels = hotels;

    if (Object.keys(filters.amenities).length > 0) {
      filteredHotels = filteredHotels.filter((hotel) =>
        Object.entries(filters.amenities).every(
          ([amenityKey, isSelected]) =>
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
      if (
        !acc.find((hotel) => hotel.property_name === currentHotel.property_name)
      ) {
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

  const filteredHotels = applyFilters(hotelData.data);

  const activeFilterCount =
    Object.values(filters.amenities).filter(Boolean).length +
    (filters.sortOrder ? 1 : 0) +
    (searchQuery ? 1 : 0) +
    (ratingFilter !== null ? 1 : 0);

  return (
    <div className="bg-[#F5F7FA] min-h-screen font-noto-sans">
      <div className="bg-gradient-to-r from-tripswift-blue to-[#054B8F] relative">
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full bg-pattern-dots"></div>
        </div>
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-2 sm:py-4 lg:py-6">
          <div className="text-tripswift-off-white mb-6 flex-col items-center">
            <h1 className="text-2xl md:text-3xl font-tripswift-bold text-tripswift-off-white">
              {t("HotelListing.heroTitle", {
                defaultValue: "Find Your Perfect Stay",
              })}
            </h1>
            <p className="mt-2 font-tripswift-regular opacity-90">
              {t("HotelListing.heroSubtitle", {
                defaultValue: "Book accommodations at the best prices",
              })}
            </p>
          </div>

          <div className="w-[290px] md:w-full">
            <CompactSearchBar
              initialLocation={location || destination || ""}
              initialCheckin={checkinDate || ""}
              initialCheckout={checkoutDate || ""}
              onSearch={handleSearch}
              onGuestChange={handleGuestChange}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-2 sm:py-4 lg:py-6">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between ml-2">
          <div>
            <div className="flex items-center">
              <MapPin
                className={`h-5 w-5  text-tripswift-blue ${i18n.language === "ar" ? "ml-3" : "mr-3"
                  }`}
              />
              <h1 className="text-xl font-tripswift-bold text-tripswift-black">
                {i18n.language === "hi"
                  ? `${params.location || params.destination} ${t(
                    "HotelListing.hotelsIn"
                  )}`
                  : `${t("HotelListing.hotelsIn")} ${params.location || params.destination
                  }`}
              </h1>
            </div>

            <div className="flex flex-col md:flex-row md:flex-wrap md:items-center text-xs sm:text-sm font-tripswift-regular text-tripswift-black/70 mt-2 gap-2 md:gap-2">
              {/* Date Range with Calendar Icon */}
              <div className="flex items-start md:items-center pl-0.5">
                <Calendar
                  className={`h-4 w-4 text-tripswift-blue flex-shrink-0 mt-0.5 md:mt-0 ${i18n.language === "ar" ? "ml-3 md:ml-3" : "mr-4 md:mr-3"}`}
                />
                <div className="flex flex-col md:flex-row md:items-center md:gap-2 min-w-0 flex-1">
                  {/* Date Range Value */}
                  <div className="leading-tight min-w-0">
                    {checkinDate && checkoutDate ? (
                      <span className="text-sm md:text-sm font-medium whitespace-nowrap">
                        {i18n.language === "ar"
                          ? `${formatDate(checkoutDate, { month: "short", day: "numeric" })} - ${formatDate(checkinDate, { month: "short", day: "numeric" })}`
                          : `${formatDate(checkinDate, { month: "short", day: "numeric" })} - ${formatDate(checkoutDate, { month: "short", day: "numeric" })}`}
                      </span>
                    ) : (
                      <span className="text-sm md:text-sm whitespace-nowrap">{t("HotelListing.selectDates", { defaultValue: "Select dates" })}</span>
                    )}
                  </div>

                  {/* Nights Count - only show if dates are selected */}
                  {checkinDate && checkoutDate && (
                    <div className="flex items-center gap-2">
                      <span className="text-tripswift-black/40 text-sm hidden md:inline">•</span>
                      <span className="text-sm md:text-sm font-medium leading-tight whitespace-nowrap">
                        {calculateNights(checkinDate, checkoutDate)} {t("HotelListing.nights", { defaultValue: "nights" })}
                      </span>
                    </div>
                  )}

                  {/* Property Count */}
                  <div className="flex items-center gap-2">
                    <span className="text-tripswift-black/40 text-sm hidden md:inline">•</span>
                    <span className="text-sm md:text-sm font-medium leading-tight whitespace-nowrap">
                      {filteredHotels.length}{" "}
                      {t("HotelListing.propertiesFound", { defaultValue: "properties found" })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:hidden mb-5">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="w-full py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-tripswift-medium text-tripswift-black hover:bg-gray-50 transition-colors duration-300 flex items-center justify-center"
          >
            <Filter
              className={`h-4 w-4  text-tripswift-blue ${i18n.language === "ar" ? "ml-2" : "mr-2"
                } `}
            />
            <span>
              {t("HotelListing.filters", { defaultValue: "Filters" })}
            </span>
            {activeFilterCount > 0 && (
              <span className={` bg-tripswift-blue text-tripswift-off-white px-2 py-0.5 rounded-full text-xs font-tripswift-medium ${i18n.language === "ar" ? "mr-2" : "ml-2"
                } `}>
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

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="hidden lg:block lg:w-1/4">
            <div className="bg-tripswift-off-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
              <div className="p-4 bg-tripswift-blue/5 border-b border-gray-200">
                <h3 className="font-tripswift-bold text-tripswift-black text-lg">
                  {t("HotelListing.filters", { defaultValue: "Filters" })}
                </h3>
                {activeFilterCount > 0 && (
                  <div className="mt-1 text-sm text-tripswift-black/60 flex items-center">
                    <span>
                      {activeFilterCount}{" "}
                      {activeFilterCount === 1
                        ? t("HotelListing.activeFilter", {
                          defaultValue: "active filter",
                        })
                        : t("HotelListing.activeFilters", {
                          defaultValue: "active filters",
                        })}
                    </span>
                    <button
                      onClick={resetFilters}
                      className={` text-tripswift-blue hover:underline font-tripswift-medium transition-all duration-300 ${i18n.language === "ar" ? "mr-2" : "ml-2"
                        }`}
                    >
                      {t("HotelListing.clearAll", {
                        defaultValue: "Clear all",
                      })}
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

            {/* <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-4 p-4">
              <h3 className="font-tripswift-bold text-tripswift-black mb-3">
                {t("HotelListing.popularFilters", { defaultValue: "Popular Filters" })}
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => toggleAmenityFilter('free_wifi')}
                  className="w-full text-left px-3 py-2 rounded flex justify-between items-center transition-colors duration-300 ${filters.amenities['free_wifi']
                    ? 'bg-tripswift-blue/10 text-tripswift-blue'
                    : 'hover:bg-gray-50 text-tripswift-black/70'
                    }`}
                >
                  <span>{t("HotelListing.freeWifi", { defaultValue: "Free WiFi" })}</span>
                  {filters.amenities["free_wifi"] && <Check className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => toggleAmenityFilter('parking')}
                  className={`w-full text-left px-3 py-2 rounded flex justify-between items-center ${filters.amenities['parking']
                    ? 'bg-tripswift-blue/10 text-tripswift-blue'
                    : 'hover:bg-gray-50 text-tripswift-black/70'
                    }`}
                >
                  <span>{t("HotelListing.parking", { defaultValue: "Parking" })}</span>
                  {filters.amenities["parking"] && <Check className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => toggleAmenityFilter('breakfast')}
                  className={`w-full text-left px-3 py-2 rounded flex justify-between items-center ${filters.amenities['breakfast']
                    ? 'bg-tripswift-blue/10 text-tripswift-blue'
                    : 'hover:bg-gray-50 text-tripswift-black/70'
                    }`}
                >
                  <span>{t("HotelListing.breakfast", { defaultValue: "Breakfast" })}</span>
                  {filters.amenities["breakfast"] && <Check className="h-4 w-4" />}
                </button>
              </div>
            </div> */}
          </div>

          {/* Mobile sidebar */}
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
            <div className="bg-tripswift-off-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-grow max-w-xs">
                <div className={`absolute inset-y-0 ${i18n.language === "ar" ? "right-0 pr-3" : "left-0 pl-3"} flex items-center pointer-events-none`}>
                  <Search className="h-4 w-4 text-tripswift-black/50" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("HotelListing.searchPropertyName", {
                    defaultValue: "Search property by name",
                  })}
                  className={`${i18n.language === "ar" ? "pr-10" : "pl-10"} w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm bg-tripswift-off-white focus:outline-none focus:ring-2 focus:ring-tripswift-blue/20 focus:border-tripswift-blue transition-all duration-300`}
                />
              </div>

              <div className="flex items-center">
                <span
                  className={`text-sm font-tripswift-medium text-tripswift-black/70 ${i18n.language === "ar" ? "ml-3" : "mr-3"
                    }`}
                >
                  {t("HotelListing.sortBy", { defaultValue: "Sort by" })}
                </span>
                <div className="relative">
                  <select
                    value={filters.sortOrder}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className={`appearance-none border border-gray-200 rounded-md py-1.5 text-sm bg-tripswift-off-white focus:outline-none focus:ring-2 focus:ring-tripswift-blue/20 focus:border-tripswift-blue transition-all duration-300
      ${i18n.language === "ar" ? "pr-3 pl-8 text-right" : "pl-3 pr-8 text-left"}
    `}
                  >
                    <option value="">
                      {t("HotelListing.recommended", {
                        defaultValue: "Recommended",
                      })}
                    </option>
                    <option value="rating_desc">
                      {t("HotelListing.highestRating", {
                        defaultValue: "Highest Rating",
                      })}
                    </option>
                    <option value="rating_asc">
                      {t("HotelListing.lowestRating", {
                        defaultValue: "Lowest Rating",
                      })}
                    </option>
                  </select>

                  <div
                    className={`pointer-events-none absolute inset-y-0 flex items-center px-2 text-gray-500
      ${i18n.language === "ar" ? "left-0" : "right-0"}
    `}
                  >
                    <svg
                      className="h-4 w-4 fill-current"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
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
                      isLoading={viewRoomLoading === hotel._id}
                    />
                  </div>
                ))}
              </div>
            )}

            {filteredHotels.length > 0 && !isLoading && (
              <div className="mt-6 bg-tripswift-off-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h3 className="font-tripswift-bold text-lg text-tripswift-black mb-4">
                  {t("HotelListing.whyBookWithAlhajz", {
                    defaultValue: "Why Book With Alhajz",
                  })}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-start">
                    <div
                      className={`bg-tripswift-blue/10 p-1 rounded-full mt-0.5 ${i18n.language === "ar" ? "ml-3" : "mr-3"
                        } `}
                    >
                      <CreditCard className="h-5 w-5 text-tripswift-blue" />
                    </div>
                    <div className="mt-1">
                      <h4 className="font-tripswift-medium text-tripswift-black">
                        {t("HotelListing.freeCancellation", {
                          defaultValue: "Free Cancellation",
                        })}
                      </h4>
                      <p className="text-sm text-tripswift-black/60 mt-1">
                        {t("HotelListing.freeCancellationDesc", {
                          defaultValue:
                            "Cancel your booking without any charges.",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div
                      className={`bg-tripswift-blue/10 p-1 rounded-full mt-0.5 ${i18n.language === "ar" ? "ml-3" : "mr-3"
                        } `}
                    >
                      <Star className="h-5 w-5 text-tripswift-blue" />
                    </div>
                    <div className="mt-1.5">
                      <h4 className="font-tripswift-medium text-tripswift-black">
                        {t("HotelListing.bestPriceGuarantee", {
                          defaultValue: "Best Price Guarantee",
                        })}
                      </h4>
                      <p className="text-sm text-tripswift-black/60 mt-1">
                        {t("HotelListing.bestPriceGuaranteeDesc", {
                          defaultValue:
                            "Find a better price, and we'll match it.",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div
                      className={`bg-tripswift-blue/10 p-1 rounded-full mt-0.5 ${i18n.language === "ar" ? "ml-3" : "mr-3"
                        } `}
                    >
                      <Shield className="h-5 w-5 text-tripswift-blue" />
                    </div>
                    <div className="mt-1">
                      <h4 className="font-tripswift-medium text-tripswift-black">
                        {t("HotelListing.secureBooking", {
                          defaultValue: "Secure Booking",
                        })}
                      </h4>
                      <p className="text-sm text-tripswift-black/60 mt-1">
                        {t("HotelListing.secureBookingDesc", {
                          defaultValue: "Your information is safe with us.",
                        })}
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