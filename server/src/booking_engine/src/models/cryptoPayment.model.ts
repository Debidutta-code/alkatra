import mongoose, { Document, ObjectId } from "mongoose";

export interface ICryptoPayment extends Document {
  customer_id: ObjectId;
  provider: string;
  coupon: string[];
  taxValue?: number;
  token: string;
  blockchain: string;
  payment_id: string;
  amount: number;
  txHash?: string;
  senderWalletAddress?: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  initiatedTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICryptoPaymentLog extends Document {
  token: string;
  blockchain: string;
  amount: number;
  txHash?: string;
  senderWalletAddress?: string;
  initiatedTime: Date;
  createdAt: Date;
  updatedAt: Date;
}


const cryptoPaymentSchema = new mongoose.Schema({
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  provider: {
    type: String,
    enum: ["mobile", "web"],
    required: true,
  },
  coupon: {
    type: [String],
    required: false,
  },
  taxValue: {
    type: Number,
    required: false,
    default: 0
  },
  token: {
    type: String,
    required: true,
  },
  blockchain: {
    type: String,
    required: true,
  },
  payment_id: {
    type: String,
    required: true,
    unique: true 
  },
  amount: {
    type: Number,
    required: true,
    min: 0 
  },
  txHash: {
    type: String,
    required: false,
  },
  senderWalletAddress: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    enum: ["Confirmed", "Pending", "Cancelled", "Failed"], 
    default: "Pending",
  },
  initiatedTime: {
    type: Date,
    default: () => new Date(),
  },
  createdAt: {
    type: Date,
    default: () => new Date(),
  },
  updatedAt: {
    type: Date,
    default: () => new Date(),
  }
}, {
  timestamps: false, 
});

// Add index for better query performance
cryptoPaymentSchema.index({ customer_id: 1 });
cryptoPaymentSchema.index({ status: 1 });
cryptoPaymentSchema.index({ createdAt: -1 });

const cryptoPaymentLogSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
  },
  blockchain: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  txHash: {
    type: String,
    required: false,
  },
  senderWalletAddress: {
    type: String,
    required: false,
  },
  initiatedTime: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: false,
});

// Add indexes for logs
cryptoPaymentLogSchema.index({ token: 1 });
cryptoPaymentLogSchema.index({ txHash: 1 });
cryptoPaymentLogSchema.index({ createdAt: -1 });

// Pre-save middleware to update updatedAt
cryptoPaymentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

cryptoPaymentLogSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export interface ICryptoPaymentModel extends mongoose.Model<ICryptoPayment> {}
export interface ICryptoPaymentLogModel extends mongoose.Model<ICryptoPaymentLog> {}

export default mongoose.model<ICryptoPayment, ICryptoPaymentModel>("CryptoPaymentDetails", cryptoPaymentSchema);
export const CryptoPaymentLog = mongoose.model<ICryptoPaymentLog, ICryptoPaymentLogModel>("CryptoPaymentLog", cryptoPaymentLogSchema);