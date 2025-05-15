import { Schema, model, Document } from 'mongoose';

interface IInventory extends Document {
  hotelCode: string;
  hotelName: string;
  invTypeCode: string;
  startDate: Date;
  endDate: Date;
  count: number;
  createdAt: Date;
}

const inventorySchema = new Schema<IInventory>({
  hotelCode: { type: String, required: true },
  hotelName: { type: String, required: true },
  invTypeCode: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  count: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Inventory = model<IInventory>('RoomInventory', inventorySchema);