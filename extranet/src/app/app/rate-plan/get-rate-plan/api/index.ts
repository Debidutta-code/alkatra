import Cookies from 'js-cookie';
import { API_ENDPOINTS } from '../constants';

export const fetchRatePlans = async (propertyId: string) => {
  const accessToken = Cookies.get('accessToken');
  if (!accessToken) {
    throw new Error('No access token found. Please log in.');
  }

  const response = await fetch(API_ENDPOINTS.GET_RATE_PLANS(propertyId), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.message || 'Failed to retrieve rate plans.');
  }

  return result.data || [];
};

export const deleteRatePlan = async (ratePlanId: string) => {
  const accessToken = Cookies.get('accessToken');
  if (!accessToken) {
    throw new Error('No access token found. Please log in.');
  }

  const response = await fetch(API_ENDPOINTS.DELETE_RATE_PLAN(ratePlanId), {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.message || 'Failed to delete rate plan.');
  }

  return result;
};