import mongoose, { Document, Schema, Types } from "mongoose";
import { PropertyInfoType, PropertyInfo } from "./property.info.model";
import { LocationType, Location } from "./property.location.model";

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

// propertyAddressSchema.pre("save", async function (next) {
//   const address = this as PropertyAddressType;

//   // Create a new Location document
//   const newLocation = new Location({
//     propertyId: address.property_id,
//     houseNo: address.address_line_1,
//     // area: address.address_line_2,
//     pincode: address.zip_code,
//     country: address.country,
//     state: address.state,
//     city: address.city,
//     coordinates: { type: "Point", coordinates: ["85.7374098", "20.2910851"] },
//   });

//   // Save the Location document
//   const savedLocation = await newLocation.save();

//   // Set the location field of the PropertyAddress to the ObjectId of the saved Location
//   // address.location = savedLocation._id;

//   next();
// });

const PropertyAddress = mongoose.model<PropertyAddressType>(
  "PropertyAddress",
  propertyAddressSchema
);

export { PropertyAddress, PropertyAddressType };