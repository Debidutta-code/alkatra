import mongoose, { Schema, Document, Types } from "mongoose";

export interface IReview extends Document {
  hotelId: Types.ObjectId;
  hotelCode: string;
  userId: Types.ObjectId;
  userEmail: string;
  comment: string;
  createdAt: Date;
}

const ReviewSchema: Schema = new Schema({
  hotelId: { type: Schema.Types.ObjectId, ref: 'PropertyInfo' },
  hotelCode: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  userEmail: { type: String, required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const CustomerReviewModel = mongoose.model<IReview>('CustomerReview', ReviewSchema);
