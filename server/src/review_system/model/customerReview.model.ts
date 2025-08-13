import { required } from "joi";
import mongoose, { Schema, Document, Types } from "mongoose";

export interface IReview extends Document {
  hotelCode: string;
  hotelName: string;
  userId: Types.ObjectId;
  guestEmail: string;
  comment: string;
  rating: number;
  createdAt: Date;
}

const ReviewSchema: Schema = new Schema({
  hotelName: { type: String, required: false, ref: 'PropertyInfo' },
  hotelCode: { type: String, required: false, ref: 'PropertyInfo' },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  guestEmail: { type: String, required: false, ref: 'ThirdPartyBooking' },
  comment: { type: String, required: false },
  rating: { type: Number, required: false },
  createdAt: { type: Date, default: Date.now }
});

export const CustomerReviewModel = mongoose.model<IReview>('CustomerReview', ReviewSchema);
