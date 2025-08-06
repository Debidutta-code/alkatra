import { Schema, Document, model, Types } from "mongoose";

/**
 * Interface for tax rule
 */
export interface ITaxRule extends Document {
    name: string;
    code: string;
    type: "PERCENTAGE" | "FIXED";
    value: number;
    applicableOn: "ROOM_RATE" | "TOTAL_AMOUNT";
    region: {
        country: string;
        state?: string;
        city?: string;
    };
    description?: string;
    validFrom: Date;
    validTo?: Date;
    isInclusive: boolean;
    priority?: number;
    hotelId: Types.ObjectId;
    createdBy: Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Actual schema for tax rule
 */
const TaxRuleSchema: Schema<ITaxRule> = new Schema(
    {
        name: { type: String, required: true },
        code: { type: String, required: true, unique: true, index: true },
        type: { type: String, enum: ["PERCENTAGE", "FIXED"], required: true },
        value: { type: Number, required: true },
        applicableOn: {
            type: String,
            enum: ["ROOM_RATE", "TOTAL_AMOUNT"],
            required: true,
        },
        region: {
            country: { type: String, required: true },
            state: { type: String },
            city: { type: String },
        },
        description: { type: String },
        validFrom: { type: Date, required: true },
        validTo: { type: Date },
        isInclusive: { type: Boolean, default: false },
        priority: { type: Number, default: 0 },
        hotelId: {
            type: Schema.Types.ObjectId,
            ref: "PropertyInfo",
            required: true,
            index: true, // ✅ index added here
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "UserModel",
            required: true,
            index: true, // ✅ index added here
        },
    },
    {
        timestamps: true,
    }
);

export const TaxRuleModel = model<ITaxRule>("TaxRule", TaxRuleSchema);
