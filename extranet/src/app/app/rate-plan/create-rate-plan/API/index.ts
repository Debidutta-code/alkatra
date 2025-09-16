// app/rate-plan/create/API/index.ts

interface CreateRatePlanPayload {
  hotelCode: string;
  invTypeCode: string;
  ratePlanCode: string;
  startDate: string;
  endDate: string;
  currencyCode: string;
  days: Record<string, boolean>;
  baseGuestAmounts: { numberOfGuests: number; amountBeforeTax: number }[];
  additionalGuestAmounts: { ageQualifyingCode: number; amount: number }[];
}

export const createRatePlan = async (
  payload: CreateRatePlanPayload,
  accessToken: string
) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/room/ratePlan/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create rate plan');
    }

    return await response.json();
  } catch (error: any) {
    throw new Error(error.message || 'API call failed');
  }
};