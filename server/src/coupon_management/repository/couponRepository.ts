import mongoose from 'mongoose';
import CouponCodeModel, { ICouponCode } from '../model/couponModel';

interface GeneratePromoCodeInput {
  code: string;
  discountPercentage: number;
}

export const generateCouponCodeRepo = async (input: GeneratePromoCodeInput): Promise<ICouponCode> => {
  const { code, discountPercentage } = input;

  const existingCode = await CouponCodeModel.findOne({ code });
  if (existingCode) {
    throw new Error('Promo code already exists');
  }
  const promoCode = new CouponCodeModel({
    code,
    isUsed: false,
    discountPercentage,
  });
  return await promoCode.save();
};


export const validateCouponCodeRepo = async (
  code: string,
  userId: string,
  bookingAmount: number,
  isUsed?: string,
): Promise<{ isValid: boolean; discountAmount: number; message?: string }> => {

  const promoCode = await CouponCodeModel.findOne({ code });
  if (!promoCode) {
    return { isValid: false, discountAmount: 0, message: 'Coupon not found' };
  }

  if (promoCode.isUsed == 'true') {
    return { isValid: false, discountAmount: 0, message: 'Coupon invalid' };
  }

  promoCode.customerId = new mongoose.Types.ObjectId(userId);
  
  if (isUsed) {
    promoCode.isUsed = isUsed;
  } else {
    promoCode.isUsed = 'available';
  }

  await promoCode.save();

  const discountAmount = (bookingAmount * promoCode.discountPercentage) / 100;
  return { isValid: true, discountAmount };

};