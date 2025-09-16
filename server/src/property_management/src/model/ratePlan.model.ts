import mongoose, { Document, Model, Schema, Types } from "mongoose";
import { PropertyInfoType } from "./property.info.model";
import { RoomType } from "./room.model";
import {
    BaseGuestAmount,
    AdditionalGuestAmount,
    DaysOfWeek
} from "../interface";


export interface RatePlan extends Document {
    property_id: Types.ObjectId;
    invTypeCode: Types.ObjectId;
    ratePlanCode: string;
    startDate: Date;
    endDate: Date;
    currencyCode: string;
    days: DaysOfWeek;
    baseGuestAmounts: BaseGuestAmount[];
    additionalGuestAmounts: AdditionalGuestAmount[];
    isActive: boolean;
}

const RatePlanSchema: Schema<RatePlan> = new Schema<RatePlan>(
    {
        property_id: {
            type: Schema.Types.ObjectId,
            ref: "PropertyInfo",
            required: true
        },

        invTypeCode: {
            type: Schema.Types.ObjectId,
            ref: "Room",
            required: true,
            trim: true
        },
        ratePlanCode: {
            type: String,
            required: true,
            trim: true
        },
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        },
        currencyCode: {
            type: String,
            required: true,
            default: "USD",
            uppercase: true,
            trim: true
        },
        days: {
            mon: { type: Boolean, default: true },
            tue: { type: Boolean, default: true },
            wed: { type: Boolean, default: true },
            thu: { type: Boolean, default: true },
            fri: { type: Boolean, default: true },
            sat: { type: Boolean, default: true },
            sun: { type: Boolean, default: true }
        },
        baseGuestAmounts: [{
            numberOfGuests: {
                type: Number,
                required: true,
                min: 1,
                max: 10
            },
            amountBeforeTax: {
                type: Number,
                required: true,
                min: 0
            }
        }],
        additionalGuestAmounts: [{
            ageQualifyingCode: {
                type: Number,
                required: true,
                enum: [7, 8, 10] // 7 = Infant, 8 = Child, 10 = Adult
            },
            amount: {
                type: Number,
                required: true,
                min: 0
            }
        }],
        isActive: {
            type: Boolean,
            default: true
        },
    },

    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Index for better query performance
RatePlanSchema.index({ property_id: 1, ratePlanCode: 1 });
RatePlanSchema.index({ startDate: 1, endDate: 1 });
RatePlanSchema.index({ invTypeCode: 1, ratePlanCode: 1 });

// Virtual for checking if rate plan is currently active
RatePlanSchema.virtual('isCurrentlyActive').get(function () {
    const now = new Date();
    return this.isActive && now >= this.startDate && now <= this.endDate;
});

const RoomRatePlan: Model<RatePlan> = mongoose.model<RatePlan>('RatePlan', RatePlanSchema);

export default RoomRatePlan;