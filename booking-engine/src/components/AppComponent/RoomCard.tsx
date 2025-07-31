"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { logout } from "@/Redux/slices/auth.slice";
import { useTranslation } from "react-i18next";
import {
  FaShower, FaThermometerHalf, FaPhone, FaTv, FaCouch, FaChair, FaDoorClosed, FaDesktop, FaWifi, FaSnowflake, FaSmokingBan, FaBed, FaChild, FaUser, FaTree,
  FaCheckCircle, FaPercent, FaTimes, FaInfoCircle, FaRulerCombined, FaBath, FaShieldAlt, FaChevronLeft, FaChevronRight
} from "react-icons/fa";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getPolicyType, getPolicyStyling, getPolicyBulletPoints } from "@/utils/cancellationPolicies";

interface RoomData {
  _id: string;
  currency_code: string;
  available_rooms?: number;
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
  amenities?: { icon: string; name: string }[];
  description?: string;
  max_number_of_adults?: number;
  max_number_of_children?: number;
  room_unit?: string;
  room_view?: string;
  cancellation_policy?: string;
  original_price?: number;
  discount_percentage?: number;
  rating?: number;
}

interface RoomCardProps {
  data: RoomData;
  price: string;
  onBookNow: () => void;
  isPriceAvailable: boolean;
}

export const RoomCard: React.FC<RoomCardProps> = ({
  data,
  price,
  onBookNow,
  isPriceAvailable
}) => {
  const { t } = useTranslation();
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1617104678098-de229db51175?q=80&w=1514&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
  const selectedImage = data.image && data.image.length > 0 ? data.image[0] : DEFAULT_IMAGE;
  const router = useRouter();
  const dispatch = useDispatch();
  const policyType = getPolicyType(data.cancellation_policy);
  const policyStyling = getPolicyStyling(policyType);
  const policyBulletPoints = getPolicyBulletPoints(policyType, t);
  const hasOriginalPrice = !!data.original_price;
  const originalPrice = data.original_price || 0;
  const discountPercentage = data.discount_percentage || 0;
  const hasDiscount = discountPercentage > 0 && hasOriginalPrice;
  const rating = data.rating !== undefined ? data.rating : 5;
  const maxRating = 5;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const truncateDescription = (text: string, wordLimit: number = 8) => {
    if (!text) return "";
    const words = text.trim().split(/\s+/);
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(" ");
  };
  const truncatedDescription = truncateDescription(data.description || "");
  const hasLongDescription = data.description && data.description.trim().split(/\s+/).length > 8;

  const [showFullDescription, setShowFullDescription] = useState(false);
  const handleBookNow = () => {
    if (!isPriceAvailable) return;
    const accessToken = Cookies.get("accessToken");
    if (!accessToken) {
      const fullUrl = window.location.href;
      Cookies.set("redirectAfterLogin", fullUrl);
      router.push("/login");
      dispatch(logout());
      return;
    }
    try {
      const decodedToken: { exp: number } = jwtDecode(accessToken);
      const currentTime = Math.floor(Date.now() / 1000);

      if (decodedToken.exp < currentTime) {
        Cookies.remove("accessToken");
        const fullUrl = window.location.href;
        Cookies.set("redirectAfterLogin", fullUrl);
        router.push("/login");
        dispatch(logout());
        return;
      }

      onBookNow();

    } catch (error) {
      Cookies.remove("accessToken");
      const fullUrl = window.location.href;
      Cookies.set("redirectAfterLogin", fullUrl);
      router.push("/login");
      dispatch(logout());
    }
  };

  const getRoomAmenities = () => {
    if (data.amenities && data.amenities.length > 0) {
      return data.amenities.map((amenity) => ({
        icon: getIconComponent(amenity.icon),
        name: amenity.name,
      }));
    }

    const defaultAmenities = [
      { icon: <FaBed className="text-tripswift-blue" />, name: t('RoomsPage.RoomCard.amenities.kingBed') },
      { icon: <FaBath className="text-tripswift-blue" />, name: t('RoomsPage.RoomCard.amenities.bathroom') },
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
      case 'bathroom': return <FaBath className={iconClass} />;
      case 'towels': return <FaShower className={iconClass} />;
      case 'linens': return <FaBed className={iconClass} />;
      case 'tableChairs': return <FaChair className={iconClass} />;
      case 'desk': return <FaDesktop className={iconClass} />;
      case 'dresserWardrobe': return <FaDoorClosed className={iconClass} />;
      case 'sofaSeating': return <FaCouch className={iconClass} />;
      case 'television': return <FaTv className={iconClass} />;
      case 'telephone': return <FaPhone className={iconClass} />;
      case 'heating': return <FaThermometerHalf className={iconClass} />;
      default: return <FaCheckCircle className={iconClass} />;
    }
  };
  const { i18n } = useTranslation();
  useEffect(() => {
    if (showPolicyModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showPolicyModal]);
  return (
    <>
      <Card className="w-full min-h-48 shadow-sm hover:shadow-md transition-shadow duration-300 bg-tripswift-off-white border border-gray-200 rounded-xl flex flex-col md:flex-row overflow-hidden font-noto-sans">
        {/* Image Section */}
        <div className="relative w-full md:w-[45%] h-48 md:h-auto flex-shrink-0 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-10"></div>

          {/* Main Image */}
          <Image
            src={data.image && data.image.length > 0 ? data.image[currentImageIndex] : DEFAULT_IMAGE}
            alt={`${data.room_name || t('RoomsPage.RoomCard.roomImageAlt')} image ${currentImageIndex + 1}`}
            layout="fill"
            objectFit="cover"
            className="w-full h-full object-cover transition-transform"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = DEFAULT_IMAGE;
            }}
          />

          {/* Navigation arrows - only show if multiple images */}
          {data.image && data.image.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(prev =>
                    prev === 0 ? data.image!.length - 1 : prev - 1
                  );
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                aria-label="Previous image"
              >
                <FaChevronLeft className="h-3 w-3" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(prev =>
                    prev === data.image!.length - 1 ? 0 : prev + 1
                  );
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                aria-label="Next image"
              >
                <FaChevronRight className="h-3 w-3" />
              </button>
            </>
          )}

          {/* Image indicators - only show if multiple images */}
          {data.image && data.image.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
              {data.image.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentImageIndex
                    ? 'bg-white'
                    : 'bg-white/50 hover:bg-white/75'
                    }`}
                  aria-label={`View image ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Image counter */}
          {data.image && data.image.length > 1 && (
            <div className="absolute top-3 right-3 z-20 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
              {currentImageIndex + 1}/{data.image.length}
            </div>
          )}

          {/* Existing discount tag */}
          {isPriceAvailable && hasDiscount && (
            <div className="absolute top-3 left-3 z-20 bg-red-600 text-tripswift-off-white text-xs font-tripswift-semibold py-1 px-2.5 rounded-full flex items-center shadow-md">
              <FaPercent className="h-2.5 w-2.5 mr-1" /> {discountPercentage}% {t('RoomsPage.RoomCard.off')}
            </div>
          )}

          {/* Existing Not Available Badge */}
          {!isPriceAvailable && (
            <div className="absolute top-3 left-3 z-20 bg-gray-600 text-tripswift-off-white text-xs font-tripswift-semibold py-1 px-2.5 rounded-full flex items-center shadow-md">
              {t('RoomsPage.RoomCard.notAvailable')}
            </div>
          )}
        </div>


        {/* Details Section */}
        <div className="w-full md:w-[55%] flex flex-col p-3 sm:p-4">
          {/* Header */}
          <CardHeader className="p-0 pb-2 flex-shrink-0">
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-1.5">
                <h3 className="text-room-title">
                  {data.room_name} - {data.room_type}
                </h3>

                {/* Available number of rooms */}
                {/* <span className="flex items-center text-red-600 semibold text-sm">
                  <svg className="w-4 h-4 mr-1 fill-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                    <path d="M8 0a8 8 0 1 0 8 8A8 8 0 0 0 8 0zm.93 12.588a1.07 1.07 0 1 1-1.07-1.07 1.07 1.07 0 0 1 1.07 1.07zM8.93 4.412l-.25 4a.682.682 0 0 1-1.36 0l-.25-4a.682.682 0 0 1 1.36 0z" />
                  </svg>
                  Only {data.available_rooms} left on our site
                </span> */}
              </div>

              {/* <div className="flex items-center text-yellow-400 gap-0.5 pt-1">
                {Array.from({ length: maxRating }).map((_, i) => (
                  i < Math.floor(rating) ? (
                    <FaStar key={i} className="h-3.5 w-3.5" />
                  ) : i < rating ? (
                    <FaStar key={i} className="h-3.5 w-3.5 opacity-60" />
                  ) : (
                    <FaRegStar key={i} className="h-3.5 w-3.5" />
                  )
                ))}
              </div> */}
            </div>
            <div className="mt-1">
              <p className="text-description">
                {showFullDescription ? (
                  <>
                    {data.description}
                    {hasLongDescription && (
                      <button
                        onClick={() => setShowFullDescription(false)}
                        className="text-xs text-tripswift-blue hover:text-[#054B8F] font-tripswift-medium ml-1 transition-colors duration-200 inline-flex items-center"
                      >
                        ({t('RoomsPage.RoomCard.showLess')})
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    {truncatedDescription}
                    {hasLongDescription && (
                      <>
                        <span className="text-tripswift-black/40">... </span>
                        <button
                          onClick={() => setShowFullDescription(true)}
                          className="text-xs text-tripswift-blue hover:text-[#054B8F] font-tripswift-medium transition-colors duration-200 inline-flex items-center"
                        >
                          ({t('RoomsPage.RoomCard.seeMore')})
                        </button>
                      </>
                    )}
                  </>
                )}
              </p>
            </div>
          </CardHeader>

          {/* Content */}
          <CardContent className="p-0 pt-1 flex-grow flex flex-col gap-2">
            {/* Room specs section */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 p-1.5 rounded-md">
              <div className="flex items-center text-xs font-tripswift-medium text-tripswift-black/70">
                <FaUser className={` h-3 w-3 text-tripswift-blue ${i18n.language === "ar" ? "ml-2" : "mr-2"}`} />
                <span>
                  {data.max_number_of_adults || data.max_occupancy} {t('RoomsPage.RoomCard.adults')}
                </span>
              </div>

              {(data.max_number_of_children || 0) > 0 && (
                <div className="flex items-center text-xs font-tripswift-medium text-tripswift-black/70">
                  <FaChild className={` h-3 w-3 text-tripswift-blue ${i18n.language === "ar" ? "ml-2" : "mr-2"}`} />
                  <span>{data.max_number_of_children} {t('RoomsPage.RoomCard.children')}</span>
                </div>
              )}

              {data.room_size > 0 && (
                <div className="flex items-center text-xs font-tripswift-medium text-tripswift-black/70">
                  <FaRulerCombined className={` h-3 w-3 text-tripswift-blue ${i18n.language === "ar" ? "ml-2" : "mr-2"}`} />
                  <span>{data.room_size} {data.room_unit || "m²"}</span>
                </div>
              )}

              {data.room_view && (
                <div className="flex flex-wrap gap-1.5">
                  <span className="bg-tripswift-blue/5 text-tripswift-black/70 text-xs px-0.5 py-1 rounded-full font-tripswift-medium inline-flex items-center">
                    <FaTree className={` h-3 w-3 text-tripswift-blue ${i18n.language === "ar" ? "ml-2" : "mr-2"}`} />
                    {data.room_view}
                  </span>
                </div>
              )}
            </div>

            {/* Enhanced Amenities Display */}
            <div className="flex flex-wrap gap-x-2 gap-y-1.5">
              {getRoomAmenities().map((amenity, index) => (
                <div key={index} className="flex items-center text-xs bg-blue-50 text-tripswift-blue/80 font-tripswift-medium px-2 py-1 rounded-full">
                  {React.cloneElement(amenity.icon, { className: ` h-3 w-3  ${i18n.language === "ar" ? "ml-2" : "mr-2"}` })}
                  <span className="truncate">{amenity.name}</span>
                </div>
              ))}
            </div>

            {/* Price and Button */}
            <div className="mt-auto pt-2 border-t border-gray-100 flex items-center justify-between">
              <div className="flex flex-col">
                {isPriceAvailable && hasDiscount && (
                  <span className="text-xs line-through text-tripswift-black/60 font-tripswift-regular">
                    {data.currency_code} {originalPrice}
                  </span>
                )}
                <div className="flex items-baseline">
                  <span className={`text-price ${!isPriceAvailable ? "text-gray-500" : ""}`}>
                    {price}
                  </span>
                  {isPriceAvailable && (
                    <span className={`text-tripswift-black/60 text-lg  font-tripswift-regular ${i18n.language === "ar" ? "mr-2" : "ml-2"}`}>
                      / {t('RoomsPage.RoomCard.night')}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={handleBookNow}
                disabled={!isPriceAvailable}
                className={`font-tripswift-semibold py-2 px-4 rounded-md text-sm flex items-center transition-colors duration-300 shadow-sm hover:shadow-md
                  ${isPriceAvailable
                    ? "bg-tripswift-blue hover:bg-[#054B8F] active:bg-[#03315c] text-tripswift-off-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"}
                `}
              >
                {isPriceAvailable ? (
                  <>
                    {/* <FaShoppingCart className="mr-1.5 h-3 w-3" />  */}
                    {t('RoomsPage.RoomCard.bookNow')}
                  </>
                ) : (
                  t('RoomsPage.RoomCard.notAvailable')
                )}
              </button>
            </div>

            {/* Policy details link - hidden on smallest screens, visible on sm and up */}
            <div className=" pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2 sm:gap-0">
              <button
                onClick={() => setShowPolicyModal(true)}
                className="text-xs text-tripswift-black/60 hover:text-tripswift-blue transition-colors duration-300 flex items-center font-tripswift-regular"
              >
                <FaInfoCircle className={` h-3 w-3  ${i18n.language === "ar" ? "ml-2" : "mr-2"}`} /> {t('RoomsPage.RoomCard.viewBookingPolicies')}
              </button>

              <div className="flex items-center text-xs text-tripswift-black/60 font-tripswift-regular">
                <FaShieldAlt className={` h-3 w-3 text-green-600  ${i18n.language === "ar" ? "ml-2" : "mr-2"}`} />
                <span>{t('RoomsPage.RoomCard.securePayment')}</span>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Policy Modal */}
      {showPolicyModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowPolicyModal(false)} // Close on backdrop click
        >
          <div
            className="bg-tripswift-off-white rounded-lg shadow-xl w-full max-w-md overflow-hidden my-8"
            onClick={(e) => e.stopPropagation()} // Prevent modal close when clicking inside
          >
            <div className="flex items-center justify-between bg-tripswift-blue text-tripswift-off-white px-4 py-3">
              <h3 className="text-lg font-tripswift-semibold">{t('RoomsPage.RoomCard.policies.title')}</h3>
              <button
                onClick={() => setShowPolicyModal(false)}
                className="text-tripswift-off-white hover:bg-[#054B8F] active:bg-[#03315c] rounded-full p-1 transition-colors duration-300"
                aria-label={t('RoomsPage.RoomCard.policies.closeModal')}
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-5 max-h-[70vh] overflow-y-auto">
              {/* Rest of your modal content remains the same */}
              <div className="mb-6">
                <h4 className="text-section-heading flex items-center mb-3">
                  <span className={`inline-block w-3 h-3 rounded-full mr-2 ${policyType === "Flexible"
                    ? "bg-green-500"
                    : policyType === "Moderate"
                      ? "bg-tripswift-blue"
                      : policyType === "Strict"
                        ? "bg-amber-500"
                        : "bg-red-500"
                    }`}></span>
                  {t('RoomsPage.RoomCard.policies.cancellationPolicy')}
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded ${policyStyling.bgColor} ${policyStyling.textColor} font-tripswift-medium`}>
                    {t(`RoomsPage.RoomCard.policies.policyTypes.${policyType.toLowerCase()}`)}
                  </span>
                </h4>

                <div className="mb-4">
                  <ul className="list-disc pl-5 space-y-1.5 text-description">
                    {policyBulletPoints.map((point, idx) => (
                      <li key={idx} className="flex">
                        <span className={`font-medium ${point.color}`}>{point.text.split(':')[0]}:</span>
                        <span className="ml-1">{point.text.split(':')[1]}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Amendment Policy Section */}
              <div>
                <h4 className="text-section-heading flex items-center mb-3">
                  <FaInfoCircle className="mr-2 text-tripswift-blue" />
                  {t('RoomsPage.RoomCard.policies.amendmentPolicy')}
                </h4>

                <div className="mb-4">
                  <ul className="list-disc pl-5 space-y-1.5 text-description">
                    <li>{t('RoomsPage.RoomCard.policies.amendmentPoints.dateChanges')}</li>
                    <li>{t('RoomsPage.RoomCard.policies.amendmentPoints.changes72Hours')}</li>
                    <li>{t('RoomsPage.RoomCard.policies.amendmentPoints.roomUpgrades')}</li>
                    <li>{t('RoomsPage.RoomCard.policies.amendmentPoints.reducingStay')}</li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => setShowPolicyModal(false)}
                className="mt-2 w-full bg-tripswift-blue hover:bg-[#054B8F] active:bg-[#03315c] text-tripswift-off-white font-tripswift-semibold py-2.5 px-4 rounded-lg transition-colors duration-300 shadow-sm"
              >
                {t('RoomsPage.RoomCard.policies.gotIt')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};