import mongoose, { Document, Schema } from 'mongoose';

export interface ICouponCode extends Document {
  customerId: mongoose.Types.ObjectId;
  code: string;
  discountPercentage: number;
  isUsed: string;
  createdAt: Date;
}

const couponCodeSchema = new Schema<ICouponCode>({
  customerId: { type: Schema.Types.ObjectId, ref: 'CustomerModel', required: false },
  code: { type: String, required: true, unique: true },
  discountPercentage: { type: Number, required: true },
  isUsed: { type: String, default: 'false', enum: ['true', 'false', 'available'] },
  createdAt: { type: Date, default: Date.now },
});

const couponModel= mongoose.model<ICouponCode>('CouponCodeModel', couponCodeSchema);
export default couponModel;