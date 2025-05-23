import { generateCouponCodeRepo, validateCouponCodeRepo } from '../repository/couponRepository';
import { generateRandomCode } from '../utils/codeGenerator';
import PromoCode from '../model/couponModel';
import mongoose from 'mongoose';

export const generateCouponCode = async () => {
  const code = generateRandomCode(12);
  const discountPercentage = parseFloat(process.env.COUPON_DISCOUNT_PERCENT || '10');
  return await generateCouponCodeRepo({
    code,
    discountPercentage,
  });
};


export const validateCouponCode = async (code: string, userId: string, bookingAmount: number) => {
  return await validateCouponCodeRepo(code, userId, bookingAmount);
};