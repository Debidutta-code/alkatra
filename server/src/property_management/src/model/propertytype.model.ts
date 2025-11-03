import mongoose, { Model, Types } from "mongoose";
import PropertyCategory from "./propertycategory.model";

export enum PropertyTypeCategory {
  MOST_COMMON = "Most common",
  OTHERS = "Others",
}

export type PropertyType = {
  propertyCategory: Types.ObjectId;
  name: string;
  code: string;
  typeCategory: PropertyTypeCategory;
};

type PropertyTypeModelType = Model<PropertyType>;

const propertyTypeSchema = new mongoose.Schema<PropertyType>(
  {
    propertyCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PropertyCategory",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Property type name is required"],
    },
    code: {
      type: String,
      required: [true, "Property type code is required"],
      unique: true,
    },
    typeCategory: {
      type: String,
      enum: Object.values(PropertyTypeCategory),
      default: PropertyTypeCategory.MOST_COMMON,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for better queries
propertyTypeSchema.index({ propertyCategory: 1, typeCategory: 1 });

propertyTypeSchema.pre("save", async function (next) {
  const propertyCategory = await PropertyCategory.findById(this.propertyCategory);
  
  if (!propertyCategory) {
    throw new Error("Property category not found");
  }

  // Generate code based on category
  const categoryPrefix = propertyCategory.category
    .split("-")[0]
    .substring(0, 3)
    .toUpperCase();
  
  this.code = `${categoryPrefix}-${this.code.toUpperCase()}`;

  next();
});

const PropertyType = mongoose.model<PropertyType, PropertyTypeModelType>(
  "PropertyType",
  propertyTypeSchema
);

export default PropertyType;