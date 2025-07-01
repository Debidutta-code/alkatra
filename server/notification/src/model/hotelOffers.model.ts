import { Schema, model } from 'mongoose';

interface IOffer {
  hotelCode: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  createdAt: Date;
}

const offerSchema = new Schema<IOffer>({
  hotelCode: { type: String, required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  data: { type: Map, of: String },
  createdAt: { type: Date, default: Date.now },
});

export const OfferModel = model<IOffer>('Offer', offerSchema);