"use client";

import React, { useState } from "react";
import Image from "next/image";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import {
  FaStar, FaRegStar, FaWifi, FaSnowflake, FaSmokingBan, FaBed, FaChild, FaUser, FaTree,
  FaCheckCircle, FaShoppingCart, FaPercent, FaTimes, FaInfoCircle, FaRulerCombined
} from "react-icons/fa";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  const DEFAULT_IMAGE = data.default_image_url || "https://images.unsplash.com/photo-1617104678098-de229db51175?q=80&w=1514&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
  const selectedImage = data.image && data.image.length > 0 ? data.image[0] : DEFAULT_IMAGE;

  const router = useRouter();

  const policyType = getPolicyType(data.cancellation_policy);
  const policyStyling = getPolicyStyling(policyType);
  const policyBulletPoints = getPolicyBulletPoints(policyType);

  const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ""));
  const hasOriginalPrice = !!data.original_price;
  const originalPrice = data.original_price || 0;
  const discountPercentage = data.discount_percentage || (
    hasOriginalPrice ? Math.round((1 - (numericPrice / originalPrice)) * 100) : 0
  );
  const hasDiscount = discountPercentage > 0 && hasOriginalPrice;

  const rating = data.rating !== undefined ? data.rating : 5;
  const maxRating = 5;

  const truncateDescription = (text: string, wordLimit: number = 8) => {
    if (!text) return "";
    const words = text.trim().split(/\s+/);
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(" ") + "...";
  };

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
    if (data.amenities && data.amenities.length > 0) {
      return data.amenities.slice(0, 3).map(amenity => ({
        icon: getIconComponent(amenity.icon),
        name: amenity.name
      }));
    }

    const defaultAmenities = [
      { icon: <FaWifi className="text-tripswift-blue" />, name: "Free WiFi" },
      { icon: <FaSnowflake className="text-tripswift-blue" />, name: "Air Conditioning" },
      { icon: <FaBed className="text-tripswift-blue" />, name: "King Bed" },
    ];
    return defaultAmenities;
  };

  const getIconComponent = (iconName: string) => {
    const iconClass = "text-tripswift-blue";
    switch (iconName) {
      case 'wifi': return <FaWifi className={iconClass} />;
      case 'snowflake': return <FaSnowflake className={iconClass} />;
      case 'smoking-ban': return <FaSmokingBan className={iconClass} />;
      case 'bed': return <FaBed className={iconClass} />;
      case 'tree': return <FaTree className={iconClass} />;
      case 'user': return <FaUser className={iconClass} />;
      case 'child': return <FaChild className={iconClass} />;
      default: return <FaCheckCircle className={iconClass} />;
    }
  };

  return (
    <>
      <Card className="w-full min-h-48 shadow-sm hover:shadow-md transition-shadow duration-300 group bg-tripswift-off-white border border-gray-200 rounded-lg flex flex-col sm:flex-row overflow-hidden">
        {/* Image Section */}
        <div className="relative w-full sm:w-[45%] h-48 sm:h-auto flex-shrink-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-10"></div>
          <Image
            src={selectedImage}
            alt={`${data.room_name || "Room"} image`}
            layout="fill"
            objectFit="cover"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = DEFAULT_IMAGE;
            }}
          />

          {/* Discount tag */}
          {hasDiscount && (
            <div className="absolute top-3 left-3 z-20 bg-red-600 text-tripswift-off-white text-xs font-tripswift-semibold py-1 px-2.5 rounded-full flex items-center shadow-md">
              <FaPercent className="h-2.5 w-2.5 mr-1" /> {discountPercentage}% OFF
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="w-full sm:w-[55%] flex flex-col p-3 sm:p-4">
          {/* Header */}
          <CardHeader className="p-0 pb-2 flex-shrink-0">
            <div className="flex justify-between items-start">
              <CardTitle className="text-room-title text-xl font-tripswift-semibold text-gray-800 tracking-tight">
                {data.room_name} - {data.room_type}
              </CardTitle>
              <div className="flex items-center text-yellow-400 gap-0.5">
                {Array.from({ length: maxRating }).map((_, i) => (
                  i < Math.floor(rating) ? (
                    <FaStar key={i} className="h-3.5 w-3.5" />
                  ) : i < rating ? (
                    <FaStar key={i} className="h-3.5 w-3.5 opacity-60" />
                  ) : (
                    <FaRegStar key={i} className="h-3.5 w-3.5" />
                  )
                ))}
              </div>
            </div>
            <p className="text-description line-clamp-2 mt-1">
              {truncatedDescription}
            </p>
          </CardHeader>

          {/* Content */}
          <CardContent className="p-0 pt-1 flex-grow flex flex-col gap-2">
            {/* Room specs section */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 p-1.5 rounded-md">
              <div className="flex items-center text-xs font-tripswift-medium text-gray-700">
                <FaUser className="mr-1.5 h-3 w-3 text-tripswift-blue" />
                <span>{data.max_number_of_adults} adults</span>
              </div>
              {data.max_number_of_children > 0 && (
                <div className="flex items-center text-xs font-tripswift-medium text-gray-700">
                  <FaChild className="mr-1.5 h-3 w-3 text-tripswift-blue" />
                  <span>{data.max_number_of_children} children</span>
                </div>
              )}
              {data.room_size > 0 && (
                <div className="flex items-center text-xs font-tripswift-medium text-gray-700">
                  <FaRulerCombined className="mr-1.5 h-3 w-3 text-tripswift-blue" />
                  <span>{data.room_size} {data.room_unit || "m²"}</span>
                </div>
              )}
            </div>

            {/* Enhanced Amenities Display */}
            <div className="flex flex-wrap gap-x-2 gap-y-1.5">
              {getRoomAmenities().map((amenity, index) => (
                <div key={index} className="flex items-center text-xs bg-blue-50 text-tripswift-blue/80 font-tripswift-medium px-2 py-1 rounded-full">
                  {React.cloneElement(amenity.icon, { className: "h-3 w-3 mr-1.5" })}
                  <span className="truncate">{amenity.name}</span>
                </div>
              ))}
            </div>

            {/* Enhanced Cancellation Policy Indicator */}
            <div className={`flex items-center text-xs font-tripswift-medium px-2 py-1.5 rounded-md ${policyType === "Flexible"
              ? " text-green-700 "
              : " text-amber-700 "
              }`}>
              {policyType === "Flexible" ? (
                <>
                  <FaCheckCircle className="mr-1.5 h-3 w-3" />
                  <span>Free cancellation</span>
                </>
              ) : (
                <>
                  <FaInfoCircle className="mr-1.5 h-3 w-3" />
                  <span>Non-refundable</span>
                </>
              )}
              <button
                onClick={() => setShowPolicyModal(true)}
                className="ml-1.5 underline hover:text-tripswift-blue transition-colors text-xs font-tripswift-regular"
              >
                Details
              </button>
            </div>

            {/* Price and Button */}
            <div className="mt-auto pt-2 border-t border-gray-100 flex items-center justify-between">
            <div className="flex flex-col">
                {hasDiscount && (
                  <span className="text-xs line-through text-gray-500 font-tripswift-regular">₹{originalPrice}</span>
                )}
                <div className="flex items-baseline">
                  <span className="text-price">{price}</span>
                  <span className="text-gray-500 text-xs ml-1.5 font-tripswift-regular">Per Night</span>
                </div>
              </div>
              <button
                onClick={handleBookNow}
                className="bg-tripswift-blue hover:bg-[#054B8F] active:bg-[#03315c] text-tripswift-off-white font-tripswift-semibold py-2 px-4 rounded-md text-sm flex items-center transition-colors duration-300 shadow-sm hover:shadow-md"
              >
                <FaShoppingCart className="mr-1.5 h-3 w-3" /> Book Now
              </button>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Policy Modal */}
      {showPolicyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-tripswift-off-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between bg-tripswift-blue text-tripswift-off-white px-4 py-3">
              <h3 className="text-lg font-tripswift-semibold">Booking Policies</h3>
              <button
                onClick={() => setShowPolicyModal(false)}
                className="text-tripswift-off-white hover:bg-[#054B8F] active:bg-[#03315c] rounded-full p-1 transition-colors"
                aria-label="Close modal"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-5">
              <div className="mb-6">
                <h4 className="text-section-heading flex items-center mb-3">
                  <span className={`inline-block w-3 h-3 rounded-full mr-2 ${policyType === "Flexible"
                      ? "bg-green-500"
                      : policyType === "Moderate"
                        ? "bg-tripswift-blue"
                        : policyType === "Strict"
                          ? "bg-amber-500"
                          : "bg-red-500"
                    }`}></span>                  Cancellation Policy
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded ${policyStyling.bgColor} ${policyStyling.textColor} font-tripswift-medium`}>
                    {policyType}
                  </span>
                </h4>

                <div className="mb-4">
                  <ul className="list-disc pl-5 space-y-1.5 text-description">
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
                <h4 className="text-section-heading flex items-center mb-3">
                  <FaInfoCircle className="mr-2 text-tripswift-blue" />
                  Amendment Policy
                </h4>

                <div className="mb-4">
                  <ul className="list-disc pl-5 space-y-1.5 text-description">
                    <li>Date changes are subject to availability</li>
                    <li>Changes within 72 hours of check-in may incur additional fees</li>
                    <li>Room upgrades are subject to availability and additional charges</li>
                    <li>Reducing stay length is subject to the cancellation policy</li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => setShowPolicyModal(false)}
                className="mt-2 w-full bg-tripswift-blue hover:bg-[#054B8F] active:bg-[#03315c] text-tripswift-off-white font-tripswift-semibold py-2.5 px-4 rounded transition-colors duration-300 shadow-sm"
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