import mongoose from "mongoose";
import convertToLocalTime from '../../../utils/timezone_convert';

const getISTTime = () => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
};

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
    default: getISTTime,
  },
  createdAt: {
    type: Date,
  },
  updatedAt: {
    type: Date,
    
  }
}, {
  timestamps: true,
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
    default: getISTTime,
  },
}, {
  timestamps: true,
});

export default mongoose.model("CryptoPaymentDetails", cryptoPaymentSchema);
export const CryptoPaymentLog = mongoose.model("CryptoPaymentLog", cryptoPaymentLogSchema);
