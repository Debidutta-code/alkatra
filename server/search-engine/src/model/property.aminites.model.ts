import mongoose, { Document, Schema, Types } from 'mongoose';
import {PropertyInfoType, PropertyInfo} from './property.info.model'

interface PropertyAnimiteType extends Document {
    propertyInfo: Types.ObjectId | PropertyInfoType;
    destination_type: string;
    property_type: string;
    no_of_rooms_available: number;
    wifi: boolean;
    swimming_pool: boolean;
    fitness_center: boolean;
    spa_and_wellness: boolean;
    restaurant: boolean;
    room_service: boolean;
    bar_and_lounge: boolean;
    parking: boolean;
    concierge_services: boolean;
    pet_friendly: boolean;
    business_facilities: boolean;
    laundry_services: boolean;
    child_friendly_facilities: boolean;

}


const propertyAminiteSchema = new Schema<PropertyAnimiteType>({
    propertyInfo: { type: Schema.Types.ObjectId, ref: 'PropertyInfo', required: true },
    destination_type: { type: String, required: true },
    property_type: { type: String, required: true },
    no_of_rooms_available: { type: Number, required: true },
    wifi: { type: Boolean, required: true },
    swimming_pool: { type: Boolean, required: true },
    fitness_center: { type: Boolean, required: true },
    spa_and_wellness: { type: Boolean, required: true },
    restaurant: { type: Boolean, required: true },
    room_service: { type: Boolean, required: true },
    bar_and_lounge: { type: Boolean, required: true },
    parking: { type: Boolean, required: true },
    concierge_services: { type: Boolean, required: true },
    pet_friendly: { type: Boolean, required: true },
    business_facilities: { type: Boolean, required: true },
    laundry_services: { type: Boolean, required: true },
    child_friendly_facilities: { type: Boolean, required: true },
});


const PropertyAminite = mongoose.model<PropertyAnimiteType>('PropertyAminite', propertyAminiteSchema);

export  {PropertyAminite,PropertyAnimiteType};