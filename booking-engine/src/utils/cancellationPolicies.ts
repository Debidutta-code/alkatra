import { FaCheckCircle, FaInfoCircle, FaTimesCircle } from "react-icons/fa";
import { IconType } from "react-icons";

/**
 * Standard OTA cancellation policy types
 */
export type PolicyType = "Flexible" | "Moderate" | "Strict" | "NonRefundable";

/**
 * Structure of the cancellation policy rules
 */
export interface PolicyRules {
  fullRefundDays: number;
  partialRefundDays: number;
  partialRefundPercentage: number;
  description: string;
  shortDescription: string;
}

/**
 * Policy styling information for UI display
 */
export interface PolicyStyling {
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  icon: IconType;
}

/**
 * Standard OTA cancellation policies configuration
 */
export const OTA_POLICIES: Record<PolicyType, PolicyRules> = {
  Flexible: {
    fullRefundDays: 1, // Full refund if cancelled more than 24 hours before check-in
    partialRefundDays: 0,
    partialRefundPercentage: 0,
    description: "Free cancellation until 24 hours before check-in. After that, the reservation is non-refundable.",
    shortDescription: "Free cancellation until 24 hours before check-in"
  },
  Moderate: {
    fullRefundDays: 5, // Full refund if cancelled more than 5 days before check-in
    partialRefundDays: 1, // Partial refund if cancelled between 1-5 days
    partialRefundPercentage: 50,
    description: "Full refund if cancelled 5+ days before check-in. 50% refund between 1-5 days before check-in. No refund within 24 hours of check-in.",
    shortDescription: "Free cancellation until 5 days before check-in"
  },
  Strict: {
    fullRefundDays: 7, // Full refund if cancelled more than 7 days before check-in
    partialRefundDays: 1, // Partial refund if cancelled between 1-7 days
    partialRefundPercentage: 50,
    description: "Full refund if cancelled 7+ days before check-in. 50% refund if cancelled 1-7 days before check-in. No refund within 24 hours of check-in.",
    shortDescription: "Free cancellation until 7 days before check-in"
  },
  NonRefundable: {
    fullRefundDays: 0,
    partialRefundDays: 0,
    partialRefundPercentage: 0,
    description: "This booking is non-refundable. No refund will be provided regardless of cancellation timing.",
    shortDescription: "Non-refundable rate"
  }
};

/**
 * Get styling information for a policy type
 */
export const getPolicyStyling = (policyType: PolicyType): PolicyStyling => {
  switch (policyType) {
    case "Flexible":
      return { 
        color: "green", 
        bgColor: "bg-green-50", 
        borderColor: "border-green-200",
        textColor: "text-green-800",
        icon: FaCheckCircle 
      };
    case "Moderate":
      return { 
        color: "tripswift-blue", 
        bgColor: "bg-tripswift-blue/10", 
        borderColor: "border-tripswift-blue/20",
        textColor: "text-tripswift-blue",
        icon: FaInfoCircle 
      };
    case "Strict":
      return { 
        color: "orange", 
        bgColor: "bg-orange-50", 
        borderColor: "border-orange-200",
        textColor: "text-orange-800",
        icon: FaInfoCircle 
      };
    case "NonRefundable":
      return { 
        color: "red", 
        bgColor: "bg-red-50", 
        borderColor: "border-red-200",
        textColor: "text-red-800",
        icon: FaTimesCircle 
      };
  }
};

/**
 * Get bullet points for a specific policy type
 */
export const getPolicyBulletPoints = (policyType: PolicyType): { text: string, color: string }[] => {
  switch (policyType) {
    case "Flexible":
      return [
        { text: "Full refund: If cancelled more than 24 hours before check-in", color: "text-green-600" },
        { text: "No refund: If cancelled within 24 hours of check-in", color: "text-red-600" }
      ];
    case "Moderate":
      return [
        { text: "Full refund: If cancelled 5+ days before check-in", color: "text-green-600" },
        { text: "50% refund: If cancelled 1-5 days before check-in", color: "text-tripswift-blue" },
        { text: "No refund: If cancelled within 24 hours of check-in", color: "text-red-600" }
      ];
    case "Strict":
      return [
        { text: "Full refund: If cancelled 7+ days before check-in", color: "text-green-600" },
        { text: "50% refund: If cancelled 1-7 days before check-in", color: "text-yellow-600" },
        { text: "No refund: If cancelled within 24 hours of check-in", color: "text-red-600" }
      ];
    case "NonRefundable":
      return [
        { text: "No refund: This booking is non-refundable at any time", color: "text-red-600" },
        { text: "Non-refundable bookings typically come with a discounted rate", color: "text-tripswift-black/60" }
      ];
  }
};

/**
 * Calculate refund amount based on policy type and days until check-in
 */
export const calculateRefund = (
  policyType: PolicyType,
  bookingAmount: number,
  daysUntilCheckIn: number,
  hoursUntilCheckIn: number
): { refundPercentage: number, refundAmount: number, cancellationFee: number } => {
  const policy = OTA_POLICIES[policyType];
  let refundPercentage = 0;
  
  if (policyType === "NonRefundable") {
    // Non-refundable booking
    refundPercentage = 0;
  } else if (daysUntilCheckIn >= policy.fullRefundDays) {
    // Full refund period
    refundPercentage = 100;
  } else if (daysUntilCheckIn >= policy.partialRefundDays || 
            (policy.partialRefundDays === 1 && hoursUntilCheckIn >= 24)) {
    // Partial refund period
    refundPercentage = policy.partialRefundPercentage;
  }
  
  const refundAmount = (refundPercentage / 100) * bookingAmount;
  const cancellationFee = bookingAmount - refundAmount;
  
  return {
    refundPercentage,
    refundAmount,
    cancellationFee
  };
};

/**
 * Determine the most appropriate policy type based on check-in date
 * (useful for suggesting policies to property owners)
 */
export const suggestPolicyForDate = (checkInDate: Date): PolicyType => {
  const now = new Date();
  const daysUntilCheckIn = Math.ceil((checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilCheckIn < 3) {
    return "NonRefundable";
  } else if (daysUntilCheckIn < 7) {
    return "Strict";
  } else if (daysUntilCheckIn < 14) {
    return "Moderate";
  } else {
    return "Flexible";
  }
};

/**
 * Get a policy type from string (with fallback)
 */
export const getPolicyType = (policyString?: string): PolicyType => {
  if (policyString && Object.keys(OTA_POLICIES).includes(policyString)) {
    return policyString as PolicyType;
  }
  
  // Default fallback
  return "Moderate";
};

/**
 * Generate description for Room Card display
 */
export const getRoomCardPolicyDescription = (policyType: PolicyType): string => {
  switch (policyType) {
    case "Flexible":
      return "Free cancellation up to 24h before check-in";
    case "Moderate":
      return "Free cancellation up to 5 days before check-in";
    case "Strict":
      return "Free cancellation up to 7 days before check-in";
    case "NonRefundable":
      return "Non-refundable rate with special discount";
  }
};