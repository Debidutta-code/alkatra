import { Types } from "mongoose";

export type BookingsType = {
  owner_id: Types.ObjectId;
  property: Types.ObjectId;
  room: Types.ObjectId;
  user: Types.ObjectId;
  booking_user_name: string;
  booking_user_email: string;
  booking_user_phone: Number;
  amount: Number;
  // Changed payment to be either an ObjectId or string to support payment methods
  payment: string | Types.ObjectId;
  booking_dates: Date;
  status: string;
  checkInDate: Date;
  checkOutDate: Date;
  reviews: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  
  // New fields for Pay at Hotel feature
  paymentType?: string; // 'payNow' or 'payAtHotel'
  stripeCustomerId?: string; // Stripe customer ID
  stripePaymentMethodId?: string; // Stripe payment method ID
};