import { Document, Types, model, Schema } from "mongoose";

export interface IReferral extends Document {
    referrerId: Types.ObjectId;
    refereeId: Types.ObjectId | null;
    referralCodeUsed: string;
    referralLink: string;
    referralQRCode?: string;
    status: "pending" | "completed";
    createdAt?: Date;
    updatedAt?: Date;
}

const ReferralSchema = new Schema<IReferral>(
    {
        referrerId: {
            type: Schema.Types.ObjectId,
            ref: "CustomerModel",
            required: true,
        },
        refereeId: {
            type: Schema.Types.ObjectId,
            ref: "CustomerModel",
            required: true,
        },
        referralCodeUsed: {
            type: String,
            required: true,
        },
        referralLink: {
            type: String,
            required: true,
        },
        referralQRCode: {
            type: String,
            required: true,
        },
        // status: {
        //     type: String,
        //     enum: ["pending", "completed"],
        //     default: "pending",
        // },
    },
    { timestamps: true }
);

// ✅ Prevent duplicate referrals
ReferralSchema.index({ referrerId: 1, refereeId: 1 }, { unique: true });

const ReferralModel = model<IReferral>("Referral", ReferralSchema);

export default ReferralModel;
