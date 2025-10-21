import axios from "axios";

export const validatePromoCode = async (
  payload: {
    code: string;
    bookingAmount: number;
    propertyId?: string;
  },
  token: string
) => {
  if (!token) {
    throw new Error("Authentication required to validate promo code.");
  }

  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/property/promo/validate`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Promo Code Validation Error:", error);

    if (
      error.response?.status === 401 ||
      error.response?.data?.message?.includes('jwt') ||
      error.message?.includes('jwt')
    ) {
      throw new Error("Your session expired. Please log in again.");
    }

    throw new Error(
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      "Failed to validate promo code. Please try again."
    );
  }
};

export const getAvailablePromoCodes = async (
  propertyId: string,
  accessToken: string
) => {
  try {
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/property/promo/search?propertyId=${propertyId}`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return data;
  } catch (error: any) {
    console.error('Error fetching promo codes:', error);
    throw error;
  }
};
