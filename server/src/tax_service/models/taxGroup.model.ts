import { Schema, Document, model, Types } from "mongoose";

/**
 * Interface for tax group
 */
export interface ITaxGroup extends Document {
    name: string;
    code: string;
    rules: Types.ObjectId[];
    isActive: boolean;
    hotelId: Types.ObjectId;
    createdBy: Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Actual schema for tax group
 */
const TaxGroupSchema: Schema<ITaxGroup> = new Schema(
    {
        name: { type: String, required: true },
        code: { type: String, required: true, unique: true },
        rules: [
            {
                type: Schema.Types.ObjectId,
                ref: "TaxRule",
                required: true,
            },
        ],
        isActive: { type: Boolean, default: true },
        hotelId: { type: Schema.Types.ObjectId, ref: "PropertyInfo", required: true, index: true },
        createdBy: { type: Schema.Types.ObjectId, ref: "UserModel", required: true, index: true },
    },
    {
        timestamps: true,
    }
);

export const TaxGroupModel = model<ITaxGroup>("TaxGroup", TaxGroupSchema);
