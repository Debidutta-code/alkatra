// src/models/DeviceToken.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

// 1. Define an interface
export interface IDeviceToken extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  platform: 'web' | 'android' | 'ios';
  createdAt: Date;
  updatedAt: Date;
}

// 2. Define a class
class DeviceTokenClass {
  userId!: mongoose.Types.ObjectId;
  token!: string;
  platform!: 'web' | 'android' | 'ios';
  createdAt!: Date;
  updatedAt!: Date;
}

// 3. Define schema
const DeviceTokenSchema = new Schema<IDeviceToken>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, unique: true, required: true },
    platform: { type: String, enum: ['web', 'android', 'ios'], required: true },
  },
  { timestamps: true }
);

// 4. Attach class methods (optional)
DeviceTokenSchema.loadClass(DeviceTokenClass);

// 5. Create the model
const DeviceToken: Model<IDeviceToken> = mongoose.model<IDeviceToken>('DeviceToken', DeviceTokenSchema);

export default DeviceToken;
