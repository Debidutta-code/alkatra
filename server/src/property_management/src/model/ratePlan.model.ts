import mongoose, { Document, Model, Schema, Types } from "mongoose";
import { PropertyInfoType, PropertyInfo } from "./property.info.model";
import { RoomType } from "./room.model";

export interface RatePlan extends Document {
    property_id: Types.ObjectId | PropertyInfoType,
    applicable_room_type: Types.ObjectId | RoomType,
    room_price: number,
    meal_plan: string,
    rate_plan_name: string,
    rate_plan_description: string,
    min_length_stay: number,    // minimum days a guest can stay
    max_length_stay: number,    // maximum days a guest can stay
    min_book_advance: number,   // advance booking, minimum days before arrival
    max_book_advance: number    // advance booking, maximum days before arrival
}

const serviceCostModel: Schema<RatePlan> = new Schema<RatePlan> (
    {
        property_id: { 
            type: Schema.Types.ObjectId, 
            ref: "PropertyInfo", 
            required: true 
        },
        applicable_room_type: { 
            type: Schema.Types.ObjectId, 
            ref: "Room", 
            required: true 
        },
        meal_plan: {
            type: String,
            enum: [ 'Including breakfast', 
                    'Including breakfast, lunch and dinner', 
                    'Including breakfast, lunch or dinner', 
                    'Room Only' ],
            required: true,
        },
        room_price: { type: Number, required: true },
        rate_plan_name: { type: String },
        rate_plan_description: { type: String },
        min_length_stay: { type: Number, required: true },
        max_length_stay: { type: Number },
        min_book_advance: { type: Number, required: true },
        max_book_advance: { type: Number }
    },
    { timestamps: true }
)

const PropertyRatePlan: Model<RatePlan> = mongoose.model<RatePlan>('RatePlan', serviceCostModel);

export default PropertyRatePlan;