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
  status: string;
  dataSource?: string; // Track which PMS this data came from
  sold?: number; // Track sold count from PMS
  blocked?: number; // Track blocked count from PMS
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
    status: { type: String },
    dataSource: { type: String, required: false }, // Track data source: Internal, Wincloud, QuotusPMS
    sold: { type: Number, required: false }, // Sold count from PMS
    blocked: { type: Number, required: false }, // Blocked count from PMS
    // createdAtIST: { type: Date, default: getISTTime },
    // updatedAtIST: { type: Date, default: getISTTime },
  },
  { timestamps: true }
);

export const Inventory = model<IInventory>('RoomInventory', inventorySchema);
