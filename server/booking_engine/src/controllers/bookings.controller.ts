import { Request, Response, NextFunction } from "express";
import Bookings from "../models/booking.model";
import { validateBookingDates } from "../utils/booking.validator.dates";
import mongoose, { Types } from "mongoose";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/errorHandler";
import AuthModelType from "../../../User-Authentication/src/Model/auth.model";
import AuthType from "../../../User-Authentication/src/Model/auth.model";
import { PropertyInfo } from "../../../pms_api/src/model/property.info.model";
import { Room } from "../../../pms_api/src/model/room.model";
import { checkPreferences } from "joi";
import { User } from "@clerk/clerk-sdk-node";
import { Location } from "../../../pms_api/src/model/property.location.model";
import { ThirdPartyReservationService } from '../../../wincloud/src/controller/reservationController';
import { ThirdPartyAmendReservationService } from '../../../wincloud/src/controller/amendReservationController';
import { ThirdPartyAmendBooking } from "../../../wincloud/src/model/amendReservationModel";
import { ThirdPartyBooking } from "../../../wincloud/src/model/reservationModel";
import stripeService from "../services/stripe.service";

// New controller function to create a setup intent
export const createSetupIntent = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Replace createStripeSetupIntent() with stripeService.createSetupIntent()
      const result = await stripeService.createSetupIntent();
      
      if (!result.success) {
        return next(new ErrorHandler(result.error || 'Failed to create setup intent', 500));
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

// New controller function to create a reservation with stored card (Pay at Hotel)
export const createReservationWithStoredCard = CatchAsyncError(
  async (req: any, res: Response, next: NextFunction) => {
    console.log("#########################\n", req.body);
    
    const data = req.body.data;
    const guests = data.guests; // Array of guests
    const roomAssociations = data.roomAssociations; // Array of room associations
    const payment = data.payment;
    const bookingDetails = data.bookingDetails;
    const paymentInfo = data.paymentInfo; // Contains Stripe payment method information
    
    // Validate payment info
    if (!paymentInfo || !paymentInfo.paymentMethodId) {
      return next(new ErrorHandler("Payment method information is required for Pay at Hotel", 400));
    }
    
    const room = roomAssociations[0].roomId; // Use first room
    const user = bookingDetails.userId;
    const booking_user_name = `${guests[0].firstName} ${guests[0].lastName}`; // Use first guest
    const booking_user_email = guests[0].email; // Use first guest
    const booking_user_phone = guests[0].phone; // Use first guest
    const property = bookingDetails.propertyId;
    const amount = payment.amount;
    const booking_dates = new Date();
    
    // Always use payAtHotel for this method
    const paymentMethod = 'payAtHotel';
    
    const status = "Confirmed"; // Booking is confirmed even though payment will happen at hotel
    const checkInDate = bookingDetails.checkInDate;
    const checkOutDate = bookingDetails.checkOutDate;
    const currentDate = new Date();
    const formattedCurrentDate = currentDate.toISOString().split("T")[0];
    
    try {
      const formattedCheckInDate = new Date(checkInDate).toISOString().split("T")[0];
      const formattedCheckOutDate = new Date(checkOutDate).toISOString().split("T")[0];
      
      // Date validation
      if (formattedCheckInDate < formattedCurrentDate || formattedCheckOutDate < formattedCurrentDate) {
        return res.status(400).json({
          message: "Check-in and check-out dates must be in the future",
        });
      }
      
      if (new Date(checkInDate) >= new Date(checkOutDate)) {
        return res.status(400).json({ message: "Check-in date must be before check-out date" });
      }
      
      // Create or retrieve Stripe customer and associate payment method
      const primaryGuest = guests[0]; // Use the first guest as primary
      const customerResult = await stripeService.createOrRetrieveCustomer(
        primaryGuest.email,
        `${primaryGuest.firstName} ${primaryGuest.lastName}`,
        primaryGuest.phone,
        paymentInfo.paymentMethodId
      );
      
      if (!customerResult.success) {
        return next(new ErrorHandler(customerResult.error || "Failed to process payment information", 500));
      }
      
      // Call third-party reservation service if needed
      try {
        const thirdPartyService = new ThirdPartyReservationService();
        await thirdPartyService.processThirdPartyReservation(data);
      } catch (error) {
        console.error("Third-party reservation processing error:", error);
        // Continue with booking process even if third-party service fails
      }
      
      // Start database transaction
      const session = await mongoose.startSession();
      session.startTransaction();
      
      try {
        const owner_id = await PropertyInfo.findOne({ _id: property })
          .select({ user_id: 1 })
          .session(session);
        
        // Create the booking with stored card information
        const newReservation = new Bookings({
          owner_id: owner_id?.user_id,
          room, // Use first room ID
          user,
          booking_user_name, // First guest name
          booking_user_email, // First guest email
          booking_user_phone, // First guest phone
          property,
          amount,
          booking_dates,
          payment: paymentMethod,
          status,
          checkInDate,
          checkOutDate,
          // Additional fields for card storage
          paymentType: 'payAtHotel',
          stripeCustomerId: customerResult.customerId,
          stripePaymentMethodId: paymentInfo.paymentMethodId
        });
        
        const savedBooking = await newReservation.save({ session });
        
        // Update user bookings and decrease room availability
        const [bookingsForUser, updatedRoom] = await Promise.all([
          AuthModelType.findByIdAndUpdate(
            user,
            { $push: { bookings: savedBooking._id } },
            { new: true, session }
          ),
          Room.findByIdAndUpdate(
            room,
            { $inc: { available_rooms: -1 } },
            { new: true, session }
          ),
        ]);
        
        await session.commitTransaction();
        session.endSession();
        
        res.status(201).json({
          success: true,
          message: "Booking confirmed with Pay at Hotel option",
          savedBooking,
          bookingsForUser,
        });
      } catch (error: any) {
        await session.abortTransaction();
        session.endSession();
        console.log(error.message);
        return next(new ErrorHandler(error.message, 400));
      }
    } catch (error) {
      console.error('Error in createReservationWithStoredCard:', error);
      return res.status(500).json({ error: "Error in Create Reservation with Stored Card" });
    }
  }
);

export const createReservation = CatchAsyncError(
  async (req: any, res: Response, next: NextFunction) => {
    console.log("#########################\n", req.body);

    const data = req.body.data;
    const guest = data.guests[0];
    const roomAssociation = data.roomAssociations[0];
    const payment = data.payment;
    const bookingDetails = data.bookingDetails;

    const room = roomAssociation.roomId;
    const user = bookingDetails.userId;
    const booking_user_name = `${guest.firstName} ${guest.lastName}`;
    const booking_user_email = guest.email;
    const booking_user_phone = guest.phone;
    const property = bookingDetails.propertyId;
    const amount = payment.amount;
    const booking_dates = new Date(); // Assuming current date for booking_dates
    
    // Map payment methods to valid enum values in the Bookings model
    let paymentMethod;
    if (payment.method === 'CREDIT_CARD' || payment.method === 'CARD') {
      paymentMethod = 'card';  // Map to 'card' enum value
    } else if (payment.method === 'CASH') {
      paymentMethod = 'cash';  // Map to 'cash' enum value
    } else if (payment.method === 'payNow') {
      paymentMethod = 'payNow';  // Already valid
    } else if (payment.method === 'payAtHotel') {
      paymentMethod = 'payAtHotel';  // Already valid
    } else {
      paymentMethod = 'other';  // Default to 'other' for unknown methods
    }
    
    const status = "Confirmed"; // Assuming status is pending
    const checkInDate = bookingDetails.checkInDate;
    const checkOutDate = bookingDetails.checkOutDate;
    const currentDate = new Date();
    const formattedCurrentDate = currentDate.toISOString().split("T")[0];

    try {
      const formattedCheckInDate = new Date(checkInDate).toISOString().split("T")[0];
      const formattedCheckOutDate = new Date(checkOutDate).toISOString().split("T")[0];

      if (formattedCheckInDate < formattedCurrentDate || formattedCheckOutDate < formattedCurrentDate) {
        return res.status(400).json({
          message: "Check-in and check-out dates must be in the future",
        });
      }

      if (new Date(checkInDate) >= new Date(checkOutDate)) {
        return res
          .status(400)
          .json({ message: "Check-in date must be before check-out date" });
      }
    } catch (error) {
      console.error("Error parsing dates:", error);
      return res.status(400).json({
        message: "Invalid date format",
      });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const owner_id = await PropertyInfo.findOne({ _id: property })
        .select({ user_id: 1 })
        .session(session);

      const newReservation = new Bookings({
        owner_id: owner_id?.user_id,
        room,
        user,
        booking_user_name,
        booking_user_email,
        booking_user_phone,
        property,
        amount,
        booking_dates,
        payment: paymentMethod, // Now this should be a valid enum value
        status,
        checkInDate,
        checkOutDate,
      });

      const savedBooking = await newReservation.save({ session });

      // Update both the user's bookings and room availability in parallel
      const [bookingsForUser, updatedRoom] = await Promise.all([
        AuthModelType.findByIdAndUpdate(
          user,
          { $push: { bookings: savedBooking._id } },
          { new: true, session }
        ),
        Room.findByIdAndUpdate(
          room,
          { $inc: { available_rooms: -1 } },
          { new: true, session }
        ),
      ]);

      await session.commitTransaction();
      session.endSession();

      res.status(201).json({
        success: true,
        savedBooking,
        bookingsForUser,
      });
    } catch (error: any) {
      await session.abortTransaction();
      session.endSession();
      console.log(error.message);
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const updateReservation = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("&&&&&&&&&&&&&&&&\nBOOKING line - 1")
      const reservationId = req.params.id;
      const updateFields = req.body;

      console.log(`************\nThe reservation id is: ${reservationId}`);
      console.log(`************\nThe update fields are: ${JSON.stringify(req.body)}`);
      console.log(`************\nThe update fields are: ${JSON.stringify(updateFields)}`);
      // Prepare data for third-party amend reservation
      const amendData = {
        reservationId,
        ...updateFields,
      };
      console.log("&&&&&&&&&&&&&&&&\nBOOKING line - 2")

      // Call third-party amend reservation service
      const thirdPartyService = new ThirdPartyAmendReservationService();
      await thirdPartyService.processAmendReservation(amendData);
      console.log("&&&&&&&&&&&&&&&&\nBOOKING line - 3")
      // Update booking in database
      console.log(`************\nReservation ID before find: ${reservationId}`);
      const reservation = await ThirdPartyBooking.findOne({ reservationId: reservationId });
      console.log("@&@&@&@&@&@&@&@&\nBOOKING: Updated Reservation:", JSON.stringify(reservation));

      if (!reservation) {
        return next(new ErrorHandler("Reservation not found", 404));
      }
      console.log("&&&&&&&&&&&&&&&&\nBOOKING line - 4")

      res.json(reservation);
      console.log("&&&&&&&&&&&&&&&&\nBOOKING line - 5")
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const getReservation = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reservationId = req.params.reservationId;
      console.log("Requested Reservation ID:", reservationId);

      const reservation = await Bookings.findById(reservationId);
      console.log("Retrieved Reservation:", reservation);

      if (!reservation) {
        return next(new ErrorHandler("Reservation not found", 404));
      }

      res.json(reservation);
    } catch (error: any) {
      console.error("Error getting reservation:", error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const getAllReservations = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Fetch all reservations from the database
      const reservations = await Bookings.find();

      // Check if there are no reservations
      if (!reservations || reservations.length === 0) {
        return res.status(404).json({
          message: "No reservations found",
        });
      }

      // Return the list of reservations
      res.json({
        length: reservations.length,
        reservations,
      });
    } catch (error: any) {
      console.error("Error getting all reservations:", error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const getAllReservationsOfUser = CatchAsyncError(
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const userID = req.params.id;

      const user_reservations = await AuthType.findById(userID)
      const populatedBookings = await Bookings.find({
        _id: { $in: (user_reservations as any).bookings },
      })
        .populate({ path: "room" })
        .populate({ path: "property" })
        .populate({ path: "user" })
        .sort({ _id: -1 });

      return res.json({
        // bookings: user_reservations?.bookings
        bookings: populatedBookings
      })

    } catch (error: any) {
      console.error("Error getting all reservations of User:", error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const getAllOfUser = CatchAsyncError(
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const userID = req.params.id;

      const user_reservations = await AuthType.findById(userID)
      const populatedBookings = await Bookings.find({
        _id: { $in: (user_reservations as any).bookings },
      })
        .populate({ path: "room" })
        .populate({ path: "property" })
        .populate({ path: "user" })
        .sort({ _id: -1 });

      return res.json({
        // bookings: user_reservations?.bookings
        bookings: populatedBookings
      })

    } catch (error: any) {
      console.error("Error getting all reservations of User:", error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
);



export const deleteReservation = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const bookingId = req.params.id;

      const deletedReservation = await Bookings.findByIdAndDelete(bookingId)
        .session(session)
        .lean();

      if (!deletedReservation) {
        await session.abortTransaction();
        session.endSession();
        return next(new ErrorHandler("Reservation not found", 404));
      }

      const [updateUserBooking, updateRoomAvailability] = await Promise.all([
        AuthModelType.findOneAndUpdate(
          { bookings: bookingId },
          { $pull: { bookings: bookingId } },
          { new: true }
        ).session(session).lean(),

        Room.findByIdAndUpdate(
          deletedReservation.room,
          { $inc: { available_rooms: 1 } },
          { new: true }
        ).session(session).lean(),
      ]);

      if (!updateRoomAvailability) {
        await session.abortTransaction();
        session.endSession();
        return next(new ErrorHandler("Room not found or failed to update", 404));
      }

      await session.commitTransaction();
      session.endSession();

      // const deleteBookingIdAtUserModel = await AuthModel.findOneAndUpdate(
      //   { bookings: bookingId },
      //   { $pull: { bookings: bookingId } }, // Use $pull to remove the specific booking ID from the array
      //   { new: true } // Optionally return the updated document
      // );

      res.json({
        success: true,
        message: "Reservation deleted successfully",
        userId: updateUserBooking?._id,
      });
    }
    catch (error: any) {
      await session.abortTransaction();
      session.endSession();
      console.error("Error deleting reservation:", error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const getReservationByRoom = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const roomId = req.params.id;
      const reservations = await Bookings.find({ room: roomId });

      res.json({
        success: true,
        length: reservations.length,
        reservations
      });
    } catch (error: any) {
      console.log("Error getting reservation:", error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
)


export const getBookingsForDashboard = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isValidUser = await AuthModelType.findById(req.params.id);

      if (!isValidUser) {
        return next(new ErrorHandler("User not found", 404));
      }

      const bookings = await Bookings.aggregate([
        {
          $match: {
            owner_id: new Types.ObjectId(req.params.id)
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user"
          }
        },
        {
          $lookup: {
            from: "propertyinfos",
            localField: "property",
            foreignField: "_id",
            as: "property"
          }
        },
        {
          $lookup: {
            from: "rooms",
            localField: "room",
            foreignField: "_id",
            as: "room"
          }
        },
        {
          $unwind: "$property"
        },
        {
          $unwind: "$room"
        },
        {
          $unwind: "$user"
        },
        {
          $project: {
            property_name: "$property.property_name",
            room_name: "$room.room_name",
            room_type: "$room.room_type",
            amount: 1,
            firstName: "$user.firstName",
            lastName: "$user.lastName",
            email: "$user.email",
            checkInDate: 1,
            checkOutDate: 1,
            status: 1
          }
        },
      ])

      return res.json({
        success: true,
        length: bookings.length,
        bookings
      })

    } catch (error: any) {
      console.log("Error getting reservation:", error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
)

export const updateStatusOfBooking = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bookingId = req.params.id;
      const { status } = req.body;

      console.log("bookingId ---> ", bookingId);
      console.log("newStatus ---> ", status);

      const updatedBooking = await Bookings.findByIdAndUpdate(
        bookingId,
        { status: status },
        { new: true }
      );

      if (!updatedBooking) {
        return next(new ErrorHandler("Booking not found", 404));
      }

      console.log("status ---> ", updatedBooking.status);

      return res.json({
        success: true,
        updatedStatus: updatedBooking.status
      });

    } catch (error: any) {
      console.log("Error updating booking status:", error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
)

export const countBookings = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const owner_id = req.params.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const count = await Bookings.countDocuments({ owner_id });
      const result = await Bookings.aggregate([
        { $match: { owner_id: new Types.ObjectId(owner_id) } },
        {
          $group: {
            _id: null,
            totalBookings: { $sum: 1 },
            pendingCount: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
            approvedCount: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
            cancelCount: { $sum: { $cond: [{ $eq: ['$status', 'cancel'] }, 1, 0] } },
            completedCount: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
            totalSales: { $sum: { $toDouble: "$amount" } }
          }
        },
        {
          $project: {
            _id: 0,
            totalBookings: 1,
            totalSales: 1,
            pendingCount: 1,
            approvedCount: 1,
            cancelCount: 1,
            completedCount: 1,
          }
        }
      ]);

      const bookingDetails = await Bookings.find({ owner_id })
        .populate('room', '-image')
        .populate('user')
        .populate('property', '-image')
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit);

      const propertyIds = bookingDetails.map(booking => booking.property?._id).filter(Boolean);

      const locationDetails = await Location.find({ propertyId: { $in: propertyIds } });

      const combinedBookingDetails = bookingDetails.map(booking => {
        const location = locationDetails.find(loc => loc.propertyId.toString() === booking.property?._id.toString());
        return {
          ...booking.toObject(),
          location: location || null
        };
      });

      return res.json({
        success: true,
        result,
        bookingDetails: combinedBookingDetails,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalBookings: count,
      });
    } catch (error: any) {
      console.log("Error counting bookings:", error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
);


export const getRevenueByOwner = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const owner_id = req.params.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;
      const skip = (page - 1) * limit;

      const { property_name, minPrice, maxPrice } = req.query;

      // Fetch properties owned by this owner
      const propertyQuery: any = { user_id: owner_id };
      if (property_name) {
        propertyQuery.property_name = { $regex: property_name, $options: "i" }; // Case-insensitive search
      }

      const properties = await PropertyInfo.find(propertyQuery)
        .select("_id property_name")
        .skip(skip)
        .limit(limit);

      const propertyIds = properties.map((property) => property._id);

      if (propertyIds.length === 0) {
        return res.status(200).json({
          success: true,
          message: "No properties found for this owner.",
          revenue: [],
        });
      }

      // Revenue aggregation
      const revenueDetails = await Bookings.aggregate([
        { $match: { property: { $in: propertyIds } } },
        {
          $group: {
            _id: "$property",
            totalAmount: { $sum: "$amount" },
            status: { $push: "$status" },
          },
        },
        {
          $lookup: {
            from: "propertyinfos",
            localField: "_id",
            foreignField: "_id",
            as: "propertyDetails",
          },
        },
        { $unwind: "$propertyDetails" },
        {
          $project: {
            _id: 1,
            property_name: "$propertyDetails.property_name",
            totalAmount: 1,
            status: 1,
          },
        },
      ]);

      // Filtering conditions for latest bookings
      const bookingQuery: any = { property: { $in: propertyIds } };

      if (minPrice || maxPrice) {
        bookingQuery.amount = {};
        if (minPrice) bookingQuery.amount.$gte = parseInt(minPrice as string);
        if (maxPrice) bookingQuery.amount.$lte = parseInt(maxPrice as string);
      }

      // Get latest 5 bookings matching the filters
      const latestBookings = await Bookings.find(bookingQuery)
        .sort({ _id: -1 })
        .limit(5)
        .select("booking_user_name amount booking_dates status property");

      const totalRevenue = revenueDetails.reduce((acc, curr) => acc + curr.totalAmount, 0);

      res.status(200).json({
        success: true,
        totalRevenue,
        latestBookings,
        revenueDetails,
      });

    } catch (error: any) {
      console.log("Error getting revenue by owner:", error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const getRevenueByProperty = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const propertyId = req.params.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;
      const skip = (page - 1) * limit;
      const { startDate, endDate, guestName } = req.query;

      console.log("Request Parameters:", {
        propertyId,
        page,
        limit,
        startDate,
        endDate,
        guestName,
      });

      const matchCriteria: any = { property: propertyId };

      if (startDate && endDate) {
        console.log("Fetching booking dates from database...");
        const modelBookingDates = await Bookings.find({ property: propertyId }, "booking_dates");

        // Format booking_dates to YYYY-MM-DD while keeping _id
        const formattedDates = modelBookingDates
          .map((booking) => {
            if (!booking.booking_dates) return null; // Skip if null
            return {
              _id: booking._id,
              booking_dates: new Date(booking.booking_dates).toISOString().split("T")[0],
            };
          })
          .filter((booking) => booking !== null); // Remove null entries

        console.log("Formatted Dates:", formattedDates);

        const startDateFormatted = new Date(startDate as string).toISOString().split("T")[0];
        const endDateFormatted = new Date(endDate as string).toISOString().split("T")[0];

        // Filter dates within range while keeping _id
        const filteredBookingIds = formattedDates
          .filter(
            (booking): booking is { _id: mongoose.Types.ObjectId; booking_dates: string } =>
              booking !== null && booking.booking_dates >= startDateFormatted && booking.booking_dates <= endDateFormatted
          )
          .map((booking) => booking._id.toString()); // Convert ObjectId to string

        console.log("Filtered Booking IDs:", filteredBookingIds);

        if (filteredBookingIds.length > 0) {
          matchCriteria._id = { $in: filteredBookingIds };
        }
      }

      console.log("Match Criteria:", matchCriteria);

      if (guestName) {
        matchCriteria.booking_user_name = { $regex: guestName, $options: "i" };
      }

      const totalBookings = await Bookings.countDocuments(matchCriteria);
      console.log("Total Bookings:", totalBookings);

      // Fetch booking details based on the match criteria
      const bookingDetails = await Bookings.find(matchCriteria)
        .populate({
          path: "room",
          select: "room_name room_type",
        })
        .select("room booking_user_name amount booking_dates status checkInDate checkOutDate")
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit);

      console.log("Booking Details:", bookingDetails);

      const totalRevenue = bookingDetails.reduce((acc, booking) => acc + Number(booking.amount), 0);

      console.log("Total Revenue:", totalRevenue);

      return res.json({
        success: true,
        totalRevenue,
        bookingDetails,
        currentPage: page,
        totalPages: Math.ceil(totalBookings / limit),
        totalBookings,
      });
    } catch (error: any) {
      console.log("Error getting revenue by property:", error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const getBookingDetailsOfUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;
      const { startDate, endDate, guestName } = req.query;

      const matchCriteria: any = { user: userId };

      if (startDate || endDate) {
        if (!startDate || !endDate) {
          return res.status(400).json({
            success: false,
            message: "Both dates are needed for filtering",
          });
        }
        matchCriteria.booking_dates = {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string),
        };
      }

      if (guestName) {
        matchCriteria.booking_user_name = { $regex: guestName, $options: "i" };
      }

      const totalBookings = await Bookings.countDocuments(matchCriteria);

      const bookingDetails = await Bookings.find(matchCriteria)
        .populate({
          path: "property",
          select: "property_name",
        })
        .populate({
          path: "room",
          select: "room_name room_type",
        })
        .select("room booking_user_name booking_user_phone amount booking_dates status checkInDate checkOutDate")
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit);

      const totalRevenue = bookingDetails.reduce((acc, booking) => acc + Number(booking.amount), 0);

      return res.json({
        success: true,
        totalRevenue,
        bookingDetails,
        currentPage: page,
        totalPages: Math.ceil(totalBookings / limit),
        totalBookings,
      });
    } catch (error: any) {
      console.log("Error getting revenue by property:", error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

