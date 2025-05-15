import { ThirdPartyReservationData } from '../interface/reservationInterface';
import { v4 as uuidv4 } from 'uuid';
import { create } from 'xmlbuilder2';

export class XmlFormatter {
    async generateReservationXml(data: ThirdPartyReservationData): Promise<string> {
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
                        'UniqueID': { '@ID': data.reservationId, '@Type': '14', '@ID_Context': 'WINCLOUD' },
                        'RoomStays': {
                            'RoomStay': data.roomIds.map((roomId, index) => ({
                                'BasicPropertyInfo': { '@HotelCode': data.hotelCode, '@HotelName': data.hotelName },
                                'RatePlans': {
                                    'RatePlan': { '@RatePlanCode': data.ratePlanCode },
                                },
                                'RoomTypes': {
                                    'RoomType': { '@RoomTypeCode': data.roomTypeCode, '@NumberOfUnits': '1' },
                                },
                                'GuestCounts': {
                                    'GuestCount': { '@AgeQualifyingCode': '10', '@Count': data.guestDetails.length.toString() },
                                },
                                'ResGuestRPHs': {
                                    'ResGuestRPH': data.guestDetails.map((_, guestIndex) => ({ '@RPH': guestIndex.toString() })),
                                },
                                'TimeSpan': {
                                    '@Start': data.checkInDate,
                                    '@End': data.checkOutDate,
                                },
                                'RoomRates': {
                                    'RoomRate': {
                                        'Rates': {
                                            'Rate': {
                                                '@EffectiveDate': data.checkInDate,
                                                'Base': {
                                                    '@AmountBeforeTax': (data.amountBeforeTax / data.roomIds.length).toString(),
                                                    '@CurrencyCode': data.currencyCode,
                                                },
                                            },
                                        },
                                    },
                                },
                                'Total': {
                                    '@AmountBeforeTax': (data.amountBeforeTax / data.roomIds.length).toString(),
                                    '@CurrencyCode': data.currencyCode,
                                },
                            })),
                        },
                        'ResGuests': {
                            'ResGuest': data.guestDetails.map((guest, index) => ({
                                '@ResGuestRPH': index.toString(),
                                'Profiles': {
                                    'ProfileInfo': {
                                        'UniqueID': { '@ID': uuidv4(), '@Type': 'Guest Profile ID' },
                                        'Profile': {
                                            '@ProfileType': 'Guest',
                                            'Customer': {
                                                'PersonName': {
                                                    'GivenName': guest.firstName,
                                                    'Surname': guest.lastName,
                                                },
                                                'Telephone': [
                                                    { '@PhoneNumber': guest.phone, '@PhoneTechType': '1' },
                                                ],
                                                'Email': guest.email,
                                            },
                                        },
                                    },
                                },
                            })),
                        },
                        'ResGlobalInfo': {
                            'Total': {
                                '@AmountBeforeTax': data.amountBeforeTax.toString(),
                                '@CurrencyCode': data.currencyCode,
                            },
                        },
                    },
                },
            },
        };

        return create(xmlObj).end({ prettyPrint: true });
    }
}