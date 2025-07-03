import { Schema, model } from 'mongoose';

interface IData {
  type: string;
  offerCode: string
}

interface IOffer {
  hotelCode: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  createdAt: Date;
}

const dataSchema = new Schema<IData>({
  type: { type: String, required: true },
  offerCode: { type: String, required: true },
});

const offerSchema = new Schema<IOffer>({
  hotelCode: { type: String, required: false },
  title: { type: String, required: true },
  body: { type: String, required: true },
  data: { type: dataSchema, required: false },
  createdAt: { type: Date, default: Date.now },
});

export const OfferModel = model<IOffer>('Offer', offerSchema);