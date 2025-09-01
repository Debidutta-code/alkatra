// src/components/hotelListingComponents/HotelCardItem.tsx
import React from "react";
import { MapPin, Star, Coffee, Wifi, Car, Waves, Droplets, Briefcase, Utensils, BellRing, Dog, Bath, Accessibility, CigaretteOff, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface Hotel {
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

export interface HotelCardItemProps {
    hotel: Hotel;
    location: string;
    onViewRoom: (id: string) => void;
    checkinDate?: string | null;
    checkoutDate?: string | null;
    isLoading?: boolean;
}

const HotelCardItem: React.FC<HotelCardItemProps> = ({
    hotel,
    location,
    onViewRoom,
    checkinDate,
    checkoutDate,
    isLoading = false
}) => {

    // Translation hook
    const { t } = useTranslation();

    // Function to get amenity icon based on amenity key
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
            case 'non_smoking_rooms':
                return <CigaretteOff className="h-4 w-4 text-tripswift-blue" />;
            case 'facilities_for_disabled_guests':
                return <Accessibility className="h-4 w-4 text-tripswift-blue" />;
            case 'family_rooms':
                return <Users className="h-4 w-4 text-tripswift-blue" />;
            default:
                return null;
        }
    };

    // Format star rating
    const formatRating = (rating: string) => {
        const numRating = parseFloat(rating);
        return isNaN(numRating) ? 0 : numRating;
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
    const defaultHotelImage = "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80";
    const { i18n } = useTranslation();
    return (
        <div
            className="bg-tripswift-off-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 group font-noto-sans cursor-pointer"
            onClick={() => onViewRoom(hotel._id)}
        >            <div className="flex flex-col md:flex-row">
                {/* Hotel image */}
                <div className="md:w-1/3 h-72 md:h-80 relative overflow-hidden">
                    <img
                        src={hotel.image && hotel.image.length > 0 ? hotel.image[0] : defaultHotelImage}
                        alt={hotel.property_name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = defaultHotelImage;
                        }}
                    />

                    {/* Rating badge with TripSwift styling */}
                    <div className="absolute top-3 right-3 bg-tripswift-blue bg-opacity-90 text-tripswift-off-white px-2 py-1 rounded text-sm font-tripswift-medium flex items-center shadow-sm">
                        <Star className="h-4 w-4 mb-1 text-yellow-400 fill-current mr-1" />
                        <span>{formatRating(hotel.star_rating).toFixed(1)}</span>
                    </div>
                </div>

                {/* Hotel details */}
                <div className="md:w-2/3 p-4 flex flex-col">
                    <div className="flex-grow">
                        {/* Hotel name and rating */}
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-tripswift-bold text-tripswift-black">{hotel.property_name}</h3>
                            <div className="flex">
                                {Array.from({ length: Math.round(parseFloat(hotel.star_rating)) }).map((_, i) => (
                                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                                ))}
                            </div>
                        </div>

                        {/* Location */}
                        <div className="flex items-center text-sm text-tripswift-black/60 mb-2">
                            <MapPin className={`h-4 w-4 text-tripswift-blue mb-1 ${i18n.language === "ar" ? "ml-1" : "mr-1 "}`} />
                            <span>{location}</span>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-tripswift-black/70 mb-3 line-clamp-2 font-tripswift-regular">
                            {hotel.description || t('HotelListing.HotelCardItem.descriptionFallback')}
                        </p>

                        {/* Amenities */}
                        <div className="flex flex-wrap gap-2 mb-3">
                            {Object.entries(hotel.amenities || {})
                                .filter(([_, hasAmenity]) => hasAmenity)
                                .slice(0, 4)
                                .map(([amenity]) => (
                                    <div key={amenity} className="flex items-center text-xs font-tripswift-medium text-tripswift-blue bg-tripswift-blue/5 border border-tripswift-blue/20 px-2 py-1 rounded-md">
                                        {getAmenityIcon(amenity)}
                                        <span className={`capitalize ${i18n.language === "ar" ? "mr-2" : "ml-2"} `}>{t(`HotelListing.HotelCardItem.amenitiesList.${amenity}`)}</span>
                                    </div>
                                ))}
                        </div>

                        {checkinDate && checkoutDate && (
                            <div className="flex items-center text-xs text-tripswift-black/70 mb-2 font-tripswift-medium">
                                <span className="bg-tripswift-blue/5 border border-tripswift-blue/10 px-2 py-1 rounded-md text-tripswift-blue">
                                    {i18n.language === "ar"
                                        ? `${formatDate(checkoutDate)} - ${formatDate(checkinDate)}`
                                        : `${formatDate(checkinDate)} - ${formatDate(checkoutDate)}`}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Contact and button */}
                    <div className="flex items-end justify-between mt-2 pt-3 border-t border-gray-100">
                        <div>
                            <div className="text-xs text-tripswift-black/50">{t('HotelListing.HotelCardItem.contactLabel')}</div>
                            <div className="text-sm text-tripswift-black/80 font-tripswift-medium">{hotel.property_contact}</div>
                        </div>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!isLoading) {
                                    onViewRoom(hotel._id);
                                }
                            }}
                            disabled={isLoading}
                            className={`px-6 py-2 rounded-lg text-sm font-tripswift-medium transition-all duration-300 flex items-center justify-center ${isLoading
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'btn-tripswift-primary hover:shadow-md'
                                }`}
                            aria-label={t('HotelListing.HotelCardItem.viewRoomButton')}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {t('HotelListing.loadingText', { defaultValue: 'Loading...' })}
                                </>
                            ) : (
                                t('HotelListing.HotelCardItem.viewRoomButton')
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HotelCardItem;