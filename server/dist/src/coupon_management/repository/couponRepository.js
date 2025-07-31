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
exports.validateCouponCodeRepo = exports.generateCouponCodeRepo = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const couponModel_1 = __importDefault(require("../model/couponModel"));
const generateCouponCodeRepo = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const { code, discountPercentage } = input;
    const existingCode = yield couponModel_1.default.findOne({ code });
    if (existingCode) {
        throw new Error('Promo code already exists');
    }
    const promoCode = new couponModel_1.default({
        code,
        isUsed: false,
        discountPercentage,
    });
    return yield promoCode.save();
});
exports.generateCouponCodeRepo = generateCouponCodeRepo;
const validateCouponCodeRepo = (code, userId, bookingAmount) => __awaiter(void 0, void 0, void 0, function* () {
    const promoCode = yield couponModel_1.default.findOne({ code });
    if (!promoCode) {
        return { isValid: false, discountAmount: 0, message: 'Coupon not found' };
    }
    if (promoCode.isUsed) {
        return { isValid: false, discountAmount: 0, message: 'Coupon invalid' };
    }
    promoCode.customerId = new mongoose_1.default.Types.ObjectId(userId);
    promoCode.isUsed = true;
    yield promoCode.save();
    const discountAmount = (bookingAmount * promoCode.discountPercentage) / 100;
    return { isValid: true, discountAmount };
});
exports.validateCouponCodeRepo = validateCouponCodeRepo;
//# sourceMappingURL=couponRepository.js.map