import mongoose, { Document, Schema, Types } from 'mongoose';
import { PropertyInfoType ,PropertyInfo} from './property.info.model';

interface LocationType extends Document {
  propertyId: Types.ObjectId | PropertyInfoType;
  houseNo: string;
  area: string;
  pincode: string;
  country: string;
  state: string;
  city: string;
  coordinates: {
    type: string;
    coordinates: number[]; // [longitude, latitude]
  };
}

const locationSchema = new Schema<LocationType>({
  propertyId: { type: Schema.Types.ObjectId, ref: 'PropertyInfo',required: true },
  houseNo: { type: String, required: true },
  area: { type: String, required: true },
  pincode: { type: String, required: true },
  country: { type: String, required: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
});

const Location = mongoose.model<LocationType>('Locations', locationSchema);

export  {Location,LocationType};
