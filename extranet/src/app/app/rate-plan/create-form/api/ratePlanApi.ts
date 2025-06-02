import axios from 'axios';
import { RatePlanFormData } from '../types/ratePlanTypes';

interface CreateRatePlanResponse {
  success: boolean;
  // Add other response fields as needed
}

export const createRatePlan = async (payload: RatePlanFormData, token: string): Promise<CreateRatePlanResponse> => {
  try {
    const response = await axios.post<CreateRatePlanResponse>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/rate-plan/create`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create rate plan');
  }
};