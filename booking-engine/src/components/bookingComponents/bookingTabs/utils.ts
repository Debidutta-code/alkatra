import React from 'react';
import { format, parseISO, differenceInDays } from "date-fns";
import { 
  FaRegCalendarCheck, 
  FaRegClock, 
  FaRegTimesCircle, 
  FaRegCalendarAlt, 
  FaBed,
  FaConciergeBell,
  FaStar
} from "react-icons/fa";
import { Booking, CouponDetails } from './types';

export const formatDateString = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, "EEE, MMM d, yyyy");
  } catch (error) {
    return "Invalid Date";
  }
};

export const calculateNights = (checkIn: string, checkOut: string): number => {
  try {
    const startDate = parseISO(checkIn);
    const endDate = parseISO(checkOut);
    return differenceInDays(endDate, startDate);
  } catch (error) {
    return 1;
  }
};

export const getStatusClass = (status: string): string => {
  switch (status) {
    case "Confirmed":
      return "bg-green-100 text-green-800 border-green-300";
    case "Pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "Cancelled":
      return "bg-red-100 text-red-800 border-red-300";
    case "Modified":
      return "bg-blue-100 text-blue-800 border-blue-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
};

export const getStatusIcon = (status: string, lang: string = "en"): React.ReactElement => {
  const directionClass = lang === "ar" ? "ml-1.5" : "mr-1.5";
  switch (status) {
    case "Confirmed":
      return React.createElement(FaRegCalendarCheck, { className: `text-green-600 ${directionClass}` });
    case "Pending":
      return React.createElement(FaRegClock, { className: `text-yellow-600 ${directionClass}` });
    case "Cancelled":
      return React.createElement(FaRegTimesCircle, { className: `text-red-600 ${directionClass}` });
    default:
      return React.createElement(FaRegCalendarAlt, { className: `text-gray-600 ${directionClass}` });
  }
};

export const getRoomTypeStyle = (roomType: string = ""): string => {
  const type = roomType?.toLowerCase() || "";
    
  if (type.includes("deluxe") || type.includes("premium")) {
    return "bg-tripswift-blue/10 text-tripswift-blue border border-tripswift-blue/30";
  } else if (type.includes("suite")) {
    return "bg-tripswift-blue/20 text-tripswift-blue border border-tripswift-blue/40";
  } else if (type.includes("executive") || type.includes("business")) {
    return "bg-tripswift-blue/15 text-tripswift-blue border border-tripswift-blue/35";
  } else {
    return "bg-tripswift-blue/5 text-tripswift-blue border border-tripswift-blue/20";
  }
};

export const getRoomTypeIcon = (roomType: string = "", lang: string = "en"): React.ReactElement => {
  const type = roomType?.toLowerCase() || "";
  const directionClass = lang === "ar" ? "ml-1.5" : "mr-1.5";

  if (type.includes("deluxe") || type.includes("premium")) {
    return React.createElement(FaConciergeBell, { className: `text-tripswift-blue ${directionClass}`});
  } else if (type.includes("suite")) {
    return React.createElement(FaStar, { className: `text-tripswift-blue ${directionClass}` });
  } else {
    return React.createElement(FaBed, { className: `text-tripswift-blue ${directionClass}` });
  }
};

// Coupon calculation utilities
const getDiscountInfo = (coupon: CouponDetails): { type: 'percentage' | 'fixed', value: number, maxCap?: number } => {
  // Handle couponModel format (discountPercentage)
  if (coupon.details.discountPercentage !== undefined) {
    return {
      type: 'percentage',
      value: coupon.details.discountPercentage,
    };
  }
  
  // Handle promocode format (discountType + discountValue)
  if (coupon.details.discountType && coupon.details.discountValue !== undefined) {
    return {
      type: coupon.details.discountType,
      value: coupon.details.discountValue,
      maxCap: coupon.details.maxDiscountAmount,
    };
  }
  
  return { type: 'percentage', value: 0 };
};

export const calculateOriginalAmount = (booking: Booking): number => {
  if (!booking.couponDetails || booking.couponDetails.length === 0) {
    return booking.totalAmount;
  }

  let totalOriginal = booking.totalAmount;

  // Apply all coupons in reverse
  for (let i = booking.couponDetails.length - 1; i >= 0; i--) {
    const discountInfo = getDiscountInfo(booking.couponDetails[i]);
    
    if (discountInfo.type === 'percentage') {
      // Reverse calculate percentage discount
      totalOriginal = totalOriginal / (1 - discountInfo.value / 100);
      
      // Apply max discount cap if exists
      if (discountInfo.maxCap) {
        const calculatedDiscount = totalOriginal - totalOriginal * (1 - discountInfo.value / 100);
        if (calculatedDiscount > discountInfo.maxCap) {
          totalOriginal = booking.totalAmount + discountInfo.maxCap;
        }
      }
    } else if (discountInfo.type === 'fixed' || discountInfo.type === 'flat') {
      // ✅ FIX: Handle both 'fixed' and 'flat' types
      totalOriginal = totalOriginal + discountInfo.value;
    }
  }

  return totalOriginal;
};

export const getDiscountAmount = (booking: Booking): number => {
  return calculateOriginalAmount(booking) - booking.totalAmount;
};

export const formatDiscountBadge = (couponDetails: CouponDetails[], currency: string): string => {
  if (!couponDetails || couponDetails.length === 0) return '';
  
  // Calculate total discount percentage or show multiple coupons
  const totalDiscount = couponDetails.reduce((total, coupon) => {
    const info = getDiscountInfo(coupon);
    if (info.type === 'percentage') {
      return total + info.value;
    }
    return total;
  }, 0);
  
  if (couponDetails.length > 1) {
    return `${totalDiscount}% OFF (${couponDetails.length} coupons)`;
  }
  
  const info = getDiscountInfo(couponDetails[0]);
  if (info.type === 'percentage') {
    return `${info.value}% OFF`;
  }
  return `${currency} ${info.value} OFF`;
};

// export const getPaymentMethodText = (booking: Booking): string => {
//   if (booking.payment === "payAtHotel" || booking.paymentType === "payAtHotel") {
//     return "Pay at Hotel";
//   }
//   if (booking.payment === "CREDIT_CARD" || booking.payment === "card") {
//     return "Credit Card (Prepaid)";
//   }
//   if (booking.payment === "cash") {
//     return "Cash";
//   }
//   if (booking.payment === "payNow") {
//     return "Paid Online";
//   }
//   if (booking.payment === "other") {
//     return "Other Payment Method";
//   }
  
//   if (booking.payment) {
//     const formatted = booking.payment
//       .replace(/([A-Z])/g, ' $1')
//       .replace(/_/g, ' ')
//       .replace(/^\w/, c => c.toUpperCase());
//     return formatted;
//   }
  
//   if (booking.paymentType) {
//     const formatted = booking.paymentType
//       .replace(/([A-Z])/g, ' $1')
//       .replace(/_/g, ' ')
//       .replace(/^\w/, c => c.toUpperCase());
//     return formatted;
//   }
  
//   return "Payment Method Not Specified";
// };

// export const getPaymentMethodIcon = (booking: Booking): JSX.Element => {
//   if (booking.payment === "payAtHotel" || booking.paymentType === "payAtHotel") {
//     return React.createElement(FaMoneyBillWave, { className: "mr-1.5" });
//   }
  
//   if (booking.payment === "CREDIT_CARD" || booking.payment === "card" || booking.payment === "payNow") {
//     return React.createElement(FaCreditCard, { className: "mr-1.5" });
//   }
  
//   return React.createElement(FaCreditCard, { className: "mr-1.5" });
// };

// export const getBookingId = (booking: Booking): string => {
//   if (booking.bookingId) return booking.bookingId;
  
//   const id = booking._id || "";
//   if (id.length >= 8) {
//     return `${id.substring(0, 4)}...${id.substring(id.length - 4)}`.toUpperCase();
//   }
//   return (id).toUpperCase();
// };