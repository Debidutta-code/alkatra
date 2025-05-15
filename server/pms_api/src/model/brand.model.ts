import mongoose, { Document, Schema, Types } from "mongoose";

interface BrandType extends Document {
  brand_name: string;
  brand_description?: string;
  brand_logo?: string;
}

const brandSchema = new Schema<BrandType>({
  brand_name: { type: String, required: true, unique: true },
  brand_description: { type: String },
//   brand_logo: { type: String },
});

const Brand = mongoose.model<BrandType>("Brand", brandSchema);

export { Brand, BrandType };
