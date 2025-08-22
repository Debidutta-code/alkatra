import { Schema, model, Document } from 'mongoose';

export interface DeepLinkData extends Document {
  couponCode: string;
  startDate: Date;  
  endDate: Date;    
  hotelCode: string;
  guestDetails: Record<string, any>; 
  hotelDetails: Record<string, any>; 
  createdAt: Date;
}

const DeepLinkSchema = new Schema<DeepLinkData>({
  couponCode: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  hotelCode: { type: String, required: true },
  guestDetails: { type: Schema.Types.Mixed, required: true }, 
  hotelDetails: { type: Schema.Types.Mixed, required: true }, 
  createdAt: { type: Date, default: Date.now }
});

export const DeepLinkModel = model<DeepLinkData>('DeepLinkData', DeepLinkSchema);
