"use strict";
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
exports.createSetupIntent = exports.createPaymentIntent = void 0;
const catchAsyncError_1 = require("../middleware/catchAsyncError");
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const stripe_service_1 = __importDefault(require("../services/stripe.service"));
/**
 * Creates a payment intent for processing payments
 */
exports.createPaymentIntent = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { amount, currency } = req.body;
        const result = yield stripe_service_1.default.createPaymentIntent(amount, currency);
        if (!result.success) {
            return next(new errorHandler_1.default(result.error, 500));
        }
        console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%\n", result);
        res.json({ clientSecret: result.clientSecret });
    }
    catch (error) {
        console.error('#################################\n Internal Error:', error.message);
        return res.status(500).json({ error: 'An error occurred while creating the payment intent. Please try again later.' });
    }
}));
/**
 * Creates a setup intent for saving payment methods
 */
exports.createSetupIntent = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield stripe_service_1.default.createSetupIntent();
        if (!result.success) {
            return next(new errorHandler_1.default(result.error, 500));
        }
        res.status(200).json({
            success: true,
            clientSecret: result.clientSecret
        });
    }
    catch (error) {
        console.error("Setup Intent Error:", error);
        return next(new errorHandler_1.default(error.message, 500));
    }
}));
//# sourceMappingURL=payment.controller.js.map