import { Document, Types, model, Schema } from "mongoose";

export interface IReward extends Document {
    customerId: Types.ObjectId;
    referralId: Types.ObjectId;
    rewardType: "discount" | "cash" | "points";
    amount: number;
    issuedAt: Date;
    redeemedAt?: Date;
    status: "pending" | "issued" | "redeemed";
    createdAt?: Date;
    updatedAt?: Date;
}


const RewardSchema = new Schema<IReward>(
    {
        customerId: {
            type: Schema.Types.ObjectId,
            ref: "Customer",
            required: true,
        },
        referralId: {
            type: Schema.Types.ObjectId,
            ref: "Referral",
            required: true,
            unique: true, // ✅ Only one reward per referral
        },
        rewardType: {
            type: String,
            enum: ["discount", "cash", "points"],
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        issuedAt: {
            type: Date,
            required: true,
            default: Date.now,
        },
        redeemedAt: {
            type: Date,
        },
        // status: {
        //     type: String,
        //     enum: ["pending", "issued", "redeemed"],
        //     required: true,
        //     default: "pending",
        // },
    },
    { timestamps: true }
);

// Add index to customerId
RewardSchema.index({ customerId: 1 }, { unique: true });

const RewardModel = model<IReward>("Reward", RewardSchema);

export default RewardModel;
