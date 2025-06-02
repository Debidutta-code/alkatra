import { RatePlanFormData } from '../types/ratePlanTypes';

export const getInitialFormData = (propertyId: string): RatePlanFormData => ({
  propertyId,
  ratePlanName: '',
  ratePlanCode: '',
  description: '',
  scheduling: {
    type: 'weekly',
    weeklyDays: [],
    dateRanges: [],
    availableSpecificDates: [],
  },
  mealPlan: 'RO',
  maxOccupancy: 1,
  adultOccupancy: 1,
  minLengthStay: 1,
  maxLengthStay: 30,
  minReleaseDay: 0,
  maxReleaseDay: 0,
  cancellationDeadline: { days: 0, hours: 0 },
  currency: 'USD',
  minBookAdvance: 0,
  maxBookAdvance: 30,
  status: 'active',
  createdBy: new Date().toISOString(),
  updatedBy: new Date().toISOString(),
});