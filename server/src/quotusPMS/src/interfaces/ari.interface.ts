/**
 * ARI (Availability, Rates, Inventory) Data Interfaces for QuotusPMS
 */

export interface ARIRestrictions {
  minStay: number;
  maxStay: number;
  closedToArrival: boolean;
  closedToDeparture: boolean;
  stopSell: boolean;
}

export interface ARIRate {
  ratePlanCode: string;
  ratePlanName: string;
  baseRate: number;
  currencyCode: string;
  restrictions: ARIRestrictions;
}

export interface ARIInventoryItem {
  id: string;
  invTypeCode: string; // Room type code
  invTypeName: string; // Room type name
  date: string; // YYYY-MM-DD format
  available: number;
  sold: number;
  blocked: number;
  rates: ARIRate[];
}

export interface ARIPayload {
  propertyCode: string;
  propertyName: string;
  timestamp: string; // ISO 8601 format
  inventory: ARIInventoryItem[];
}

export interface ARIValidationResult {
  valid: boolean;
  errors: string[];
}

export interface ARIProcessingResult {
  success: boolean;
  message: string;
  propertyCode?: string;
  datesProcessed?: string[];
  ratePlansProcessed?: number;
  inventoryRecordsProcessed?: number;
  errors?: string[];
}
