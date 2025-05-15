export interface RatePlanData {
    hotelCode: string;
    hotelName: string;
    invTypeCode: string;
    ratePlanCode: string;
    startDate: string;
    endDate: string;
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

export interface OTAHotelRateAmountNotifRQ {
    OTA_HotelRateAmountNotifRQ: {
        EchoToken?: string;
        TimeStamp?: string;
        Target?: string;
        Version?: string;
        POS?: {
            Source: {
                RequestorID: {
                    ID: string;
                    ID_Context: string;
                    MessagePassword?: string;
                };
            };
        };
        RateAmountMessages: {
            $: {
                HotelCode: string;
                HotelName: string;
            };
            RateAmountMessage: Array<{
                StatusApplicationControl: {
                    $: {
                        InvTypeCode: string;
                        RatePlanCode: string;
                        Start: string;
                        End: string;
                    };
                };
                Rates: {
                    Rate: {
                        $: {
                            Mon: string;
                            Tue: string;
                            Weds: string;
                            Thur: string;
                            Fri: string;
                            Sat: string;
                            Sun: string;
                            CurrencyCode: string;
                        };
                        BaseByGuestAmts: {
                            BaseByGuestAmt: Array<{
                                $: {
                                    AmountBeforeTax: string;
                                    NumberOfGuests: string;
                                };
                            }>;
                        };
                        AdditionalGuestAmounts?: {
                            AdditionalGuestAmount: Array<{
                                $: {
                                    AgeQualifyingCode: string;
                                    Amount: string;
                                };
                            }> | {
                                $: {
                                    AgeQualifyingCode: string;
                                    Amount: string;
                                };
                            };
                        };
                    };
                };
            }> | {
                StatusApplicationControl: {
                    $: {
                        InvTypeCode: string;
                        RatePlanCode: string;
                        Start: string;
                        End: string;
                    };
                };
                Rates: {
                    Rate: {
                        $: {
                            Mon: string;
                            Tue: string;
                            Weds: string;
                            Thur: string;
                            Fri: string;
                            Sat: string;
                            Sun: string;
                            CurrencyCode: string;
                        };
                        BaseByGuestAmts: {
                            BaseByGuestAmt: Array<{
                                $: {
                                    AmountBeforeTax: string;
                                    NumberOfGuests: string;
                                };
                            }>;
                        };
                        AdditionalGuestAmounts?: {
                            AdditionalGuestAmount: Array<{
                                $: {
                                    AgeQualifyingCode: string;
                                    Amount: string;
                                };
                            }> | {
                                $: {
                                    AgeQualifyingCode: string;
                                    Amount: string;
                                };
                            };
                        };
                    };
                };
            };
        };
    };
}