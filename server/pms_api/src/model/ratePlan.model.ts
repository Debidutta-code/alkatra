import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface SchedulingType {
  type: 'weekly' | 'date_range' | 'specific-dates';
  weekly_days?: string[];
  date_ranges?: { start: Date; end: Date }[];
  specific_dates?: Date[];
}

export interface RatePlan extends Document {
  propertyId: Types.ObjectId;
  rate_plan_code: string;
  rate_plan_name: string;
  description?: string;
  room_price?: number;
  meal_plan: 'RO' | 'BB' | 'HB' | 'FB';
  max_occupancy: number;
  adult_occupancy: number;
  min_length_stay: number;
  max_length_stay: number;
  min_book_advance: number;
  max_book_advance: number;
  status: 'active' | 'inactive';
  created_by: Date;
  updated_by: Date;
  scheduling: SchedulingType;
}

const schedulingSchema = new Schema<SchedulingType>(
  {
    type: {
      type: String,
      enum: ['weekly', 'date_range', 'specific-dates'],
      required: true,
    },
    weekly_days: {
      type: [String],
      enum: [
        'monday', 'tuesday', 'wednesday',
        'thursday', 'friday', 'saturday', 'sunday'
      ],
      default: undefined,
    },
    date_ranges: [
      {
        start: { type: Date, required: true },
        end: { type: Date, required: true },
      }
    ],
    specific_dates: [Date],
  },
  { _id: false }
);

const ratePlanSchema = new Schema<RatePlan>(
  {
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: 'PropertyInfo',
      required: true
    },
    rate_plan_code: {
      type: String,
      required: true,
      unique: true
    },
    rate_plan_name: { type: String, required: true },
    description: { type: String },
    meal_plan: {
      type: String,
      enum: ['RO', 'BB', 'HB', 'FB'],
      required: false,
      default: 'RO',
    },
    room_price: {type: Number, required: true},
    max_occupancy: { type: Number, required: true },
    adult_occupancy: { type: Number, required: true },
    min_length_stay: { type: Number, required: true },
    max_length_stay: { type: Number, required: true },
    min_book_advance: { type: Number, required: true },
    max_book_advance: { type: Number, required: true },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    created_by: { type: Date, default: Date.now },
    updated_by: { type: Date, default: Date.now },
    scheduling: {
      type: schedulingSchema,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const RatePlanModel: Model<RatePlan> = mongoose.model<RatePlan>('RatePlan', ratePlanSchema);
export default RatePlanModel;
