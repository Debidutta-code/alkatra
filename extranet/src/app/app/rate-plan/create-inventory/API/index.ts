// app/rate-plan/create-inventory/API/index.ts

import { CreateInventoryPayload } from '../types';

export const createInventory = async (
  payload: CreateInventoryPayload,
  accessToken: string
) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/room/inventory/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create inventory');
    }

    return await response.json();
  } catch (error: any) {
    throw new Error(error.message || 'API call failed');
  }
};