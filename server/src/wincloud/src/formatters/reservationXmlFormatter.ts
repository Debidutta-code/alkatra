import { ThirdPartyReservationData } from '../interface/reservationInterface';
import { v4 as uuidv4 } from 'uuid';
import { create } from 'xmlbuilder2';

export class XmlFormatter {
    async generateReservationXml(data: ThirdPartyReservationData): Promise<string> {
        const {
            userId,
            guests,
            email,
            phone,
            reservationId,
            hotelCode,
            hotelName,
            ratePlanCode,
            roomTypeCode,
            numberOfRooms,
            checkInDate,
            checkOutDate,
            roomTotalPrice,
            currencyCode,
            ageCodeSummary,
        } = data;

        const amountPerRoom = (roomTotalPrice / numberOfRooms).toString();

        const xmlObj = {
            'OTA_HotelResNotifRQ': {
                '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
                '@xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
                '@xmlns': 'http://www.opentravel.org/OTA/2003/05',
                '@EchoToken': uuidv4(),
                '@TimeStamp': new Date().toISOString(),
                '@Version': '1.0',
                '@ResStatus': 'Commit',
                'POS': {
                    'Source': {
                        'RequestorID': { '@ID': uuidv4(), '@Type': 'OTA' },
                        'BookingChannel': {
                            '@Type': 'OTA',
                            'CompanyName': 'TripSwift',
                        },
                    },
                },
                'HotelReservations': {
                    'HotelReservation': {
                        '@CreateDateTime': new Date().toISOString(),
                        'UniqueID': { '@ID': reservationId, '@Type': '14', '@ID_Context': 'WINCLOUD' },
                        'RoomStays': {
                            'RoomStay': {
                                'BasicPropertyInfo': {
                                    '@HotelCode': hotelCode,
                                    ...(hotelName && { '@HotelName': hotelName }),
                                },
                                'RatePlans': {
                                    'RatePlan': { '@RatePlanCode': ratePlanCode },
                                },
                                'RoomTypes': {
                                    'RoomType': {
                                        '@RoomTypeCode': roomTypeCode,
                                        '@NumberOfUnits': numberOfRooms,
                                    },
                                },
                                'GuestCounts': {
                                    'GuestCount': Object.entries(ageCodeSummary)
                                        .filter(([_, count]) => count > 0)
                                        .map(([ageCode, count]) => (
                                            {
                                                '@AgeQualifyingCode': ageCode,
                                                '@Count': count.toString(),
                                            }
                                        )
                                        ),
                                },
                                'TimeSpan': {
                                    '@Start': checkInDate,
                                    '@End': checkOutDate,
                                },
                                'RoomRates': {
                                    'RoomRate': {
                                        'Rates': {
                                            'Rate': {
                                                '@EffectiveDate': checkInDate,
                                                'Base': {
                                                    '@AmountBeforeTax': amountPerRoom,
                                                    '@CurrencyCode': currencyCode,
                                                },
                                            },
                                        },
                                    },
                                },
                                'Total': {
                                    '@AmountBeforeTax': amountPerRoom,
                                    '@CurrencyCode': currencyCode,
                                },
                            },
                        },
                        'ResGuests': {},
                        'ResGlobalInfo': {
                            'Total': {
                                '@AmountBeforeTax': roomTotalPrice.toString(),
                                '@CurrencyCode': currencyCode,
                            },
                        },
                    },
                },
            },
        };

        return create(xmlObj).end({ prettyPrint: true });
    }
}
