import { fetchRatePlans, deleteRatePlan } from '../api';
import { RatePlan } from '../types';

export const getRatePlansService = async (propertyId: string): Promise<RatePlan[]> => {
  try {
    return await fetchRatePlans(propertyId);
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Failed to fetch rate plans. Please try again later.'
    );
  }
};

export const deleteRatePlanService = async (ratePlanId: string): Promise<void> => {
  try {
    await deleteRatePlan(ratePlanId);
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Failed to delete rate plan. Please try again later.'
    );
  }
};