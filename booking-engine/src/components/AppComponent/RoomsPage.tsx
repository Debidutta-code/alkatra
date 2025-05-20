"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { RoomCard } from "@/components/AppComponent/RoomCard";
import GuestInformationModal from "@/components/bookingComponents/GuestInformationModal";
import { useDispatch, useSelector } from "@/Redux/store";
import { setAmount, setRoomId } from "@/Redux/slices/pmsHotelCard.slice";
import { setGuestDetails } from "@/Redux/slices/hotelcard.slice"; // Added correct import
import {
  Calendar, Search, Bed, ChevronRight, ChevronLeft, ChevronDown,
  MapPin, Star, Coffee, Wifi, Car, Waves, Droplets, Briefcase, Utensils, BellRing, CheckCircle,
  Bath, Dog, ImageIcon, Users
} from "lucide-react";
import LoadingSkeleton from "../hotelListingComponents/LoadingSkeleton";
import { formatDate, calculateNights } from "@/utils/dateUtils";

import { useTranslation } from "react-i18next"; // Import useTranslation
import i18next, { t } from "i18next";

interface Room {
  _id: string;
  propertyInfo_id: string;
  room_name: string;
  room_type: string;
  total_room: number;
  floor: number;
  room_view: string;
  room_size: number;
  room_unit: string;
  smoking_policy: string;
  max_occupancy: number;
  max_number_of_adults: number;
  max_number_of_children: number;
  number_of_bedrooms: number;
  number_of_living_room: number;
  extra_bed: number;
  description: string;
  image: string[];
  available: boolean;
  rateplan_created: boolean;
  room_price: number;
  amenities?: string[];
}

interface RoomData {
  _id: string;
  propertyInfo_id: string;
  room_name: string;
  room_type: string;
  total_room: number;
  floor: number;
  room_view: string;
  room_size: number;
  room_unit: string;
  smoking_policy: string;
  max_occupancy: number;
  max_number_of_adults: number;
  max_number_of_children: number;
  number_of_bedrooms: number;
  number_of_living_room: number;
  extra_bed: number;
  description: string;
  image: string[];
  available: boolean;
  rateplan_created: boolean;
  cancellation_policy?: string;
  original_price?: number;
  discount_percentage?: number;
  rating?: number;
  amenities?: { icon: string; name: string; }[];
  room_details_url?: string;
  default_image_url?: string;
}

interface RoomResponse {
  success: boolean;
  data: Room[];
}

interface PropertyDetails {
  _id?: string;
  property_name: string;
  property_address: string | {
    address_line_1?: string;
    address_line_2?: string;
    city?: string;
    state?: string;
    country?: string;
    zip_code?: number;
  };
  star_rating: number | string;
  image?: string[];
  description?: string;
  property_amenities?: {
    amenities?: { [key: string]: boolean };
  };
  property_contact?: string;
  property_email?: string;
}

const RoomsPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get("id");
  const checkInDate = searchParams.get("checkin") || "2024-11-20";
  const checkOutDate = searchParams.get("checkout") || "2024-12-24";
  const [rooms, setRooms] = useState<RoomResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [propertyDetails, setPropertyDetails] = useState<PropertyDetails | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showPropertyDetails, setShowPropertyDetails] = useState(true);
  const [selectedImage, setSelectedImage] = useState<number>(0);
  
  // Get guest details from Redux
  const { guestDetails } = useSelector((state) => state.hotel);
  
  const dispatch = useDispatch();
  
  // Initialize Redux with URL parameters
  useEffect(() => {
    // Get guest details from URL parameters
    const rooms = searchParams.get('rooms');
    const adults = searchParams.get('adults');
    const children = searchParams.get('children');
    
    if (rooms || adults || children) {
      // Initialize Redux with URL parameters
      dispatch(setGuestDetails({
        rooms: Number(rooms) || 1,
        guests: Number(adults) || 1,
        children: Number(children) || 0,
        childAges: Array(Number(children) || 0).fill(0)
      }));
    }
  }, [searchParams, dispatch]);

  // Helper function to format address
  const getFormattedAddress = (addressObj: any): string => {
    if (!addressObj) return "";
    if (typeof addressObj === 'string') return addressObj;

    const parts = [
      addressObj.address_line_1,
      addressObj.address_line_2,
      addressObj.city,
      addressObj.state,
      addressObj.country
    ].filter(Boolean);

    return parts.join(', ');
  };
  
  // Helper function to display guest count information
  const getGuestCountDisplay = () => {
    if (!guestDetails) return "1 Room · 1 Adult · 0 Children";
    
    const rooms = guestDetails.rooms || 1;
    const adults = guestDetails.guests || 1;
    const children = guestDetails.children || 0;
    
    return `${rooms} ${rooms === 1 ? 'Room' : 'Rooms'} · ${adults} ${adults === 1 ? 'Adult' : 'Adults'}${
      children > 0 ? ` · ${children} ${children === 1 ? 'Child' : 'Children'}` : ''
    }`;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!propertyId) return;
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/room/rooms_by_propertyId2/${propertyId}`
        );

        // Fetch property details
        const propertyResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/property/${propertyId}`
        );

        setRooms(response.data);

        // Handle different response formats
        const propDetails = propertyResponse.data.property || propertyResponse.data.data || propertyResponse.data;
        setPropertyDetails(propDetails);

        console.log("Property details:", propDetails); // For debugging
      } catch (error) {
        console.error("Error fetching data:", error);
        setRooms({ success: true, data: [] });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [propertyId]);

  // Helper function to convert string[] amenities to the expected format
  const convertAmenities = (room: Room) => {
    // Map string amenities to objects with icon and name properties
    const convertedAmenities = room.amenities?.map(amenity => {
      // Default mapping of amenity strings to icon names
      const getIconName = (amenityName: string) => {
        const amenityLower = amenityName.toLowerCase();
        if (amenityLower.includes('wifi')) return 'wifi';
        if (amenityLower.includes('air') || amenityLower.includes('ac')) return 'snowflake';
        if (amenityLower.includes('smoking')) return 'smoking-ban';
        if (amenityLower.includes('bed')) return 'bed';
        if (amenityLower.includes('view')) return 'tree';
        // Default icon if no match
        return 'check-circle';
      };

      return {
        icon: getIconName(amenity),
        name: amenity
      };
    });

    // Create a new object that matches the RoomData interface
    return {
      ...room,
      amenities: convertedAmenities
    } as unknown as RoomData;
  };

  const handleBookNow = (room: Room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
    dispatch(setRoomId(room._id));
    dispatch(setAmount(room.room_price?.toString() || room.room_size.toString()));
  };

  // In the parent component (RoomsPage.tsx or similar)
  const confirmBooking = (formData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    propertyId: string;
    roomId: string;
    checkIn: string;
    checkOut: string;
    amount: string;
    userId?: string;
    rooms?: number;
    adults?: number;
    children?: number;
  }) => {
    // Create the URL query params with all necessary data
    const queryParams = new URLSearchParams({
      roomId: formData.roomId,
      propertyId: formData.propertyId,
      amount: formData.amount,
      currency: "INR",
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      userId: formData.userId || "",
      
      // Add guest counts if available
      ...(formData.rooms ? { rooms: formData.rooms.toString() } : {}),
      ...(formData.adults ? { adults: formData.adults.toString() } : {}),
      ...(formData.children ? { children: formData.children.toString() } : {})
    }).toString();

    // Navigate to the payment page with all parameters
    router.push(`/payment?${queryParams}`);
  };


  // Get unique room types from all rooms
  const roomTypes = React.useMemo(() => {
    if (!rooms?.data) return [];
    const types = new Set(rooms.data.map(room => room.room_type));
    return ['all', ...Array.from(types)];
  }, [rooms]);

  // Filter rooms based on selected filters and search query
  const filteredRooms = React.useMemo(() => {
    if (!rooms?.data) return [];

    return rooms.data.filter(room => {
      // Apply room type filter
      if (filterType !== 'all' && room.room_type !== filterType) {
        return false;
      }

      // Apply search query
      if (searchQuery && !room.room_name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [rooms, filterType, searchQuery]);

  // Function to get amenity icon based on amenity key (same as in HotelCardItem)
  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case 'wifi':
        return <Wifi className="h-4 w-4 text-tripswift-blue" />;
      case 'swimming_pool':
        return <Waves className="h-4 w-4 text-tripswift-blue" />;
      case 'fitness_center':
        return <Droplets className="h-4 w-4 text-tripswift-blue" />;
      case 'spa_and_wellness':
        return <Bath className="h-4 w-4 text-tripswift-blue" />;
      case 'restaurant':
        return <Utensils className="h-4 w-4 text-tripswift-blue" />;
      case 'room_service':
        return <BellRing className="h-4 w-4 text-tripswift-blue" />;
      case 'bar_and_lounge':
        return <Coffee className="h-4 w-4 text-tripswift-blue" />;
      case 'parking':
        return <Car className="h-4 w-4 text-tripswift-blue" />;
      case 'concierge_services':
        return <BellRing className="h-4 w-4 text-tripswift-blue" />;
      case 'pet_friendly':
        return <Dog className="h-4 w-4 text-tripswift-blue" />;
      case 'business_facilities':
        return <Briefcase className="h-4 w-4 text-tripswift-blue" />;
      case 'laundry_services':
        return <Droplets className="h-4 w-4 text-tripswift-blue" />;
      case 'child_friendly_facilities':
        return <Star className="h-4 w-4 text-tripswift-blue" />;
      default:
        return <CheckCircle className="h-4 w-4 text-tripswift-blue" />;
    }
  };

  return (
    <div className="bg-[#F5F7FA] min-h-screen">
      {/* Property header */}
      <div className="bg-gradient-to-r from-tripswift-blue to-[#054B8F] text-tripswift-off-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center text-sm bg-tripswift-off-white/20 px-3 py-1.5 rounded-full hover:bg-tripswift-off-white/30 transition-colors mb-2 md:mb-0"
            >
              <ChevronRight className="h-4 w-4 mr-1 rotate-180" /> {t('RoomsPage.backToSearch')}
            </button>
          </div>

          <div className="flex flex-wrap gap-4 mt-2 items-center">
            <div className="flex items-center bg-tripswift-off-white/10 pl-3 pr-4 py-2 rounded-lg">
              <Calendar className="h-5 w-5 mr-2 text-tripswift-off-white/70" />
              <div>
                <div className="text-sm font-tripswift-medium">
                  {formatDate(checkInDate)} - {formatDate(checkOutDate)}
                </div>
                <div className="text-xs text-tripswift-off-white/60 mt-0.5">
                  {calculateNights(checkInDate, checkOutDate)} {calculateNights(checkInDate, checkOutDate) === 1 ? 'night' : 'nights'} stay
                </div>
              </div>
            </div>
            
            {/* Add Guest Information Display */}
            <div className="flex items-center bg-tripswift-off-white/10 pl-3 pr-4 py-2 rounded-lg">
              <Users className="h-5 w-5 mr-2 text-tripswift-off-white/70" />
              <div>
                <div className="text-sm font-tripswift-medium">
                  {getGuestCountDisplay()}
                </div>
              </div>
            </div>
            
            {propertyDetails?.star_rating && (
              <div className="flex items-center bg-tripswift-off-white/10 pl-3 pr-4 py-2 rounded-lg">
                <Star className="h-5 w-5 mr-2 text-yellow-400" />
                <div>
                  <div className="text-sm font-tripswift-medium">
                    {propertyDetails.star_rating} Star Hotel Rating
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Property Details Section */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-tripswift-off-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Collapsible header */}
          <div
            className="flex justify-between items-center bg-tripswift-blue/5 p-4 cursor-pointer"
            onClick={() => setShowPropertyDetails(!showPropertyDetails)}
          >
            <div>
              <h1 className="text-2xl md:text-xl font-tripswift-bold">
                {propertyDetails?.property_name || t('RoomsPage.viewPropertyDetails')}
              </h1>
              {propertyDetails?.property_address && (
                <p className="text-tripswift-off-white/80 mt-1 font-tripswift-regular flex items-center">
                  <MapPin className="h-4 w-4 mr-1 text-tripswift-off-white/60" />
                  {getFormattedAddress(propertyDetails.property_address)}
                </p>
              )}
            </div>
            <ChevronDown
              className={`h-5 w-5 text-tripswift-black/70 transform transition-transform duration-300 ${showPropertyDetails ? 'rotate-180' : ''}`}
            />
          </div>

          {showPropertyDetails && (
            <div className="p-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Property images gallery */}
                <div className="lg:col-span-2">
                  <div className="relative rounded-lg overflow-hidden bg-gray-100 h-64 md:h-80 group">
                    {propertyDetails?.image && propertyDetails.image.length > 0 ? (
                      <>
                        <img
                          src={propertyDetails.image[selectedImage]}
                          alt={propertyDetails.property_name || "Property"}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />

                        {/* Navigation arrows for images */}
                        {propertyDetails.image.length > 1 && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImage(prev =>
                                  prev === 0 ? propertyDetails.image!.length - 1 : prev - 1
                                );
                              }}
                              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-tripswift-black/50 text-white rounded-full p-2 hover:bg-tripswift-black/70 transition-colors"
                            >
                              <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImage(prev =>
                                  prev === propertyDetails.image!.length - 1 ? 0 : prev + 1
                                );
                              }}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-tripswift-black/50 text-white rounded-full p-2 hover:bg-tripswift-black/70 transition-colors"
                            >
                              <ChevronRight className="h-5 w-5" />
                            </button>

                            {/* Image count indicator */}
                            <div className="absolute bottom-3 right-3 bg-tripswift-black/70 text-white text-xs py-1 px-3 rounded-full">
                              {selectedImage + 1} / {propertyDetails.image.length}
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-gray-400" />
                        <span className="ml-2 text-gray-500">{t('RoomsPage.noImagesAvailable')}</span>
                      </div>
                    )}
                  </div>

                  {/* Image thumbnails */}
                  {propertyDetails?.image && propertyDetails.image.length > 1 && (
                    <div className="flex mt-2 space-x-2 overflow-x-auto pb-2">
                      {propertyDetails.image.map((img, index) => (
                        <div
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`w-20 h-20 flex-shrink-0 rounded-md overflow-hidden cursor-pointer relative transition-all duration-300 ${selectedImage === index ? 'ring-2 ring-tripswift-blue' : 'opacity-70 hover:opacity-90'
                            }`}
                        >
                          <img
                            src={img}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Property description */}
                  {propertyDetails?.description && (
                    <div className="mt-4">
                      <h3 className="text-md font-tripswift-medium text-tripswift-black mb-2">{t('RoomsPage.aboutThisProperty')}</h3>
                      <p className="text-tripswift-black/70 text-sm">
                        {propertyDetails.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Property amenities and contact info */}
                <div className="lg:col-span-1">
                  {/* Property amenities */}
                  <div className="bg-tripswift-blue/5 rounded-lg mb-4">
                    <h3 className="text-md font-tripswift-medium text-tripswift-black mb-3">{t('RoomsPage.propertyAmenities')}</h3>

                    {propertyDetails?.property_amenities?.amenities &&
                      Object.keys(propertyDetails.property_amenities.amenities).length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(propertyDetails.property_amenities.amenities)
                          .filter(([_, hasAmenity]) => hasAmenity)
                          .slice(0, 8)
                          .map(([amenity]) => (
                            <div
                              key={amenity}
                              className="flex items-center text-xs font-tripswift-medium text-tripswift-blue bg-tripswift-blue/5 border border-tripswift-blue/20 px-2 py-1 rounded-md"
                            >
                              {getAmenityIcon(amenity)}
                              {/* Using t() for amenity names directly from the 'amenitiesList' in RoomsPage */}
                              <span className="capitalize ml-1">{t(`RoomsPage.amenitiesList.${amenity}`)}</span>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-sm text-tripswift-black/60">{t('RoomsPage.noAmenitiesSpecified')}</p>
                    )}
                  </div>

                  {/* Contact information */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h3 className="text-md font-tripswift-medium text-tripswift-black mb-3">{t('RoomsPage.contactInformation')}</h3>
                    <div className="space-y-2 text-sm">
                      {propertyDetails?.property_contact && (
                        <div className="flex items-center text-tripswift-black/70">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-tripswift-blue mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {propertyDetails.property_contact}
                        </div>
                      )}
                      {propertyDetails?.property_email && (
                        <div className="flex items-center text-tripswift-black/70">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-tripswift-blue mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {propertyDetails.property_email}
                        </div>
                      )}
                      {propertyDetails?.property_address && (
                        <div className="flex items-center text-tripswift-black/70">
                          <MapPin className="h-4 w-4 text-tripswift-blue mr-2 flex-shrink-0" />
                          {getFormattedAddress(propertyDetails.property_address)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4">
        {/* Filter and Search Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            {/* Room type filter */}
            <div className="flex flex-wrap gap-2">
              {roomTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-1.5 rounded-md text-sm font-tripswift-medium transition-colors ${filterType === type
                    ? 'bg-tripswift-blue text-tripswift-off-white'
                    : 'bg-gray-100 text-tripswift-black/70 hover:bg-gray-200'
                    }`}
                >
                  {type === 'all' ? t('RoomsPage.allRooms') : type}
                </button>
              ))}
            </div>

            {/* Search input */}
            <div className="relative w-full md:max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-tripswift-black/50" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('RoomsPage.searchRoomName')}
                className="pl-10 w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-tripswift-blue/20 focus:border-tripswift-blue"
              />
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-tripswift-bold text-tripswift-black flex items-center">
            {t('RoomsPage.availableRooms')}
          </h2>
          <div className="text-sm text-tripswift-black/70 font-tripswift-medium bg-tripswift-blue/5 px-3 py-1 rounded-md">
            {i18next.language === 'hi' && (
              <span>
                <span className="mr-1">
                  {filteredRooms.length}
                </span>
                {filteredRooms.length > 1 ? (
                  <span>{t('RoomsPage.showingRooms_other')}</span>
                ) : (
                  <span>{t('RoomsPage.showingRooms_one')}</span>
                )}
              </span>
            )}
            {i18next.language === 'en' && (
              <span>
                Showing {filteredRooms.length} {filteredRooms.length > 1 ? 'Rooms' : 'Room'}
              </span>
            )}
            {/* Static text for Arabic */}
            {i18next.language === 'ar' && (
              <span>
                عرض {filteredRooms.length} {filteredRooms.length > 1 ? 'غرف' : 'غرفة'}
              </span>
            )}
          </div>
        </div>

        {/* Loading state */}
        {isLoading && <LoadingSkeleton type="room" count={4} />}

        {/* Empty state */}
        {!isLoading && (!filteredRooms || filteredRooms.length === 0) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 mx-auto bg-tripswift-blue/10 rounded-full flex items-center justify-center mb-4">
              <Bed className="h-8 w-8 text-tripswift-blue" />
            </div>
            <h3 className="text-xl font-tripswift-bold text-tripswift-black mb-2">{t('RoomsPage.noRoomsAvailableTitle')}</h3>
            <p className="text-tripswift-black/70 max-w-md mx-auto mb-6">
              {t('RoomsPage.noRoomsAvailableMessage')}
            </p>
            <button
              onClick={() => {
                setFilterType('all');
                setSearchQuery('');
              }}
              className="btn-tripswift-primary px-6 py-2 rounded-lg text-sm"
            >
              {t('RoomsPage.clearFilters')}
            </button>
          </div>
        )}

        {/* Rooms grid */}
        {!isLoading && filteredRooms.length > 0 && (
          <div className="space-y-4">
            {filteredRooms.map((room) => (
              <RoomCard
                key={room._id}
                data={convertAmenities(room)} // Convert to the expected format
                price={`₹${room.room_price || room.room_size}`} // Format price with currency symbol
                onBookNow={() => handleBookNow(room)}
              />
            ))}
          </div>
        )}
      </div>

      <GuestInformationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedRoom={selectedRoom}
        checkInDate={checkInDate}
        checkOutDate={checkOutDate}
        onConfirmBooking={confirmBooking}
        guestData={guestDetails}
      />
    </div>
  );
};

export default RoomsPage;