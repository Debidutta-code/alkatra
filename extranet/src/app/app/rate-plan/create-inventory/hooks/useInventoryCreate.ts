// app/rate-plan/create-inventory/hooks/useInventoryCreate.ts
'use client';

import { useState } from 'react';
import { createInventoryService } from '../services/inventoryService';
import { CreateInventoryPayload } from '../types';

export const useInventoryCreate = () => {
  const [isLoading, setIsLoading] = useState(false);

  const createInventory = async (data: CreateInventoryPayload) => {
    setIsLoading(true);
    try {
      const result = await createInventoryService(data);
      return result;
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { createInventory, isLoading };
};