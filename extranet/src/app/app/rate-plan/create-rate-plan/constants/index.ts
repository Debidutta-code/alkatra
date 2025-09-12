// app/rate-plan/create/constants/index.ts

export const DEFAULT_CURRENCY = 'USD';

export const DEFAULT_DAYS = {
  mon: true,
  tue: true,
  wed: true,
  thu: true,
  fri: true,
  sat: true,
  sun: true,
};

export const DEFAULT_BASE_GUESTS = [
  { numberOfGuests: 1, amountBeforeTax: 0 },
];

export const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'AED', 'SAR', 'INR'];
export const DEFAULT_ADDITIONAL_GUESTS = [
  { ageQualifyingCode: 10, amount: 0 },
];