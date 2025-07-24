import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICustomer extends Document {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    role: string;
    permissions: Types.ObjectId[];
    address?: string;
    createdAt: Date;
    updatedAt: Date;
}

const CustomerSchema: Schema = new Schema<ICustomer>({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: false },
    password: { type: String, required: true },
    address: { type: String },
    role: { type: String, required: true, enum: ["customer"], default: "customer" },
    permissions: [{ type: Schema.Types.ObjectId, ref: "Permission" }],
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

const customerModel = mongoose.model<ICustomer>("CustomerModel", CustomerSchema);
export default customerModel;
