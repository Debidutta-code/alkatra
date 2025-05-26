export interface DateRange {
  start: string;
  end: string;
}

export interface RatePlanFormData {
  propertyId: string;
  ratePlanName: string;
  ratePlanCode: string;
  description: string;
  scheduling: {
    type: 'weekly' | 'date_range' | 'specific-dates';
    weeklyDays: string[];
    dateRanges: DateRange[];
    availableSpecificDates: string[];
  };
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
  };
  currency: string;
  minBookAdvance: number;
  maxBookAdvance: number;
  status: 'active' | 'inactive';
  createdBy: string;
  updatedBy: string;
}