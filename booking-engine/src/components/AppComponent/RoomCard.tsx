import React, { useState } from "react";
import Image from "next/image";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import {
  FaStar, FaRegStar, FaWifi, FaSnowflake, FaSmokingBan, FaBed, FaChild, FaUser, FaTree,
  FaCheckCircle, FaShoppingCart, FaPercent, FaTimes, FaInfoCircle
} from "react-icons/fa";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getPolicyType, getPolicyStyling, getPolicyBulletPoints } from "@/utils/cancellationPolicies";

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
  amenities?: { icon: string; name: string }[];
  room_details_url?: string;
  default_image_url?: string;
}

interface RoomCardProps {
  data: RoomData;
  price: string;
  onBookNow: () => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({ data, price, onBookNow }) => {
  // State for policy modal
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  // Default image URL - use from data or fall back to default
  const DEFAULT_IMAGE = data.default_image_url || "https://images.unsplash.com/photo-1617104678098-de229db51175?q=80&w=1514&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  // Safely get the image URL, checking for undefined or empty array
  const selectedImage = data.image && data.image.length > 0 ? data.image[0] : DEFAULT_IMAGE;

  const router = useRouter();

  // Get cancellation policy information
  const policyType = getPolicyType(data.cancellation_policy);
  const policyStyling = getPolicyStyling(policyType);
  const policyBulletPoints = getPolicyBulletPoints(policyType);

  // Format price for display
  const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
  const hasOriginalPrice = !!data.original_price;
  const originalPrice = data.original_price || 0;
  const discountPercentage = data.discount_percentage || (
    hasOriginalPrice ? Math.round((1 - (numericPrice / originalPrice)) * 100) : 0
  );
  const hasDiscount = discountPercentage > 0 && hasOriginalPrice;

  // Determine star rating (default to 5 if not provided)
  const rating = data.rating !== undefined ? data.rating : 5;
  const maxRating = 5;

  // Function to truncate description to 5 words
  const truncateDescription = (text: string, wordLimit: number = 5) => {
    if (!text) return "";
    const words = text.trim().split(/\s+/);
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(" ") + "...";
  };

  // Truncated description
  const truncatedDescription = truncateDescription(data.description);

  const handleBookNow = () => {
    const accessToken = Cookies.get("accessToken");
    if (!accessToken) {
      const fullUrl = window.location.href;
      Cookies.set("redirectAfterLogin", fullUrl);
      router.push("/login");
    } else {
      onBookNow();
    }
  };

  const getRoomAmenities = () => {
    // Use provided amenities if available
    if (data.amenities && data.amenities.length > 0) {
      return data.amenities.map(amenity => ({
        // Convert string icon names to actual icon components
        icon: getIconComponent(amenity.icon),
        name: amenity.name
      }));
    }

    // Fallback to default amenities
    const defaultAmenities = [
      { icon: <FaWifi />, name: "Free WiFi" },
      { icon: <FaSnowflake />, name: "Air Conditioning" },
      { icon: <FaSmokingBan />, name: data.smoking_policy === "Non-Smoking" ? "Non-Smoking" : "Smoking Allowed" },
      { icon: <FaBed />, name: `${data.number_of_bedrooms} Bedrooms` },
    ];
    return defaultAmenities;
  };

  // Helper to convert string icon names to components
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'wifi': return <FaWifi />;
      case 'snowflake': return <FaSnowflake />;
      case 'smoking-ban': return <FaSmokingBan />;
      case 'bed': return <FaBed />;
      case 'tree': return <FaTree />;
      case 'user': return <FaUser />;
      case 'child': return <FaChild />;
      default: return <FaCheckCircle />;
    }
  };

  return (
    <>
      <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group bg-white">
        {/* Room label and discount tag */}
        {hasDiscount && (
          <div className="absolute top-0 right-0 z-10 bg-red-600 text-white text-sm font-bold py-1 px-3 rounded-bl-lg">
            {discountPercentage}% OFF
          </div>
        )}

        {/* Room image */}
        <div className="relative w-full h-52">
          <Image
            src={selectedImage}
            alt={`${data.room_name || 'Room'} image`}
            layout="fill"
            objectFit="cover"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = DEFAULT_IMAGE;
            }}
          />

          {/* Room capacity indicator overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white px-4 py-2 flex items-center justify-between">
            <div className="flex items-center">
              <FaUser className="mr-1" />
              <span className="text-sm">{data.max_number_of_adults} adults</span>
              {data.max_number_of_children > 0 && (
                <>
                  <FaChild className="ml-2 mr-1" />
                  <span className="text-sm">{data.max_number_of_children} children</span>
                </>
              )}
            </div>
            <span className="text-sm">{data.room_size} {data.room_unit}</span>
          </div>
        </div>

        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl text-blue-700 font-bold">
              {data.room_name}
            </CardTitle>
            <div className="flex items-center text-yellow-400 gap-0.5">
              {/* Dynamic star rating */}
              {Array.from({ length: maxRating }).map((_, i) => (
                i < Math.floor(rating) ? (
                  <FaStar key={i} />
                ) : i < rating ? (
                  // Handle half stars if needed
                  <FaStar key={i} className="opacity-60" />
                ) : (
                  <FaRegStar key={i} />
                )
              ))}
            </div>
          </div>
          
          {/* Updated description with 5-word limit */}
          <p className="text-gray-600 mt-1">
            {truncatedDescription}
          </p>
        </CardHeader>

        <CardContent className="pt-0 pb-3">
          {/* Room type and view */}
          <div className="mb-3 flex flex-wrap gap-2">
            <span className="inline-block bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded">
              {data.room_type}
            </span>
            {data.room_view && (
              <span className="inline-block bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded">
                <FaTree className="inline mr-1" /> {data.room_view} view
              </span>
            )}
          </div>

          {/* Amenities */}
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-4">
            {getRoomAmenities().map((amenity, index) => (
              <div key={index} className="flex items-center text-sm text-gray-600">
                <span className="text-blue-500 mr-2">{amenity.icon}</span>
                <span>{amenity.name}</span>
              </div>
            ))}
          </div>

          {/* Cancellation policy summary */}
          <div className={`flex items-center text-xs font-medium ${policyType === "Flexible" ? "text-green-700" : "text-amber-700"} mt-1 mb-2`}>
            {policyType === "Flexible" ? (
              <>
                <FaCheckCircle className="mr-1.5" />
                <span>Free cancellation</span>
              </>
            ) : (
              <>
                <FaInfoCircle className="mr-1.5" />
                <span>Non-refundable</span>
              </>
            )}
            <button
              onClick={() => setShowPolicyModal(true)}
              className="ml-2 underline hover:text-blue-600 transition-colors"
            >
              Details
            </button>
          </div>

          {/* Price information */}
          <div className="flex flex-col">
            {hasDiscount && (
              <div className="flex items-center mb-1">
                <span className="text-gray-500 line-through text-sm">${originalPrice.toFixed(2)}</span>
                <span className="ml-2 bg-red-100 text-red-800 text-xs font-semibold px-1.5 py-0.5 rounded flex items-center">
                  <FaPercent className="mr-1" size={10} /> {discountPercentage}% OFF
                </span>
              </div>
            )}
            <div className="flex items-baseline">
              <span className="text-2xl font-bold text-blue-700">{price}</span>
              <span className="text-gray-500 text-sm ml-1">per night</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="bg-gray-50 border-t border-gray-100 pt-4 pb-4 flex flex-col">
          <div className="flex space-x-2 w-full">
            <button
              onClick={handleBookNow}
              className="flex-grow bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded flex items-center justify-center transition-colors"
            >
              <FaShoppingCart className="mr-2" /> Book Now
            </button>
          </div>
        </CardFooter>
      </Card>

      {/* Policy Modal */}
      {showPolicyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between bg-blue-600 text-white px-4 py-3">
              <h3 className="text-lg font-medium">Booking Policies</h3>
              <button
                onClick={() => setShowPolicyModal(false)}
                className="text-white hover:bg-blue-700 rounded-full p-1"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-5">
              {/* Cancellation Policy Section */}
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-800 flex items-center mb-3">
                  <span className={`inline-block w-3 h-3 rounded-full mr-2 bg-${policyStyling.color}-500`}></span>
                  Cancellation Policy
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded ${policyStyling.bgColor} ${policyStyling.textColor}`}>
                    {policyType}
                  </span>
                </h4>

                <div className="mb-4 text-sm">
                  <ul className="list-disc pl-5 space-y-1 text-gray-700">
                    {policyBulletPoints.map((point, idx) => (
                      <li key={idx}>
                        <span className={point.color}>{point.text.split(':')[0]}:</span>
                        {point.text.split(':')[1]}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Amendment Policy Section */}
              <div>
                <h4 className="text-lg font-medium text-gray-800 flex items-center mb-3">
                  <FaInfoCircle className="mr-2 text-blue-500" />
                  Amendment Policy
                </h4>

                <div className="mb-4 text-sm">
                  <ul className="list-disc pl-5 space-y-1 text-gray-700">
                    <li>Date changes are subject to availability</li>
                    <li>Changes within 72 hours of check-in may incur additional fees</li>
                    <li>Room upgrades are subject to availability and additional charges</li>
                    <li>Reducing stay length is subject to the cancellation policy</li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => setShowPolicyModal(false)}
                className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};