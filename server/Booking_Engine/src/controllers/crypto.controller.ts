import { Request, Response, NextFunction } from "express";
import mongoose, { Types } from "mongoose";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/errorHandler";
import AuthModelType from "../../../User-Authentication/src/Model/auth.model";
import { AuthenticatedRequest } from "../../../Customer-Authentication/src/types/custom";
import CryptoPaymentDetails, { CryptoPaymentLog } from "../models/cryptoPayment.model";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { CryptoGuestDetails } from "../models/cryptoUserPaymentInitialStage.model";
import { createReservationWithCryptoPayment } from "./bookings.controller";

let convertedAmount: number;

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


export const getCryptoDetails = CatchAsyncError(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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


export const cryptoPaymentInitiate = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
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
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    let finalAmount: number | null = null;

    for (let i = 0; i < 100; i++) {
      const candidateAmount = parseFloat((baseAmount + i / 100).toFixed(2));

      const exists = await CryptoPaymentDetails.findOne({
        amount: candidateAmount,
        status: "Pending",
        createdAt: { $gte: oneHourAgo },
      });

      if (!exists) {
        finalAmount = candidateAmount;
        break;
      }
    }

    if (finalAmount === null) {
      return res.status(500).json({ message: "All amount variations are already used. Try again later." });
    }
    const cryptoPaymentDetails = new CryptoPaymentDetails({
      customer_id: new Types.ObjectId(userId),
      token,
      blockchain,
      payment_id: uuidv4(),
      amount: finalAmount,
      status: "Pending",
    });

    await cryptoPaymentDetails.save();
    convertedAmount = amount;

    return res.status(200).json({
      message: "Crypto payment initiated successfully",
      data: cryptoPaymentDetails,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};


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
      currencyCode,
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

    const guestDetails = await CryptoGuestDetails.findOne({
      totalAmount: parseFloat(amount),
      status: "Processing",
    });

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

    await createReservationWithCryptoPayment({
      reservationId: guestDetails.reservationId,
      userId: guestDetails?.userId ?? "",
      checkInDate: guestDetails.checkInDate,
      checkOutDate: guestDetails.checkOutDate,
      hotelCode: guestDetails.hotelCode,
      hotelName: guestDetails.hotelName,
      ratePlanCode: guestDetails.ratePlanCode,
      numberOfRooms: guestDetails.numberOfRooms,
      roomTypeCode: guestDetails.roomTypeCode,
      roomTotalPrice: guestDetails.totalAmount,
      currencyCode: guestDetails.currencyCode,
      email: guestDetails.email,
      phone: guestDetails.phone,
      guests: guestDetails.guestDetails ?? [],
    });

    return res.status(200).json({
      message: "Payment confirmed successfully",
      data: payment,
    });
  } catch (error) {
    return next(new ErrorHandler("Internal server error", 500));
  }
});

export const getWalletAddress = CatchAsyncError(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  console.log("Entering into get wallet address");
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