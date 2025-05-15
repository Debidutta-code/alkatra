import mongoose, { Schema, Model } from "mongoose";

enum TransactionStatusType {
  "SUCCESS" = "Success",
  "REVERSED" = "Reversed",
  "PROCESSING" = "Processing",
}

enum CurrencyType {
  "INR" = "INR",
}

export type TransactionType = {
  user: Schema.Types.ObjectId;
  status: TransactionStatusType;
  amount: number;
  currency: CurrencyType.INR;
  booking: Schema.Types.ObjectId;
  deletedAt: Date;
};

type TransactionModelType = Model<TransactionType>;

const transactionSchema = new Schema<TransactionType>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    status: {
      type: String,
      enum: Object.values(TransactionStatusType),
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
    },
    currency: {
      type: String,
      enum: Object.values(CurrencyType),
    },
    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model<TransactionType, TransactionModelType>(
  "Transaction",
  transactionSchema
);

export default Transaction;
