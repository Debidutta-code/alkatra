// import { FaCalendarAlt, FaExchangeAlt, FaUserPlus, FaUserMinus, FaInfoCircle } from "react-icons/fa";
// import { IconType } from "react-icons";

// /**
//  * Types of reservation amendments
//  */
// export type AmendmentType = "DateChange" | "RoomUpgrade" | "GuestChange" | "StayExtension" | "StayReduction";

// /**
//  * Structure of amendment rules
//  */
// export interface AmendmentRules {
//   minDaysBeforeCheckIn: number;
//   feePercentage: number;
//   maxFeeAmount: number | null;
//   isAllowed: boolean;
//   description: string;
//   shortDescription: string;
// }

// /**
//  * Amendment styling information for UI display
//  */
// export interface AmendmentStyling {
//   color: string;
//   bgColor: string;
//   borderColor: string;
//   textColor: string;
//   icon: IconType;
// }

// /**
//  * Configuration for different amendment types
//  */
// export const AMENDMENT_POLICIES: Record<AmendmentType, AmendmentRules> = {
//   DateChange: {
//     minDaysBeforeCheckIn: 3,
//     feePercentage: 0,
//     maxFeeAmount: null,
//     isAllowed: true,
//     description: "Date changes are allowed up to 3 days before check-in with no fee. Changes within 3 days may incur a fee equal to one night's stay.",
//     shortDescription: "Free date changes until 3 days before check-in"
//   },
//   RoomUpgrade: {
//     minDaysBeforeCheckIn: 1,
//     feePercentage: 0,
//     maxFeeAmount: null,
//     isAllowed: true,
//     description: "Room upgrades are allowed subject to availability. Price difference will apply. No downgrade fee for moving to a lower category.",
//     shortDescription: "Room upgrades available (price difference applies)"
//   },
//   GuestChange: {
//     minDaysBeforeCheckIn: 1,
//     feePercentage: 0,
//     maxFeeAmount: null,
//     isAllowed: true,
//     description: "Guest name changes are allowed up to 24 hours before check-in. Additional guests may incur extra person charges.",
//     shortDescription: "Guest changes allowed until 24 hours before check-in"
//   },
//   StayExtension: {
//     minDaysBeforeCheckIn: 1,
//     feePercentage: 0,
//     maxFeeAmount: null,
//     isAllowed: true,
//     description: "Extend your stay subject to availability. Current rate may apply to additional nights.",
//     shortDescription: "Extend your stay (subject to availability)"
//   },
//   StayReduction: {
//     minDaysBeforeCheckIn: 3,
//     feePercentage: 25,
//     maxFeeAmount: null,
//     isAllowed: true,
//     description: "Reducing length of stay more than 3 days before check-in will incur a 25% fee for the cancelled nights. Within 3 days, cancellation policy applies.",
//     shortDescription: "25% fee applies when reducing stay length"
//   }
// };

// /**
//  * Get styling information for an amendment type
//  */
// export const getAmendmentStyling = (amendmentType: AmendmentType): AmendmentStyling => {
//   switch (amendmentType) {
//     case "DateChange":
//       return { 
//         color: "tripswift-blue", 
//         bgColor: "bg-tripswift-blue/10", 
//         borderColor: "border-tripswift-blue/20",
//         textColor: "text-tripswift-blue",
//         icon: FaCalendarAlt 
//       };
//     case "RoomUpgrade":
//       return { 
//         color: "green", 
//         bgColor: "bg-green-50", 
//         borderColor: "border-green-200",
//         textColor: "text-green-800",
//         icon: FaExchangeAlt 
//       };
//     case "GuestChange":
//       return { 
//         color: "purple", 
//         bgColor: "bg-purple-50", 
//         borderColor: "border-purple-200",
//         textColor: "text-purple-800",
//         icon: FaUserPlus 
//       };
//     case "StayExtension":
//       return { 
//         color: "tripswift-blue", 
//         bgColor: "bg-tripswift-blue/10", 
//         borderColor: "border-tripswift-blue/20",
//         textColor: "text-tripswift-blue",
//         icon: FaCalendarAlt 
//       };
//     case "StayReduction":
//       return { 
//         color: "orange", 
//         bgColor: "bg-orange-50", 
//         borderColor: "border-orange-200",
//         textColor: "text-orange-800",
//         icon: FaUserMinus 
//       };
//   }
// };

// /**
//  * Get bullet points for a specific amendment type
//  */
// export const getAmendmentBulletPoints = (amendmentType: AmendmentType): { text: string, color: string }[] => {
//   switch (amendmentType) {
//     case "DateChange":
//       return [
//         { text: "Free changes: If amended more than 3 days before check-in", color: "text-green-600" },
//         { text: "Fee applies: One night's charge if amended within 3 days of check-in", color: "text-tripswift-blue" },
//         { text: "New dates: Subject to availability and rate differences", color: "text-tripswift-black/60" }
//       ];
//     case "RoomUpgrade":
//       return [
//         { text: "Upgrades: Available anytime subject to availability", color: "text-green-600" },
//         { text: "Rate difference: Will apply for higher category rooms", color: "text-tripswift-blue" },
//         { text: "Downgrades: No fee, but refund subject to cancellation policy", color: "text-tripswift-black/60" }
//       ];
//     case "GuestChange":
//       return [
//         { text: "Guest name: Can be changed up to 24 hours before check-in", color: "text-green-600" },
//         { text: "Additional guests: May incur extra person charges", color: "text-tripswift-blue" },
//         { text: "Maximum occupancy: Cannot be exceeded per room regulations", color: "text-red-600" }
//       ];
//     case "StayExtension":
//       return [
//         { text: "Availability: Extension subject to room availability", color: "text-tripswift-blue" },
//         { text: "Rate: Current or seasonal rate may apply to additional nights", color: "text-tripswift-black/60" },
//         { text: "Request timing: Best to request as early as possible", color: "text-tripswift-black/60" }
//       ];
//     case "StayReduction":
//       return [
//         { text: "Early departure: 25% fee applies to cancelled nights if notified 3+ days prior", color: "text-tripswift-blue" },
//         { text: "Late notice: Full cancellation policy applies if within 3 days", color: "text-red-600" },
//         { text: "Minimum stay: Some rates require a minimum length of stay", color: "text-tripswift-black/60" }
//       ];
//   }
// };

// /**
//  * Calculate amendment fee based on amendment type and days until check-in
//  */
// export const calculateAmendmentFee = (
//   amendmentType: AmendmentType,
//   bookingAmount: number,
//   nightlyRate: number,
//   daysUntilCheckIn: number,
//   nightsAffected: number = 1
// ): { feePercentage: number, feeAmount: number, maxFeeApplied: boolean } => {
//   const policy = AMENDMENT_POLICIES[amendmentType];
//   let feePercentage = 0;
//   let feeAmount = 0;
//   let maxFeeApplied = false;
  
//   // No fees for room upgrades (only rate difference applies)
//   if (amendmentType === "RoomUpgrade" || amendmentType === "StayExtension") {
//     return { feePercentage: 0, feeAmount: 0, maxFeeApplied: false };
//   }
  
//   // Date changes fees
//   if (amendmentType === "DateChange") {
//     if (daysUntilCheckIn < policy.minDaysBeforeCheckIn) {
//       feeAmount = nightlyRate; // One night's fee for late changes
//       feePercentage = (feeAmount / bookingAmount) * 100;
//     }
//   }
  
//   // Stay reduction fees
//   if (amendmentType === "StayReduction") {
//     if (daysUntilCheckIn >= policy.minDaysBeforeCheckIn) {
//       feePercentage = policy.feePercentage;
//       feeAmount = (nightlyRate * nightsAffected) * (feePercentage / 100);
//     } else {
//       // Within 3 days, full cancellation fee applies for reduced nights
//       feePercentage = 100;
//       feeAmount = nightlyRate * nightsAffected;
//     }
//   }
  
//   // Apply maximum fee cap if specified
//   if (policy.maxFeeAmount !== null && feeAmount > policy.maxFeeAmount) {
//     feeAmount = policy.maxFeeAmount;
//     maxFeeApplied = true;
//   }
  
//   return {
//     feePercentage,
//     feeAmount,
//     maxFeeApplied
//   };
// };

// /**
//  * Check if a specific amendment is allowed based on reservation details
//  */
// export const isAmendmentAllowed = (
//   amendmentType: AmendmentType,
//   daysUntilCheckIn: number,
//   isNonRefundable: boolean = false
// ): { allowed: boolean, reason: string | null } => {
//   const policy = AMENDMENT_POLICIES[amendmentType];
  
//   // Non-refundable reservations have stricter amendment rules
//   if (isNonRefundable) {
//     if (amendmentType === "DateChange" || amendmentType === "StayReduction") {
//       return { 
//         allowed: false, 
//         reason: "This amendment is not allowed for non-refundable reservations" 
//       };
//     }
//   }
  
//   // Check minimum days requirement
//   if (daysUntilCheckIn < policy.minDaysBeforeCheckIn) {
//     return { 
//       allowed: amendmentType !== "StayReduction", // Only stay reduction is completely disallowed within min days
//       reason: `This amendment requires at least ${policy.minDaysBeforeCheckIn} days before check-in` 
//     };
//   }
  
//   // All other cases are allowed
//   return { allowed: true, reason: null };
// };

// /**
//  * Get an amendment type from string (with fallback)
//  */
// export const getAmendmentType = (amendmentString?: string): AmendmentType => {
//   if (amendmentString && Object.keys(AMENDMENT_POLICIES).includes(amendmentString)) {
//     return amendmentString as AmendmentType;
//   }
  
//   // Default fallback
//   return "DateChange";
// };

// /**
//  * Generate description for Room Card display
//  */
// export const getRoomCardAmendmentDescription = (amendmentType: AmendmentType): string => {
//   return AMENDMENT_POLICIES[amendmentType].shortDescription;
// };

// /**
//  * Get all available amendment types for a reservation
//  */
// export const getAvailableAmendments = (
//   daysUntilCheckIn: number,
//   isNonRefundable: boolean = false
// ): AmendmentType[] => {
//   return Object.keys(AMENDMENT_POLICIES).filter(type => {
//     const { allowed } = isAmendmentAllowed(type as AmendmentType, daysUntilCheckIn, isNonRefundable);
//     return allowed;
//   }) as AmendmentType[];
// };