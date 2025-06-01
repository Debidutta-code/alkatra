import { CheckCircle, Info, XCircle, AlertCircle, LucideIcon } from "lucide-react";
import { TFunction } from "i18next";

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
  headerBgColor: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  icon: LucideIcon;
}

// Type for translation keys to ensure type safety
type TranslationKeys = 
  | 'CancellationPolicies.policyTypes.flexible.description'
  | 'CancellationPolicies.policyTypes.flexible.shortDescription'
  | 'CancellationPolicies.policyTypes.moderate.description'
  | 'CancellationPolicies.policyTypes.moderate.shortDescription'
  | 'CancellationPolicies.policyTypes.strict.description'
  | 'CancellationPolicies.policyTypes.strict.shortDescription'
  | 'CancellationPolicies.policyTypes.nonrefundable.description'
  | 'CancellationPolicies.policyTypes.nonrefundable.shortDescription'
  | `CancellationPolicies.policyTypes.${Lowercase<PolicyType>}.bulletPoints`
  | `CancellationPolicies.roomCardPolicyDescriptions.${Lowercase<PolicyType>}`;

/**
 * Get standard OTA cancellation policies using provided translation function
 */
export const getOTAPolicies = (t: TFunction): Record<PolicyType, PolicyRules> => {
  return {
    Flexible: {
      fullRefundDays: 1,
      partialRefundDays: 0,
      partialRefundPercentage: 0,
      description: t('CancellationPolicies.policyTypes.flexible.description' as TranslationKeys, { defaultValue: '' }) as string,
      shortDescription: t('CancellationPolicies.policyTypes.flexible.shortDescription' as TranslationKeys, { defaultValue: '' }) as string,
    },
    Moderate: {
      fullRefundDays: 5,
      partialRefundDays: 1,
      partialRefundPercentage: 50,
      description: t('CancellationPolicies.policyTypes.moderate.description' as TranslationKeys, { defaultValue: '' }) as string,
      shortDescription: t('CancellationPolicies.policyTypes.moderate.shortDescription' as TranslationKeys, { defaultValue: '' }) as string,
    },
    Strict: {
      fullRefundDays: 7,
      partialRefundDays: 1,
      partialRefundPercentage: 50,
      description: t('CancellationPolicies.policyTypes.strict.description' as TranslationKeys, { defaultValue: '' }) as string,
      shortDescription: t('CancellationPolicies.policyTypes.strict.shortDescription' as TranslationKeys, { defaultValue: '' }) as string,
    },
    NonRefundable: {
      fullRefundDays: 0,
      partialRefundDays: 0,
      partialRefundPercentage: 0,
      description: t('CancellationPolicies.policyTypes.nonrefundable.description' as TranslationKeys, { defaultValue: '' }) as string,
      shortDescription: t('CancellationPolicies.policyTypes.nonrefundable.shortDescription' as TranslationKeys, { defaultValue: '' }) as string,
    },
  };
};

/**
 * Get styling information for a policy type
 */
export const getPolicyStyling = (policyType: PolicyType): PolicyStyling => {
  switch (policyType) {
    case "Flexible":
      return { 
        headerBgColor: "bg-green-500", 
        bgColor: "bg-green-50", 
        borderColor: "border-green-200",
        textColor: "text-green-800",
        icon: CheckCircle 
      };
    case "Moderate":
      return { 
        headerBgColor: "bg-blue-500", 
        bgColor: "bg-blue-50", 
        borderColor: "border-blue-200",
        textColor: "text-blue-800",
        icon: Info 
      };
    case "Strict":
      return { 
        headerBgColor: "bg-amber-500", 
        bgColor: "bg-amber-50", 
        borderColor: "border-amber-200",
        textColor: "text-amber-800",
        icon: AlertCircle 
      };
    case "NonRefundable":
      return { 
        headerBgColor: "bg-red-500", 
        bgColor: "bg-red-50", 
        borderColor: "border-red-200",
        textColor: "text-red-800",
        icon: XCircle 
      };
    default:
      const exhaustiveCheck: never = policyType;
      throw new Error(`Unhandled policy type: ${exhaustiveCheck}`);
  }
};

/**
 * Get bullet points for a specific policy type
 */
export const getPolicyBulletPoints = (policyType: PolicyType, t: TFunction): { text: string, color: string }[] => {
  const bulletPoints = t(`CancellationPolicies.policyTypes.${policyType.toLowerCase()}.bulletPoints` as TranslationKeys, { 
    returnObjects: true,
    defaultValue: [] as string[]
  }) as string[];
  
  switch (policyType) {
    case "Flexible":
      return bulletPoints.map((text, index) => ({
        text,
        color: index === 0 ? "text-green-600" : "text-red-600",
      }));
    case "Moderate":
      return bulletPoints.map((text, index) => ({
        text,
        color: index === 0 ? "text-green-600" : index === 1 ? "text-blue-600" : "text-red-600",
      }));
    case "Strict":
      return bulletPoints.map((text, index) => ({
        text,
        color: index === 0 ? "text-green-600" : index === 1 ? "text-amber-600" : "text-red-600",
      }));
    case "NonRefundable":
      return bulletPoints.map((text, index) => ({
        text,
        color: index === 0 ? "text-red-600" : "text-red-600",
      }));
    default:
      const exhaustiveCheck: never = policyType;
      throw new Error(`Unhandled policy type: ${exhaustiveCheck}`);
  }
};

/**
 * Calculate refund amount based on policy type and days until check-in
 */
export const calculateRefund = (
  policyType: PolicyType,
  bookingAmount: number,
  daysUntilCheckIn: number,
  hoursUntilCheckIn: number = 0,
  t: TFunction
): { refundPercentage: number, refundAmount: number, cancellationFee: number, message: string } => {
  const policy = getOTAPolicies(t)[policyType];
  let refundPercentage = 0;
  let message = '';

  if (policyType === "NonRefundable") {
    refundPercentage = 0;
    message = t('CancellationPolicies.messages.nonRefundable' as TranslationKeys, { defaultValue: 'This booking is non-refundable' }) as string;
  } else if (daysUntilCheckIn >= policy.fullRefundDays) {
    refundPercentage = 100;
    message = t('CancellationPolicies.messages.fullRefund' as TranslationKeys, { 
      defaultValue: 'Full refund available if cancelled before {{days}} days',
      days: policy.fullRefundDays
    }) as string;
  } else if (daysUntilCheckIn >= policy.partialRefundDays || 
            (policy.partialRefundDays === 1 && hoursUntilCheckIn >= 24)) {
    refundPercentage = policy.partialRefundPercentage;
    message = t('CancellationPolicies.messages.partialRefund' as TranslationKeys, { 
      defaultValue: 'Partial refund ({{percentage}}%) available if cancelled before {{days}} days',
      percentage: policy.partialRefundPercentage,
      days: policy.partialRefundDays
    }) as string;
  } else {
    message = t('CancellationPolicies.messages.noRefund' as TranslationKeys, { defaultValue: 'No refund available at this time' }) as string;
  }
  
  const refundAmount = (refundPercentage / 100) * bookingAmount;
  const cancellationFee = bookingAmount - refundAmount;
  
  return {
    refundPercentage,
    refundAmount,
    cancellationFee,
    message
  };
};

/**
 * Determine the most appropriate policy type based on check-in date
 */
export const suggestPolicyForDate = (checkInDate: Date): PolicyType => {
  const now = new Date();
  const timeDiff = checkInDate.getTime() - now.getTime();
  const daysUntilCheckIn = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  
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
  const validPolicies: PolicyType[] = ["Flexible", "Moderate", "Strict", "NonRefundable"];
  if (policyString && validPolicies.includes(policyString as PolicyType)) {
    return policyString as PolicyType;
  }
  
  if (policyString) {
    console.warn(`Invalid policy type provided: ${policyString}. Falling back to "Moderate".`);
  }
  
  return "Moderate";
};

/**
 * Generate description for Room Card display
 */
export const getRoomCardPolicyDescription = (policyType: PolicyType, t: TFunction): string => {
  return t(`CancellationPolicies.roomCardPolicyDescriptions.${policyType.toLowerCase()}` as TranslationKeys, { 
    defaultValue: getOTAPolicies(t)[policyType].shortDescription 
  }) as string;
};

/**
 * Get the icon component for a policy type
 */
export const getPolicyIcon = (policyType: PolicyType): LucideIcon => {
  return getPolicyStyling(policyType).icon;
};

/**
 * Get badge styling for policy display
 */
export const getPolicyBadgeStyling = (policyType: PolicyType): { className: string, icon: LucideIcon } => {
  const styling = getPolicyStyling(policyType);
  return {
    className: `${styling.bgColor} ${styling.textColor} border ${styling.borderColor} rounded-md px-2 py-1 text-sm font-medium`,
    icon: styling.icon
  };
};

/**
 * Get all policy types with their display names
 */
export const getPolicyTypesWithNames = (t: TFunction): { type: PolicyType, name: string }[] => {
  return (["Flexible", "Moderate", "Strict", "NonRefundable"] as PolicyType[]).map(type => ({
    type,
    name: t(`CancellationPolicies.policyNames.${type.toLowerCase()}` as TranslationKeys, { defaultValue: type }) as string
  }));
};