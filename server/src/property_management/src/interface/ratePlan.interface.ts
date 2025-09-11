export interface BaseGuestAmount {
    numberOfGuests: number;
    amountBeforeTax: number;
}

export interface AdditionalGuestAmount {
    ageQualifyingCode: number;
    amount: number;
}

export interface DaysOfWeek {
    mon: boolean;
    tue: boolean;
    wed: boolean;
    thu: boolean;
    fri: boolean;
    sat: boolean;
    sun: boolean;
}

export interface CreateRatePlanRequest {
    hotelCode: string;
    invTypeCode: string;
    ratePlanCode: string;
    startDate: string;
    endDate: string;
    currencyCode: string;
    days: DaysOfWeek;
    baseGuestAmounts: BaseGuestAmount[];
    additionalGuestAmounts: AdditionalGuestAmount[];
}