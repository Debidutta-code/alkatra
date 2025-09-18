// app/rate-plan/create-inventory/services/inventoryService.ts

import Cookies from 'js-cookie';
import { createInventory as apiCreateInventory } from '../API';
import { CreateInventoryPayload } from '../types';

export const createInventoryService = async (data: CreateInventoryPayload) => {
  const accessToken = Cookies.get('accessToken');
  if (!accessToken) {
    throw new Error('No access token found. Please log in.');
  }

  return await apiCreateInventory(data, accessToken);
};