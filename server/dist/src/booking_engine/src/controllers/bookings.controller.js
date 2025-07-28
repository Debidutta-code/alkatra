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
exports.getAllHotelsByRole = exports.getBookingDetailsForExtranet = exports.getBookingDetailsOfUser = exports.cancelThirdPartyReservation = exports.updateThirdPartyReservation = exports.createReservationWithStoredCard = void 0;
exports.createReservationWithCryptoPayment = createReservationWithCryptoPayment;
const mongoose_1 = require("mongoose");
const catchAsyncError_1 = require("../middleware/catchAsyncError");
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const reservationController_1 = require("../../../wincloud/src/controller/reservationController");
const amendReservationController_1 = require("../../../wincloud/src/controller/amendReservationController");
const reservationModel_1 = require("../../../wincloud/src/model/reservationModel");
const stripe_service_1 = __importDefault(require("../services/stripe.service"));
const cancelReservationService_1 = require("../../../wincloud/src/service/cancelReservationService");
const cryptoUserPaymentInitialStage_model_1 = require("../models/cryptoUserPaymentInitialStage.model");
const email_service_1 = __importDefault(require("../../../customer_authentication/src/services/email.service"));
const handlebars_1 = __importDefault(require("handlebars"));
const inventoryModel_1 = require("../../../wincloud/src/model/inventoryModel");
const auth_model_1 = __importDefault(require("../../../user_authentication/src/Model/auth.model"));
const property_info_model_1 = require("../../../property_management/src/model/property.info.model");
const auth_model_2 = __importDefault(require("../../../user_authentication/src/Model/auth.model"));
const calculateAgeCategory = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    if (today.getMonth() < birthDate.getMonth() ||
        (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
        age--;
    }
    if (age <= 2)
        return { age, category: "Infant", ageCode: "7" };
    if (age <= 12)
        return { age, category: "Child", ageCode: "8" };
    return { age, category: "Adult", ageCode: "10" };
};
const reduceRoomsAfterBookingConfirmed = (res, hotelCode, roomTypeCode, numberOfRooms, dates) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    console.log(`Get data for reduce rooms ${hotelCode} | ${roomTypeCode} | ${numberOfRooms} | ${dates}`);
    const requiredFields = { hotelCode, roomTypeCode, numberOfRooms, dates };
    const missingFields = Object.entries(requiredFields)
        .filter(([key, value]) => value === undefined || value === null || value === "" || (key === 'startDate' && (!Array.isArray(value) || value.length !== 2)))
        .map(([key]) => key);
    if (missingFields.length > 0) {
        return {
            message: `Missing required fields: ${missingFields.join(", ")}`,
        };
    }
    const [checkInDate, checkOutDate] = dates;
    if (checkInDate > checkOutDate) {
        return {
            message: "Check-in date must be before or equal to check-out date",
        };
    }
    try {
        const inventoryRecords = yield inventoryModel_1.Inventory.find({
            hotelCode,
            invTypeCode: roomTypeCode,
            'availability.startDate': {
                $gte: new Date(checkInDate),
                $lte: new Date(checkOutDate),
            },
        });
        if (!inventoryRecords || inventoryRecords.length === 0) {
            return { message: "No available rooms found for the specified criteria" };
        }
        const bulkOps = [];
        for (const item of inventoryRecords) {
            const currentCount = ((_a = item.availability) === null || _a === void 0 ? void 0 : _a.count) || 0;
            if (currentCount < numberOfRooms) {
                return {
                    message: `Not enough rooms for date ${(_b = item.availability) === null || _b === void 0 ? void 0 : _b.startDate}. Available: ${currentCount}, requested: ${numberOfRooms}`,
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
        const result = yield inventoryModel_1.Inventory.bulkWrite(bulkOps);
        return {
            message: "Room counts reduced successfully for booking",
            result,
        };
    }
    catch (error) {
        console.error("❌ Error reducing rooms after booking confirmed:", error.message || error);
        return { message: "Failed to reduce rooms after booking confirmed" };
    }
});
const reduceRoomsAfterBookingConfirmedCrypto = (hotelCode, roomTypeCode, numberOfRooms, dates) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    console.log(`(Crypto) Reduce rooms: ${hotelCode} | ${roomTypeCode} | ${numberOfRooms} | ${dates}`);
    const requiredFields = { hotelCode, roomTypeCode, numberOfRooms, dates };
    const missingFields = Object.entries(requiredFields)
        .filter(([_, value]) => value === undefined ||
        value === null ||
        value === "" ||
        (Array.isArray(dates) && dates.length !== 2))
        .map(([key]) => key);
    if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
    }
    const [checkInDate, checkOutDate] = dates;
    if (checkInDate > checkOutDate) {
        throw new Error("Check-in date must be before or equal to check-out date");
    }
    const inventoryRecords = yield inventoryModel_1.Inventory.find({
        hotelCode,
        invTypeCode: roomTypeCode,
        'availability.startDate': {
            $gte: new Date(checkInDate),
            $lte: new Date(checkOutDate),
        },
    });
    if (!inventoryRecords || inventoryRecords.length === 0) {
        throw new Error("No available rooms found for the specified criteria");
    }
    const bulkOps = [];
    for (const item of inventoryRecords) {
        const currentCount = ((_a = item.availability) === null || _a === void 0 ? void 0 : _a.count) || 0;
        if (currentCount < numberOfRooms) {
            throw new Error(`Not enough rooms for date ${(_b = item.availability) === null || _b === void 0 ? void 0 : _b.startDate}. Available: ${currentCount}, requested: ${numberOfRooms}`);
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
    const result = yield inventoryModel_1.Inventory.bulkWrite(bulkOps);
    return {
        message: "Room counts reduced successfully for booking (Crypto)",
        result,
    };
});
const increaseRoomsAfterBookingCancelled = (res, hotelCode, roomTypeCode, numberOfRooms, dates) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log(`Get data to increase rooms ${hotelCode} | ${roomTypeCode} | ${numberOfRooms} | ${dates}`);
    const requiredFields = { hotelCode, roomTypeCode, numberOfRooms, dates };
    const missingFields = Object.entries(requiredFields)
        .filter(([key, value]) => value === undefined || value === null || value === "" || (key === 'startDate' && (!Array.isArray(value) || value.length !== 2)))
        .map(([key]) => key);
    if (missingFields.length > 0) {
        return {
            message: `Missing required fields: ${missingFields.join(", ")}`,
        };
    }
    const [checkInDate, checkOutDate] = dates;
    if (checkInDate > checkOutDate) {
        return {
            message: "Check-in date must be before or equal to check-out date",
        };
    }
    try {
        const inventoryRecords = yield inventoryModel_1.Inventory.find({
            hotelCode,
            invTypeCode: roomTypeCode,
            'availability.startDate': {
                $gte: new Date(checkInDate),
                $lte: new Date(checkOutDate),
            },
        });
        if (!inventoryRecords || inventoryRecords.length === 0) {
            return { message: "No matching room inventory records found for the given dates." };
        }
        const bulkOps = [];
        for (const item of inventoryRecords) {
            const currentCount = ((_a = item.availability) === null || _a === void 0 ? void 0 : _a.count) || 0;
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
        const result = yield inventoryModel_1.Inventory.bulkWrite(bulkOps);
        return {
            message: "Room counts increased successfully after cancellation.",
            result,
        };
    }
    catch (error) {
        console.error("❌ Error increasing rooms after booking cancellation:", error.message || error);
        throw new Error(`Failed to increase rooms after booking cancellation: ${error.message}`);
    }
});
// New controller function to create a reservation with stored card (Pay at Hotel)
exports.createReservationWithStoredCard = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
    }
    const { checkInDate, checkOutDate, hotelCode, hotelName, ratePlanCode, numberOfRooms, roomTypeCode, roomTotalPrice, currencyCode, email, phone, guests, paymentInfo, } = req.body;
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
    const ageCodeCount = { "7": 0, "8": 0, "10": 0 };
    const categorizedGuests = guests.map(({ firstName, lastName, dob }) => {
        if (!dob)
            throw new Error(`DOB missing for ${firstName} ${lastName}`);
        const { age, category, ageCode } = calculateAgeCategory(dob);
        ageCodeCount[ageCode] = (ageCodeCount[ageCode] || 0) + 1;
        return { firstName, lastName, dob, age, category, ageCode };
    });
    try {
        const customerResult = yield stripe_service_1.default.createOrRetrieveCustomer(email, `${guests[0].firstName} ${guests[0].lastName}`, phone, paymentInfo.paymentMethodId);
        if (!customerResult.success) {
            return next(new errorHandler_1.default(customerResult.error || "Stripe customer creation failed", 500));
        }
    }
    catch (error) {
        return res.status(500).json({
            message: "Error while interacting with Stripe",
            error: error instanceof Error ? error.message : error,
        });
    }
    const reservationInput = {
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
        const thirdPartyService = new reservationController_1.ThirdPartyReservationService();
        yield thirdPartyService.processThirdPartyReservation(reservationInput);
        try {
            const reduceRoomResult = yield reduceRoomsAfterBookingConfirmed(res, hotelCode, roomTypeCode, numberOfRooms, [checkIn, checkOutDate]);
            if (!reduceRoomResult) {
                return res.status(400).json({ message: "Failed to reduce rooms" });
            }
        }
        catch (error) {
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
                  <td>{{phone}}</td>
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
                  href="mailto:{{supportEmail}}">{{supportEmail}}</a> or call {{supportPhone}}.</p>

              <a href="{{websiteUrl}}" class="button">View Your Booking</a>
            </div>
            <div class="footer">
              <p>&copy; {{currentYear}} {{companyName}}. All rights reserved.</p>
              <p>{{companyAddress}}</p>
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
                supportEmail: 'support@alhajz.com',
                supportPhone: '+1-800-123-4567',
                websiteUrl: 'https://book.trip-swift.ai',
                currentYear: new Date().getFullYear(),
                companyName: 'Al-Hajz',
                companyAddress: '1234 Example St, City, Country',
            };
            // Compile the Handlebars template
            const template = handlebars_1.default.compile(htmlContent);
            // Generate the final HTML by replacing placeholders with actual data
            const finalHtml = template(templateData);
            yield email_service_1.default.sendEmail({
                to: email,
                text: `Your booking has been confirmed`,
                subject: `Booking Confirmation - ${hotelName}`,
                html: finalHtml,
            });
        }
        catch (error) {
            return res.status(500).json({ message: "❌ Failed to send confirmation email" });
        }
    }
    catch (error) {
        return res.status(500).json({ message: "Failed to process reservation with third-party" });
    }
    res.status(200).json({
        message: "Reservation received",
        numberOfRooms,
        roomTotalPrice,
        guests: categorizedGuests,
        ageCodeSummary: ageCodeCount,
    });
}));
function createReservationWithCryptoPayment(input) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { reservationId, userId, checkInDate, checkOutDate, hotelCode, hotelName, ratePlanCode, numberOfRooms, roomTypeCode, roomTotalPrice, currencyCode, email, phone, guests, } = input;
            console.log(`BOOKING Controller, crypto booking begins ${currencyCode} ${roomTotalPrice}`);
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
            const ageCodeCount = { "7": 0, "8": 0, "10": 0 };
            const categorizedGuests = guests.map(({ firstName, lastName, dob }) => {
                if (!dob)
                    throw new Error(`DOB missing for ${firstName} ${lastName}`);
                const { age, category, ageCode } = calculateAgeCategory(dob);
                ageCodeCount[ageCode] = (ageCodeCount[ageCode] || 0) + 1;
                return { firstName, lastName, dob, age, category, ageCode };
            });
            const reservationInput = {
                bookingDetails: {
                    reservationId: reservationId !== null && reservationId !== void 0 ? reservationId : "",
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
            const thirdPartyService = new reservationController_1.ThirdPartyReservationService();
            yield thirdPartyService.processThirdPartyReservation(reservationInput);
            yield reduceRoomsAfterBookingConfirmedCrypto(hotelCode, roomTypeCode, numberOfRooms, [checkIn, checkOut]);
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
                  <td>{{phone}}</td>
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
                  href="mailto:{{supportEmail}}">{{supportEmail}}</a> or call {{supportPhone}}.</p>

              <a href="{{websiteUrl}}" class="button">View Your Booking</a>
            </div>
            <div class="footer">
              <p>&copy; {{currentYear}} {{companyName}}. All rights reserved.</p>
              <p>{{companyAddress}}</p>
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
                supportEmail: 'support@alhajz.com',
                supportPhone: '+1-800-123-4567',
                websiteUrl: 'https://book.trip-swift.ai',
                currentYear: new Date().getFullYear(),
                companyName: 'Al-Hajz',
                companyAddress: '1234 Example St, City, Country',
            };
            const template = handlebars_1.default.compile(htmlContent);
            const finalHtml = template(templateData);
            yield email_service_1.default.sendEmail({
                to: email,
                text: `Your reservation has been confirmed`,
                subject: `Reservation Confirmation - ${hotelName}`,
                html: finalHtml,
            });
            return {
                message: "Reservation with crypto confirmed",
                guests: categorizedGuests,
                ageCodeSummary: ageCodeCount,
            };
        }
        catch (error) {
            console.error("❌ Error creating reservation with crypto:", error.message || error);
            throw new Error(`Failed to create reservation: ${error.message || "Unknown error"}`);
        }
    });
}
;
exports.updateThirdPartyReservation = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }
        const reservationId = req.params.id;
        if (!reservationId) {
            return res.status(400).json({ message: "Reservation ID is required" });
        }
        const existingReservation = yield reservationModel_1.ThirdPartyBooking.findOne({ reservationId });
        if (!existingReservation) {
            throw new Error(`Reservation with ID ${reservationId} not found in our record`);
        }
        if (existingReservation.status === 'Cancelled') {
            throw new Error(`Reservation with ID ${reservationId} is already cancelled`);
        }
        const { checkInDate, checkOutDate, hotelCode, hotelName, ratePlanCode, numberOfRooms, roomTypeCode, roomTotalPrice, currencyCode, email, phone, guests, } = req.body;
        const requiredFields = {
            reservationId,
            checkInDate,
            checkOutDate,
            hotelCode,
            ratePlanCode,
            numberOfRooms,
            roomTypeCode,
            roomTotalPrice,
            currencyCode,
            email,
            phone,
            guests,
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
        const ageCodeCount = { "7": 0, "8": 0, "10": 0 };
        const categorizedGuests = guests.map(({ firstName, lastName, dob }) => {
            if (!dob)
                throw new Error(`DOB missing for ${firstName} ${lastName}`);
            const { age, category, ageCode } = calculateAgeCategory(dob);
            ageCodeCount[ageCode] = (ageCodeCount[ageCode] || 0) + 1;
            return { firstName, lastName, dob, age, category, ageCode };
        });
        const amendReservationInput = {
            bookingDetails: {
                userId,
                reservationId,
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
        try {
            const thirdPartyService = new amendReservationController_1.ThirdPartyAmendReservationService();
            yield thirdPartyService.processAmendReservation(amendReservationInput);
            yield reduceRoomsAfterBookingConfirmed(res, hotelCode, roomTypeCode, numberOfRooms, [checkIn, checkOutDate]);
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
      <h1>Booking Update Confirmation</h1>
    </div>
    <div class="content">
      <h2>Dear {{guestName}},</h2>
      <p>Your reservation with {{hotelName}} has been successfully updated. Below are the updated details for your
        booking.</p>

      <h2>Updated Reservation Details</h2>
      <table class="details-table">
        <tr>
          <th>Hotel Name</th>
          <td>{{hotelName}}</td>
        </tr>
        <!-- <tr>
          <th>Hotel Code</th>
          <td>{{hotelCode}}</td>
        </tr> -->
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
          <td>{{phone}}</td>
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

      <p>If you have any questions or need further modifications to your reservation, please contact us at <a
          href="mailto:{{supportEmail}}">{{supportEmail}}</a> or call {{supportPhone}}.</p>

      <a href="{{websiteUrl}}" class="button">View Your Updated Reservation</a>
    </div>
    <div class="footer">
      <p>© {{currentYear}} {{companyName}}. All rights reserved.</p>
      <p>{{companyAddress}}</p>
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
                supportEmail: 'support@alhajz.com',
                supportPhone: '+1-800-123-4567',
                websiteUrl: 'https://book.trip-swift.ai',
                currentYear: new Date().getFullYear(),
                companyName: 'Al-Hajz',
                companyAddress: '1234 Example St, City, Country',
            };
            const template = handlebars_1.default.compile(htmlContent);
            const finalHtml = template(templateData);
            yield email_service_1.default.sendEmail({
                to: email,
                text: `Your reservation update has been confirmed`,
                subject: `Reservation Confirmation - ${hotelName}`,
                html: finalHtml,
            });
        }
        catch (error) {
            return res.status(500).json({ message: error.message || "Failed to update reservation" });
        }
        res.status(200).json({
            message: "Reservation updated successfully",
            numberOfRooms,
            roomTotalPrice,
            guests: categorizedGuests,
            ageCodeSummary: ageCodeCount,
        });
    }
    catch (error) {
        console.error("❌ Error updating third-party reservation:", error.message || error);
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
}));
exports.cancelThirdPartyReservation = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }
        const reservationId = req.params.id;
        if (!reservationId) {
            return res.status(400).json({ message: "Reservation ID is required" });
        }
        const existingReservation = yield reservationModel_1.ThirdPartyBooking.findOne({ reservationId });
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
            const thirdPartyService = new cancelReservationService_1.ThirdPartyCancelReservationService();
            const result = yield thirdPartyService.processCancelReservation(cancelReservationInput);
            yield increaseRoomsAfterBookingCancelled(res, hotelCode, existingReservation.roomTypeCode, existingReservation.numberOfRooms, [checkInDate, checkOutDate]);
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
                    <p>If you have any questions or need assistance, please contact us at <a href="mailto:{{supportEmail}}">{{supportEmail}}</a> or call {{supportPhone}}.</p>
                    <a href="{{websiteUrl}}" class="button">Visit Our Website</a>
                </div>
                <div class="footer">
                    <p>© {{currentYear}} {{companyName}}. All rights reserved.</p>
                    <p>{{companyAddress}}</p>
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
                supportEmail: 'support@alhajz.com',
                supportPhone: '+1-800-123-4567',
                websiteUrl: 'https://book.trip-swift.ai',
                currentYear: new Date().getFullYear(),
                companyName: 'Al-Hajz',
                companyAddress: '1234 Example St, City, Country',
            };
            const template = handlebars_1.default.compile(htmlContent);
            const finalHtml = template(templateData);
            yield email_service_1.default.sendEmail({
                to: email,
                subject: `Booking Cancellation Confirmation - ${hotelName}`,
                html: finalHtml,
            });
            console.log(`✅ Cancellation confirmation email sent to ${email}`);
            res.status(200).json({
                message: "Reservation cancellation processed successfully",
                reservationId: result,
            });
        }
        catch (error) {
            console.error('❌ Failed to send cancellation confirmation email:', error);
            return res.status(500).json({ message: `Failed to process cancellation: ${error.message}` });
        }
    }
    catch (error) {
        console.error("❌ Error cancelling third-party reservation:", error.message || error);
        if (error.message.includes('Reservation not found')) {
            return res.status(404).json({ message: error.message });
        }
        if (error.message.includes('Check-in date is today or in the past')) {
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ message: `Failed to process cancellation: ${error.message}` });
    }
}));
// export const createReservation = CatchAsyncError(
//   async (req: any, res: Response, next: NextFunction) => {
//     console.log("#########################\n", req.body);
//     const data = req.body.data;
//     const guests = data.guests;
//     const roomAssociations = data.roomAssociations;
//     const payment = data.payment;
//     const bookingDetails = data.bookingDetails;
//     const paymentInfo = data.paymentInfo;
//     const room = roomAssociations[0].roomId;
//     const customer_id = bookingDetails.userId;
//     const booking_user_name = `${guests[0].firstName} ${guests[0].lastName}`;
//     const booking_user_email = guests[0].email;
//     const booking_user_phone = guests[0].phone;
//     const property = bookingDetails.propertyId;
//     const amount = payment.amount;
//     const booking_dates = new Date();
//     const checkInDate = bookingDetails.checkInDate;
//     const checkOutDate = bookingDetails.checkOutDate;
//     const status = "Confirmed";
//     let paymentMethod;
//     if (payment.method === 'CREDIT_CARD' || payment.method === 'CARD' || payment.method === 'payNow') {
//       paymentMethod = 'stripe';
//     } else if (payment.method === 'payAtHotel') {
//       paymentMethod = 'payAtHotel';
//     } else {
//       paymentMethod = 'other';
//     }
//     const currentDate = new Date();
//     const formattedCurrentDate = currentDate.toISOString().split("T")[0];
//     const formattedCheckInDate = new Date(checkInDate).toISOString().split("T")[0];
//     const formattedCheckOutDate = new Date(checkOutDate).toISOString().split("T")[0];
//     if (formattedCheckInDate < formattedCurrentDate || formattedCheckOutDate < formattedCurrentDate) {
//       return res.status(400).json({ message: "Check-in and check-out dates must be in the future" });
//     }
//     if (new Date(checkInDate) >= new Date(checkOutDate)) {
//       return res.status(400).json({ message: "Check-in date must be before check-out date" });
//     }
//     const session = await mongoose.startSession();
//     session.startTransaction();
//     try {
//       const customer = await Customer.findById(customer_id).session(session);
//       if (!customer) {
//         await session.abortTransaction();
//         session.endSession();
//         return next(new ErrorHandler("Customer not found", 404));
//       }
//       const newReservation = new Bookings({
//         customer_id,
//         room,
//         booking_user_name,
//         booking_user_email,
//         booking_user_phone,
//         property,
//         amount,
//         booking_dates,
//         payment: paymentMethod,
//         status,
//         checkInDate,
//         checkOutDate,
//         paymentType: paymentMethod,
//         stripeCustomerId: paymentInfo?.stripeCustomerId || null,
//         stripePaymentMethodId: paymentInfo?.paymentMethodId || null,
//       });
//       const savedBooking = await newReservation.save({ session });
//       const updatedRoom = await Room.findByIdAndUpdate(
//         room,
//         { $inc: { available_rooms: -1 } },
//         { new: true, session }
//       );
//       await session.commitTransaction();
//       session.endSession();
//       res.status(201).json({
//         success: true,
//         message: "Booking created successfully",
//         savedBooking,
//       });
//     } catch (error: any) {
//       await session.abortTransaction();
//       session.endSession();
//       console.log(error.message);
//       return next(new ErrorHandler(error.message, 400));
//     }
//   }
// );
// export const updateReservation = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       console.log("&&&&&&&&&&&&&&&&\nBOOKING line - 1")
//       const reservationId = req.params.id;
//       const updateFields = req.body;
//       console.log(`************\nThe reservation id is: ${reservationId}`);
//       console.log(`************\nThe update fields are: ${JSON.stringify(req.body)}`);
//       console.log(`************\nThe update fields are: ${JSON.stringify(updateFields)}`);
//       // Prepare data for third-party amend reservation
//       const amendData = {
//         reservationId,
//         ...updateFields,
//       };
//       console.log("&&&&&&&&&&&&&&&&\nBOOKING line - 2")
//       // Call third-party amend reservation service
//       const thirdPartyService = new ThirdPartyAmendReservationService();
//       await thirdPartyService.processAmendReservation(amendData);
//       console.log("&&&&&&&&&&&&&&&&\nBOOKING line - 3")
//       // Update booking in database
//       console.log(`************\nReservation ID before find: ${reservationId}`);
//       const reservation = await ThirdPartyBooking.findOne({ reservationId: reservationId });
//       console.log("@&@&@&@&@&@&@&@&\nBOOKING: Updated Reservation:", JSON.stringify(reservation));
//       if (!reservation) {
//         return next(new ErrorHandler("Reservation not found", 404));
//       }
//       console.log("&&&&&&&&&&&&&&&&\nBOOKING line - 4")
//       res.json(reservation);
//       console.log("&&&&&&&&&&&&&&&&\nBOOKING line - 5")
//     } catch (error: any) {
//       return next(new ErrorHandler(error.message, 400));
//     }
//   }
// );
// export const getReservation = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const reservationId = req.params.reservationId;
//       console.log("Requested Reservation ID:", reservationId);
//       const reservation = await Bookings.findById(reservationId);
//       console.log("Retrieved Reservation:", reservation);
//       if (!reservation) {
//         return next(new ErrorHandler("Reservation not found", 404));
//       }
//       res.json(reservation);
//     } catch (error: any) {
//       console.error("Error getting reservation:", error);
//       return next(new ErrorHandler(error.message, 400));
//     }
//   }
// );
// export const getAllReservations = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       // Fetch all reservations from the database
//       const reservations = await Bookings.find();
//       // Check if there are no reservations
//       if (!reservations || reservations.length === 0) {
//         return res.status(404).json({
//           message: "No reservations found",
//         });
//       }
//       // Return the list of reservations
//       res.json({
//         length: reservations.length,
//         reservations,
//       });
//     } catch (error: any) {
//       console.error("Error getting all reservations:", error);
//       return next(new ErrorHandler(error.message, 400));
//     }
//   }
// );
// export const getAllReservationsOfUser = CatchAsyncError(
//   async (req: any, res: Response, next: NextFunction) => {
//     try {
//       const userID = req.params.id;
//       const user_reservations = await Customer.findById(userID)
//       const populatedBookings = await Bookings.find({
//         customer_id: { $in: (user_reservations as any).bookings },
//       })
//         .populate({ path: "room" })
//         .populate({ path: "property" })
//         .populate({ path: "user" })
//         .sort({ _id: -1 });
//       return res.json({
//         // bookings: user_reservations?.bookings
//         bookings: populatedBookings
//       })
//     } catch (error: any) {
//       console.error("Error getting all reservations of User:", error);
//       return next(new ErrorHandler(error.message, 400));
//     }
//   }
// );
// export const getAllOfUser = CatchAsyncError(
//   async (req: any, res: Response, next: NextFunction) => {
//     try {
//       const userID = req.params.id;
//       const user_reservations = await Customer.findById(userID)
//       const populatedBookings = await Bookings.find({
//         _id: { $in: (user_reservations as any).bookings },
//       })
//         .populate({ path: "room" })
//         .populate({ path: "property" })
//         .populate({ path: "user" })
//         .sort({ _id: -1 });
//       return res.json({
//         // bookings: user_reservations?.bookings
//         bookings: populatedBookings
//       })
//     } catch (error: any) {
//       console.error("Error getting all reservations of User:", error);
//       return next(new ErrorHandler(error.message, 400));
//     }
//   }
// );
// export const deleteReservation = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const session = await mongoose.startSession();
//     session.startTransaction();
//     try {
//       const bookingId = req.params.id;
//       const deletedReservation = await Bookings.findByIdAndDelete(bookingId)
//         .session(session)
//         .lean();
//       if (!deletedReservation) {
//         await session.abortTransaction();
//         session.endSession();
//         return next(new ErrorHandler("Reservation not found", 404));
//       }
//       const [updateUserBooking, updateRoomAvailability] = await Promise.all([
//         AuthModelType.findOneAndUpdate(
//           { bookings: bookingId },
//           { $pull: { bookings: bookingId } },
//           { new: true }
//         ).session(session).lean(),
//         Room.findByIdAndUpdate(
//           deletedReservation.room,
//           { $inc: { available_rooms: 1 } },
//           { new: true }
//         ).session(session).lean(),
//       ]);
//       if (!updateRoomAvailability) {
//         await session.abortTransaction();
//         session.endSession();
//         return next(new ErrorHandler("Room not found or failed to update", 404));
//       }
//       await session.commitTransaction();
//       session.endSession();
//       // const deleteBookingIdAtUserModel = await AuthModel.findOneAndUpdate(
//       //   { bookings: bookingId },
//       //   { $pull: { bookings: bookingId } }, // Use $pull to remove the specific booking ID from the array
//       //   { new: true } // Optionally return the updated document
//       // );
//       res.json({
//         success: true,
//         message: "Reservation deleted successfully",
//         userId: updateUserBooking?._id,
//       });
//     }
//     catch (error: any) {
//       await session.abortTransaction();
//       session.endSession();
//       console.error("Error deleting reservation:", error);
//       return next(new ErrorHandler(error.message, 400));
//     }
//   }
// );
// export const getReservationByRoom = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const roomId = req.params.id;
//       const reservations = await Bookings.find({ room: roomId });
//       res.json({
//         success: true,
//         length: reservations.length,
//         reservations
//       });
//     } catch (error: any) {
//       console.log("Error getting reservation:", error);
//       return next(new ErrorHandler(error.message, 400));
//     }
//   }
// )
// export const getBookingsForDashboard = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const isValidUser = await AuthModelType.findById(req.params.id);
//       if (!isValidUser) {
//         return next(new ErrorHandler("User not found", 404));
//       }
//       const bookings = await Bookings.aggregate([
//         {
//           $match: {
//             owner_id: new Types.ObjectId(req.params.id)
//           }
//         },
//         {
//           $lookup: {
//             from: "users",
//             localField: "user",
//             foreignField: "_id",
//             as: "user"
//           }
//         },
//         {
//           $lookup: {
//             from: "propertyinfos",
//             localField: "property",
//             foreignField: "_id",
//             as: "property"
//           }
//         },
//         {
//           $lookup: {
//             from: "rooms",
//             localField: "room",
//             foreignField: "_id",
//             as: "room"
//           }
//         },
//         {
//           $unwind: "$property"
//         },
//         {
//           $unwind: "$room"
//         },
//         {
//           $unwind: "$user"
//         },
//         {
//           $project: {
//             property_name: "$property.property_name",
//             room_name: "$room.room_name",
//             room_type: "$room.room_type",
//             amount: 1,
//             firstName: "$user.firstName",
//             lastName: "$user.lastName",
//             email: "$user.email",
//             checkInDate: 1,
//             checkOutDate: 1,
//             status: 1
//           }
//         },
//       ])
//       return res.json({
//         success: true,
//         length: bookings.length,
//         bookings
//       })
//     } catch (error: any) {
//       console.log("Error getting reservation:", error);
//       return next(new ErrorHandler(error.message, 400));
//     }
//   }
// )
// export const updateStatusOfBooking = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const bookingId = req.params.id;
//       const { status } = req.body;
//       console.log("bookingId ---> ", bookingId);
//       console.log("newStatus ---> ", status);
//       const updatedBooking = await Bookings.findByIdAndUpdate(
//         bookingId,
//         { status: status },
//         { new: true }
//       );
//       if (!updatedBooking) {
//         return next(new ErrorHandler("Booking not found", 404));
//       }
//       console.log("status ---> ", updatedBooking.status);
//       return res.json({
//         success: true,
//         updatedStatus: updatedBooking.status
//       });
//     } catch (error: any) {
//       console.log("Error updating booking status:", error);
//       return next(new ErrorHandler(error.message, 400));
//     }
//   }
// )
// export const countBookings = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const owner_id = req.params.id;
//       const page = parseInt(req.query.page as string) || 1;
//       const limit = parseInt(req.query.limit as string) || 10;
//       const skip = (page - 1) * limit;
//       const count = await Bookings.countDocuments({ owner_id });
//       const result = await Bookings.aggregate([
//         { $match: { owner_id: new Types.ObjectId(owner_id) } },
//         {
//           $group: {
//             _id: null,
//             totalBookings: { $sum: 1 },
//             pendingCount: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
//             approvedCount: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
//             cancelCount: { $sum: { $cond: [{ $eq: ['$status', 'cancel'] }, 1, 0] } },
//             completedCount: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
//             totalSales: { $sum: { $toDouble: "$amount" } }
//           }
//         },
//         {
//           $project: {
//             _id: 0,
//             totalBookings: 1,
//             totalSales: 1,
//             pendingCount: 1,
//             approvedCount: 1,
//             cancelCount: 1,
//             completedCount: 1,
//           }
//         }
//       ]);
//       const bookingDetails = await Bookings.find({ owner_id })
//         .populate('room', '-image')
//         .populate('user')
//         .populate('property', '-image')
//         .sort({ _id: -1 })
//         .skip(skip)
//         .limit(limit);
//       const propertyIds = bookingDetails.map(booking => booking.property?._id).filter(Boolean);
//       const locationDetails = await Location.find({ propertyId: { $in: propertyIds } });
//       const combinedBookingDetails = bookingDetails.map(booking => {
//         const location = locationDetails.find(loc => loc.propertyId.toString() === booking.property?._id.toString());
//         return {
//           ...booking.toObject(),
//           location: location || null
//         };
//       });
//       return res.json({
//         success: true,
//         result,
//         bookingDetails: combinedBookingDetails,
//         currentPage: page,
//         totalPages: Math.ceil(count / limit),
//         totalBookings: count,
//       });
//     } catch (error: any) {
//       console.log("Error counting bookings:", error);
//       return next(new ErrorHandler(error.message, 400));
//     }
//   }
// );
// export const getRevenueByOwner = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const owner_id = req.params.id;
//       const page = parseInt(req.query.page as string) || 1;
//       const limit = parseInt(req.query.limit as string) || 5;
//       const skip = (page - 1) * limit;
//       const { property_name, minPrice, maxPrice } = req.query;
//       // Fetch properties owned by this owner
//       const propertyQuery: any = { user_id: owner_id };
//       if (property_name) {
//         propertyQuery.property_name = { $regex: property_name, $options: "i" }; // Case-insensitive search
//       }
//       const properties = await PropertyInfo.find(propertyQuery)
//         .select("_id property_name")
//         .skip(skip)
//         .limit(limit);
//       const propertyIds = properties.map((property) => property._id);
//       if (propertyIds.length === 0) {
//         return res.status(200).json({
//           success: true,
//           message: "No properties found for this owner.",
//           revenue: [],
//         });
//       }
//       // Revenue aggregation
//       const revenueDetails = await Bookings.aggregate([
//         { $match: { property: { $in: propertyIds } } },
//         {
//           $group: {
//             _id: "$property",
//             totalAmount: { $sum: "$amount" },
//             status: { $push: "$status" },
//           },
//         },
//         {
//           $lookup: {
//             from: "propertyinfos",
//             localField: "_id",
//             foreignField: "_id",
//             as: "propertyDetails",
//           },
//         },
//         { $unwind: "$propertyDetails" },
//         {
//           $project: {
//             _id: 1,
//             property_name: "$propertyDetails.property_name",
//             totalAmount: 1,
//             status: 1,
//           },
//         },
//       ]);
//       // Filtering conditions for latest bookings
//       const bookingQuery: any = { property: { $in: propertyIds } };
//       if (minPrice || maxPrice) {
//         bookingQuery.amount = {};
//         if (minPrice) bookingQuery.amount.$gte = parseInt(minPrice as string);
//         if (maxPrice) bookingQuery.amount.$lte = parseInt(maxPrice as string);
//       }
//       // Get latest 5 bookings matching the filters
//       const latestBookings = await Bookings.find(bookingQuery)
//         .sort({ _id: -1 })
//         .limit(5)
//         .select("booking_user_name amount booking_dates status property");
//       const totalRevenue = revenueDetails.reduce((acc, curr) => acc + curr.totalAmount, 0);
//       res.status(200).json({
//         success: true,
//         totalRevenue,
//         latestBookings,
//         revenueDetails,
//       });
//     } catch (error: any) {
//       console.log("Error getting revenue by owner:", error);
//       return next(new ErrorHandler(error.message, 400));
//     }
//   }
// );
// export const getRevenueByProperty = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const propertyId = req.params.id;
//       const page = parseInt(req.query.page as string) || 1;
//       const limit = parseInt(req.query.limit as string) || 5;
//       const skip = (page - 1) * limit;
//       const { startDate, endDate, guestName } = req.query;
//       console.log("Request Parameters:", {
//         propertyId,
//         page,
//         limit,
//         startDate,
//         endDate,
//         guestName,
//       });
//       const matchCriteria: any = { property: propertyId };
//       if (startDate && endDate) {
//         console.log("Fetching booking dates from database...");
//         const modelBookingDates = await Bookings.find({ property: propertyId }, "booking_dates");
//         // Format booking_dates to YYYY-MM-DD while keeping _id
//         const formattedDates = modelBookingDates
//           .map((booking) => {
//             if (!booking.booking_dates) return null; // Skip if null
//             return {
//               _id: booking._id,
//               booking_dates: new Date(booking.booking_dates).toISOString().split("T")[0],
//             };
//           })
//           .filter((booking) => booking !== null); // Remove null entries
//         console.log("Formatted Dates:", formattedDates);
//         const startDateFormatted = new Date(startDate as string).toISOString().split("T")[0];
//         const endDateFormatted = new Date(endDate as string).toISOString().split("T")[0];
//         // Filter dates within range while keeping _id
//         const filteredBookingIds = formattedDates
//           .filter(
//             (booking): booking is { _id: mongoose.Types.ObjectId; booking_dates: string } =>
//               booking !== null && booking.booking_dates >= startDateFormatted && booking.booking_dates <= endDateFormatted
//           )
//           .map((booking) => booking._id.toString()); // Convert ObjectId to string
//         console.log("Filtered Booking IDs:", filteredBookingIds);
//         if (filteredBookingIds.length > 0) {
//           matchCriteria._id = { $in: filteredBookingIds };
//         }
//       }
//       console.log("Match Criteria:", matchCriteria);
//       if (guestName) {
//         matchCriteria.booking_user_name = { $regex: guestName, $options: "i" };
//       }
//       const totalBookings = await Bookings.countDocuments(matchCriteria);
//       console.log("Total Bookings:", totalBookings);
//       // Fetch booking details based on the match criteria
//       const bookingDetails = await Bookings.find(matchCriteria)
//         .populate({
//           path: "room",
//           select: "room_name room_type",
//         })
//         .select("room booking_user_name amount booking_dates status checkInDate checkOutDate")
//         .sort({ _id: -1 })
//         .skip(skip)
//         .limit(limit);
//       console.log("Booking Details:", bookingDetails);
//       const totalRevenue = bookingDetails.reduce((acc, booking) => acc + Number(booking.amount), 0);
//       console.log("Total Revenue:", totalRevenue);
//       return res.json({
//         success: true,
//         totalRevenue,
//         bookingDetails,
//         currentPage: page,
//         totalPages: Math.ceil(totalBookings / limit),
//         totalBookings,
//       });
//     } catch (error: any) {
//       console.log("Error getting revenue by property:", error);
//       return next(new ErrorHandler(error.message, 400));
//     }
//   }
// );
exports.getBookingDetailsOfUser = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = req.params.id;
        const { filterData, startDate, endDate, guestName } = req.query;
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const skip = (page - 1) * limit;
        const matchCriteria = {
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
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }
        if (guestName) {
            matchCriteria.guestDetails = {
                $elemMatch: {
                    firstName: { $regex: guestName, $options: "i" },
                },
            };
        }
        if (filterData && filterData !== 'null' && filterData !== '') {
            const validFilters = ['upcoming', 'completed', 'cancelled', 'processing'];
            if (!validFilters.includes(filterData)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid filterData. Must be one of: upcoming, completed, cancelled, processing",
                });
            }
            const currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0);
            if (filterData === 'upcoming') {
                matchCriteria.checkInDate = Object.assign(Object.assign({}, matchCriteria.checkInDate), { $gt: currentDate });
                matchCriteria.status = { $ne: 'Cancelled' };
                console.log("Current Date:", currentDate.toISOString());
                console.log("Check-in Date Match Criteria:", JSON.stringify(matchCriteria.checkInDate, null, 2));
            }
            else if (filterData === 'completed') {
                matchCriteria.checkInDate = Object.assign(Object.assign({}, matchCriteria.checkInDate), { $lte: currentDate });
                matchCriteria.status = { $in: ['Confirmed'] };
            }
            else if (filterData === 'cancelled') {
                matchCriteria.status = 'Cancelled';
            }
            else if (filterData === 'Processing') {
                delete matchCriteria.status;
                if (matchCriteria.checkInDate) {
                    matchCriteria.checkInDate = {
                        $gte: (_a = matchCriteria.checkInDate.$gte) === null || _a === void 0 ? void 0 : _a.toISOString().split('T')[0],
                        $lte: (_b = matchCriteria.checkInDate.$lte) === null || _b === void 0 ? void 0 : _b.toISOString().split('T')[0],
                    };
                }
            }
        }
        let bookings;
        let totalBookings;
        if (filterData === 'processing') {
            totalBookings = yield cryptoUserPaymentInitialStage_model_1.CryptoGuestDetails.countDocuments(Object.assign(Object.assign({}, matchCriteria), { status: 'Processing' }));
            if (totalBookings === 0) {
                return res.status(404).json({
                    success: false,
                    message: "No bookings found for the given user ID",
                });
            }
            bookings = yield cryptoUserPaymentInitialStage_model_1.CryptoGuestDetails.find(Object.assign(Object.assign({}, matchCriteria), { status: 'Processing' }))
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);
        }
        else {
            totalBookings = yield reservationModel_1.ThirdPartyBooking.countDocuments(matchCriteria);
            if (totalBookings === 0) {
                return res.status(404).json({
                    success: false,
                    message: "No bookings found for the given user ID",
                });
            }
            bookings = yield reservationModel_1.ThirdPartyBooking.find(matchCriteria)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);
        }
        bookings = bookings.map(booking => (Object.assign(Object.assign({}, booking.toObject()), { checkInDate: booking.checkInDate instanceof Date
                ? booking.checkInDate.toISOString().split('T')[0]
                : booking.checkInDate, checkOutDate: booking.checkOutDate instanceof Date
                ? booking.checkOutDate.toISOString().split('T')[0]
                : booking.checkOutDate })));
        const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
        return res.status(200).json({
            success: true,
            totalBookings,
            currentPage: page,
            totalPages: Math.ceil(totalBookings / limit),
            totalRevenue,
            bookings,
        });
    }
    catch (error) {
        console.error("Error in getBookingDetailsOfUser:", error);
        return next(new errorHandler_1.default(error.message || "Internal Server Error", 500));
    }
}));
// export const getBookingDetailsForExtranet = CatchAsyncError(async (req: CustomRequest, res: Response, next: NextFunction) => {
//   try {
//     const owner_id = req.user?.id;
//     const owner_role = req.role;
//     let bookingDetails = [];
//     let count = 0;
//     if (!owner_id || !owner_role) {
//       return res.status(400).json({ message: "Owner Id or Role not provided. Please provide them" });
//     }
//     const page = parseInt(req.query.page as string) || 1;
//     const limit = parseInt(req.query.limit as string) || 10;
//     if (!page || !limit) {
//       return res.status(400).json({ message: "Page or Limit not found. Please provide page and limit" });
//     }
//     const skip = (page - 1) * limit;
//     if (skip === undefined || skip === null || isNaN(skip)) {
//       throw new Error("Skip value not generated");
//     }
//     if (owner_role === "superAdmin") {
//       bookingDetails = await ThirdPartyBooking.find({});
//       if (bookingDetails.length <= 0) {
//         return res.status(400).json({ message: "Can't find any booking details" });
//       }
//       count = bookingDetails.length;
//     }
//     else if (owner_role === "groupManager") {
//       const groupOwnerDetails = await Auth.findById({ _id: owner_id });
//       if (!groupOwnerDetails) {
//         throw new Error("Can't find Group Owner Details. Please provide correct details");
//       }
//       const hotelUserDetails = await Auth.find({ createdBy: groupOwnerDetails.email });
//       if (!hotelUserDetails || hotelUserDetails.length === 0) {
//         throw new Error("Can't find User details");
//       }
//       const userIds = hotelUserDetails.map(user => user._id);
//       console.log(`The user details ${userIds}`);
//       const properties = await PropertyInfo.find({ user_id: { $in: userIds } });
//       if (!properties || properties.length === 0) {
//         throw new Error("No properties found for the group manager");
//       }
//       const propertyCodes = properties.map(property => property.property_code);
//       bookingDetails = await ThirdPartyBooking.find({ hotelCode: { $in: propertyCodes } })
//         .skip(skip)
//         .limit(limit);
//       if (bookingDetails.length <= 0) {
//         return res.status(400).json({ message: "Can't find any booking details for the properties" });
//       }
//       count = await ThirdPartyBooking.countDocuments({ hotelCode: { $in: propertyCodes } });
//     }
//     else if (owner_role === "hotelManager") {
//       const properties = await PropertyInfo.find({ user_id: { $in: owner_id } });
//       if (!properties || properties.length === 0) {
//         throw new Error("No properties found for the group manager");
//       }
//       const propertyCodes = properties.map(property => property.property_code);
//       bookingDetails = await ThirdPartyBooking.find({ hotelCode: { $in: propertyCodes } })
//         .skip(skip)
//         .limit(limit);
//       if (bookingDetails.length <= 0) {
//         return res.status(400).json({ message: "Can't find any booking details for the properties" });
//       }
//       count = await ThirdPartyBooking.countDocuments({ hotelCode: { $in: propertyCodes } });
//     }
//     return res.json({
//       success: true,
//       // count: count,
//       bookingDetails: bookingDetails,
//     });
//   } catch (error: any) {
//     console.log("Error counting bookings:", error);
//     return next(new ErrorHandler(error.message, 400));
//   }
// }
// );
const validatePagination = (page, limit) => {
    if (isNaN(page) || page < 1) {
        throw new Error('Invalid page number. Page must be a positive integer.');
    }
    if (isNaN(limit) || limit < 1 || limit > 100) {
        throw new Error('Invalid limit. Limit must be between 1 and 100.');
    }
};
const getBookingQuery = (query, skip, limit) => __awaiter(void 0, void 0, void 0, function* () {
    const [bookingDetails, count] = yield Promise.all([
        reservationModel_1.ThirdPartyBooking.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
        reservationModel_1.ThirdPartyBooking.countDocuments(query),
    ]);
    return { bookingDetails, count };
});
exports.getBookingDetailsForExtranet = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const owner_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const owner_role = req.role;
        if (!owner_id || !owner_role) {
            return res.status(400).json({ success: false, message: 'Owner ID or Role not provided' });
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        validatePagination(page, limit);
        const skip = (page - 1) * limit;
        let bookingDetails = [];
        let count = 0;
        if (owner_role === 'superAdmin') {
            const result = yield getBookingQuery({}, skip, limit);
            bookingDetails = result.bookingDetails;
            count = result.count;
        }
        else if (owner_role === 'groupManager') {
            const groupOwnerDetails = yield auth_model_1.default.findById(owner_id);
            if (!groupOwnerDetails) {
                throw new Error('Group owner details not found');
            }
            const hotelUserDetails = yield auth_model_1.default.find({ createdBy: groupOwnerDetails.email });
            if (!hotelUserDetails || hotelUserDetails.length === 0) {
                throw new Error('No user details found for group manager');
            }
            const userIds = hotelUserDetails.map(user => user._id);
            const properties = yield property_info_model_1.PropertyInfo.find({ user_id: { $in: userIds } });
            if (!properties || properties.length === 0) {
                throw new Error('No properties found for the group manager');
            }
            const propertyCodes = properties.map(property => property.property_code);
            const result = yield getBookingQuery({ hotelCode: { $in: propertyCodes } }, skip, limit);
            bookingDetails = result.bookingDetails;
            count = result.count;
        }
        else if (owner_role === 'hotelManager') {
            const properties = yield property_info_model_1.PropertyInfo.find({ user_id: owner_id });
            if (!properties || properties.length === 0) {
                throw new Error('No properties found for the hotel manager');
            }
            const propertyCodes = properties.map(property => property.property_code);
            const result = yield getBookingQuery({ hotelCode: { $in: propertyCodes } }, skip, limit);
            bookingDetails = result.bookingDetails;
            count = result.count;
        }
        else {
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
    }
    catch (error) {
        console.error('Error fetching booking details:', error.message);
        return next(new errorHandler_1.default(error.message, 400));
    }
}));
exports.getAllHotelsByRole = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        console.log(`The user details ${JSON.stringify(req.user)}`);
        const ownerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const ownerRole = req.role;
        console.log(`The owner id is ${ownerId} and owner role is ${ownerRole}`);
        if (!ownerId || !ownerRole) {
            return next(new errorHandler_1.default("Owner ID and ROLE not available", 400));
        }
        console.log("Owner ID:", ownerId);
        const convertedOwnerId = new mongoose_1.Types.ObjectId(ownerId);
        const ownerDetails = yield auth_model_2.default.findById(convertedOwnerId);
        if (!ownerDetails) {
            return next(new errorHandler_1.default("Owner not found in database", 404));
        }
        console.log("Owner Details:", ownerDetails);
        const allowedRoles = ["superAdmin", "groupManager", "hotelManager"];
        if (!allowedRoles.includes(ownerDetails.role)) {
            return next(new errorHandler_1.default("Unauthorized access", 403));
        }
        let query = {};
        switch (ownerDetails.role) {
            case "superAdmin":
                break;
            case "groupManager":
                const managedUsers = yield auth_model_2.default.find({
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
        const properties = yield property_info_model_1.PropertyInfo.find(query).select('property_name');
        const propertyNames = [...new Set(properties.map(prop => prop.property_name))].sort();
        return res.json({
            success: true,
            message: "Hotel names fetched successfully",
            hotelNames: propertyNames,
            count: propertyNames.length,
        });
    }
    catch (error) {
        console.error("Error fetching hotel names:", error);
        return next(new errorHandler_1.default(error.message || "Failed to fetch hotel names", error.statusCode || 500));
    }
}));
//# sourceMappingURL=bookings.controller.js.map