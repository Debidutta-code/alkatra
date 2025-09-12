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

export interface RatePlanDataDateWise {
    hotelCode: string;
    hotelName: string;
    invTypeCode: string;
    ratePlanCode: string;
    startDate: string | Date;
    endDate: string | Date;
    days: {
        mon: boolean;
        tue: boolean;
        wed: boolean;
        thu: boolean;
        fri: boolean;
        sat: boolean;
        sun: boolean;
    };
    currencyCode: string;
    baseByGuestAmts: Array<{
        amountBeforeTax: number;
        numberOfGuests: number;
    }>;
    additionalGuestAmounts: Array<{
        ageQualifyingCode: string;
        amount: number;
    }>;
}