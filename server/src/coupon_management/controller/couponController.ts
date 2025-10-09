// controllers/promoController.ts
import { Request, Response } from 'express';
// import asyncHandler from 'express-async-handler';
import * as promoService from '../services/couponService';
import { AuthenticatedRequest } from '../types/custom';

// export const generateCouponCode = asyncHandler(async (req: Request, res: Response) => {
//   const promoCode = await promoService.generateCouponCode();
//   res.status(201).json({ success: true, data: promoCode });
// });


export const generateCouponCode = async (req: Request, res: Response) => {
  const promoCode = await promoService.generateCouponCode();
  res.status(201).json({ success: true, data: promoCode });
};

export const getCouponDetails = async (req: AuthenticatedRequest, res: Response) => {
  const { code } = req.params;
  const userId = req.user?.id;
  if (!userId) {
    res.status(400).json({ success: false, message: 'User not authenticated' });
    return;
  }
  const result = await promoService.getCouponDetailService(code);
  res.status(200).json({ success: true, data: result });
};
// export const getCouponDetails = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
//   const { code } = req.params;
//   const userId = req.user?.id;
//   if (!userId) {
//     res.status(400).json({ success: false, message: 'User not authenticated' });
//     return;
//   }
//   const result = await promoService.getCouponDetailService(code);
//   res.status(200).json({ success: true, data: result });
// });

export const validateCouponCode = async (req: AuthenticatedRequest, res: Response) => {
  const { code, bookingAmount, isUsed } = req.body;
  const userId = req.user?._id;
  const result = await promoService.validateCouponCode(code, userId!, bookingAmount, isUsed);
  res.status(200).json({ success: true, data: result });
};
// export const validateCouponCode = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
//   const { code, bookingAmount } = req.body;
//   const userId = req.user?._id;
//   const result = await promoService.validateCouponCode(code, userId!, bookingAmount);
//   res.status(200).json({ success: true, data: result });
// });