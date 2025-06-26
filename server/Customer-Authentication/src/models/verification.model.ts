// ✅ 1. otp.model.ts
import mongoose, { Document, Schema } from 'mongoose';

export enum OTPStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  EXPIRED = 'expired',
}

export enum OTPType {
  REGISTER = 'register',
  LOGIN = 'login',
}

export interface IOTP extends Document {
  identifier: string; // email or phone
  otp: string;
  status: OTPStatus;
  expiresAt: Date;
  createdAt: Date;
  attemptCount: number;
  type: OTPType;
}

const OTPSchema: Schema<IOTP> = new Schema({
  identifier: { type: String, required: true },
  otp: { type: String, required: true },
  status: { type: String, enum: Object.values(OTPStatus), default: OTPStatus.PENDING },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  attemptCount: { type: Number, default: 0 },
  type: { type: String, enum: Object.values(OTPType), required: true },
});

export default mongoose.model<IOTP>('OTP', OTPSchema);