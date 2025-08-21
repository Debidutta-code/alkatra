import mongoose, { Schema, Document, Types } from "mongoose";
import { reservationsUrl } from "twilio/lib/jwt/taskrouter/util";

export interface IReview extends Document {
  reservationId: string;
  hotelCode: string;
  hotelName: string;
  userId: Types.ObjectId;
  guestEmail: string;
  comment: string;
  rating: number;
  createdAt: Date;
}

const ReviewSchema: Schema = new Schema({
  reservationId: { type: String, required: false, ref: 'ThirdPartyBooking' },
  hotelName: { type: String, required: false, ref: 'PropertyInfo' },
  hotelCode: { type: String, required: false, ref: 'PropertyInfo' },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  guestEmail: { type: String, required: false, ref: 'ThirdPartyBooking' },
  comment: { type: String, required: false },
  rating: { type: Number, required: false },
  createdAt: { type: Date, default: Date.now }
});

export const CustomerReviewModel = mongoose.model<IReview>('CustomerReview', ReviewSchema);
