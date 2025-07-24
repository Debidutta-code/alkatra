export interface OTARateAmountNotifRQ {
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
                            Mon?: string;
                            Tue?: string;
                            Weds?: string;
                            Thur?: string;
                            Fri?: string;
                            Sat?: string;
                            Sun?: string;
                            CurrencyCode: string;
                        };
                        BaseByGuestAmts: {
                            BaseByGuestAmt: Array<{
                                $: {
                                    AmountBeforeTax: string;
                                    NumberOfGuests: string;
                                };
                            }> | {
                                $: {
                                    AmountBeforeTax: string;
                                    NumberOfGuests: string;
                                };
                            };
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
                StatusApplicationControl: { $: any };
                Rates: { Rate: any };
            };
        };
    };
}
