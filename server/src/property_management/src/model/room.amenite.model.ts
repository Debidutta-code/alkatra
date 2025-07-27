import mongoose, { Document, Schema, Types } from "mongoose";
import { PropertyInfoType } from "./property.info.model";

type BedType = "single" | "double" | "king" | "twin" | "queen";

interface RoomAmenities {
  bed: BedType;
  bathroom: boolean;
  linensBedding: boolean;
  linens: boolean; 
  bidet: boolean; 
  toiletPaper: boolean; 
  towelsSheets: boolean;
  freeToiletries: boolean; 
  shower: boolean; 
  toilet: boolean; 
}

interface FurnitureAmenities {
  tableChairs: boolean;
  desk: boolean;
  dresserWardrobe: boolean;
  sofaSeating: boolean;
  diningTable: boolean;
  readingChair: boolean;
}

interface SpaceLayoutAmenities {
  diningArea: boolean;
  sittingArea: boolean;
  balcony: boolean;
}

interface TechnologyAmenities {
  television: boolean;
  telephone: boolean;
  wifiInternet: boolean;
  flatScreenTV: boolean; 
  satelliteChannels: boolean; 
  cableChannels: boolean; 
}

interface ClimateControlAmenities {
  airConditioning: boolean;
  heating: boolean;
}

interface KitchenetteMiniBarAmenities {
  smallRefrigerator: boolean;
  microwave: boolean;
  refrigerator: boolean;
  kitchenware: boolean; 
  electricKettle: boolean; 
  oven: boolean; 
  stovetop: boolean; 
  teaCoffeeMaker: boolean; 
}

interface SafetySecurityAmenities {
  safe: boolean;
  smokeDetectors: boolean;
  fireExtinguisher: boolean;
}

interface ToiletriesAmenities {
  shampooConditioner: boolean;
  soap: boolean;
  hairDryer: boolean;
}

interface WorkLeisureAmenities {
  workDesk: boolean;
  additionalLighting: boolean;
  ironingFacilities: boolean; 
}

interface AccessibilityFeaturesAmenities {
  accessibleBathroom: boolean;
  wheelchairAccessibility: boolean;
  upperFloorsAccessibleByElevator: boolean; 
  entireUnitWheelchairAccessible: boolean; 
}

interface RoomAminityType extends Document {
  propertyInfo_id: Types.ObjectId | PropertyInfoType;
  room_type: string;
  amenities: {
    basic: RoomAmenities;
    furniture: FurnitureAmenities;
    spaceLayout: SpaceLayoutAmenities;
    technology: TechnologyAmenities;
    climateControl: ClimateControlAmenities;
    kitchenetteMiniBar: KitchenetteMiniBarAmenities;
    safetySecurity: SafetySecurityAmenities;
    toiletries: ToiletriesAmenities;
    workLeisure: WorkLeisureAmenities;
    accessibilityFeatures: AccessibilityFeaturesAmenities;
  };
}

const roomAminitySchema = new Schema({
  propertyInfo_id: {
    type: Schema.Types.ObjectId,
    ref: "PropertyInfo",
    required: true,
  },
  room_type: {
    type: String,
    ref: "Room",
    required: true,
  },
  amenities: {
    basic: {
      bed: {
        type: String,
        enum: ["single", "double", "king", "twin", "queen"],
        default: "single",
      },
      bathroom: { type: Boolean, default: false },
      linensBedding: { type: Boolean, default: false },
      linens: { type: Boolean, default: false },
      bidet: { type: Boolean, default: false },
      toiletPaper: { type: Boolean, default: false },
      towelsSheets: { type: Boolean, default: false }, // extra fee
      freeToiletries: { type: Boolean, default: false },
      shower: { type: Boolean, default: false },
      toilet: { type: Boolean, default: false },
    },
    furniture: {
      tableChairs: { type: Boolean, default: false },
      desk: { type: Boolean, default: false },
      dresserWardrobe: { type: Boolean, default: false },
      sofaSeating: { type: Boolean, default: false },
      diningTable: { type: Boolean, default: false },
      readingChair: { type: Boolean, default: false },
    },
    spaceLayout: {
      diningArea: { type: Boolean, default: false },
      sittingArea: { type: Boolean, default: false },
      balcony: { type: Boolean, default: false },
    },
    technology: {
      television: { type: Boolean, default: false },
      telephone: { type: Boolean, default: false },
      wifiInternet: { type: Boolean, default: false },
      flatScreenTV: { type: Boolean, default: false },
      satelliteChannels: { type: Boolean, default: false },
      cableChannels: { type: Boolean, default: false },
    },
    climateControl: {
      airConditioning: { type: Boolean, default: false },
      heating: { type: Boolean, default: false },
    },
    kitchenetteMiniBar: {
      smallRefrigerator: { type: Boolean, default: false },
      microwave: { type: Boolean, default: false },
      refrigerator: { type: Boolean, default: false },
      kitchenware: { type: Boolean, default: false },
      electricKettle: { type: Boolean, default: false },
      oven: { type: Boolean, default: false },
      stovetop: { type: Boolean, default: false },
      teaCoffeeMaker: { type: Boolean, default: false },
    },
    safetySecurity: {
      safe: { type: Boolean, default: false },
      smokeDetectors: { type: Boolean, default: false },
      fireExtinguisher: { type: Boolean, default: false },
    },
    toiletries: {
      shampooConditioner: { type: Boolean, default: false },
      soap: { type: Boolean, default: false },
      hairDryer: { type: Boolean, default: false },
    },
    workLeisure: {
      workDesk: { type: Boolean, default: false },
      additionalLighting: { type: Boolean, default: false },
      ironingFacilities: { type: Boolean, default: false },
    },
    accessibilityFeatures: {
      accessibleBathroom: { type: Boolean, default: false },
      wheelchairAccessibility: { type: Boolean, default: false },
      upperFloorsAccessibleByElevator: { type: Boolean, default: false },
      entireUnitWheelchairAccessible: { type: Boolean, default: false },
    },
  },
});

const RoomAminity = mongoose.model("RoomAminity", roomAminitySchema);

export { RoomAminity, RoomAminityType };