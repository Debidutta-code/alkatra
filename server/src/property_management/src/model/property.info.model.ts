import mongoose, { Document, Schema, Types } from "mongoose";
import { PropertyAddressType } from "./property.address.model";
import { RoomType } from "./room.model";
import { PropertyCategory } from "./propertycategory.model";
import { PropertyAmenitiesType } from "./propertyamenite.model";
import { RoomAminityType } from "./room.amenite.model";

interface PropertyInfoType extends Document {
  user_id: Types.ObjectId ;
  property_name: string;
  property_email: string;
  property_contact: string;
  star_rating: mongoose.Types.Decimal128;
  property_code: string;
  property_address: Types.ObjectId | PropertyAddressType;
  property_amenities: Types.ObjectId | PropertyAmenitiesType;
  property_room: Types.ObjectId[] | RoomType;
  room_Aminity: Types.ObjectId | RoomAminityType;
  image: string[];
  description: string;
  property_category: Types.ObjectId | PropertyCategory;
  property_type: Types.ObjectId;
  isDraft: boolean;
  rate_plan: Types.ObjectId;
  tax_group?: Types.ObjectId;
  status: string;
  dataSource: Types.ObjectId; // Reference to DataSourceProvider
}

const propertyInfoSchema = new Schema<PropertyInfoType>({
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  property_name: { type: String, required: true },
  property_email: { type: String, required: true, unique: true },
  property_contact: { type: String, required: true },
  star_rating: { type: String, required: true },
  property_code: { type: String, required: true, unique: true },
  property_address: { type: Schema.Types.ObjectId, ref: "PropertyAddress" },
  property_amenities: { type: Schema.Types.ObjectId, ref: "propertyAminity" },
  property_category: { type: Schema.Types.ObjectId, ref: "PropertyCategory" },
  property_type: { type: Schema.Types.ObjectId, ref: "PropertyType", required: [true, "Property type is required"], },
  property_room: [{ type: Schema.Types.ObjectId, ref: "Room" }],
  room_Aminity: { type: Schema.Types.ObjectId, ref: "RoomAminity" },
  image: [{ type: String }],
  description: { type: String },
  isDraft: { type: Boolean, default: true, },
  rate_plan: [{ type: Schema.Types.ObjectId }],
  tax_group: { type: Schema.Types.ObjectId, ref: "TaxGroup", sparse: true },
  status: { type: String, enum: ["open", "close"], required: false },
  dataSource: { type: Schema.Types.ObjectId, ref: "DataSourceProvider", required: true },
},{
  timestamps: true,
});

const PropertyInfo = mongoose.model<PropertyInfoType>("PropertyInfo", propertyInfoSchema);

export { PropertyInfo, PropertyInfoType };
