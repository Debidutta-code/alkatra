import mongoose, { Document, Schema, Types, } from 'mongoose';
import {PropertyInfoType, PropertyInfo} from './property.info.model'


type BedType = 'single' | 'double' | 'king' | 'twin' | 'queen';

interface RoomAmenities {
    bed: BedType;
    bathroom: boolean;
    towels: boolean;
    linensBedding: boolean;
  }

  interface FurnitureAmenities {
    tableChairs: boolean;
    desk: boolean;
    dresserWardrobe: boolean;
    sofaSeating: boolean;
  }
  
  interface TechnologyAmenities {
    television: boolean;
    telephone: boolean;
    wifiInternet: boolean;
  }
  
  interface ClimateControlAmenities {
    airConditioning: boolean;
    heating: boolean;
  }
  
  interface KitchenetteMiniBarAmenities {
    smallRefrigerator: boolean;
    microwave: boolean;
    coffeeMaker: boolean;
  }
  
  interface SafetySecurityAmenities {
    safe: boolean;
    smokeDetectors: boolean;
    fireExtinguisher: boolean;
  }
  
  interface ToiletriesAmenities {
    shampooConditioner: boolean;
    soap: boolean;
    hairdryer: boolean;
  }
  
  interface ViewAmenities {
    view: boolean;
  }
  
  interface WorkLeisureAmenities {
    workDesk: boolean;
    readingChair: boolean;
    additionalLighting: boolean;
  }
  
  interface AccessibilityFeaturesAmenities {
    accessibleBathroom: boolean;
    wheelchairAccessibility: boolean;
  }


  interface RoomType extends Document {
    propertyInfo_id: Types.ObjectId | PropertyInfoType;
    name: string;
    type: string;
    price: number;
    available: boolean;
    capacity: number;
    amenities: {
      basic: RoomAmenities;
      furniture: FurnitureAmenities;
      technology: TechnologyAmenities;
      climateControl: ClimateControlAmenities;
      kitchenetteMiniBar: KitchenetteMiniBarAmenities;
      safetySecurity: SafetySecurityAmenities;
      toiletries: ToiletriesAmenities;
      view: ViewAmenities;
      workLeisure: WorkLeisureAmenities;
      accessibilityFeatures: AccessibilityFeaturesAmenities;
    };
    image: string;
    description: string;


  }

  const roomSchema = new Schema<RoomType>({
    propertyInfo_id: { type: Schema.Types.ObjectId, ref: 'PropertyInfo', required: true },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    available:{
      type: Boolean, 
      default: false
    },
    capacity: {
      type: Number,
      required: true,
    },
    amenities: {
      basic: {
        bed: {
            type: String,
            enum: ['single', 'double', 'king', 'twin', 'queen'],
            default: 'single', // You can set a default value
          },
        bathroom: { type: Boolean, default: false },
        towels: { type: Boolean, default: false },
        linensBedding: { type: Boolean, default: false },
      },
      furniture: {
        tableChairs: { type: Boolean, default: false },
        desk: { type: Boolean, default: false },
        dresserWardrobe: { type: Boolean, default: false },
        sofaSeating: { type: Boolean, default: false },
      },
      technology: {
        television: { type: Boolean, default: false },
        telephone: { type: Boolean, default: false },
        wifiInternet: { type: Boolean, default: false },
      },
      climateControl: {
        airConditioning: { type: Boolean, default: false },
        heating: { type: Boolean, default: false },
      },
      kitchenetteMiniBar: {
        smallRefrigerator: { type: Boolean, default: false },
        microwave: { type: Boolean, default: false },
        coffeeMaker: { type: Boolean, default: false },
      },
      safetySecurity: {
        safe: { type: Boolean, default: false },
        smokeDetectors: { type: Boolean, default: false },
        fireExtinguisher: { type: Boolean, default: false },
      },
      toiletries: {
        shampooConditioner: { type: Boolean, default: false },
        soap: { type: Boolean, default: false },
        hairdryer: { type: Boolean, default: false },
      },
      view: { type: Boolean, default: false },
      workLeisure: {
        workDesk: { type: Boolean, default: false },
        readingChair: { type: Boolean, default: false },
        additionalLighting: { type: Boolean, default: false },
      },
      accessibilityFeatures: {
        accessibleBathroom: { type: Boolean, default: false },
        wheelchairAccessibility: { type: Boolean, default: false },
      },
    },
    image: { type: String },
    description: {type: String}

  });
  
  const Room = mongoose.model<RoomType>('Rooms', roomSchema);
  
  export  {Room};