import mongoose from "mongoose";

const cryptoPaymentSchema = new mongoose.Schema({
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
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
  },
  amount: {
    type: Number,
    required: true,
  },
  txHash: {
    type: String,
    require: false,
  },
  senderWalletAddress: {
    type: String,
    require: false,
  },
  status: {
    type: String,
    enum: ["Confirmed", "Pending", "Cancelled"],
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
  
});

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
  },
  txHash: {
    type: String,
    require: false,
  },
  senderWalletAddress: {
    type: String,
    require: false,
  },
  initiatedTime: {
    type: Date,
    default: new Date(),
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
  updatedAt: {
    type: Date,
    default: new Date(),    
  }
}, {
  timestamps: false,
});

export default mongoose.model("CryptoPaymentDetails", cryptoPaymentSchema);
export const CryptoPaymentLog = mongoose.model("CryptoPaymentLog", cryptoPaymentLogSchema);
