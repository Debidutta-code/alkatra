import mongoose, { Document, Schema, Types } from "mongoose";
import { PropertyInfoType, PropertyInfo } from "./property.info.model";


interface RoomType extends Document {
  propertyInfo_id: Types.ObjectId | PropertyInfoType;
  room_name: string;
  room_type: string;
  total_room: number;
  available_rooms: number;
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
}

const roomSchema = new Schema<RoomType>({
  propertyInfo_id: {
    type: Schema.Types.ObjectId,
    ref: "PropertyInfo",
    required: true,
  },
  room_name: { type: String, required: true },
  room_type: { type: String, required: true },
  total_room: { type: Number, required: true },
  available_rooms: { type: Number, required: true },
  floor: { type: Number, required: true },
  room_view: { type: String },
  room_size: { type: Number, required: true },
  room_unit: { type: String, required: true },
  smoking_policy: { type: String, required: true },
  max_occupancy: { type: Number, required: true },
  max_number_of_adults: { type: Number, required: true },
  max_number_of_children: { type: Number, required: true },
  number_of_bedrooms: { type: Number, required: true },
  number_of_living_room: { type: Number, required: true },
  extra_bed: { type: Number, required: true },
  description: { type: String },
  image: [{ type: String }],
  available: { type: Boolean, default: true },
  rateplan_created: { type: Boolean, default: false },
});

const Room = mongoose.model<RoomType>("Room", roomSchema);

export { Room, RoomType };
