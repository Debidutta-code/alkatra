import mongoose, { Schema, Model } from "mongoose";
import { RatePlan, SchedulingType } from "../common/interface/ratePlan.interface";


const schedulingSchema = new Schema<SchedulingType>(
  {
    type: {
      type: String,
      enum: ['weekly', 'date_range', 'specific-dates'],
      required: true,
    },
    weeklyDays: {
      type: [String],
      enum: [
        'monday', 'tuesday', 'wednesday',
        'thursday', 'friday', 'saturday', 'sunday'
      ],
      default: undefined,
        },
    // periodic days
    dateRanges: [
      {
        start: { type: Date },
        end: { type: Date },
      }
    ],
    availableSpecificDates: [Date],
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
    ratePlanCode: {
      type: String,
      required: true,
      unique: true
    },
    ratePlanName: { type: String, required: true },
    minLengthStay: { type: Number, required: true },
    maxLengthStay: { type: Number, required: true },
    minReleaseDay: { type: Number, required: true },
        maxReleaseDay: { type: Number, required: true },
    cancellationDeadline: {
  days: { type: Number, default: 0 },
  hours: { type: Number,  default: 0 }
},
    description: { type: String },
    mealPlan: {
      type: String,
      enum: ['RO', 'BB', 'HB', 'FB'],
      required: false,
      default: 'RO',
        },
        currency: {
            type: String,
        },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'inactive'
    },
    createdBy: { type: Date, default: Date.now },
    updatedBy: { type: Date, default: Date.now },
    scheduling: {
      type: schedulingSchema,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const RatePlanModel: Model<RatePlan> = mongoose.model<RatePlan>('RatePlanModel', ratePlanSchema);
export default RatePlanModel;
