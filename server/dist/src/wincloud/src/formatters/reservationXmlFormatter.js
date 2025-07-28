"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.XmlFormatter = void 0;
const uuid_1 = require("uuid");
const xmlbuilder2_1 = require("xmlbuilder2");
class XmlFormatter {
    generateReservationXml(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId, guests, email, phone, reservationId, hotelCode, hotelName, ratePlanCode, roomTypeCode, numberOfRooms, checkInDate, checkOutDate, roomTotalPrice, currencyCode, ageCodeSummary, } = data;
            const amountPerRoom = (roomTotalPrice / numberOfRooms).toString();
            const xmlObj = {
                'OTA_HotelResNotifRQ': {
                    '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
                    '@xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
                    '@xmlns': 'http://www.opentravel.org/OTA/2003/05',
                    '@EchoToken': (0, uuid_1.v4)(),
                    '@TimeStamp': new Date().toISOString(),
                    '@Version': '1.0',
                    '@ResStatus': 'Commit',
                    'POS': {
                        'Source': {
                            'RequestorID': { '@ID': (0, uuid_1.v4)(), '@Type': 'OTA' },
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
                                    'BasicPropertyInfo': Object.assign({ '@HotelCode': hotelCode }, (hotelName && { '@HotelName': hotelName })),
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
                                            .map(([ageCode, count]) => ({
                                            '@AgeQualifyingCode': ageCode,
                                            '@Count': count.toString(),
                                        })),
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
            return (0, xmlbuilder2_1.create)(xmlObj).end({ prettyPrint: true });
        });
    }
}
exports.XmlFormatter = XmlFormatter;
//# sourceMappingURL=reservationXmlFormatter.js.map