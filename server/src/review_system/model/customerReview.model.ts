import mongoose, { Schema, Document, Types } from "mongoose";

export interface IReview extends Document {
  hotelId: Types.ObjectId;
  hotelCode: string;
  userId: Types.ObjectId;
  userEmail: string;
  comment: string;
  rating: number;
  createdAt: Date;
}

const ReviewSchema: Schema = new Schema({
  hotelId: { type: Schema.Types.ObjectId, ref: 'PropertyInfo' },
  hotelCode: { type: String, required: false },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  userEmail: { type: String, required: false },
  comment: { type: String, required: false },
  rating: { type: Number, required: false },
  createdAt: { type: Date, default: Date.now }
});

export const CustomerReviewModel = mongoose.model<IReview>('CustomerReview', ReviewSchema);
