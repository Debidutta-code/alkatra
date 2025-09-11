import mongoose, { Schema, Document, Types } from "mongoose";

export interface IDeletedCustomer extends Document {
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

const DeletedCustomerSchema: Schema = new Schema<IDeletedCustomer>({
    googleId: { type: String },
    provider: { type: String, required: false },
    avatar: { type: String },
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },
    email: { type: String, required: false, unique: false, trim: true, lowercase: true },
    phone: { type: String, required: false, trim: true },
    password: { type: String, required: false },
    address: { type: String },
    role: { type: String, required: false, enum: ["customer"], default: "customer" },
    permissions: [{ type: Schema.Types.ObjectId, ref: "Permission" }],
    referralCode: { type: String, unique: false, sparse: true },
    referralLink: { type: String, unique: false, sparse: true },
    referralQRCode: { type: String, unique: false, sparse: true },
    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date, default: () => new Date() }
});


export default mongoose.model<IDeletedCustomer>("DeletedCustomerModel", DeletedCustomerSchema);
