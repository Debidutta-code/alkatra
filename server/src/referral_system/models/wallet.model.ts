import { Document, Types, model, Schema } from "mongoose";

export interface IWallet extends Document {
    customerId: Types.ObjectId;
    totalEarned: number;
    totalRedeemed: number;
    currentBalance: number;
    currency: string; // e.g. "INR", "USD"
    createdAt?: Date;
    updatedAt?: Date;
}

const WalletSchema: Schema<IWallet> = new Schema<IWallet>(
    {
        customerId: { 
            type: Schema.Types.ObjectId, 
            ref: "CustomerModel", 
            required: true, 
            unique: true 
        },
        totalEarned: { 
            type: Number, 
            default: 0 
        },
        totalRedeemed: { 
            type: Number, 
            default: 0 
        },
        currentBalance: { 
            type: Number, 
            default: 0 
        },
        currency: { 
            type: String, 
            default: "USD" 
        },
    },
    {
        timestamps: true
    }
);

const WalletModel = model<IWallet>("WalletModel", WalletSchema);

export default WalletModel;
