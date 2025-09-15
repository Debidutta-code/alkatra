// app/rate-plan/create-rate-plan/services/createService.ts
'use client';

import { useState } from 'react';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { createRatePlan as apiCreateRatePlan } from '../API';
import { CreateRatePlanPayload } from '../types';

export const useRatePlanCreate = () => {
  const [isLoading, setIsLoading] = useState(false);

  const createRatePlan = async (data: CreateRatePlanPayload) => {
    setIsLoading(true);
    try {
      const accessToken = Cookies.get('accessToken');
      if (!accessToken) {
        throw new Error('No access token found. Please log in.');
      }

      const transformedData = {
        ...data,
        days: { ...data.days },
      };
      const result = await apiCreateRatePlan(transformedData, accessToken);
      toast.success('Rate plan created successfully!');
      return result;
    } catch (error: any) {
      toast.error(error.message || 'Failed to create rate plan');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { createRatePlan, isLoading };
};