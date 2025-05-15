// import React, { useState } from "react";
// import { MapPin, Star, Coffee, Wifi, Car, Waves, Droplets, Briefcase, Utensils, BellRing, Dog, Bath } from "lucide-react";

// export interface Hotel {
//   _id: string;
//   property_name: string;
//   property_email: string;
//   property_contact: string;
//   star_rating: string;
//   property_code: string;
//   description: string;
//   image: string[];
//   amenities: { [key: string]: boolean };
// }

// interface HotelCardItemProps {
//   hotel: Hotel;
//   location: string;
//   onViewRoom: (id: string) => void;
// }

// const HotelCardItem: React.FC<HotelCardItemProps> = ({ hotel, location, onViewRoom }) => {
//   const [isFavorite, setIsFavorite] = useState(false);

//   // Function to get amenity icon based on amenity key - using only available lucide-react icons
//   // and matching exactly with the AMENITIES keys from FilterModal
//   const getAmenityIcon = (amenity: string) => {
//     switch (amenity) {
//       case 'wifi':
//         return <Wifi className="h-4 w-4 text-blue-500" />;
//       case 'swimming_pool':
//         return <Waves className="h-4 w-4 text-blue-500" />; // Using Waves instead of Pool
//       case 'fitness_center':
//         return <Droplets className="h-4 w-4 text-blue-500" />; // Using Droplets as alternative
//       case 'spa_and_wellness':
//         return <Bath className="h-4 w-4 text-blue-500" />;
//       case 'restaurant':
//         return <Utensils className="h-4 w-4 text-blue-500" />;
//       case 'room_service':
//         return <BellRing className="h-4 w-4 text-blue-500" />;
//       case 'bar_and_lounge':
//         return <Coffee className="h-4 w-4 text-blue-500" />;
//       case 'parking':
//         return <Car className="h-4 w-4 text-blue-500" />;
//       case 'concierge_services':
//         return <BellRing className="h-4 w-4 text-blue-500" />;
//       case 'pet_friendly':
//         return <Dog className="h-4 w-4 text-blue-500" />;
//       case 'business_facilities':
//         return <Briefcase className="h-4 w-4 text-blue-500" />;
//       case 'laundry_services':
//         return <Droplets className="h-4 w-4 text-blue-500" />;
//       case 'child_friendly_facilities':
//         return <Star className="h-4 w-4 text-blue-500" />;
//       default:
//         return null;
//     }
//   };

//   // Format star rating
//   const formatRating = (rating: string) => {
//     const numRating = parseFloat(rating);
//     return isNaN(numRating) ? 0 : numRating;
//   };

//   return (
//     <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300">
//       <div className="flex flex-col sm:flex-row">
//         {/* Hotel image */}
//         <div className="sm:w-1/3 h-52 sm:h-auto relative">
//           {hotel.image && hotel.image.length > 0 ? (
//             <img
//               src={hotel.image[0]}
//               alt={hotel.property_name}
//               className="w-full h-full object-cover"
//             />
//           ) : (
//             <div className="w-full h-full bg-gray-200 flex items-center justify-center">
//               <span className="text-gray-400">No image</span>
//             </div>
//           )}

//           {/* Rating badge */}
//           <div className="absolute top-3 left-3 bg-blue-900 bg-opacity-90 text-white px-2 py-1 rounded text-sm font-medium flex items-center">
//             <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
//             <span>{formatRating(hotel.star_rating).toFixed(1)}</span>
//           </div>
//         </div>

//         {/* Hotel details */}
//         <div className="sm:w-2/3 p-4 flex flex-col">
//           <div className="flex-grow">
//             {/* Hotel name and rating */}
//             <div className="flex justify-between items-start mb-1">
//               <h3 className="text-lg font-bold text-gray-800">{hotel.property_name}</h3>
//               <div className="flex">
//                 {Array.from({ length: Math.round(parseFloat(hotel.star_rating)) }).map((_, i) => (
//                   <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
//                 ))}
//               </div>
//             </div>

//             {/* Location */}
//             <div className="flex items-center text-sm text-gray-500 mb-2">
//               <MapPin className="h-4 w-4 mr-1" />
//               <span>{location}</span>
//             </div>

//             {/* Description */}
//             <p className="text-sm text-gray-600 mb-3 line-clamp-2">
//               {hotel.description || "Experience a comfortable stay at this wonderful property."}
//             </p>

//             {/* Amenities */}
//             <div className="flex flex-wrap gap-2 mb-3">
//               {Object.entries(hotel.amenities || {})
//                 .filter(([_, hasAmenity]) => hasAmenity)
//                 .slice(0, 4)
//                 .map(([amenity]) => (
//                   <div key={amenity} className="flex items-center text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
//                     {getAmenityIcon(amenity)}
//                     <span className="capitalize ml-1">{amenity.replace('_', ' ')}</span>
//                   </div>
//                 ))}
//             </div>
//           </div>

//           {/* Contact and button */}
//           <div className="flex items-end justify-between mt-2 pt-3 border-t border-gray-100">
//             <div>
//               <div className="text-xs text-gray-500">Contact</div>
//               <div className="text-sm text-gray-700">{hotel.property_contact}</div>
//             </div>

//             <button
//               onClick={() => onViewRoom(hotel._id)}
//               className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors"
//             >
//               View Room
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default HotelCardItem;

// src/components/hotelListingComponents/HotelCardItem.tsx
import React from "react";
import { MapPin, Star, Coffee, Wifi, Car, Waves, Droplets, Briefcase, Utensils, BellRing, Dog, Bath, Calendar } from "lucide-react";

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
                return <Wifi className="h-4 w-4 text-blue-500" />;
            case 'swimming_pool':
                return <Waves className="h-4 w-4 text-blue-500" />;
            case 'fitness_center':
                return <Droplets className="h-4 w-4 text-blue-500" />;
            case 'spa_and_wellness':
                return <Bath className="h-4 w-4 text-blue-500" />;
            case 'restaurant':
                return <Utensils className="h-4 w-4 text-blue-500" />;
            case 'room_service':
                return <BellRing className="h-4 w-4 text-blue-500" />;
            case 'bar_and_lounge':
                return <Coffee className="h-4 w-4 text-blue-500" />;
            case 'parking':
                return <Car className="h-4 w-4 text-blue-500" />;
            case 'concierge_services':
                return <BellRing className="h-4 w-4 text-blue-500" />;
            case 'pet_friendly':
                return <Dog className="h-4 w-4 text-blue-500" />;
            case 'business_facilities':
                return <Briefcase className="h-4 w-4 text-blue-500" />;
            case 'laundry_services':
                return <Droplets className="h-4 w-4 text-blue-500" />;
            case 'child_friendly_facilities':
                return <Star className="h-4 w-4 text-blue-500" />;
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300">
            <div className="flex flex-col sm:flex-row">
                {/* Hotel image */}
                <div className="sm:w-1/3 h-52 sm:h-auto relative">
                    {hotel.image && hotel.image.length > 0 ? (
                        <img
                            src={hotel.image[0]}
                            alt={hotel.property_name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400">No image</span>
                        </div>
                    )}

                    {/* Rating badge moved to top-right for more prominence */}
                    <div className="absolute top-3 right-3 bg-blue-900 bg-opacity-90 text-white px-2 py-1 rounded text-sm font-medium flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                        <span>{formatRating(hotel.star_rating).toFixed(1)}</span>
                    </div>
                </div>

                {/* Hotel details */}
                <div className="sm:w-2/3 p-4 flex flex-col">
                    <div className="flex-grow">
                        {/* Hotel name and rating */}
                        <div className="flex justify-between items-start mb-1">
                            <h3 className="text-lg font-bold text-gray-800">{hotel.property_name}</h3>
                            <div className="flex">
                                {Array.from({ length: Math.round(parseFloat(hotel.star_rating)) }).map((_, i) => (
                                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                                ))}
                            </div>
                        </div>

                        {/* Location */}
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>{location}</span>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {hotel.description || "Experience a comfortable stay at this wonderful property."}
                        </p>

                        {/* Amenities */}
                        <div className="flex flex-wrap gap-2 mb-3">
                            {Object.entries(hotel.amenities || {})
                                .filter(([_, hasAmenity]) => hasAmenity)
                                .slice(0, 4)
                                .map(([amenity]) => (
                                    <div key={amenity} className="flex items-center text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                                        {getAmenityIcon(amenity)}
                                        <span className="capitalize ml-1">{amenity.replace('_', ' ')}</span>
                                    </div>
                                ))}
                        </div>
                    </div>

                    {/* Contact and button */}
                    <div className="flex items-end justify-between mt-2 pt-3 border-t border-gray-100">
                        <div>
                            <div className="text-xs text-gray-500">Contact</div>
                            <div className="text-sm text-gray-700">{hotel.property_contact}</div>
                        </div>

                        <button
                            onClick={() => onViewRoom(hotel._id)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors"
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