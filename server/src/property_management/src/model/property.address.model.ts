import mongoose, { Document, Schema, Types } from "mongoose";
import { PropertyInfoType, PropertyInfo } from "./property.info.model";

interface PropertyAddressType extends Document {
  property_id: Types.ObjectId | PropertyInfoType;
  address_line_1: string;
  address_line_2: string;
  country: string;
  state: string;
  city: string;
  location: string;
  landmark: string;
  zip_code: number;
}

const propertyAddressSchema = new Schema<PropertyAddressType>({
  property_id: {
    type: Schema.Types.ObjectId,
    ref: "PropertyInfo",
    required: true,
  },
  address_line_1: { type: String, required: true },
  address_line_2: { type: String, required: false },
  country: { type: String, required: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  location: { type: String, required: false },
  landmark: { type: String, required: true },
  zip_code: { type: Number, required: true },
});


const PropertyAddress = mongoose.model<PropertyAddressType>(
  "PropertyAddress",
  propertyAddressSchema
);

export { PropertyAddress, PropertyAddressType };