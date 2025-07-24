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
  // createdAt: Date;
}

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
    // createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Inventory = model<IInventory>('RoomInventory', inventorySchema);
