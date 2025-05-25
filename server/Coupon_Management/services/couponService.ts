import { generateCouponCodeRepo, validateCouponCodeRepo } from '../repository/couponRepository';
import { generateRandomCode } from '../utils/codeGenerator';
import CouponCodeModel from '../model/couponModel';

export const generateCouponCode = async () => {
  const code = generateRandomCode(12);
  const discountPercentage = parseFloat(process.env.COUPON_DISCOUNT_PERCENT || '10');
  return await generateCouponCodeRepo({
    code,
    discountPercentage,
  });
};

export const getCouponDetailService = async (code: string) => {
  const coupon = await CouponCodeModel.findOne({ code});
  if (!coupon) {
    throw new Error('Coupon not found');
  }
  return {
    code: coupon.code,
    discountPercentage: coupon.discountPercentage,
    isUsed: coupon.isUsed,
    createdAt: coupon.createdAt,  
  };
};

export const validateCouponCode = async (code: string, userId: string, bookingAmount: number) => {
  return await validateCouponCodeRepo(code, userId, bookingAmount);
};