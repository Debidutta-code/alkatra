import { Schema, model, Document, Types } from "mongoose";

export interface IPromocodeUsage extends Document {
    _id: Types.ObjectId;
    promoCodeId: Types.ObjectId;
    userId: Types.ObjectId;
    bookingId: Types.ObjectId;
    discountType: "percentage" | "flat";
    discountValue: number;
    originalAmount: number;
    discountedAmount: number;
    finalAmount: number;
    discountApplied: number;
    usageDate: Date;
    status: "applied" | "cancelled" | "expired";
    metadata?: {
        ipAddress?: string;
        userAgent?: string;
        deviceType?: string;
    };
}

const PromocodeUsageSchema = new Schema<IPromocodeUsage>(
    {
        promoCodeId: {
            type: Schema.Types.ObjectId,
            ref: "Promocode",
            required: [true, "Promo code ID is required"],
            index: true
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
            index: true
        },
        bookingId: {
            type: Schema.Types.ObjectId,
            ref: "Booking",
            required: [true, "Booking ID is required"],
            index: true
        },
        discountType: {
            type: String,
            enum: ["percentage", "flat"],
            required: [true, "Discount type is required"]
        },
        discountValue: {
            type: Number,
            required: [true, "Discount value is required"]
        },
        originalAmount: {
            type: Number,
            required: [true, "Original amount is required"]
        },
        discountedAmount: {
            type: Number,
            required: [true, "Discounted amount is required"]
        },
        finalAmount: {
            type: Number,
            required: [true, "Final amount is required"]
        },
        discountApplied: {
            type: Number,
            required: [true, "Discount applied amount is required"]
        },
        usageDate: {
            type: Date,
            default: Date.now,
            index: true
        },
        status: {
            type: String,
            enum: ["applied", "cancelled", "expired"],
            default: "applied",
            index: true
        },
        metadata: {
            ipAddress: String,
            userAgent: String,
            deviceType: String
        }
    },
    {
        timestamps: true,
    }
);

PromocodeUsageSchema.index({ promoCodeId: 1, userId: 1 });
PromocodeUsageSchema.index({ userId: 1, status: 1 });
PromocodeUsageSchema.index({ promoCodeId: 1, status: 1 });
PromocodeUsageSchema.index({ usageDate: -1 });

export const PromocodeUsage = model<IPromocodeUsage>("PromocodeUsage", PromocodeUsageSchema);