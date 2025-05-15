import mongoose, { Document, Schema } from 'mongoose';

interface HotelType extends Document {
    hotel_name: string;
    hotel_code: string;
    price: number;
    state: string;
    district: string;
    location: string;
    destination_type: string;
    hotel_type: string;
    no_of_rooms_available: number;
    ratings:  mongoose.Types.Decimal128;
    wifi: boolean;
    swimming_pool: boolean;
    fitness_center: boolean;
    spa_and_wellness: boolean;
    restaurant: boolean;
    room_service: boolean;
    bar_and_lounge: boolean;
    parking: boolean;
    concierge_services: boolean;
    climate_control_rooms: boolean;
    room_type: string;
    tv: boolean;
    pet_friendly: boolean;
    business_facilities: boolean;
    laundry_services: boolean;
    child_friendly_facilities: boolean;
    max_adult_occupancy: number;
}


const hotelSchema = new Schema<HotelType>({
    hotel_name: { type: String, required: true },
    state: { type: String, required: true },
    district: { type: String, required: true },
    location: { type: String, required: true },
    destination_type: { type: String, required: true },
    hotel_code: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    hotel_type: { type: String, required: true },
    no_of_rooms_available: { type: Number, required: true },
    ratings: { type: mongoose.Types.Decimal128, required: true },
    wifi: { type: Boolean, required: true },
    swimming_pool: { type: Boolean, required: true },
    fitness_center: { type: Boolean, required: true },
    spa_and_wellness: { type: Boolean, required: true },
    restaurant: { type: Boolean, required: true },
    room_service: { type: Boolean, required: true },
    bar_and_lounge: { type: Boolean, required: true },
    parking: { type: Boolean, required: true },
    concierge_services: { type: Boolean, required: true },
    climate_control_rooms: { type: Boolean, required: true },
    room_type: { type: String, required: true },
    tv: { type: Boolean, required: true },
    pet_friendly: { type: Boolean, required: true },
    business_facilities: { type: Boolean, required: true },
    laundry_services: { type: Boolean, required: true },
    child_friendly_facilities: { type: Boolean, required: true },
    max_adult_occupancy: { type: Number, required: true },
});


const Hotel = mongoose.model<HotelType>('Hotel', hotelSchema);

export default Hotel;