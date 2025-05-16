import { Model, Schema, model, Document } from "mongoose";
import { BookingsType } from "../../types";

interface IBooking extends BookingsType, Document {}

type BookingsModelType = Model<IBooking>;

const bookingSchema = new Schema<BookingsType>({
  room: {
    type: Schema.Types.ObjectId,
    ref: "Room",
    required: [true, "Room id is required field"],
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User id is required field"],
  },
  property: {
    type: Schema.Types.ObjectId,
    ref: "PropertyInfo",
    required: [true, "Property id is required"],
  },
  owner_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [false, "Owner id is required field"],
  },
  booking_user_name: {
    type: String,
    required: [true, "Booking user name is required"],
  },
  booking_user_email: {
    type: String,
    required: [true, "Booking user email is required"],
  },
  booking_user_phone: {
    type: String, // Changed to String to accommodate phone numbers with special characters
    required: [true, "Booking user phone is required"],
  },
  amount: {
    type: Number,
    required: [true, "Amount is required"],
  },
  booking_dates: {
    type: Date,
    required: [true, "Booking dates are required"],
  },
  payment: {
    type: String, // Changed to String to store payment method
    enum: ["payNow", "payAtHotel", "card", "cash", "other"],
    default: "payNow",
  },
  // New fields for Pay at Hotel feature
  paymentType: {
    type: String,
    enum: ["payNow", "payAtHotel"],
    default: "payNow"
  },
  stripeCustomerId: {
    type: String,
  },
  stripePaymentMethodId: {
    type: String,
  },
  status: {
    type: String,
    default: "pending",
    enum: [
      "pending",
      "cancel",
      "approved",
      "rejected",
      "in-reviews",
      "completed",
      "Confirmed",
    ],
    required: [true, "Status is required"],
  },
  checkInDate: {
    type: Date,
    required: true,
    validate: {
      validator: function (value: { toISOString: () => string }) {
        return /^\d{4}-\d{2}-\d{2}$/.test(value.toISOString().split("T")[0]);
      },
      message: "Invalid date format for check-in date",
    },
  },
  checkOutDate: {
    type: Date,
    required: true,
    validate: {
      validator: function (value: { toISOString: () => string }) {
        return /^\d{4}-\d{2}-\d{2}$/.test(value.toISOString().split("T")[0]);
      },
      message: "Invalid date format for check-out date",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update 'updatedAt' field before saving or updating a document
bookingSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const Bookings = model<BookingsType, BookingsModelType>("Bookings", bookingSchema);

export default Bookings;