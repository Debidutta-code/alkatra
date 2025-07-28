"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInitiatedPaymentDetails = exports.getWalletAddress = exports.pushCryptoPaymentDetails = exports.storeGuestDetailsForCryptoPayment = exports.cryptoPaymentInitiate = exports.currencyConversion = exports.getCryptoDetails = exports.getPaymentSuccessResponse = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const catchAsyncError_1 = require("../middleware/catchAsyncError");
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const cryptoPayment_model_1 = __importStar(require("../models/cryptoPayment.model"));
const uuid_1 = require("uuid");
const cryptoUserPaymentInitialStage_model_1 = require("../models/cryptoUserPaymentInitialStage.model");
const bookings_controller_1 = require("./bookings.controller");
const notification_service_1 = require("../../../notification/src/service/notification.service");
const timezone_convert_1 = __importDefault(require("../../../utils/timezone_convert"));
let convertedAmount;
const notification = new notification_service_1.NotificationService();
const calculateAgeCategory = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    if (today.getMonth() < birthDate.getMonth() ||
        (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
        age--;
    }
    if (age <= 2)
        return { age, category: "Infant", ageCode: "7" };
    if (age <= 12)
        return { age, category: "Child", ageCode: "8" };
    return { age, category: "Adult", ageCode: "10" };
};
exports.getPaymentSuccessResponse = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { paymentId, amount } = req.query;
    try {
        const getDetails = yield cryptoPayment_model_1.default.findOne({
            payment_id: paymentId,
            amount: parseFloat(amount),
            status: "Confirmed",
        });
        if (!getDetails) {
            return res.status(404).json({
                message: "Payment still not confirmed or not found",
            });
        }
        return res.status(200).json({
            message: "Payment confirmed successfully",
        });
    }
    catch (error) {
        return next(new errorHandler_1.default("Internal server error", 500));
    }
}));
exports.getCryptoDetails = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const collection = mongoose_1.default.connection.collection("CryptoDetails");
        const { token } = req.query;
        if (token) {
            const tokenDoc = yield collection.findOne({ name: token }, {
                projection: {
                    _id: 0,
                    "networks.name": 1,
                    "networks.imageUrl": 1,
                    "networks.contractAddress": 1,
                    "networks.chainId": 1
                },
            });
            if (!tokenDoc) {
                return res.status(404).json({
                    message: `Token '${token}' not found`,
                });
            }
            return res.status(200).json({
                message: "Network details fetched successfully",
                data: tokenDoc.networks,
            });
        }
        const allTokens = yield collection
            .find({}, { projection: { _id: 0, name: 1, imageUrl: 1 } })
            .toArray();
        return res.status(200).json({
            success: true,
            message: "Token list fetched successfully",
            data: allTokens,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default("Internal server error", 500));
    }
}));
exports.currencyConversion = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Entered in CURRENCY CONVERSION controller");
    try {
        const { currency, amount } = req.body;
        console.log(`The data get from UI for currency conversion is:\n#################### ${JSON.stringify(req.body)}`);
        const requiredFields = { currency, amount };
        const missingFields = Object.entries(requiredFields)
            .filter(([_, value]) => value === undefined || value === null || value === "")
            .map(([key]) => key);
        if (missingFields.length > 0) {
            return res.status(400).json({
                message: `Missing required fields: ${missingFields.join(", ")}`,
            });
        }
        if (currency.toUpperCase() === "USD") {
            convertedAmount = amount || 0;
            console.log(`The currency is ${currency} and amount is ${amount}`);
            return res.status(200).json({
                message: "Currency conversion successful",
                data: {
                    convertedAmount: amount,
                    conversionRate: 0,
                },
            });
        }
        let conversionRate = parseFloat(process.env.CURRENCY_CONVERSION_BASE_RATE || "0");
        if (isNaN(conversionRate) || conversionRate === 0) {
            return res.status(500).json({
                message: "Conversion rate is not properly configured in environment variables.",
            });
        }
        convertedAmount = parseFloat((parseFloat(amount) / conversionRate).toFixed(2));
        console.log(`The converted amount is ${convertedAmount} and conversion rate is ${conversionRate}`);
        return res.status(200).json({
            message: "Currency conversion successful",
            data: {
                convertedAmount,
                conversionRate,
            },
        });
    }
    catch (error) {
        return next(new errorHandler_1.default("Internal server error", 500));
    }
}));
exports.cryptoPaymentInitiate = (0, catchAsyncError_1.CatchAsyncError)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: "User ID not found in token" });
        }
        const { token, blockchain, currency, amount } = req.body;
        const requiredFields = { token, blockchain, currency, amount, userId };
        const missingFields = Object.entries(requiredFields)
            .filter(([_, value]) => value === undefined || value === null || value === "")
            .map(([key]) => key);
        if (missingFields.length > 0) {
            return res.status(400).json({
                message: `Missing required fields: ${missingFields.join(", ")}`,
            });
        }
        if (amount !== convertedAmount) {
            return res.status(400).json({
                message: "Amount not matched in crypto payment initiation",
            });
        }
        const baseAmount = parseFloat(amount);
        const fortyMinuteAgo = new Date(Date.now() - 40 * 60 * 1000);
        let finalAmount = null;
        for (let i = 0; i < 100; i++) {
            const candidateAmount = parseFloat((baseAmount + i / 100).toFixed(2));
            const exists = yield cryptoPayment_model_1.default.findOne({
                amount: candidateAmount,
                status: "Pending",
                createdAt: { $gte: fortyMinuteAgo },
            });
            if (!exists) {
                finalAmount = candidateAmount;
                break;
            }
        }
        if (finalAmount === null) {
            return res.status(500).json({ message: "All amount variations are already used. Try again later." });
        }
        console.log(`##############The time zone data ${(0, timezone_convert_1.default)()}`);
        // console.log(`########## Date - ${new Date().toLocaleString}`)
        const cryptoPaymentDetails = new cryptoPayment_model_1.default({
            customer_id: new mongoose_1.Types.ObjectId(userId),
            token,
            blockchain,
            payment_id: (0, uuid_1.v4)(),
            amount: finalAmount,
            status: "Pending",
        });
        yield cryptoPaymentDetails.save();
        convertedAmount = finalAmount;
        return res.status(200).json({
            message: "Crypto payment initiated successfully",
            data: cryptoPaymentDetails,
        });
    }
    catch (error) {
        return res.status(500).json({ message: "Internal server error", error });
    }
}));
exports.storeGuestDetailsForCryptoPayment = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
    }
    const { checkInDate, checkOutDate, hotelCode, hotelName, ratePlanCode, numberOfRooms, roomTypeCode, roomTotalPrice, currencyCode, email, phone, guests } = req.body;
    console.log(`The guest details we get is:\n#################### ${JSON.stringify(req.body)}`);
    const requiredFields = {
        checkInDate,
        checkOutDate,
        hotelCode,
        hotelName,
        ratePlanCode,
        numberOfRooms,
        roomTypeCode,
        roomTotalPrice,
        currencyCode,
        email,
        phone,
        guests
    };
    const missingFields = Object.entries(requiredFields)
        .filter(([_, value]) => value === undefined || value === null || value === "")
        .map(([key]) => key);
    if (missingFields.length > 0) {
        return res.status(400).json({
            message: `Missing required fields: ${missingFields.join(", ")}`,
        });
    }
    console.log(`The amount in crypto guest details storage is ${roomTotalPrice}`);
    if (roomTotalPrice !== convertedAmount) {
        return res.status(400).json({
            message: "Amount not matched in guest details initialize",
        });
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    if (checkIn < today || checkOut <= checkIn) {
        return res.status(400).json({
            message: "Check-in date cannot be in the past or Check-out date must be after check-in date",
        });
    }
    if (!Array.isArray(guests) || guests.length === 0) {
        return res.status(400).json({ message: "Guest details are required" });
    }
    const ageCodeCount = { "7": 0, "8": 0, "10": 0 };
    const categorizedGuests = guests.map(({ firstName, lastName, dob }) => {
        if (!dob)
            throw new Error(`DOB missing for ${firstName} ${lastName}`);
        const { age, category, ageCode } = calculateAgeCategory(dob);
        ageCodeCount[ageCode] = (ageCodeCount[ageCode] || 0) + 1;
        return { firstName, lastName, dob, age, category, ageCode };
    });
    try {
        const reservationId = (0, uuid_1.v4)();
        const newBooking = new cryptoUserPaymentInitialStage_model_1.CryptoGuestDetails({
            reservationId,
            hotelCode,
            hotelName,
            ratePlanCode,
            roomTypeCode,
            checkInDate: checkIn,
            checkOutDate: checkOut,
            guestDetails: guests.map(({ firstName, lastName, dob }) => ({ firstName, lastName, dob })),
            email,
            phone,
            ageCodeSummary: ageCodeCount,
            numberOfRooms,
            totalAmount: roomTotalPrice,
            // currencyCode: currencyCode.toUpperCase() || "USD",
            userId,
            status: "Processing",
            createdAt: new Date(),
        });
        yield newBooking.save();
        convertedAmount = 0;
        res.status(200).json({
            message: "Reservation received and stored successfully",
            reservationId,
            numberOfRooms,
            roomTotalPrice,
            guests: categorizedGuests,
            ageCodeSummary: ageCodeCount,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to store reservation",
            error,
        });
    }
}));
exports.pushCryptoPaymentDetails = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { senderWalletAddress, token, blockChain, amount, txHash } = req.body;
        console.log("Received data:", { token, blockChain, amount, txHash });
        const requiredFields = { token, blockChain, amount, txHash };
        const missingFields = Object.entries(requiredFields)
            .filter(([_, value]) => value === undefined || value === null || value === "")
            .map(([key]) => key);
        if (missingFields.length > 0) {
            return res.status(400).json({
                message: `Missing required fields: ${missingFields.join(", ")}`,
            });
        }
        const cryptoPaymentLog = new cryptoPayment_model_1.CryptoPaymentLog({
            token,
            blockchain: blockChain,
            amount: parseFloat(amount),
            txHash,
            senderWalletAddress,
        });
        console.log(">>>>>>>> CryptoPaymentLog:", cryptoPaymentLog, "parsedamount is ", parseFloat(amount));
        yield cryptoPaymentLog.save();
        const payment = yield cryptoPayment_model_1.default.findOne({
            token,
            blockchain: blockChain,
            amount: parseFloat(amount),
            status: "Pending",
        });
        if (payment) {
            // await notification.sendCryptoPaymentNotification(payment.customer_id.toString(), parseFloat(amount), txHash)
            console.log(`The payment details we get is ${payment}`);
            console.log("----------11111111111111111111-------------------------");
        }
        const guestDetails = yield cryptoUserPaymentInitialStage_model_1.CryptoGuestDetails.findOne({
            totalAmount: parseFloat(amount),
            status: "Processing",
        });
        console.log(">>>>>>>>>>>>>", guestDetails);
        if (!payment) {
            return res.status(404).json({
                message: "No matching pending payment found for the provided details.",
            });
        }
        if (!guestDetails) {
            return res.status(404).json({
                message: "No matching guest details found for the provided amount.",
            });
        }
        payment.status = "Confirmed";
        guestDetails.status = "Confirmed";
        payment.txHash = txHash;
        payment.senderWalletAddress = senderWalletAddress;
        guestDetails.txHash = txHash;
        guestDetails.senderWalletAddress = senderWalletAddress;
        yield payment.save();
        yield guestDetails.save();
        console.log("Payment and guest details updated successfully");
        const cryptoPaymentDetails = yield (0, bookings_controller_1.createReservationWithCryptoPayment)({
            reservationId: guestDetails.reservationId,
            userId: (_a = guestDetails === null || guestDetails === void 0 ? void 0 : guestDetails.userId) !== null && _a !== void 0 ? _a : "",
            checkInDate: guestDetails.checkInDate,
            checkOutDate: guestDetails.checkOutDate,
            hotelCode: guestDetails.hotelCode || "WINCLOUD",
            hotelName: guestDetails.hotelName,
            ratePlanCode: guestDetails.ratePlanCode,
            numberOfRooms: guestDetails.numberOfRooms,
            roomTypeCode: guestDetails.roomTypeCode,
            roomTotalPrice: guestDetails.totalAmount,
            currencyCode: guestDetails.currencyCode.toUpperCase(),
            email: guestDetails.email,
            phone: guestDetails.phone,
            guests: (_b = guestDetails.guestDetails) !== null && _b !== void 0 ? _b : [],
        });
        if (cryptoPaymentDetails) {
            yield notification.sendCryptoPaymentNotification(payment.customer_id.toString(), parseFloat(amount), txHash);
            console.log("----------11111111111111111111-------------------------");
        }
        return res.status(200).json({
            message: "Payment confirmed successfully",
            data: payment,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default("Internal server error", 500));
    }
}));
exports.getWalletAddress = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const collection = mongoose_1.default.connection.collection("CryptoWalletAddress");
    try {
        console.log("");
        const walletAddress = yield collection.find({}, { projection: { _id: 0, wallet_address: 1 } }).toArray();
        return res.status(200).json({
            success: true,
            message: "Token list fetched successfully",
            address: walletAddress,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default("Internal server error", 500));
    }
}));
exports.getInitiatedPaymentDetails = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { amount } = req.query;
    if (!userId || !amount) {
        return res.status(400).json({
            message: `Missing userId or initiated amount fields`,
        });
    }
    console.log(`Get data from UI by QUERY userid: ${userId}, amount: ${amount}`);
    try {
        const customerId = mongoose_1.default.Types.ObjectId.isValid(userId) ? new mongoose_1.default.Types.ObjectId(userId) : null;
        const amountNumber = Number(amount);
        if (!customerId || isNaN(amountNumber)) {
            return res.status(400).json({
                message: 'Invalid userId or amount format',
            });
        }
        const paymentDetails = yield cryptoPayment_model_1.default.findOne({
            customer_id: customerId,
            amount: amountNumber,
            status: 'Pending',
        });
        if (!paymentDetails) {
            return res.status(404).json({
                message: 'No matching payment details found',
            });
        }
        return res.status(200).json({
            message: 'Payment details retrieved successfully',
            paymentDetails,
        });
    }
    catch (error) {
        console.error('❌ Error retrieving payment details:', error);
        return res.status(500).json({
            message: 'Internal server error',
            error: error.message,
        });
    }
}));
//# sourceMappingURL=crypto.controller.js.map