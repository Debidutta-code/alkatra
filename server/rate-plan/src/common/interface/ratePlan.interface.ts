import { Document, Types } from "mongoose";

export interface SchedulingType {
  type: 'weekly' | 'date_range' | 'specific-dates';
  weeklyDays?: string[];
  dateRanges?: { start: Date; end: Date }[];
  availableSpecificDates?: Date[];
}

export interface RatePlan extends Document {
  propertyId: Types.ObjectId;
  ratePlanCode: string;
  ratePlanName: string;
  description?: string;
  mealPlan: 'RO' | 'BB' | 'HB' | 'FB';
  maxOccupancy: number;
  adultOccupancy: number;
  minLengthStay: number;
  maxLengthStay: number;
  minReleaseDay: number;
  maxReleaseDay: number;
  cancellationDeadline: {
    days: number;
    hours: number;
  }
  currency: string;
  minBookAdvance: number;
  maxBookAdvance: number;
  status: 'active' | 'inactive';
  createdBy: Date;
  updatedBy: Date;
  scheduling: SchedulingType;
}