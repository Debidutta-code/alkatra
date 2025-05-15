import mongoose, {
  HydratedDocument,
  Model,
  QueryWithHelpers,
  Types,
} from "mongoose"; 

export enum Category {
  HOTEL = "HOTEL",
  HOMESTAY = "HOMESTAY",
  WildlifeSafari = "WILDLIFE SAFARI",
  BeachResort = "BEACH RESORT",
  MountainRetreat = "MOUNTAIN RETREAT",
  AdventureDestination = "ADVENTURE DESTINATION",
  CulturalCity = "CULTURAL CITY",
  Traking = "TRAKING",
}

export type PropertyCategory = {
  category: Category;
};

type PropertyCategoryModelType = Model<PropertyCategory>;

const propertyCategorySchema = new mongoose.Schema<PropertyCategory>(
  {
    category: {
      type: String,
      enum: Object.values(Category),
      default: Category.HOTEL,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

propertyCategorySchema.pre("save", async function (next) {
  this.category = this.category.toUpperCase() as Category;

  next();
});

const PropertyCategory = mongoose.model<
  PropertyCategory,
  PropertyCategoryModelType
>("PropertyCategory", propertyCategorySchema);

export default PropertyCategory;
