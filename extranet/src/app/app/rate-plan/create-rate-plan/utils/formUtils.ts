// app/rate-plan/create/utils/formUtils.ts

import { DEFAULT_BASE_GUESTS, DEFAULT_DAYS } from '../constants';

export const generateInitialGuestAmounts = (count: number = 1) => {
  return Array.from({ length: count }, (_, i) => ({
    numberOfGuests: i + 1,
    amountBeforeTax: 0,
  }));
};

export const getDefaultDays = () => ({ ...DEFAULT_DAYS });