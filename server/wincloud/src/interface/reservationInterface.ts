export interface GuestDetails {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
}

export interface ReservationInput {
    guests: Array<{
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
    }>;
    roomAssociations: Array<{
        roomId: string;
    }>;
    bookingDetails: {
        propertyId: string;
        userId: string;
        checkInDate: string;
        checkOutDate: string;
        hotelCode: string;
        hotelName: string;
        ratePlanCode: string;
        roomTypeCode: string;
        currencyCode: string;
        status: string;
    };
    payment: {
        amount: string;
        method: string;
    };
}

export interface ThirdPartyReservationData {
    hotelCode: string;
    hotelName: string;
    ratePlanCode: string;
    roomTypeCode: string;
    checkInDate: string;
    checkOutDate: string;
    guestDetails: GuestDetails[];
    amountBeforeTax: number;
    currencyCode: string;
    userId: string;
    propertyId: string;
    roomIds: string[];
    status: string;
    reservationId: string;
    thirdPartyReservationIdType8?: string;
    thirdPartyReservationIdType3?: string;
}

export interface OTAHotelResNotifRQ {
    OTA_HotelResNotifRQ: {
        '@xmlns:xsi': string;
        '@xmlns:xsd': string;
        '@xmlns': string;
        '@EchoToken': string;
        '@TimeStamp': string;
        '@Version': string;
        '@ResStatus': string;
        POS: {
            Source: {
                RequestorID: {
                    '@ID': string;
                    '@Type': string;
                };
                BookingChannel: {
                    '@Type': string;
                    CompanyName: string;
                };
            };
        };
        HotelReservations: {
            HotelReservation: {
                '@CreateDateTime': string;
                UniqueID: {
                    '@ID': string;
                    '@Type': string;
                    '@ID_Context': string;
                };
                RoomStays: {
                    RoomStay: Array<{
                        BasicPropertyInfo: {
                            '@HotelCode': string;
                            '@HotelName': string;
                        };
                        RatePlans: {
                            RatePlan: {
                                '@RatePlanCode': string;
                            };
                        };
                        RoomTypes: {
                            RoomType: {
                                '@RoomTypeCode': string;
                                '@NumberOfUnits': string;
                            };
                        };
                        GuestCounts: {
                            GuestCount: {
                                '@AgeQualifyingCode': string;
                                '@Count': string;
                            };
                        };
                        ResGuestRPHs: {
                            ResGuestRPH: Array<{
                                '@RPH': string;
                            }>;
                        };
                        TimeSpan: {
                            '@Start': string;
                            '@End': string;
                        };
                        RoomRates: {
                            RoomRate: {
                                Rates: {
                                    Rate: {
                                        '@EffectiveDate': string;
                                        Base: {
                                            '@AmountBeforeTax': string;
                                            '@CurrencyCode': string;
                                        };
                                    };
                                };
                            };
                        };
                        Total: {
                            '@AmountBeforeTax': string;
                            '@CurrencyCode': string;
                        };
                    }>;
                };
                ResGuests: {
                    ResGuest: Array<{
                        '@ResGuestRPH': string;
                        Profiles: {
                            ProfileInfo: {
                                UniqueID: {
                                    '@ID': string;
                                    '@Type': string;
                                };
                                Profile: {
                                    '@ProfileType': string;
                                    Customer: {
                                        PersonName: {
                                            GivenName: string;
                                            Surname: string;
                                        };
                                        Telephone: Array<{
                                            '@PhoneNumber': string;
                                            '@PhoneTechType': string;
                                        }>;
                                        Email: string;
                                    };
                                };
                            };
                        };
                    }>;
                };
                ResGlobalInfo: {
                    Total: {
                        '@AmountBeforeTax': string;
                        '@CurrencyCode': string;
                    };
                };
            };
        };
    };
}