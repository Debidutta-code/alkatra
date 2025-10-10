// src/components/propertyId/promo-codes/promoCodeApi.ts

const API_BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/property/promo`;

export interface PromoCode {
  _id: string;
  propertyId: string;
  propertyCode: string;
  codeName: string;
  description: string;
  discountType: 'flat' | 'percentage';
  discountValue: number;
  validFrom: string;
  validTo: string;
  minBookingAmount: number;
  maxDiscountAmount: number;
  // useLimit: number;
  // usageLimitPerUser: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePromoCodePayload {
  propertyId: string;
  propertyCode: string;
  codeName: string;
  description: string;
  discountType: 'flat' | 'percentage';
  discountValue: number;
  validFrom: string;
  validTo: string;
  minBookingAmount: number;
  maxDiscountAmount: number;
  // useLimit: number;
  // usageLimitPerUser: number;
  isActive: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const createPromoCode = async (
  token: string,
  payload: CreatePromoCodePayload
): Promise<PromoCode> => {
  const res = await fetch(`${API_BASE_URL}/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Failed to create promo code' }));
    throw new Error(error.message || 'Failed to create promo code');
  }
  
  const response: ApiResponse<PromoCode> = await res.json();
  return response.data;
};

export const getPromoCodesByProperty = async (
  token: string,
  propertyId: string
): Promise<PromoCode[]> => {
  const res = await fetch(`${API_BASE_URL}/get?propertyId=${propertyId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Failed to fetch promo codes' }));
    throw new Error(error.message || 'Failed to fetch promo codes');
  }
  
  const response: ApiResponse<PromoCode[]> = await res.json();
  return response.data;
};

export const getPromoCodeById = async (
  token: string,
  promoId: string
): Promise<PromoCode> => {
  const res = await fetch(`${API_BASE_URL}/${promoId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Failed to fetch promo code' }));
    throw new Error(error.message || 'Failed to fetch promo code');
  }
  
  const response: ApiResponse<PromoCode> = await res.json();
  return response.data;
};

export const updatePromoCode = async (
  token: string,
  promoId: string,
  payload: Partial<CreatePromoCodePayload>
): Promise<PromoCode> => {
  const res = await fetch(`${API_BASE_URL}/update/${promoId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Failed to update promo code' }));
    throw new Error(error.message || 'Failed to update promo code');
  }
  
  const response: ApiResponse<PromoCode> = await res.json();
  return response.data;
};

export const deletePromoCode = async (
  token: string,
  promoId: string
): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/delete/${promoId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Failed to delete promo code' }));
    throw new Error(error.message || 'Failed to delete promo code');
  }
};