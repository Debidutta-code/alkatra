"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { RoomCard } from "@/components/appComponent/RoomCard";
import GuestInformationModal, { Guest } from "@/components/bookingComponents/GuestInformationModal";
import { useDispatch, useSelector } from "@/Redux/store";
import { setAmount, setRoomId } from "@/Redux/slices/pmsHotelCard.slice";
import { setGuestDetails } from "@/Redux/slices/hotelcard.slice";
import FullscreenGallery from './FullscreenGallery';
import QRCodeDisplay from "./QRCodeDisplay";
import {
  Calendar,
  Search,
  Bed,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  MapPin,
  Star,
  Coffee,
  Wifi,
  Car,
  Waves,
  Droplets,
  Briefcase,
  Utensils,
  BellRing,
  CheckCircle,
  Bath,
  Dog,
  ImageIcon,
  Users,
  Filter,
  AlertCircle,
  Ban,
  Accessibility
} from "lucide-react";
import LoadingSkeleton from "../hotelListingComponents/LoadingSkeleton";
import { formatDate, calculateNights } from "@/utils/dateUtils";
import { useTranslation } from "react-i18next";
// import QRCodeDisplay from "./QRCodeDisplay";

interface Room {
  _id: string;
  currency_code: string;
  has_valid_rate: boolean;
  max_occupancy: number;
  propertyInfo_id: string;
  rate_plan_code: string;
  room_name: string;
  room_size: number;
  room_type: string;
  room_price?: number | null;
  baseByGuestAmts?: {
    amountBeforeTax: number;
    numberOfGuests: number;
    _id: string;
  }[];
  image?: string[];
  amenities?: string[];
  description?: string;
  available_rooms?: number;
  max_number_of_adults?: number;
  max_number_of_children?: number;
  room_view?: string;
}

interface RoomResponse {
  success: boolean;
  data: Room[];
}

interface PropertyDetails {
  _id?: string;
  property_name: string;
  property_code: string;
  property_address:
  | string
  | {
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
  room_Aminity?: {
    _id?: string;
    propertyInfo_id?: string;
    amenities?: {
      [key: string]: { [key: string]: boolean }; // Generic structure for nested categories
    };
    __v?: number;
  };
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
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [propertyDetails, setPropertyDetails] = useState<PropertyDetails | null>(null);
  const [qrCodeData, setQrCodeData] = useState({
    qrCode: null,
    couponCode: null,
  });
  const [showPropertyDetails, setShowPropertyDetails] = useState<boolean>(true);
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [propertyCode, setPropertyCode] = useState<string>("");
  const [roomTypeCode, setRoomTypeCode] = useState<string[]>([]);
  const [roomAmenities, setRoomAmenities] = useState<{ [key: string]: any }>({});
  const [unavailableRoomTypes, setUnavailableRoomTypes] = useState<{ roomType: string; dates: string[] }[]>([]);
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);
  const [galleryInitialIndex, setGalleryInitialIndex] = useState<number>(0);


  // New state for handling 400 error
  const [showRoomNotAvailable, setShowRoomNotAvailable] = useState<boolean>(false);

  // Get guest details from Redux
  const { guestDetails } = useSelector((state) => state.hotel);

  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();

  // Initialize Redux with URL parameters
  useEffect(() => {
    const roomsParam = searchParams.get("rooms");
    const adults = searchParams.get("adults");
    const children = searchParams.get("children");
    const infants = searchParams.get("infant");

    if (roomsParam || adults || children || infants) {
      dispatch(
        setGuestDetails({
          rooms: Number(roomsParam) || 1,
          guests: Number(adults) || 1,
          children: Number(children) || 0,
          infants: Number(infants) || 0,
          childAges: Array(Number(children) || 0).fill(0),
        })
      );
    }
  }, [searchParams, dispatch]);

  // Helper function to display guest count information
  const getGuestCountDisplay = () => {
    if (!guestDetails) return t("GuestBox.defaultText", { defaultValue: "1 Room · 1 Adult · 0 Children" });

    const rooms = guestDetails.rooms || 1;
    const adults = guestDetails.guests || 1;
    const children = guestDetails.children || 0;
    const infants = guestDetails.infants || 0;

    let display = `${rooms} ${rooms === 1 ? t("GuestBox.roomSingular") : t("GuestBox.roomsPlural")} · ${adults} ${adults === 1 ? t("GuestBox.adultSingular") : t("GuestBox.adultsPlural")
      }`;

    if (children > 0) {
      display += ` · ${children} ${children === 1 ? t("GuestBox.childSingular") : t("GuestBox.childrenPlural")}`;
    }
    if (infants > 0) {
      display += ` · ${infants} ${infants === 1 ? t("GuestBox.infantSingular") : t("GuestBox.infantsPlural")}`;
    }

    return display;
  };

  // Fetch property details
  useEffect(() => {
    const fetchProperty = async () => {
      if (!propertyId) return;

      try {
        const propertyResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/property/${propertyId}`
        );
        const propDetails = propertyResponse.data.property ||
          propertyResponse.data.data ||
          propertyResponse.data;
        console.log("Property Details:", propDetails);
        console.log("Property Amenities:", propDetails?.property_amenities?.amenities);
        if (!propDetails?.property_amenities?.amenities) {
          console.warn("Property amenities are missing or empty in the API response");
        }
        setPropertyDetails(propDetails);
        setPropertyCode(propDetails.property_code);
        sessionStorage.setItem("propertyCode", propDetails.property_code);
      } catch (error) {
        console.error("Error fetching property:", error);
      }
    };
    fetchProperty();
  }, [propertyId]);


  useEffect(() => {
    const fetchRooms = async () => {
      if (!propertyId || !propertyCode) return;

      setIsLoading(true);
      setShowRoomNotAvailable(false);
      console.log("Fetching rooms for property:", propertyId, "with code:", propertyCode);

      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/room/rooms_by_propertyId2/${propertyId}?numberOfRooms=${guestDetails?.rooms || 1}`,
          {
            startDate: checkInDate,
            endDate: checkOutDate,
            hotelCode: propertyCode,
          }
        );
        const roomData = response.data.data;
        console.log("The room data:", roomData);
        setRooms(response.data);
        setUnavailableRoomTypes(response.data.unavailableRoomTypes || []); // Set unavailable room types

        if (response.data.qrCode) {
          setQrCodeData({
            qrCode: response.data.qrCode,
            couponCode: response.data.couponCode || "",
          });
        }
      } catch (error) {
        console.error("Error fetching rooms:", error);
        if (axios.isAxiosError(error)) {
          setShowRoomNotAvailable(true);
        } else {
          setRooms({ success: true, data: [] });
        }
      } finally {
        setIsLoading(false);
      }
    };
    const fetchAminities = async () => {
      if (!propertyId) return;

      try {
        const amenitiesResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/amenite/${propertyId}`
        );
        const amenitiesData = amenitiesResponse.data.data;
        console.log("Amenities Data:", amenitiesData);
        const amenitiesMap = amenitiesData.reduce((acc: { [key: string]: any }, item: any) => {
          const roomType = item.room_type || "default";
          acc[roomType] = item.amenities;
          return acc;
        }, {});
        console.log("Amenities Map:", amenitiesMap);
        setRoomAmenities(amenitiesMap);
      } catch (error) {
        console.error("Error fetching amenities:", error);
      }
    };

    const fetchData = async () => {
      await fetchRooms();
      await fetchAminities();
    };

    fetchData();
  }, [propertyId, checkInDate, checkOutDate, propertyCode, guestDetails?.rooms]);


  useEffect(() => {
    console.log("The property code we get from api: ", propertyCode);
  }, [propertyCode]);
  useEffect(() => {
    if (showRoomNotAvailable) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showRoomNotAvailable]);

  // Helper function to convert amenities to the expected format
  const convertAmenities = (room: Room) => {
    let roomAmenitiesList: string[] = [];

    // Normalize room_type for case-insensitive matching
    const roomTypeLower = room.room_type.toLowerCase();
    const amenitiesKeys = Object.keys(roomAmenities).reduce((acc, key) => {
      acc[key.toLowerCase()] = roomAmenities[key];
      return acc;
    }, {} as { [key: string]: any });

    // Get amenities for the specific room type, fallback to default
    const amenitiesForRoomType = amenitiesKeys[roomTypeLower] || amenitiesKeys["default"] || {};

    // Log for debugging mismatches
    if (!amenitiesKeys[roomTypeLower] && !amenitiesKeys["default"]) {
      console.warn(`No amenities found for room type "${room.room_type}" and no default amenities available`);
    } else if (!amenitiesKeys[roomTypeLower]) {
      console.log(`Using default amenities for room type "${room.room_type}"`);
    } else {
      console.log(`Found amenities for room type "${room.room_type}"`);
    }

    // Extract amenities from all categories
    Object.values(amenitiesForRoomType).forEach((category: any) => {
      Object.entries(category).forEach(([key, value]) => {
        if (value === true || (typeof value === "string" && value !== "")) {
          // Handle special case for 'bed' which has string values like "double" or "single"
          const readableName = key === "bed" ? `Bed: ${value}` : key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase())
            .trim();
          roomAmenitiesList.push(readableName);
        }
      });
    });

    // Remove duplicates (e.g., combine similar amenities)
    roomAmenitiesList = Array.from(new Set(roomAmenitiesList));

    const convertedAmenities = roomAmenitiesList.map((amenity) => {
      const getIconName = (amenityName: string) => {
        const amenityLower = amenityName.toLowerCase();
        // Comprehensive icon mappings based on Postman data
        if (amenityLower.includes("wifi") || amenityLower.includes("internet")) return "wifi";
        if (amenityLower.includes("air") || amenityLower.includes("ac")) return "snowflake";
        if (amenityLower.includes("smoking")) return "smoking-ban";
        if (amenityLower.includes("bed")) return "bed";
        if (amenityLower.includes("bathroom") || amenityLower.includes("bidet") || amenityLower.includes("toilet") || amenityLower.includes("shower")) return "bathroom";
        if (amenityLower.includes("towels") || amenityLower.includes("towels sheets")) return "towels";
        if (amenityLower.includes("linens") || amenityLower.includes("linens bedding")) return "linens";
        if (amenityLower.includes("toiletries") || amenityLower.includes("shampoo") || amenityLower.includes("conditioner") || amenityLower.includes("soap")) return "toiletries";
        if (amenityLower.includes("hairdryer") || amenityLower.includes("hair dryer")) return "hairDryer";
        if (amenityLower.includes("table") || amenityLower.includes("chairs") || amenityLower.includes("dining table")) return "tableChairs";
        if (amenityLower.includes("desk") || amenityLower.includes("work desk")) return "desk";
        if (amenityLower.includes("dresser") || amenityLower.includes("wardrobe")) return "dresserWardrobe";
        if (amenityLower.includes("seating") || amenityLower.includes("sofa") || amenityLower.includes("reading chair")) return "sofaSeating";
        if (amenityLower.includes("television") || amenityLower.includes("flat screen tv") || amenityLower.includes("satellite") || amenityLower.includes("cable")) return "television";
        if (amenityLower.includes("telephone")) return "telephone";
        if (amenityLower.includes("heating")) return "heating";
        if (amenityLower.includes("refrigerator") || amenityLower.includes("microwave") || amenityLower.includes("kitchenware") || amenityLower.includes("oven") || amenityLower.includes("stovetop")) return "kitchenette";
        if (amenityLower.includes("coffee") || amenityLower.includes("tea") || amenityLower.includes("coffee maker") || amenityLower.includes("electric kettle")) return "coffeeMaker";
        if (amenityLower.includes("smoke detectors")) return "smokeDetectors";
        if (amenityLower.includes("fire extinguisher")) return "fireExtinguisher";
        if (amenityLower.includes("safe")) return "safe";
        if (amenityLower.includes("accessible") || amenityLower.includes("wheelchair") || amenityLower.includes("elevator")) return "accessibility";
        if (amenityLower.includes("ironing")) return "ironing";
        if (amenityLower.includes("dining area") || amenityLower.includes("sitting area")) return "sofaSeating";
        if (amenityLower.includes("balcony")) return "balcony";
        return "check-circle";
      };

      return {
        icon: getIconName(amenity),
        name: t(`RoomsPage.amenitiesList.${amenity.toLowerCase()}`, { defaultValue: amenity }),
      };
    });

    return {
      ...room,
      amenities: convertedAmenities,
      default_image_url: room.image?.[0] || "",
    };
  };

  const handleBookNow = (room: Room) => {
    if (!room.has_valid_rate) return;
    setSelectedRoom(room);
    setIsModalOpen(true);
    dispatch(setRoomId(room._id));

    // Use amountBeforeTax from baseByGuestAmts
    const guestCount = guestDetails?.guests || 1;
    const matchingRate =
      room.baseByGuestAmts?.find((rate) => rate.numberOfGuests === guestCount) ||
      room.baseByGuestAmts?.[0];
    const amount = matchingRate ? matchingRate.amountBeforeTax.toFixed(2) : "0.00";
    dispatch(setAmount(amount));
  };

  const confirmBooking = (formData: {
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
    infants?: number;
    guests?: Guest[];
  }) => {
    console.log("form data", formData);
    const queryParams = new URLSearchParams({
      roomId: formData.roomId,
      propertyId: formData.propertyId,
      currency: selectedRoom?.currency_code || "",
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      email: formData.email,
      phone: formData.phone,
      userId: formData.userId || "",
      hotelName: propertyDetails?.property_name || "",
      ratePlanCode: selectedRoom?.rate_plan_code || "",
      roomType: selectedRoom?.room_type || "",
      ...(formData.rooms ? { rooms: formData.rooms.toString() } : {}),
      ...(formData.adults ? { adults: formData.adults.toString() } : {}),
      ...(formData.children ? { children: formData.children.toString() } : {}),
      ...(formData.infants ? { infants: formData.infants.toString() } : {}),
      ...(formData.guests
        ? { guests: encodeURIComponent(JSON.stringify(formData.guests)) }
        : {}),
    }).toString();
    router.push(`/payment?${queryParams}`);
  };

  // Get unique room types
  const roomTypes = useMemo(() => {
    if (!rooms?.data) return [];
    const types = new Set(rooms.data.map((room) => room.room_type));
    return ["all", ...Array.from(types)];
  }, [rooms]);

  // Filter rooms
  const filteredRooms = useMemo(() => {
    if (!rooms?.data) return [];
    return rooms.data.filter((room) => {
      if (filterType !== "all" && room.room_type !== filterType) return false;
      if (
        searchQuery &&
        !room.room_name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [rooms, filterType, searchQuery]);

  // Helper function to format address
  const getFormattedAddress = (addressObj: any): string => {
    if (!addressObj) return "";
    if (typeof addressObj === "string") return addressObj;

    const parts = [
      addressObj.address_line_1,
      addressObj.address_line_2,
      addressObj.city,
      addressObj.state,
      addressObj.country,
    ].filter(Boolean);

    return parts.join(", ");
  };

  const getAmenityIcon = (amenity: string) => {
    const normalizedAmenity = amenity.toLowerCase();
    switch (normalizedAmenity) {
      case "wifi":
        return <Wifi className="h-4 w-4 text-tripswift-blue" />;
      case "swimming_pool":
        return <Waves className="h-4 w-4 text-tripswift-blue" />;
      case "fitness_center":
        return <Droplets className="h-4 w-4 text-tripswift-blue" />;
      case "spa_and_wellness":
        return <Bath className="h-4 w-4 text-tripswift-blue" />;
      case "restaurant":
        return <Utensils className="h-4 w-4 text-tripswift-blue" />;
      case "room_service":
        return <BellRing className="h-4 w-4 text-tripswift-blue" />;
      case "bar_and_lounge":
        return <Coffee className="h-4 w-4 text-tripswift-blue" />;
      case "parking":
        return <Car className="h-4 w-4 text-tripswift-blue" />;
      case "concierge_services":
        return <BellRing className="h-4 w-4 text-tripswift-blue" />;
      case "pet_friendly":
        return <Dog className="h-4 w-4 text-tripswift-blue" />;
      case "business_facilities":
        return <Briefcase className="h-4 w-4 text-tripswift-blue" />;
      case "laundry_services":
        return <Droplets className="h-4 w-4 text-tripswift-blue" />;
      case "child_friendly_facilities":
        return <Star className="h-4 w-4 text-tripswift-blue" />;
      case "non_smoking_rooms":
        return <Ban className="h-4 w-4 text-tripswift-blue" />;
      case "facilities_for_disabled_guests":
        return <Accessibility className="h-4 w-4 text-tripswift-blue" />;
      case "family_rooms":
        return <Users className="h-4 w-4 text-tripswift-blue" />;
      default:
        return <CheckCircle className="h-4 w-4 text-tripswift-blue" />;
    }
  };

  return (
    <div className="bg-[#F5F7FA] min-h-screen font-noto-sans relative">
      {/* Room Not Available Overlay */}
      {showRoomNotAvailable && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 relative">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>

            {/* Content */}
            <div className="text-center">
              <h3 className="text-xl font-tripswift-semibold text-gray-900 mb-2">
                {t("RoomsPage.noRoomsAvailableTitle")}
              </h3>
              <p className="text-gray-600 mb-6 font-tripswift-regular">
                {t("RoomsPage.noRoomsAvailableMessage")}
              </p>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => router.back()}
                  className="flex-1 bg-tripswift-blue hover:bg-tripswift-blue/90 text-white font-tripswift-medium py-2.5 px-4 rounded-lg transition-colors duration-200"
                >
                  {t("RoomsPage.goBack", { defaultValue: "Go Back" })}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Property Details Section - Using TripSwift classes */}
      <div className="bg-gradient-to-r from-tripswift-blue to-[#054B8F] text-tripswift-off-white">
        <div className="container mx-auto px-4 py-5">
          <div className="flex flex-col md:flex-row items-start  md:items-center gap-4">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center text-sm font-tripswift-medium bg-tripswift-off-white/20 px-3.5 py-2 rounded-full hover:bg-tripswift-off-white/30 transition-colors mb-2 md:mb-0"
            >
              <ChevronLeft
                className={`h-4 w-4  ${i18n.language === "ar" ? "ml-1.5" : "mr-1.5"
                  }`}
              />{" "}
              {t("RoomsPage.backToSearch")}
            </button>
          </div>

          <div className="flex flex-wrap gap-3 mt-3 items-center">
            <div className="flex items-center bg-tripswift-off-white/10 backdrop-blur-sm pl-3.5 pr-4 py-2.5 rounded-xl">
              <Calendar
                className={` h-5 w-5 text-tripswift-off-white/80 ${i18n.language === "ar" ? "ml-2.5" : "mr-2.5"
                  }`}
              />
              <div>
                <div className="text-sm font-tripswift-medium">
                  {i18n.language === "ar"
                    ? `${formatDate(checkOutDate)} - ${formatDate(checkInDate)}`
                    : `${formatDate(checkInDate)} - ${formatDate(checkOutDate)}`}
                </div>
                <div className="text-xs text-tripswift-off-white/80 mt-0.5 font-tripswift-regular">
                  {(() => {
                    const nights = calculateNights(checkInDate, checkOutDate);
                    return (
                      <>
                        {nights}{" "}
                        {nights === 1
                          ? t("RoomsPage.nights")
                          : t("RoomsPage.nightsPlural")}{" "}
                        {t("RoomsPage.stay")}
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Guest Information Display */}
            <div className="flex items-center bg-tripswift-off-white/10 backdrop-blur-sm pl-3.5 pr-4 py-2.5 rounded-xl">
              <Users
                className={`h-5 w-5 text-tripswift-off-white/80 ${i18n.language === "ar" ? "ml-2.5" : "mr-2.5"
                  }`}
              />
              <div>
                <div className="text-sm font-tripswift-medium">
                  {getGuestCountDisplay()}
                </div>
              </div>
            </div>

            {propertyDetails?.star_rating && (
              <div className="flex items-center bg-tripswift-off-white/10 backdrop-blur-sm pl-3.5 pr-4 py-2.5 rounded-xl">
                <Star
                  className={`h-5 w-5 text-yellow-400 ${i18n.language === "ar" ? "ml-2.5" : "mr-2.5"
                    }`}
                />
                <div>
                  <div className="text-sm font-tripswift-medium">
                    {propertyDetails.star_rating}{" "}
                    {t("RoomsPage.starHotelRating")}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4">
        <div className="bg-tripswift-off-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Collapsible header - TripSwift branded */}
          <div
            className="flex justify-between items-center bg-tripswift-blue/5 p-4 cursor-pointer"
            onClick={() => setShowPropertyDetails(!showPropertyDetails)}
          >
            <div>
              <h1 className="text-property-title">
                {propertyDetails?.property_name ||
                  t("RoomsPage.viewPropertyDetails")}
              </h1>
              {propertyDetails?.property_address && (
                <div className="text-location flex items-center text-gray-600 mt-1.5">
                  <MapPin className={`h-4 w-4  text-tripswift-blue flex-shrink-0 ${i18n.language === "ar" ? "ml-2" : "mr-2"}`} />
                  <span className="font-tripswift-regular text-sm">
                    {getFormattedAddress(propertyDetails.property_address)}
                  </span>
                </div>
              )}
            </div>
            <ChevronDown
              className={`h-5 w-5 text-tripswift-black/70 transform transition-transform duration-300 ${showPropertyDetails ? "rotate-180" : ""
                }`}
            />
          </div>

          {showPropertyDetails && (
            <div className="px-4 pt-3 pb-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Property images gallery */}
                <div className="lg:col-span-2">
                  {/* Main container with padding to allow for inner rounded images */}
                  <div className="relative rounded-xl overflow-hidden bg-white shadow-sm p-1.5">
                    {propertyDetails?.image &&
                      Array.isArray(propertyDetails.image) &&
                      propertyDetails.image.length > 0 ? (
                      <>
                        {/* Different layouts based on image count */}
                        {propertyDetails.image.length === 1 ? (
                          /* Single image layout with 4-sided curve */
                          <div
                            className="h-[280px] rounded-xl overflow-hidden cursor-pointer group"
                            onClick={() => {
                              setGalleryInitialIndex(0);
                              setIsGalleryOpen(true);
                            }}
                          >
                            <img
                              src={propertyDetails.image[0]}
                              alt={propertyDetails.property_name || "Property"}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
                          </div>
                        ) : propertyDetails.image.length === 2 ? (
                          /* Two images layout - EACH with 4-sided curve */
                          <div className="grid grid-cols-2 gap-2 h-[280px]">
                            {propertyDetails.image.map((img, index) => (
                              <div
                                key={index}
                                className="relative h-full rounded-xl overflow-hidden cursor-pointer group"
                                onClick={() => {
                                  setGalleryInitialIndex(index);
                                  setIsGalleryOpen(true);
                                }}
                              >
                                <img
                                  src={img}
                                  alt={`${propertyDetails.property_name || "Property"} view ${index + 1}`}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
                                {index === selectedImage && (
                                  <div className="absolute inset-0 shadow-inner ring-2 ring-tripswift-blue/30"></div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : propertyDetails.image.length <= 4 ? (
                          /* 3-4 images layout - EACH with 4-sided curve */
                          <div className="grid grid-cols-2 gap-2 h-[280px]">
                            {/* Main selected image - larger with 4-sided curve */}
                            <div
                              className="col-span-2 md:col-span-1 row-span-2 relative h-full rounded-xl overflow-hidden cursor-pointer group"
                              onClick={() => {
                                setGalleryInitialIndex(selectedImage);
                                setIsGalleryOpen(true);
                              }}
                            >
                              <img
                                src={propertyDetails.image[selectedImage]}
                                alt={propertyDetails.property_name || "Property"}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
                            </div>

                            {/* Grid of other images - each with 4-sided curve */}
                            <div className="hidden md:grid md:grid-cols-1 md:grid-rows-2 gap-2">
                              {propertyDetails.image
                                .filter((_, i) => i !== selectedImage)
                                .slice(0, 2)
                                .map((img, index) => {
                                  const images = propertyDetails?.image;
                                  const originalIndex = images?.findIndex((i) => i === img);
                                  return (
                                    <div
                                      key={index}
                                      className="relative cursor-pointer h-[138px] rounded-xl overflow-hidden group"
                                      onClick={() => {
                                        if (images && Array.isArray(images)) {
                                          const newIndex = images.findIndex((i) => i === img);
                                          if (newIndex !== -1) {
                                            setSelectedImage(newIndex);
                                          }
                                        }
                                      }}
                                      onDoubleClick={() => {
                                        if (originalIndex !== undefined && originalIndex !== -1) {
                                          setGalleryInitialIndex(originalIndex);
                                          setIsGalleryOpen(true);
                                        }
                                      }}
                                    >
                                      <img
                                        src={img}
                                        alt={`Property view ${index + 1}`}
                                        className="w-full h-full object-cover group-hover:opacity-90 group-hover:scale-105 transition-all duration-300"
                                      />
                                    </div>
                                  );
                                })}
                              {propertyDetails.image.length > 3 && selectedImage !== 3 && (
                                <div
                                  className="relative cursor-pointer h-[138px] rounded-xl overflow-hidden group"
                                  onClick={() => setSelectedImage(3)}
                                  onDoubleClick={() => {
                                    setGalleryInitialIndex(3);
                                    setIsGalleryOpen(true);
                                  }}
                                >
                                  <img
                                    src={propertyDetails.image[3]}
                                    alt={`Property view 4`}
                                    className="w-full h-full object-cover group-hover:opacity-90 group-hover:scale-105 transition-all duration-300"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          /* 5+ images layout - EACH with 4-sided curve */
                          <div className="grid grid-cols-4 gap-2 h-[280px]">
                            {/* Main selected image with 4-sided curve */}
                            <div
                              className="col-span-4 md:col-span-2 md:row-span-2 relative h-full rounded-xl overflow-hidden cursor-pointer group"
                              onClick={() => {
                                setGalleryInitialIndex(selectedImage);
                                setIsGalleryOpen(true);
                              }}
                            >
                              <img
                                src={propertyDetails.image[selectedImage]}
                                alt={propertyDetails.property_name || "Property"}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
                            </div>

                            {/* Grid of other images - each with 4-sided curve */}
                            <div className="hidden md:grid md:col-span-2 md:grid-cols-2 md:grid-rows-2 gap-2">
                              {propertyDetails.image
                                .filter((_, i) => i !== selectedImage)
                                .slice(0, 3)
                                .map((img, index) => {
                                  const images = propertyDetails?.image;
                                  const originalIndex = images?.findIndex((i) => i === img);
                                  return (
                                    <div
                                      key={index}
                                      className="relative cursor-pointer rounded-xl overflow-hidden group"
                                      onClick={() => {
                                        if (images && Array.isArray(images)) {
                                          const newIndex = images.findIndex((i) => i === img);
                                          if (newIndex !== -1) {
                                            setSelectedImage(newIndex);
                                          }
                                        }
                                      }}
                                      onDoubleClick={() => {
                                        if (originalIndex !== undefined && originalIndex !== -1) {
                                          setGalleryInitialIndex(originalIndex);
                                          setIsGalleryOpen(true);
                                        }
                                      }}
                                    >
                                      <img
                                        src={img}
                                        alt={`Property view ${index + 1}`}
                                        className="w-full h-full object-cover group-hover:opacity-90 group-hover:scale-105 transition-all duration-300"
                                      />
                                    </div>
                                  );
                                })}

                              {/* Last image with overlay showing more images - with 4-sided curve */}
                              <div
                                className="relative cursor-pointer rounded-xl overflow-hidden group"
                                onClick={() => {
                                  setGalleryInitialIndex(4);
                                  setIsGalleryOpen(true);
                                }}
                              >
                                <img
                                  src={propertyDetails.image[4]}
                                  alt="More property images"
                                  className="w-full h-full object-cover brightness-75 group-hover:brightness-50 transition-all duration-300"
                                />
                                <div className="absolute inset-0 flex items-center justify-center text-tripswift-off-white">
                                  <div className="text-center">
                                    <ImageIcon className="h-6 w-6 mx-auto mb-1" />
                                    <span className="font-tripswift-medium">
                                      +{propertyDetails.image.length - 4}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Navigation controls */}
                        {propertyDetails.image.length > 2 && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const images = propertyDetails.image;
                                if (images && Array.isArray(images) && images.length > 0) {
                                  setSelectedImage((prev) =>
                                    prev <= 0 ? images.length - 1 : prev - 1
                                  );
                                }
                              }}
                              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-tripswift-off-white/70 backdrop-blur-sm rounded-full p-2.5 shadow-sm hover:bg-tripswift-off-white transition-colors duration-300 z-10 group"
                            >
                              <ChevronLeft className="h-5 w-5 text-white group-hover:text-black transition-colors duration-300" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const images = propertyDetails.image;
                                if (images && Array.isArray(images) && images.length > 0) {
                                  setSelectedImage((prev) =>
                                    prev >= images.length - 1 ? 0 : prev + 1
                                  );
                                }
                              }}
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-tripswift-off-white/70 backdrop-blur-sm rounded-full p-2.5 shadow-sm hover:bg-tripswift-off-white transition-colors duration-300 z-10 group"
                            >
                              <ChevronRight className="h-5 w-5 text-white group-hover:text-black transition-colors duration-300" />
                            </button>

                            {/* Counter */}
                            <div className="absolute text-white bottom-4 right-4 bg-tripswift-off-white/70 backdrop-blur-sm text-xs py-1.5 px-4 rounded-full font-tripswift-medium shadow-sm z-10">
                              {selectedImage + 1} / {propertyDetails.image.length}
                            </div>
                          </>
                        )}

                        {/* View all photos button */}
                        {propertyDetails.image.length >= 3 && (
                          <button
                            className="absolute top-4 right-4 bg-tripswift-off-white/70 backdrop-blur-sm text-tripswift-black text-xs font-tripswift-medium px-3.5 py-2 rounded-full shadow-sm flex items-center bg-tripswift-off-white transition-colors duration-300 z-10"
                            onClick={(e) => {
                              e.stopPropagation();
                              setGalleryInitialIndex(selectedImage);
                              setIsGalleryOpen(true);
                            }}
                          >
                            <ImageIcon className="h-3.5 w-3.5 mr-1.5" />
                            {t("RoomsPage.viewAllPhotos", { defaultValue: "View all photos" })}
                          </button>
                        )}

                        {/* Click to view overlay hint */}
                        <div className="absolute top-4 left-4 bg-black/20 backdrop-blur-sm text-white text-xs font-tripswift-medium px-2.5 py-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                          Click to view
                        </div>

                      </>
                    ) : (
                      <div className="w-full h-[280px] rounded-xl flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-gray-300" />
                        <span className="ml-2 text-gray-400 font-tripswift-medium">
                          {t("RoomsPage.noImagesAvailable")}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Image thumbnails with 4-sided curve */}
                  {propertyDetails?.image &&
                    Array.isArray(propertyDetails.image) &&
                    propertyDetails.image.length >= 3 && (
                      <div className="flex mt-3 space-x-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                        {propertyDetails.image.map((img, index) => (
                          <div
                            key={index}
                            onClick={() => setSelectedImage(index)}
                            onDoubleClick={() => {
                              setGalleryInitialIndex(index);
                              setIsGalleryOpen(true);
                            }}
                            className={`w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-xl overflow-hidden cursor-pointer relative transition-all duration-300 group ${selectedImage === index
                              ? "shadow-md scale-105"
                              : "opacity-70 hover:opacity-90"
                              }`}
                            title="Click to select, double-click to view fullscreen"
                          >
                            <img
                              src={img}
                              alt={`Thumbnail ${index + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {selectedImage === index && (
                              <div className="absolute bottom-0 left-0 right-0 h-1 bg-tripswift-blue"></div>
                            )}
                            {/* Fullscreen icon on hover */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                              <ImageIcon className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  {/* Property description */}
                  {/* {propertyDetails?.description && (
                    <div className="mt-4">
                      <h3 className="text-section-heading mb-2">{t('RoomsPage.aboutThisProperty')}</h3>
                      <p className="text-description">
                        {propertyDetails.description}
                      </p>
                    </div>
                  )} */}
                  {/* Property amenities section */}
                  <div className="mt-4">
                    <h3 className="text-section-heading mb-3">
                      {t("RoomsPage.propertyAmenities")}
                    </h3>
                    {propertyDetails?.property_amenities?.amenities &&
                      Object.keys(propertyDetails.property_amenities.amenities).length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(propertyDetails.property_amenities.amenities)
                          .filter(([_, hasAmenity]) => hasAmenity)
                          .map(([amenity]) => (
                            <div
                              key={amenity}
                              className="flex items-center text-xs font-tripswift-medium text-tripswift-blue bg-tripswift-blue/5 border border-tripswift-blue/20 px-2 py-1 rounded-md"
                            >
                              {getAmenityIcon(amenity)}
                              <span className={`capitalize ${i18n.language === "ar" ? "mr-2" : "ml-2"}`}>
                                {t(`RoomsPage.amenitiesList.${amenity}`)}
                              </span>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-description">
                        {t("RoomsPage.noAmenitiesSpecified")}
                      </p>
                    )}
                  </div>
                </div>

                {/* Property amenities and contact info */}
                <div className="lg:col-span-1">

                  {/* Property amenities */}
                  <div className="bg-tripswift-blue/5 p-4 rounded-xl mb-2">
                    {qrCodeData.qrCode && qrCodeData.couponCode && (
                      <QRCodeDisplay qrCode={qrCodeData.qrCode} />
                    )}
                  </div> 

                  {/* Property description */}
                  {propertyDetails?.description && (
                    <div className="mt-4 p-4">
                      <h3 className="text-section-heading mb-2">{t('RoomsPage.aboutThisProperty')}</h3>
                      <p className="text-description">
                        {propertyDetails.description}
                      </p>
                    </div>
                  )}

                  {/* Contact information */}
                  <div className="bg-tripswift-off-white p-4 rounded-xl border border-gray-100">
                    <h3 className="text-section-heading mb-3">
                      {t("RoomsPage.contactInformation")}
                    </h3>
                    <div className="space-y-2">
                      {propertyDetails?.property_contact && (
                        <div className="flex items-center text-description">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-4 w-4 text-tripswift-blue ${i18n.language === "ar" ? "ml-2" : "mr-2"}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                          {propertyDetails.property_contact}
                        </div>
                      )}
                      {propertyDetails?.property_email && (
                        <div className="flex items-center text-description">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-4 w-4 text-tripswift-blue ${i18n.language === "ar" ? "ml-2" : "mr-2"}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                          {propertyDetails.property_email}
                        </div>
                      )}
                      {propertyDetails?.property_address && (
                        <div className="flex items-center text-description">
                          <MapPin className={`h-4 w-4 text-tripswift-blue flex-shrink-0 mb-0.5 ${i18n.language === "ar" ? "ml-2" : "mr-2"}`} />
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
        <div className="bg-tripswift-off-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 mt-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            {/* Room type filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              <div className="text-gray-500 flex items-center mr-1 font-tripswift-medium">
                <Filter className={`h-4 w-4  ${i18n.language === "ar" ? "ml-1.5" : "mr-1.5"}`} /> {t("RoomsPage.filter")}
              </div>
              {roomTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3.5 py-1.5 rounded-lg text-sm whitespace-nowrap font-tripswift-medium transition-colors duration-300 ${filterType === type
                    ? "bg-tripswift-blue text-tripswift-off-white"
                    : "bg-gray-100 text-tripswift-black/70 hover:bg-gray-200"
                    }`}
                >
                  {type === "all" ? t("RoomsPage.allRooms") : type}
                </button>
              ))}
            </div>

            {/* Search input */}
            <div className="relative w-full md:max-w-xs">
              <div className={`absolute inset-y-0 ${i18n.language === "ar" ? "right-0 pr-3" : "left-0 pl-3"} flex items-center pointer-events-none`}>
                <Search className="h-4 w-4 text-tripswift-black/50" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("RoomsPage.searchRoomName")}
                className={`${i18n.language === "ar" ? "pr-10" : "pl-10"} w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-tripswift-regular bg-tripswift-off-white focus:outline-none focus:ring-2 focus:ring-tripswift-blue/30 focus:border-tripswift-blue transition-colors duration-300`}
              />
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-section-heading">
            {t("RoomsPage.availableRooms")}
          </h2>
          <div className="text-sm font-tripswift-medium text-tripswift-black/70 bg-tripswift-blue/5 px-3.5 py-1.5 rounded-lg">
            <span>
              {t("RoomsPage.showingRooms", {
                count: filteredRooms.length,
                defaultValue: filteredRooms.length > 1 ? "Showing {{count}} Rooms" : "Showing {{count}} Room",
              })}
            </span>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="space-y-4">
            <LoadingSkeleton type="room" count={3} />
            <div className="mt-2 text-center text-sm text-gray-500 font-tripswift-regular">
              {t("RoomsPage.loadingRoomsMessage", { defaultValue: "Loading available rooms..." })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && (!filteredRooms || filteredRooms.length === 0) && (
          <div className="bg-tripswift-off-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 mx-auto bg-tripswift-blue/10 rounded-full flex items-center justify-center mb-4">
              <Bed className="h-8 w-8 text-tripswift-blue" />
            </div>
            <h3 className="text-lg font-tripswift-semibold text-tripswift-black mb-2">
              {t("RoomsPage.noRoomsAvailableTitle")}
            </h3>
            <p className="text-description max-w-md mx-auto mb-6">
              {t("RoomsPage.noRoomsAvailableMessage")}
            </p>
            <button
              onClick={() => {
                setFilterType("all");
                setSearchQuery("");
              }}
              className="btn-tripswift-primary px-6 py-2.5 rounded-lg text-sm font-tripswift-medium transition-all duration-300"
            >
              {t("RoomsPage.clearFilters")}
            </button>
          </div>
        )}

        {/* Rooms grid */}
        {!isLoading && filteredRooms.length > 0 && (
          <div className="space-y-3.5">
            {filteredRooms.map((room) => {
              // Determine the price to display
              let displayPrice = t("RoomsPage.priceNotAvailable");
              if (room.has_valid_rate && room.baseByGuestAmts && room.baseByGuestAmts.length > 0) {
                const guestCount = guestDetails?.guests || 1;
                const matchingRate =
                  room.baseByGuestAmts.find((rate) => rate.numberOfGuests === guestCount) ||
                  room.baseByGuestAmts[0];
                displayPrice = `${room.currency_code} ${matchingRate.amountBeforeTax.toFixed(2)}`;
              }

              // Check if the room type is unavailable
              const isUnavailable = unavailableRoomTypes.some(
                (unavailable) => unavailable.roomType === room.room_type
              );

              return (
                <div
                  key={room._id}
                  className={`relative ${isUnavailable ? "blur-sm opacity-60" : ""}`}
                >
                  <RoomCard
                    data={convertAmenities(room)}
                    price={displayPrice}
                    onBookNow={() => handleBookNow(room)}
                    isPriceAvailable={room.has_valid_rate && !isUnavailable} // Disable booking for unavailable rooms
                  />
                  {isUnavailable && (
                    <div className="absolute top-4 left-4 z-20 bg-gray-600 text-tripswift-off-white text-xs font-tripswift-semibold py-1 px-2.5 rounded-full flex items-center shadow-md">
                      {t("RoomsPage.RoomCard.notAvailable")}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <FullscreenGallery
        images={propertyDetails?.image || []}
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        initialIndex={galleryInitialIndex}
        propertyName={propertyDetails?.property_name}
      />

      {/* Guest Information Modal */}
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