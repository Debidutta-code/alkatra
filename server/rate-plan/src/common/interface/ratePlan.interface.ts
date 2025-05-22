import  {  Document, Types } from "mongoose";


export interface SchedulingType {
  type: 'weekly' | 'date_range' | 'specific-dates'; // present
  weeklyDays?: string[]; // present
  dateRanges?: { start: Date; end: Date }[]; // present
  availableSpecificDates?: Date[]; // present
}

export interface RatePlan extends Document {
  propertyId: Types.ObjectId; // present
  ratePlanCode: string; // present
  ratePlanName: string; // present
  description?: string; // present
  mealPlan: 'RO' | 'BB' | 'HB' | 'FB'; // present
  maxOccupancy: number;
  adultOccupancy: number;
  minLengthStay: number; // present
  maxLengthStay: number; // present
  minReleaseDay: number; // present
  maxReleaseDay: number; // present
  cancellationDeadline: {
    days: number; // present
    hours: number; // present
  }
  currency: string; // present
  minBookAdvance: number;
  maxBookAdvance: number;
  status: 'active' | 'inactive'; // present
  createdBy: Date;
  updatedBy: Date;
  scheduling: SchedulingType; // present
}