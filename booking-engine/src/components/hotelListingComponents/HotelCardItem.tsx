// src/components/hotelListingComponents/HotelCardItem.tsx
import React from "react";
import { MapPin, Star, Coffee, Wifi, Car, Waves, Droplets, Briefcase, Utensils, BellRing, Dog, Bath } from "lucide-react";
import { t } from "i18next";

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

const amenities = {
    wifi: t('HotelBox.FilterModal.amenitiesList.wifi'),
    swimming_pool: t('HotelBox.FilterModal.amenitiesList.swimming_pool'),
    fitness_center: t('HotelBox.FilterModal.amenitiesList.fitness_center'),
    spa_and_wellness: t('HotelBox.FilterModal.amenitiesList.spa_and_wellness'),
    restaurant: t('HotelBox.FilterModal.amenitiesList.restaurant'),
    room_service: t('HotelBox.FilterModal.amenitiesList.room_service'),
    bar_and_lounge: t('HotelBox.FilterModal.amenitiesList.bar_and_lounge'),
    parking: t('HotelBox.FilterModal.amenitiesList.parking'),
    concierge_services: t('HotelBox.FilterModal.amenitiesList.concierge_services'),
    pet_friendly: t('HotelBox.FilterModal.amenitiesList.pet_friendly'),
    business_facilities: t('HotelBox.FilterModal.amenitiesList.business_facilities'),
    laundry_services: t('HotelBox.FilterModal.amenitiesList.laundry_services'),
    child_friendly_facilities: t('HotelBox.FilterModal.amenitiesList.child_friendly_facilities')
};

export interface HotelCardItemProps {
    hotel: Hotel;
    location: string;
    onViewRoom: (id: string) => void;
    checkinDate?: string | null;
    checkoutDate?: string | null;
}

const HotelCardItem: React.FC<HotelCardItemProps> = ({
    hotel,
    location,
    onViewRoom,
    checkinDate,
    checkoutDate
}) => {
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

    return (
        <div className="bg-tripswift-off-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 group">
            <div className="flex flex-col sm:flex-row">
                {/* Hotel image */}
                <div className="sm:w-1/3 h-52 sm:h-auto relative overflow-hidden">
                    {hotel.image && hotel.image.length > 0 ? (
                        <img
                            src={hotel.image[0]}
                            alt={hotel.property_name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400 font-tripswift-regular">No image</span>
                        </div>
                    )}

                    {/* Rating badge with TripSwift styling */}
                    <div className="absolute top-3 right-3 bg-tripswift-blue bg-opacity-90 text-tripswift-off-white px-2 py-1 rounded text-sm font-tripswift-medium flex items-center shadow-sm">
                        <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                        <span>{formatRating(hotel.star_rating).toFixed(1)}</span>
                    </div>
                </div>

                {/* Hotel details */}
                <div className="sm:w-2/3 p-4 flex flex-col">
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
                            <MapPin className="h-4 w-4 mr-1 text-tripswift-blue" />
                            <span>{location}</span>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-tripswift-black/70 mb-3 line-clamp-2 font-tripswift-regular">
                            {hotel.description || "Experience a comfortable stay at this wonderful property."}
                        </p>

                        {/* Amenities */}
                        <div className="flex flex-wrap gap-2 mb-3">
                            {Object.entries(hotel.amenities || {})
                                .filter(([_, hasAmenity]) => hasAmenity)
                                .slice(0, 4)
                                .map(([amenity]) => (
                                    <div key={amenity} className="flex items-center text-xs font-tripswift-medium text-tripswift-blue bg-tripswift-blue/5 border border-tripswift-blue/20 px-2 py-1 rounded-md">
                                        {getAmenityIcon(amenity)}
                                        <span className="capitalize ml-1">{amenities[amenity as keyof typeof amenities]}</span>
                                    </div>
                                ))}
                        </div>

                        {checkinDate && checkoutDate && (
                            <div className="flex items-center text-xs text-tripswift-black/70 mb-2 font-tripswift-medium">
                                <span className="bg-tripswift-blue/5 border border-tripswift-blue/10 px-2 py-1 rounded-md text-tripswift-blue">
                                    {formatDate(checkinDate)} - {formatDate(checkoutDate)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Contact and button */}
                    <div className="flex items-end justify-between mt-2 pt-3 border-t border-gray-100">
                        <div>
                            <div className="text-xs text-tripswift-black/50">Contact</div>
                            <div className="text-sm text-tripswift-black/80 font-tripswift-medium">{hotel.property_contact}</div>
                        </div>

                        <button
                            onClick={() => onViewRoom(hotel._id)}
                            className="btn-tripswift-primary px-6 py-2 rounded-md text-sm transition-all duration-300 hover:shadow-md"
                            aria-label={`View rooms at ${hotel.property_name}`}
                        >
                            View Room
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HotelCardItem;