import mongoose, { Document, Schema, Types ,Model} from "mongoose";
import { PropertyInfoType, PropertyInfo } from "./property.info.model";

type OtherAmenity = {
  wifi: boolean;
  swimmingPool: boolean;
  fitnessCenter: boolean;
  spaAndWellness: boolean;
  restaurant: boolean;
  roomService: boolean;
  barAndLounge: boolean;
  parking: boolean;
  conciergeServices: boolean;
  petFriendly: boolean;
  businessFacilities: boolean;
  laundryServices: boolean;
  childFriendlyFacilities: boolean;
  nonSmokingRooms: boolean;
  facilitiesForDisabledGuests: boolean;
  familyRooms: boolean;
};

interface PropertyAmenitiesType extends Document {
  propertyInfo_id: Types.ObjectId | PropertyInfoType;
  amenities: OtherAmenity;
}

const propertyAmenitiesSchema = new Schema<PropertyAmenitiesType>({
  propertyInfo_id: { type: Schema.Types.ObjectId, ref: 'PropertyInfo', required: true },
  amenities: {
    wifi: { type: Boolean, default: false },
    swimming_pool: { type: Boolean, default: false },
    fitness_center: { type: Boolean, default: false },
    spa_and_wellness: { type: Boolean, default: false },
    restaurant: { type: Boolean, default: false },
    room_service: { type: Boolean, default: false },
    bar_and_lounge: { type: Boolean, default: false },
    parking: { type: Boolean, default: false },
    concierge_services: { type: Boolean, default: false },
    pet_friendly: { type: Boolean, default: false },
    business_facilities: { type: Boolean, default: false },
    laundry_services: { type: Boolean, default: false },
    child_friendly_facilities: { type: Boolean, default: false },
    non_smoking_rooms: { type: Boolean, default: false },
    facilities_for_disabled_guests: { type: Boolean, default: false },
    family_rooms: { type: Boolean, default: false },
  },
});

const propertyAminity = mongoose.model<PropertyAmenitiesType>("propertyAminity", propertyAmenitiesSchema);

export { propertyAminity, PropertyAmenitiesType };