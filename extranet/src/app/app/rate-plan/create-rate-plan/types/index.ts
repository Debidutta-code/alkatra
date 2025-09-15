// app/rate-plan/create/types/index.ts

export interface DaysOfWeek {
  mon: boolean;
  tue: boolean;
  wed: boolean;
  thu: boolean;
  fri: boolean;
  sat: boolean;
  sun: boolean;
}

export interface GuestAmount {
  numberOfGuests: number;
  amountBeforeTax: number;
}

export interface AdditionalGuestAmount {
  ageQualifyingCode: number;
  amount: number;
}

export interface CreateRatePlanPayload {
  hotelCode: string;
  invTypeCode: string;
  ratePlanCode: string;
  startDate: string;
  endDate: string;
  currencyCode: string;
  days: DaysOfWeek;
  baseGuestAmounts: GuestAmount[];
  additionalGuestAmounts: AdditionalGuestAmount[];
}