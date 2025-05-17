import mongoose from "mongoose";

const guestSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  email:     { type: String, required: true },
  phone:     { type: String, required: true },
});

const bookingSchema = new mongoose.Schema({
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    required: true,
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PropertyInfo",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  booking_user_name: {
    type: String,
    required: true,
  },
  booking_user_email: {
    type: String,
    required: true,
  },
  booking_user_phone: {
    type: String,
    required: true,
  },
  guests: [guestSchema], // array of guest objects
  booking_dates: {
    type: Date,
    default: Date.now,
  },
  checkInDate: {
    type: Date,
    required: true,
  },
  checkOutDate: {
    type: Date,
    required: true,
  },
  payment: {
    type: String,
    enum: ["payAtHotel", "stripe", "razorpay", "other"],
    required: true,
  },
  paymentType: {
    type: String,
    default: "payAtHotel",
  },
  status: {
    type: String,
    enum: ["Confirmed", "Pending", "Cancelled"],
    default: "Confirmed",
  },
  stripeCustomerId: {
    type: String,
  },
  stripePaymentMethodId: {
    type: String,
  },
}, {
  timestamps: true,
});

export default mongoose.model("Bookings", bookingSchema);
