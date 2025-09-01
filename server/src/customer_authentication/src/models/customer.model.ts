import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICustomer extends Document {
    googleId: string;
    provider: string;
    avatar: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    address?: string;
    role: string;
    permissions: Types.ObjectId[];
    referralCode?: string;
    referralLink?: string;
    referralQRCode?: string;
    createdAt: Date;
    updatedAt: Date;
}

const CustomerSchema: Schema = new Schema<ICustomer>({
    googleId: { type: String },
    provider: { type: String, required: true, enum: ["local", "google"] },
    avatar: { type: String },
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },
    email: { type: String, required: false, unique: true },
    phone: { type: String, required: false },
    password: { type: String, required: false },
    address: { type: String },
    role: { type: String, required: false, enum: ["customer"], default: "customer" },
    permissions: [{ type: Schema.Types.ObjectId, ref: "Permission" }],
    referralCode: { type: String, unique: true, sparse: true },
    referralLink: { type: String, unique: true, sparse: true },
    referralQRCode: { type: String, unique: true, sparse: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Update `updatedAt` field before saving
CustomerSchema.pre<ICustomer>("save", function (next) {
    this.updatedAt = new Date();
    next();
});

// Update `updatedAt` field before updating
CustomerSchema.pre<ICustomer>("findOneAndUpdate", function (next) {
    this.set({ updatedAt: new Date() });
    next();
});

export default mongoose.model<ICustomer>("CustomerModel", CustomerSchema);
