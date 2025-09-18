import { Request, Response, NextFunction } from "express";
import mongoose, { isValidObjectId, Types } from "mongoose";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/errorHandler";
import { ThirdPartyReservationService } from '../../../wincloud/src/controller/reservationController';
import { ThirdPartyAmendReservationService } from '../../../wincloud/src/controller/amendReservationController';
import { ThirdPartyBooking } from "../../../wincloud/src/model/reservationModel";
import stripeService from "../services/stripe.service";
import { ReservationInput } from "../../../wincloud/src/interface/reservationInterface";
import { ThirdPartyCancelReservationService } from '../../../wincloud/src/service/cancelReservationService';
import { AmendReservationInput } from "../../../wincloud/src/interface/amendReservationInterface";
import { CryptoGuestDetails } from "../models/cryptoUserPaymentInitialStage.model";
import EmailService from '../../../customer_authentication/src/services/email.service';
import Handlebars from "handlebars";
import { Inventory } from "../../../wincloud/src/model/inventoryModel";
import { CustomRequest } from "../../../user_authentication/src/Utils/types";
import Auth from "../../../user_authentication/src/Model/auth.model";
import { PropertyInfo } from "../../../property_management/src/model/property.info.model";
import UserModel from "../../../user_authentication/src/Model/auth.model";
import { MailFactory } from "../../../customer_authentication/src/services/mailFactory";
import { BookAgainAvailabilityService, BookingService } from "../services";


const mailer = MailFactory.getMailer();

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
  if (age <= 13) return { age, category: "Child", ageCode: "8" };
  return { age, category: "Adult", ageCode: "10" };
};

const reduceRoomsAfterBookingConfirmed = async (
  res: Response,
  hotelCode: string,
  roomTypeCode: string,
  numberOfRooms: number,
  dates: Date[]
) => {
  console.log(`Get data for reduce rooms ${hotelCode} | ${roomTypeCode} | ${numberOfRooms} | ${dates}`);

  const requiredFields = { hotelCode, roomTypeCode, numberOfRooms, dates };
  const missingFields = Object.entries(requiredFields)
    .filter(([key, value]) => value === undefined || value === null || value === "" || (key === 'dates' && (!Array.isArray(value) || value.length !== 2)))
    .map(([key]) => key);

  if (missingFields.length > 0) {
    return {
      message: `Missing required fields: ${missingFields.join(", ")}`,
    };
  }

  const [checkInDate, checkOutDate] = dates;

  if (checkInDate >= checkOutDate) {
    return {
      message: "Check-in date must be before check-out date",
    };
  }

  try {
    // Calculate the date range excluding the checkout date
    const dateRange = [];
    let currentDate = new Date(checkInDate);
    const endDate = new Date(checkOutDate);
    while (currentDate < endDate) {
      dateRange.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const inventoryRecords = await Inventory.find({
      hotelCode,
      invTypeCode: roomTypeCode,
      'availability.startDate': {
        $in: dateRange,
      },
    });

    if (!inventoryRecords || inventoryRecords.length === 0) {
      return { message: "No available rooms found for the specified criteria" };
    }

    const bulkOps = [];

    for (const item of inventoryRecords) {
      const currentCount = item.availability?.count || 0;
      if (currentCount < numberOfRooms) {
        return {
          message: `Not enough rooms for date ${item.availability?.startDate}. Available: ${currentCount}, requested: ${numberOfRooms}`,
        };
      }

      const newCount = currentCount - numberOfRooms;

      bulkOps.push({
        updateOne: {
          filter: { _id: item._id },
          update: {
            $set: {
              'availability.count': newCount,
              updatedAt: new Date(),
            },
          },
        },
      });
    }

    const result = await Inventory.bulkWrite(bulkOps);

    return {
      message: "Room counts reduced successfully for booking",
      result,
    };

  } catch (error: any) {
    console.error("❌ Error reducing rooms after booking confirmed:", error.message || error);
    return { message: "Failed to reduce rooms after booking confirmed" };
  }
};

const reduceRoomsAfterBookingConfirmedCrypto = async (
  hotelCode: string,
  roomTypeCode: string,
  numberOfRooms: number,
  dates: Date[]
): Promise<{ message: string; result: any }> => {
  console.log(`(Crypto) Reduce rooms: ${hotelCode} | ${roomTypeCode} | ${numberOfRooms} | ${dates}`);

  const requiredFields = { hotelCode, roomTypeCode, numberOfRooms, dates };
  const missingFields = Object.entries(requiredFields)
    .filter(([_, value]) =>
      value === undefined ||
      value === null ||
      value === "" ||
      (Array.isArray(dates) && dates.length !== 2)
    )
    .map(([key]) => key);

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
  }

  const [checkInDate, checkOutDate] = dates;

  if (checkInDate > checkOutDate) {
    throw new Error("Check-in date must be before or equal to check-out date");
  }

  const dateRange = [];
  let currentDate = new Date(checkInDate);
  const endDate = new Date(checkOutDate);
  while (currentDate < endDate) {
    dateRange.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const inventoryRecords = await Inventory.find({
    hotelCode,
    invTypeCode: roomTypeCode,
    'availability.startDate': {
      $in: dateRange,
    },
  });

  if (!inventoryRecords || inventoryRecords.length === 0) {
    throw new Error("No available rooms found for the specified criteria");
  }

  const bulkOps = [];

  for (const item of inventoryRecords) {
    const currentCount = item.availability?.count || 0;
    if (currentCount < numberOfRooms) {
      throw new Error(
        `Not enough rooms for date ${item.availability?.startDate}. Available: ${currentCount}, requested: ${numberOfRooms}`
      );
    }

    const newCount = currentCount - numberOfRooms;

    bulkOps.push({
      updateOne: {
        filter: { _id: item._id },
        update: {
          $set: {
            'availability.count': newCount,
            updatedAt: new Date(),
          },
        },
      },
    });
  }

  const result = await Inventory.bulkWrite(bulkOps);
  return {
    message: "Room counts reduced successfully for booking (Crypto)",
    result,
  };
};

const increaseRoomsAfterBookingCancelled = async (
  res: Response,
  hotelCode: string,
  roomTypeCode: string,
  numberOfRooms: number,
  dates: Date[]
) => {
  console.log(`Get data to increase rooms ${hotelCode} | ${roomTypeCode} | ${numberOfRooms} | ${dates}`);

  const requiredFields = { hotelCode, roomTypeCode, numberOfRooms, dates };
  const missingFields = Object.entries(requiredFields)
    .filter(([key, value]) => value === undefined || value === null || value === "" || (key === 'startDate' && (!Array.isArray(value) || value.length !== 2)))
    .map(([key]) => key);

  if (missingFields.length > 0) {
    return {
      message: `Missing required fields: ${missingFields.join(", ")}`,
    }
  }

  const [checkInDate, checkOutDate] = dates;

  if (checkInDate > checkOutDate) {
    return {
      message: "Check-in date must be before or equal to check-out date",
    };
  }

  try {
    const dateRange = [];
    let currentDate = new Date(checkInDate);
    const endDate = new Date(checkOutDate);
    while (currentDate < endDate) {
      dateRange.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const inventoryRecords = await Inventory.find({
      hotelCode,
      invTypeCode: roomTypeCode,
      'availability.startDate': {
        $in: dateRange,
      },
    });

    if (!inventoryRecords || inventoryRecords.length === 0) {
      return { message: "No matching room inventory records found for the given dates." };
    }

    const bulkOps = [];

    for (const item of inventoryRecords) {
      const currentCount = item.availability?.count;
      const newCount = currentCount + numberOfRooms;

      bulkOps.push({
        updateOne: {
          filter: { _id: item._id },
          update: {
            $set: {
              'availability.count': newCount,
              updatedAt: new Date(),
            },
          },
        },
      });
    }

    const result = await Inventory.bulkWrite(bulkOps);

    return {
      message: "Room counts increased successfully after cancellation.",
      result,
    };

  } catch (error: any) {
    console.error("❌ Error increasing rooms after booking cancellation:", error.message || error);
    throw new Error(`Failed to increase rooms after booking cancellation: ${error.message}`);
  }
};

// New controller function to create a reservation with stored card (Pay at Hotel)
export const createReservationWithStoredCard = CatchAsyncError(
  async (req: any, res: Response, next: NextFunction) => {
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
      guests,
      paymentInfo,
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
      guests,
      paymentInfo,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => value === undefined || value === null || value === "")
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`,
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
      const customerResult = await stripeService.createOrRetrieveCustomer(
        email,
        `${guests[0].firstName} ${guests[0].lastName}`,
        phone,
        paymentInfo.paymentMethodId
      );

      if (!customerResult.success) {
        return next(new ErrorHandler(customerResult.error || "Stripe customer creation failed", 500));
      }
    }

    catch (error) {
      return res.status(500).json({
        message: "Error while interacting with Stripe",
        error: error instanceof Error ? error.message : error,
      });
    }

    const reservationInput: ReservationInput = {
      bookingDetails: {
        reservationId: "",
        paymentMethod: "payAtHotel",
        userId,
        checkInDate,
        checkOutDate,
        hotelCode,
        hotelName,
        ratePlanCode,
        roomTypeCode,
        numberOfRooms,
        roomTotalPrice,
        currencyCode,
        guests,
        email,
        phone,
      },
      ageCodeSummary: ageCodeCount,
    };

    // console.log("Reservation Input Data:", JSON.stringify(reservationInput, null, 2));

    try {
      const thirdPartyService = new ThirdPartyReservationService();
      await thirdPartyService.processThirdPartyReservation(reservationInput);
      try {
        const reduceRoomResult = await reduceRoomsAfterBookingConfirmed(
          res,
          hotelCode,
          roomTypeCode,
          numberOfRooms,
          [checkIn, checkOutDate]
        );
        if (!reduceRoomResult) {
          return res.status(400).json({ message: "Failed to reduce rooms" });
        }
      } catch (error) {
        if (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to reduce rooms";
          return res.status(400).json({ message: errorMessage });
        }
      }
      try {
        const htmlContent = `<!DOCTYPE html>
        <html lang="en">

        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }

            .container {
              max-width: 600px;
              margin: 20px auto;
              background-color: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }

            .header {
              background-color: #1a73e8;
              color: #ffffff;
              padding: 20px;
              text-align: center;
            }

            .header h1 {
              margin: 0;
              font-size: 24px;
            }

            .content {
              padding: 20px;
            }

            .content h2 {
              color: #333333;
              font-size: 20px;
              margin-top: 0;
            }

            .content p {
              color: #666666;
              line-height: 1.6;
              margin: 10px 0;
            }

            .details-table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }

            .details-table th,
            .details-table td {
              padding: 10px;
              text-align: left;
              border-bottom: 1px solid #dddddd;
            }

            .details-table th {
              background-color: #f8f8f8;
              color: #333333;
              font-weight: bold;
            }

            .footer {
              background-color: #f4f4f4;
              padding: 15px;
              text-align: center;
              color: #888888;
              font-size: 12px;
            }

            .button {
              display: inline-block;
              padding: 10px 20px;
              margin: 20px 0;
              background-color: #1a73e8;
              color: #ffffff;
              text-decoration: none;
              border-radius: 5px;
              font-weight: bold;
              text-color
            }

            @media only screen and (max-width: 600px) {
              .container {
                width: 100%;
                margin: 10px;
              }

              .header h1 {
                font-size: 20px;
              }

              .content h2 {
                font-size: 18px;
              }
            }
          </style>
        </head>

        <body>
          <div class="container">
            <div class="header">
              <h1>Booking Confirmation</h1>
            </div>
            <div class="content">
              <h2>Dear {{guestName}},</h2>
              <p>Thank you for your booking with {{hotelName}}! We are excited to confirm your booking details below.</p>

              <h2>Reservation Details</h2>
              <table class="details-table">
                <tr>
                  <th>Hotel Name</th>
                  <td>{{hotelName}}</td>
                </tr>
                <tr>
                  <th>Check-In Date</th>
                  <td>{{checkInDate}}</td>
                </tr>
                <tr>
                  <th>Check-Out Date</th>
                  <td>{{checkOutDate}}</td>
                </tr>
                <tr>
                  <th>Room Type</th>
                  <td>{{roomTypeCode}}</td>
                </tr>
                <tr>
                  <th>Number of Rooms</th>
                  <td>{{numberOfRooms}}</td>
                </tr>
                <tr>
                  <th>Total Price</th>
                  <td>{{roomTotalPrice}} {{currencyCode}}</td>
                </tr>
                <tr>
                  <th>Contact Email</th>
                  <td>{{email}}</td>
                </tr>
                <tr>
                  <th>Contact Phone</th>
                  <td>+{{phone}}</td>
                </tr>
              </table>

              <h2>Guest Details</h2>
              <table class="details-table">
                <tr>
                  <th>Name</th>
                  <th>Age Category</th>
                </tr>
                {{#each guests}}
                <tr>
                  <td>{{firstName}} {{lastName}}</td>
                  <td>{{category}} (Age {{age}})</td>
                </tr>
                {{/each}}
              </table>

              <p>For any questions or to modify your reservation, please contact us at <a
                  href="mailto:{{supportEmail}}">{{supportEmail}}</a>.</p>

              <a href="{{websiteUrl}}" class="button">View Your Booking</a>
            </div>
            <div class="footer">
              <p>&copy; {{currentYear}} {{companyName}}. All rights reserved.</p>
            </div>
          </div>
        </body>

        </html>`;

        const templateData = {
          guestName: `${guests[0].firstName} ${guests[0].lastName}`,
          hotelName: hotelName,
          checkInDate: new Date(checkInDate).toLocaleDateString(),
          checkOutDate: new Date(checkOutDate).toLocaleDateString(),
          roomTypeCode: roomTypeCode,
          numberOfRooms: numberOfRooms,
          roomTotalPrice: roomTotalPrice,
          currencyCode: currencyCode,
          email: email,
          phone: phone,
          guests: categorizedGuests,
          supportEmail: 'business.alhajz@gmail.com',
          // supportPhone: '+1-800-123-4567',
          websiteUrl: 'https://alhajz.ai',
          currentYear: new Date().getFullYear(),
          companyName: 'Al-Hajz',
        };

        // Compile the Handlebars template
        const template = Handlebars.compile(htmlContent);

        // Generate the final HTML by replacing placeholders with actual data
        const finalHtml = template(templateData);

        await mailer.sendMail({
          to: email,
          subject: `Booking Confirmation - ${hotelName}`,
          html: finalHtml,
          text: `Your booking has been confirmed`,
        });




      }
      catch (error: any) {
        return res.status(500).json({ message: "❌ Failed to send confirmation email" });
      }
    } catch (error: any) {
      return res.status(500).json({ message: "Failed to process reservation with third-party" });
    }

    res.status(200).json({
      message: "Reservation received",
      numberOfRooms,
      roomTotalPrice,
      guests: categorizedGuests,
      ageCodeSummary: ageCodeCount,
    });
  }
);

export async function createReservationWithCryptoPayment(input: {
  reservationId?: string;
  userId: string;
  checkInDate: string;
  checkOutDate: string;
  hotelCode: string;
  hotelName: string;
  ratePlanCode: string;
  numberOfRooms: number;
  roomTypeCode: string;
  roomTotalPrice: number;
  currencyCode: string;
  email: string;
  phone: string;
  guests: { firstName: string; lastName: string; dob: string }[];
}) {
  try {
    const {
      reservationId,
      userId,
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
      guests,
    } = input;

    console.log(`BOOKING Controller, crypto booking begins ${currencyCode} ${roomTotalPrice}`)

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkIn < today || checkOut <= checkIn) {
      throw new Error("Check-in date cannot be in the past or Check-out date must be after check-in date");
    }

    if (!Array.isArray(guests) || guests.length === 0) {
      throw new Error("Guest details are required");
    }

    const ageCodeCount: Record<string, number> = { "7": 0, "8": 0, "10": 0 };

    const categorizedGuests = guests.map(({ firstName, lastName, dob }) => {
      if (!dob) throw new Error(`DOB missing for ${firstName} ${lastName}`);
      const { age, category, ageCode } = calculateAgeCategory(dob);
      ageCodeCount[ageCode] = (ageCodeCount[ageCode] || 0) + 1;
      return { firstName, lastName, dob, age, category, ageCode };
    });

    const reservationInput: ReservationInput = {
      bookingDetails: {
        reservationId: reservationId ?? "",
        paymentMethod: "crypto",
        userId,
        checkInDate,
        checkOutDate,
        hotelCode,
        hotelName,
        ratePlanCode,
        roomTypeCode,
        numberOfRooms,
        roomTotalPrice,
        currencyCode,
        guests,
        email,
        phone,
      },
      ageCodeSummary: ageCodeCount,
    };

    const thirdPartyService = new ThirdPartyReservationService();
    await thirdPartyService.processThirdPartyReservation(reservationInput);
    await reduceRoomsAfterBookingConfirmedCrypto(
      hotelCode,
      roomTypeCode,
      numberOfRooms,
      [checkIn, checkOut]
    );

    const htmlContent = `<!DOCTYPE html>
        <html lang="en">

        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }

            .container {
              max-width: 600px;
              margin: 20px auto;
              background-color: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }

            .header {
              background-color: #1a73e8;
              color: #ffffff;
              padding: 20px;
              text-align: center;
            }

            .header h1 {
              margin: 0;
              font-size: 24px;
            }

            .content {
              padding: 20px;
            }

            .content h2 {
              color: #333333;
              font-size: 20px;
              margin-top: 0;
            }

            .content p {
              color: #666666;
              line-height: 1.6;
              margin: 10px 0;
            }

            .details-table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }

            .details-table th,
            .details-table td {
              padding: 10px;
              text-align: left;
              border-bottom: 1px solid #dddddd;
            }

            .details-table th {
              background-color: #f8f8f8;
              color: #333333;
              font-weight: bold;
            }

            .footer {
              background-color: #f4f4f4;
              padding: 15px;
              text-align: center;
              color: #888888;
              font-size: 12px;
            }

            .button {
              display: inline-block;
              padding: 10px 20px;
              margin: 20px 0;
              background-color: #1a73e8;
              color: #ffffff;
              text-decoration: none;
              border-radius: 5px;
              font-weight: bold;
            }

            @media only screen and (max-width: 600px) {
              .container {
                width: 100%;
                margin: 10px;
              }

              .header h1 {
                font-size: 20px;
              }

              .content h2 {
                font-size: 18px;
              }
            }
          </style>
        </head>

        <body>
          <div class="container">
            <div class="header">
              <h1>Booking Confirmation</h1>
            </div>
            <div class="content">
              <h2>Dear {{guestName}},</h2>
              <p>Thank you for your booking with {{hotelName}}! We are excited to confirm your booking details below.</p>

              <h2>Reservation Details</h2>
              <table class="details-table">
                <tr>
                  <th>Hotel Name</th>
                  <td>{{hotelName}}</td>
                </tr>
                <tr>
                  <th>Check-In Date</th>
                  <td>{{checkInDate}}</td>
                </tr>
                <tr>
                  <th>Check-Out Date</th>
                  <td>{{checkOutDate}}</td>
                </tr>
                <tr>
                  <th>Room Type</th>
                  <td>{{roomTypeCode}}</td>
                </tr>
                <tr>
                  <th>Number of Rooms</th>
                  <td>{{numberOfRooms}}</td>
                </tr>
                <tr>
                  <th>Total Price</th>
                  <td>{{roomTotalPrice}} {{currencyCode}}</td>
                </tr>
                <tr>
                  <th>Contact Email</th>
                  <td>{{email}}</td>
                </tr>
                <tr>
                  <th>Contact Phone</th>
                  <td>+{{phone}}</td>
                </tr>
              </table>

              <h2>Guest Details</h2>
              <table class="details-table">
                <tr>
                  <th>Name</th>
                  <th>Age Category</th>
                </tr>
                {{#each guests}}
                <tr>
                  <td>{{firstName}} {{lastName}}</td>
                  <td>{{category}} (Age {{age}})</td>
                </tr>
                {{/each}}
              </table>

              <p>For any questions or to modify your reservation, please contact us at <a
                  href="mailto:{{supportEmail}}">{{supportEmail}}</a>.</p>

              <a href="{{websiteUrl}}" class="button">View Your Booking</a>
            </div>
            <div class="footer">
              <p>&copy; {{currentYear}} {{companyName}}. All rights reserved.</p>
            </div>
          </div>
        </body>

        </html>`;
    const templateData = {
      guestName: `${guests[0].firstName} ${guests[0].lastName}`,
      hotelName,
      checkInDate: new Date(checkInDate).toLocaleDateString(),
      checkOutDate: new Date(checkOutDate).toLocaleDateString(),
      roomTypeCode,
      numberOfRooms,
      roomTotalPrice,
      currencyCode,
      email,
      phone,
      guests: categorizedGuests,
      supportEmail: 'business.alhajz@gmail.com',
      // supportPhone: '+1-800-123-4567',
      websiteUrl: 'https://alhajz.ai',
      currentYear: new Date().getFullYear(),
      companyName: 'Al-Hajz',
    };

    const template = Handlebars.compile(htmlContent);
    const finalHtml = template(templateData);

    await mailer.sendMail({
      to: email,
      subject: `Booking Confirmation - ${hotelName}`,
      html: finalHtml,
      text: `Your booking has been confirmed`,
    });

    return {
      message: "Reservation with crypto confirmed",
      guests: categorizedGuests,
      ageCodeSummary: ageCodeCount,
    };

  } catch (error: any) {
    console.error("❌ Error creating reservation with crypto:", error.message || error);
    throw new Error(`Failed to create reservation: ${error.message || "Unknown error"}`);
  }
};

export const cancelThirdPartyReservation = CatchAsyncError(
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      const reservationId = req.params.id;
      if (!reservationId) {
        return res.status(400).json({ message: "Reservation ID is required" });
      }
      const existingReservation = await ThirdPartyBooking.findOne({ reservationId });
      if (!existingReservation) {
        return res.status(404).json({ message: `Reservation with ID ${reservationId} not found in our record` });
      }
      if (existingReservation.status === 'Cancelled') {
        return res.status(400).json({ message: `Reservation with ID ${reservationId} is already cancelled` });
      }

      const { firstName, lastName, email, hotelCode, hotelName, checkInDate, checkOutDate } = req.body;
      const requiredFields = { reservationId, firstName, lastName, email, hotelCode, hotelName, checkInDate, checkOutDate };
      const missingFields = Object.entries(requiredFields)
        .filter(([_, value]) => value === undefined || value === null || value === "")
        .map(([key]) => key);

      if (missingFields.length > 0) {
        return res.status(400).json({
          message: `Missing required fields: ${missingFields.join(", ")}`,
        });
      }

      const cancelReservationInput = {
        reservationId,
        hotelCode,
        hotelName,
        firstName,
        lastName,
        email,
        checkInDate,
        checkOutDate,
        status: "Cancelled",
      };

      try {
        const thirdPartyService = new ThirdPartyCancelReservationService();
        const result = await thirdPartyService.processCancelReservation(cancelReservationInput);
        await increaseRoomsAfterBookingCancelled(res, hotelCode, existingReservation.roomTypeCode, existingReservation.numberOfRooms, [checkInDate, checkOutDate]);

        const htmlContent = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 500px;
                    margin: 20px auto;
                    background-color: #ffffff;
                    border-radius: 6px;
                    overflow: hidden;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                .header {
                    background-color: #d32f2f;
                    color: #ffffff;
                    padding: 15px;
                    text-align: center;
                }
                .header h1 {
                    margin: 0;
                    font-size: 20px;
                }
                .content {
                    padding: 15px;
                }
                .content p {
                    color: #666666;
                    line-height: 1.5;
                    margin: 8px 0;
                    font-size: 14px;
                }
                .details-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 15px 0;
                }
                .details-table th,
                .details-table td {
                    padding: 8px;
                    text-align: left;
                    border-bottom: 1px solid #e0e0e0;
                }
                .details-table th {
                    background-color: #f8f8f8;
                    color: #333333;
                    font-weight: bold;
                    font-size: 14px;
                }
                .details-table td {
                    color: #666666;
                    font-size: 14px;
                }
                .button {
                    display: inline-block;
                    padding: 8px 16px;
                    margin: 15px 0;
                    background-color: #d32f2f;
                    color: #ffffff;
                    text-decoration: none;
                    border-radius: 4px;
                    font-size: 14px;
                    font-weight: bold;
                }
                .footer {
                    background-color: #f4f4f4;
                    padding: 10px;
                    text-align: center;
                    color: #888888;
                    font-size: 12px;
                }
                @media only screen and (max-width: 500px) {
                    .container {
                        width: 100%;
                        margin: 10px;
                    }
                    .header h1 {
                        font-size: 18px;
                    }
                    .content p {
                        font-size: 13px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Booking Cancellation Confirmation</h1>
                </div>
                <div class="content">
                    <p>Dear {{guestName}},</p>
                    <p>Your reservation with {{hotelName}} has been successfully cancelled. Below are the details of the cancelled booking.</p>
                    <table class="details-table">
                        <tr>
                            <th>Hotel Name</th>
                            <td>{{hotelName}}</td>
                        </tr>
                        <tr>
                            <th>Check-In Date</th>
                            <td>{{checkInDate}}</td>
                        </tr>
                        <tr>
                            <th>Check-Out Date</th>
                            <td>{{checkOutDate}}</td>
                        </tr>
                        <tr>
                            <th>Amount</th>
                            <td>{{amount}}</td>
                        </tr>
                    </table>
                    <p>If you have any questions or need assistance, please contact us at <a href="mailto:{{supportEmail}}">{{supportEmail}}</a>.</p>
                    <a href="{{websiteUrl}}" class="button">Visit Our Website</a>
                </div>
                <div class="footer">
                    <p>© {{currentYear}} {{companyName}}. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>`;

        const templateData = {
          guestName: `${firstName} ${lastName}`,
          hotelName,
          amount: `${existingReservation.totalAmount} ${existingReservation.currencyCode}`,
          checkInDate: new Date(checkInDate).toLocaleDateString(),
          checkOutDate: new Date(checkOutDate).toLocaleDateString(),
          supportEmail: 'business.alhajz@gmail.com',
          websiteUrl: 'https://alhajz.ai',
          currentYear: new Date().getFullYear(),
          companyName: 'Al-Hajz',
        };

        const template = Handlebars.compile(htmlContent);
        const finalHtml = template(templateData);

        await mailer.sendMail({
          to: email,
          subject: `Booking Cancellation Confirmation - ${hotelName}`,
          html: finalHtml,
          text: `Your reservation update has been confirmed`,
        });

        // await EmailService.sendEmail({
        //   to: email,
        //   subject: `Booking Cancellation Confirmation - ${hotelName}`,
        //   html: finalHtml,
        // });
        console.log(`✅ Cancellation confirmation email sent to ${email}`);

        res.status(200).json({
          message: "Reservation cancellation processed successfully",
          reservationId: result,
        });
      } catch (error: any) {
        console.error('❌ Failed to send cancellation confirmation email:', error);
        return res.status(500).json({ message: `Failed to process cancellation: ${error.message}` });
      }
    } catch (error: any) {
      console.error("❌ Error cancelling third-party reservation:", error.message || error);
      if (error.message.includes('Reservation not found')) {
        return res.status(404).json({ message: error.message });
      }
      if (error.message.includes('Check-in date is today or in the past')) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: `Failed to process cancellation: ${error.message}` });
    }
  }
);


export const getBookingDetailsOfUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.id;
      const { filterData, startDate, endDate, guestName } = req.query;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const skip = (page - 1) * limit;

      const matchCriteria: any = {
        userId,
      };
      if (startDate || endDate) {
        if (!startDate || !endDate) {
          return res.status(400).json({
            success: false,
            message: "Both startDate and endDate are required for date filtering",
          });
        }

        matchCriteria.checkInDate = {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string),
        };
      }
      if (guestName) {
        matchCriteria.guestDetails = {
          $elemMatch: {
            firstName: { $regex: guestName as string, $options: "i" },
          },
        };
      }

      if (filterData && filterData !== 'null' && filterData !== '') {
        const validFilters = ['upcoming', 'completed', 'cancelled', 'processing'];
        if (!validFilters.includes(filterData as string)) {
          return res.status(400).json({
            success: false,
            message: "Invalid filterData. Must be one of: upcoming, completed, cancelled, processing",
          });
        }

        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        if (filterData === 'upcoming') {
          matchCriteria.checkInDate = {
            ...matchCriteria.checkInDate,
            $gt: currentDate,
          };
          matchCriteria.status = { $ne: 'Cancelled' };
          console.log("Current Date:", currentDate.toISOString());
          console.log("Check-in Date Match Criteria:", JSON.stringify(matchCriteria.checkInDate, null, 2));
        } else if (filterData === 'completed') {
          matchCriteria.checkInDate = {
            ...matchCriteria.checkInDate,
            $lte: currentDate,
          };
          matchCriteria.status = { $in: ['Confirmed'] };
        } else if (filterData === 'cancelled') {
          matchCriteria.status = 'Cancelled';
        } else if (filterData === 'Processing') {

          delete matchCriteria.status;

          if (matchCriteria.checkInDate) {
            matchCriteria.checkInDate = {
              $gte: matchCriteria.checkInDate.$gte?.toISOString().split('T')[0],
              $lte: matchCriteria.checkInDate.$lte?.toISOString().split('T')[0],
            };
          }
        }
      }

      let bookings;
      let totalBookings;
      if (filterData === 'processing') {
        totalBookings = await CryptoGuestDetails.countDocuments({
          ...matchCriteria,
          status: 'Processing',
        });
        if (totalBookings === 0) {
          return res.status(404).json({
            success: false,
            message: "No bookings found for the given user ID",
          });
        }
        bookings = await CryptoGuestDetails.find({
          ...matchCriteria,
          status: 'Processing',
        })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit);
      } else {
        totalBookings = await ThirdPartyBooking.countDocuments(matchCriteria);
        if (totalBookings === 0) {
          return res.status(404).json({
            success: false,
            message: "No bookings found for the given user ID",
          });
        }
        bookings = await ThirdPartyBooking.find(matchCriteria)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit);
      }
      bookings = bookings.map(booking => ({
        ...booking.toObject(),
        checkInDate: booking.checkInDate instanceof Date
          ? booking.checkInDate.toISOString().split('T')[0]
          : booking.checkInDate,
        checkOutDate: booking.checkOutDate instanceof Date
          ? booking.checkOutDate.toISOString().split('T')[0]
          : booking.checkOutDate,
      }));

      const totalRevenue = bookings.reduce(
        (sum, booking) => sum + (booking.totalAmount || 0),
        0
      );

      return res.status(200).json({
        success: true,
        totalBookings,
        currentPage: page,
        totalPages: Math.ceil(totalBookings / limit),
        totalRevenue,
        bookings,
      });
    } catch (error: any) {
      console.error("Error in getBookingDetailsOfUser:", error);
      return next(new ErrorHandler(error.message || "Internal Server Error", 500));
    }
  }
);

const validatePagination = (page: number, limit: number): void => {
  if (isNaN(page) || page < 1) {
    throw new Error('Invalid page number. Page must be a positive integer.');
  }
  if (isNaN(limit) || limit < 1 || limit > 100) {
    throw new Error('Invalid limit. Limit must be between 1 and 100.');
  }
};

const getBookingQuery = async (query: any, skip: number, limit: number) => {
  const [bookingDetails, count] = await Promise.all([
    ThirdPartyBooking.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
    ThirdPartyBooking.countDocuments(query),
  ]);
  return { bookingDetails, count };
};

export const getBookingDetailsForExtranet = CatchAsyncError(async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const owner_id = req.user?.id;
    const owner_role = req.role;

    if (!owner_id || !owner_role) {
      return res.status(400).json({ success: false, message: 'Owner ID or Role not provided' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    validatePagination(page, limit);
    const skip = (page - 1) * limit;

    let bookingDetails = [];
    let count = 0;

    if (owner_role === 'superAdmin') {
      const result = await getBookingQuery({}, skip, limit);
      bookingDetails = result.bookingDetails;
      count = result.count;
    } else if (owner_role === 'groupManager') {
      const groupOwnerDetails = await Auth.findById(owner_id);
      if (!groupOwnerDetails) {
        throw new Error('Group owner details not found');
      }

      const hotelUserDetails = await Auth.find({ createdBy: groupOwnerDetails.email });
      if (!hotelUserDetails || hotelUserDetails.length === 0) {
        throw new Error('No user details found for group manager');
      }

      const userIds = hotelUserDetails.map(user => user._id);
      const properties = await PropertyInfo.find({ user_id: { $in: userIds } });
      if (!properties || properties.length === 0) {
        throw new Error('No properties found for the group manager');
      }

      const propertyCodes = properties.map(property => property.property_code);
      const result = await getBookingQuery({ hotelCode: { $in: propertyCodes } }, skip, limit);
      bookingDetails = result.bookingDetails;
      count = result.count;
    } else if (owner_role === 'hotelManager') {
      const properties = await PropertyInfo.find({ user_id: owner_id });
      if (!properties || properties.length === 0) {
        throw new Error('No properties found for the hotel manager');
      }

      const propertyCodes = properties.map(property => property.property_code);
      const result = await getBookingQuery({ hotelCode: { $in: propertyCodes } }, skip, limit);
      bookingDetails = result.bookingDetails;
      count = result.count;
    } else {
      throw new Error('Invalid role provided');
    }

    if (bookingDetails.length === 0) {
      return res.status(404).json({ success: false, message: 'No booking details found' });
    }

    return res.json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      bookingDetails,
    });
  } catch (error: any) {
    console.error('Error fetching booking details:', error.message);
    return next(new ErrorHandler(error.message, 400));
  }
});

export const getAllHotelsByRole = CatchAsyncError(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      console.log(`The user details ${JSON.stringify(req.user)}`);
      const ownerId = req.user?.id;
      const ownerRole = req.role;
      console.log(`The owner id is ${ownerId} and owner role is ${ownerRole}`);
      if (!ownerId || !ownerRole) {
        return next(new ErrorHandler("Owner ID and ROLE not available", 400));
      }
      console.log("Owner ID:", ownerId);
      const convertedOwnerId = new Types.ObjectId(ownerId);
      const ownerDetails = await UserModel.findById(convertedOwnerId);
      if (!ownerDetails) {
        return next(new ErrorHandler("Owner not found in database", 404));
      }
      console.log("Owner Details:", ownerDetails);
      const allowedRoles = ["superAdmin", "groupManager", "hotelManager"];
      if (!allowedRoles.includes(ownerDetails.role)) {
        return next(new ErrorHandler("Unauthorized access", 403));
      }

      let query = {};

      switch (ownerDetails.role) {
        case "superAdmin":
          break;

        case "groupManager":
          const managedUsers = await UserModel.find({
            createdBy: ownerDetails.email
          }).select('_id');

          query = {
            user_id: { $in: managedUsers.map(user => user._id) }
          };
          break;

        case "hotelManager":
          // Fix: Convert ownerId to ObjectId for consistency
          query = { user_id: convertedOwnerId };
          break;
      }

      const properties = await PropertyInfo.find(query).select('property_name');
      const propertyNames = [...new Set(properties.map(prop => prop.property_name))].sort();

      return res.json({
        success: true,
        message: "Hotel names fetched successfully",
        hotelNames: propertyNames,
        count: propertyNames.length,
      });

    } catch (error: any) {
      console.error("Error fetching hotel names:", error);
      return next(new ErrorHandler(
        error.message || "Failed to fetch hotel names",
        error.statusCode || 500
      ));
    }
  }
);

export class BookingController {

  private bookingService: BookingService;
  private bookAgainAvailabilityService: BookAgainAvailabilityService;

  constructor(bookingService: BookingService, bookAgainAvailabilityService: BookAgainAvailabilityService) {
    if (!bookingService || !bookAgainAvailabilityService) {
      throw new Error("Services are required");
    }
    this.bookingService = bookingService;
    this.bookAgainAvailabilityService = bookAgainAvailabilityService;
  }



  async updatePayAtHotelBookings(req: any, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User ID is required" });
      }

      const reservationId = req.params.id;
      if (!reservationId) {
        return res.status(400).json({ message: "Reservation ID is required" });
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
        guests,
      } = req.body;

      const { categorizedGuests, ageCodeSummary } = await this.bookingService.updateBooking(userId, reservationId, {
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
        guests,
      });

      return res.status(200).json({
        message: "Reservation updated successfully",
        numberOfRooms,
        roomTotalPrice,
        guests: categorizedGuests,
        ageCodeSummary,
      });
    } catch (error: any) {
      console.error("Error updating booking details:", error.message);
      return res.status(500).json({ message: error.message || "Internal Server Error while updating booking" });
    }
  }

  async bookAgainCheckAvailability(req: any, res: Response, next: NextFunction) {
    try {

      /**
       * Checking for USER 
       */
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User ID is required" });
      }

      /**
       * 
       */
      const { hotelCode, invTypeCode, startDate, endDate } = req.query;
      if (!hotelCode || !invTypeCode || !startDate || !endDate) {
        return res.status(404).json({
          success: false,
          message: "Some data are missing in body",
        });
      }

      /**
       * Calling the service file
       */
      const result = await this.bookAgainAvailabilityService.bookAgainAvailability(hotelCode, invTypeCode, startDate, endDate);
      if (!result) {
        return res.status(400).json({ message: "No rate plan or inventory found" })
      }


      return res.status(200).json({
        success: true,
        message: "Rooms are available",
      });

    }
    catch (error: any) {
      console.log("Book again process failed");
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}
