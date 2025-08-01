"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CryptoPaymentLog = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const cryptoPaymentSchema = new mongoose_1.default.Schema({
    customer_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
const cryptoPaymentLogSchema = new mongoose_1.default.Schema({
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
exports.default = mongoose_1.default.model("CryptoPaymentDetails", cryptoPaymentSchema);
exports.CryptoPaymentLog = mongoose_1.default.model("CryptoPaymentLog", cryptoPaymentLogSchema);
//# sourceMappingURL=cryptoPayment.model.js.map