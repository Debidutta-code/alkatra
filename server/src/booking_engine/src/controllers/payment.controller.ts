// controllers/payment.controller.ts
import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/errorHandler";
import stripeService from "../services/stripe.service";

/**
 * Creates a payment intent for processing payments
 */
export const createPaymentIntent = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { amount, currency } = req.body;

      const result = await stripeService.createPaymentIntent(amount, currency);

      if (!result.success) {
        return next(new ErrorHandler(result.error, 500));
      }

      console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%\n", result);
      res.json({ clientSecret: result.clientSecret });
    } catch (error: any) {
      console.error('#################################\n Internal Error:', error.message);
      return res.status(500).json({ error: 'An error occurred while creating the payment intent. Please try again later.' });
    }
  }
);

/**
 * Creates a setup intent for saving payment methods
 */
export const createSetupIntent = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await stripeService.createSetupIntent();
      
      if (!result.success) {
        return next(new ErrorHandler(result.error, 500));
      }
      
      res.status(200).json({
        success: true,
        clientSecret: result.clientSecret
      });
    } catch (error: any) {
      console.error("Setup Intent Error:", error);
      return next(new ErrorHandler(error.message, 500));
    }
  }
);