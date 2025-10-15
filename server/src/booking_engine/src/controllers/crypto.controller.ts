import { Response, NextFunction } from "express";
import mongoose, { Types } from "mongoose";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/errorHandler";
import { AuthenticatedRequest } from "../../../customer_authentication/src/types/custom";
import CryptoPaymentDetails, { CryptoPaymentLog } from "../models/cryptoPayment.model";
import { v4 as uuidv4 } from "uuid";
import { CryptoGuestDetails } from "../models/cryptoUserPaymentInitialStage.model";
import { BookingController } from "./bookings.controller";
import { NotificationService } from "../../../notification/src/service/notification.service";
import { BookAgainAvailabilityService, AmendBookingService } from "../services";
import { PromoCodeService } from "../../../property_management/src/service";
import { Promocode } from "../../../property_management/src/model";
import CouponModel from "../../../coupon_management/model/couponModel";


const amendBookingService = AmendBookingService.getInstance();
const bookAgainService = BookAgainAvailabilityService.getInstance();
const promoCodeService = PromoCodeService.getInstance();
const bookingController = new BookingController(amendBookingService, bookAgainService, promoCodeService);

let convertedAmount: number;

const notification = new NotificationService()

const calculateAgeCategory = (dob: string) => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  if (
    today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  if (age <= 2) return { age, category: "Infant", ageCode: "7" };
  if (age <= 12) return { age, category: "Child", ageCode: "8" };
  return { age, category: "Adult", ageCode: "10" };
};

export const getPaymentSuccessResponse = CatchAsyncError(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { paymentId, amount } = req.query;
  try {
    const getDetails = await CryptoPaymentDetails.findOne({
      payment_id: paymentId,
      amount: parseFloat(amount as string),
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
    return next(new ErrorHandler("Internal server error", 500));
  }
});


export const getCryptoDetails = CatchAsyncError(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const collection = mongoose.connection.collection("CryptoDetails");
    const { token } = req.query;

    if (token) {
      const tokenDoc = await collection.findOne(
        { name: token },
        {
          projection: {
            _id: 0,
            "networks.name": 1,
            "networks.imageUrl": 1,
            "networks.contractAddress": 1,
            "networks.chainId": 1
          },
        }
      );

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

    const allTokens = await collection
      .find({}, { projection: { _id: 0, name: 1, imageUrl: 1 } })
      .toArray();

    return res.status(200).json({
      success: true,
      message: "Token list fetched successfully",
      data: allTokens,
    });
  } catch (error) {
    return next(new ErrorHandler("Internal server error", 500));
  }
}
);


export const currencyConversion = CatchAsyncError(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { currency, amount } = req.body;

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
      console.log(`CURRENCY CONVERSION: The currency is ${currency} and amount is ${amount}`);
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

    return res.status(200).json({
      message: "Currency conversion successful",
      data: {
        convertedAmount,
        conversionRate,
      },
    });
  } catch (error) {
    return next(new ErrorHandler("Internal server error", 500));
  }
});

export const cryptoPaymentInitiate = CatchAsyncError(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "User ID not found in token" });
    }

    const { token, blockchain, currency, amount, provider, coupon, taxValue } = req.body;
    console.log("The tax value we get", taxValue);

    const requiredFields = { token, blockchain, currency, amount, userId };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => value === undefined || value === null || value === "")
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    let couponCodes: string[] = [];
    let couponDetails: any[] = [];

    // Only extract and check coupons if coupon field is provided
    if (coupon !== undefined && coupon !== null && coupon !== '') {
      couponCodes = extractCouponCodes(coupon);

      // Only get coupon details if we have valid coupon codes
      if (couponCodes.length > 0) {
        couponDetails = await getCouponDetails(couponCodes);
      }
    }

    const baseAmount = parseFloat(amount);
    const fortyMinuteAgo = new Date(Date.now() - 40 * 60 * 1000);

    let finalAmount: number | null = null;

    for (let i = 0; i < 100; i++) {
      const candidateAmount = parseFloat((baseAmount + i / 100).toFixed(2));

      const exists = await CryptoPaymentDetails.findOne({
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

    convertedAmount = finalAmount;

    const cryptoPaymentDetails = new CryptoPaymentDetails({
      customer_id: new Types.ObjectId(userId),
      provider,
      coupon: couponCodes, // Store extracted coupon codes (empty array if no coupons)
      taxValue: taxValue || 0,
      token,
      blockchain,
      payment_id: uuidv4(),
      amount: finalAmount,
      status: "Pending",
    });

    await cryptoPaymentDetails.save();

    // Convert to plain object to add extra field
    const paymentResponse = cryptoPaymentDetails.toObject() as typeof cryptoPaymentDetails & { couponDetails?: any[] };

    // Add couponDetails field to the response
    paymentResponse.couponDetails = couponDetails;

    return res.status(200).json({
      message: "Crypto payment initiated successfully",
      data: paymentResponse
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
});


export const storeGuestDetailsForCryptoPayment = CatchAsyncError(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  const {
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
  } = req.body;

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

  const ageCodeCount: Record<string, number> = { "7": 0, "8": 0, "10": 0 };

  const categorizedGuests = guests.map(({ firstName, lastName, dob }) => {
    if (!dob) throw new Error(`DOB missing for ${firstName} ${lastName}`);
    const { age, category, ageCode } = calculateAgeCategory(dob);
    ageCodeCount[ageCode] = (ageCodeCount[ageCode] || 0) + 1;
    return { firstName, lastName, dob, age, category, ageCode };
  });
  try {
    const reservationId = uuidv4();
    const newBooking = new CryptoGuestDetails({
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
      currencyCode: currencyCode.toUpperCase() || "USD",
      userId,
      status: "Processing",
      createdAt: new Date(),
    });
    await newBooking.save();
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
});


export const pushCryptoPaymentDetails = CatchAsyncError(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { senderWalletAddress, token, blockChain, amount, txHash } = req.body;

    const requiredFields = { token, blockChain, amount, txHash };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => value === undefined || value === null || value === "")
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }
    const cryptoPaymentLog = new CryptoPaymentLog({
      token,
      blockchain: blockChain,
      amount: parseFloat(amount),
      txHash,
      senderWalletAddress,
    });

    await cryptoPaymentLog.save();

    const payment = await CryptoPaymentDetails.findOne({
      token,
      blockchain: blockChain,
      amount: parseFloat(amount),
      status: "Pending",
    });

    if (payment) {
      console.log(`The payment details we get is ${payment}`);
      console.log("----------11111111111111111111-------------------------")
    }

    const guestDetails = await CryptoGuestDetails.findOne({
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
    (payment as any).txHash = txHash;
    (payment as any).senderWalletAddress = senderWalletAddress;
    (guestDetails as any).txHash = txHash;
    (guestDetails as any).senderWalletAddress = senderWalletAddress;
    await payment.save();
    await guestDetails.save();
    console.log("Payment and guest details updated successfully");

    const cryptoPaymentDetails = await bookingController.createReservationWithCryptoPayment({
      provider: payment.provider,
      coupon: payment.coupon,
      reservationId: guestDetails.reservationId,
      userId: guestDetails?.userId ?? "",
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
      guests: guestDetails.guestDetails ?? [],
    });

    if (cryptoPaymentDetails) {
      const notificationSend = notification.sendCryptoPaymentNotification(payment.customer_id.toString(), parseFloat(amount), txHash);
    }

    return res.status(200).json({
      message: "Payment confirmed successfully",
      data: payment,
    });
  } catch (error) {
    return next(new ErrorHandler("Internal server error", 500));
  }
});

export const getWalletAddress = CatchAsyncError(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const collection = mongoose.connection.collection("CryptoWalletAddress");
  try {
    console.log("");
    const walletAddress = await collection.find({}, { projection: { _id: 0, wallet_address: 1 } }).toArray();
    return res.status(200).json({
      success: true,
      message: "Token list fetched successfully",
      address: walletAddress,
    });
  }
  catch (error) {
    return next(new ErrorHandler("Internal server error", 500));
  }
});

export const getInitiatedPaymentDetails = CatchAsyncError(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  const { amount } = req.query;
  if (!userId || !amount) {
    return res.status(400).json({
      message: `Missing userId or initiated amount fields`,
    });
  }
  console.log(`Get data from UI by QUERY userid: ${userId}, amount: ${amount}`);
  try {

    const customerId = mongoose.Types.ObjectId.isValid(userId as string) ? new mongoose.Types.ObjectId(userId as string) : null;
    const amountNumber = Number(amount);

    if (!customerId || isNaN(amountNumber)) {
      return res.status(400).json({
        message: 'Invalid userId or amount format',
      });
    }

    const paymentDetails = await CryptoPaymentDetails.findOne({
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
  } catch (error: any) {
    console.error('❌ Error retrieving payment details:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
});



/**
 * Helper function to extract coupon codes
 */

/**
 * Helper function to extract coupon codes
 */
const extractCouponCodes = (couponField: any): string[] => {
  if (!couponField) return [];
  if (Array.isArray(couponField)) {
    return couponField
      .filter(code => code && typeof code === 'string' && code.trim() !== '')
      .map(code => code.trim());
  }
  if (typeof couponField === 'string' && couponField.trim() !== '') {
    return [couponField.trim()];
  }
  return [];
};

/**
 * Helper function to get coupon details from both models
 * @param couponCodes 
 * @returns 
 */
const getCouponDetails = async (couponCodes: string[]) => {
  if (couponCodes.length === 0) return [];

  const uniqueCouponCodes = [...new Set(couponCodes)];

  // Search in both Promocode and CouponModel collections
  const [promoCodes, couponModels] = await Promise.all([
    Promocode.find({
      code: { $in: uniqueCouponCodes }
    }).select('code discountType discountValue minBookingAmount maxDiscountAmount validFrom validTo isActive'),

    CouponModel.find({
      code: { $in: uniqueCouponCodes }
    }).select('code discountPercentage')
  ]);

  const couponDetails = [];

  // Add promocodes to results
  promoCodes.forEach(coupon => {
    couponDetails.push({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minBookingAmount: coupon.minBookingAmount,
      maxDiscountAmount: coupon.maxDiscountAmount,
      validFrom: coupon.validFrom,
      validTo: coupon.validTo,
      isActive: coupon.isActive,
      source: 'promocode'
    });
  });

  // Add coupon models to results
  couponModels.forEach(coupon => {
    couponDetails.push({
      code: coupon.code,
      discountPercentage: coupon.discountPercentage,
      source: 'couponModel'
    });
  });

  return couponDetails;
};