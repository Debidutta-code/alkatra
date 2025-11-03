import mongoose, { Model } from "mongoose";

export enum CategoryType {
  HOME = "Home-type property",
  HOTEL = "Hotel-type property",
  UNIQUE = "Unique-type property",
}

export enum PropertyTypeCategory {
  MOST_COMMON = "Most common",
  OTHERS = "Others",
}

export type PropertyCategory = {
  category: CategoryType;
  description?: string;
};

type PropertyCategoryModelType = Model<PropertyCategory>;

const propertyCategorySchema = new mongoose.Schema<PropertyCategory>(
  {
    category: {
      type: String,
      enum: Object.values(CategoryType),
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const PropertyCategory = mongoose.model<PropertyCategory, PropertyCategoryModelType>(
  "PropertyCategory",
  propertyCategorySchema
);

export default PropertyCategory;