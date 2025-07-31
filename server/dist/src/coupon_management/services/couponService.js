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
exports.validateCouponCode = exports.getCouponDetailService = exports.generateCouponCode = void 0;
const couponRepository_1 = require("../repository/couponRepository");
const codeGenerator_1 = require("../utils/codeGenerator");
const couponModel_1 = __importDefault(require("../model/couponModel"));
const generateCouponCode = () => __awaiter(void 0, void 0, void 0, function* () {
    const code = (0, codeGenerator_1.generateRandomCode)(12);
    const discountPercentage = parseFloat(process.env.COUPON_DISCOUNT_PERCENT || '10');
    return yield (0, couponRepository_1.generateCouponCodeRepo)({
        code,
        discountPercentage,
    });
});
exports.generateCouponCode = generateCouponCode;
const getCouponDetailService = (code) => __awaiter(void 0, void 0, void 0, function* () {
    const coupon = yield couponModel_1.default.findOne({ code });
    if (!coupon) {
        throw new Error('Coupon not found');
    }
    return {
        code: coupon.code,
        discountPercentage: coupon.discountPercentage,
        isUsed: coupon.isUsed,
        createdAt: coupon.createdAt,
    };
});
exports.getCouponDetailService = getCouponDetailService;
const validateCouponCode = (code, userId, bookingAmount) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, couponRepository_1.validateCouponCodeRepo)(code, userId, bookingAmount);
});
exports.validateCouponCode = validateCouponCode;
//# sourceMappingURL=couponService.js.map