import mongoose, { Schema, Document } from 'mongoose';

export interface IRatePlanType extends Document {
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ratePlanTypeSchema: Schema = new Schema<IRatePlanType>(
  {
    code: {
      type: String,
      required: [true, 'Rate type code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Rate type name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, 
  }
);

const RatePlanType = mongoose.model<IRatePlanType>('RatePlanType', ratePlanTypeSchema);
export default RatePlanType;
