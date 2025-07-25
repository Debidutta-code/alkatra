import { Schema, model, Document } from 'mongoose';

export interface Availability {
  startDate: Date;
  endDate: Date;
  count: number;
}

export interface IInventory extends Document {
  hotelCode: string;
  hotelName: string;
  invTypeCode: string;
  availability: Availability;
  // createdAtIST: Date;
  // updatedAtIST: Date;
}

// const getISTTime = () => {
//   const utc = new Date();
//   const istOffset = 5.5 * 60 * 60 * 1000; 
//   return new Date(utc.getTime() + istOffset);
// };

const availabilitySchema = new Schema<Availability>({
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  count: { type: Number, required: true },
}, { _id: false });

const inventorySchema = new Schema<IInventory>(
  {
    hotelCode: { type: String, required: true },
    hotelName: { type: String, required: true },
    invTypeCode: { type: String, required: true },
    availability: { type: availabilitySchema, required: true },
    // createdAtIST: { type: Date, default: getISTTime },
    // updatedAtIST: { type: Date, default: getISTTime },
  },
  { timestamps: true }
);

export const Inventory = model<IInventory>('RoomInventory', inventorySchema);
