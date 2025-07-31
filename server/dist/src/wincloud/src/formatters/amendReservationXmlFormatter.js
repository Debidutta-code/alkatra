"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAmendReservationXML = generateAmendReservationXML;
// amendReservationXmlFormatter.ts
const xmlbuilder2_1 = require("xmlbuilder2");
const uuid_1 = require("uuid");
function generateAmendReservationXML(data) {
    const hotelCode = data.hotelCode;
    const hotelName = data.hotelName;
    const ratePlanCode = data.ratePlanCode;
    const roomTypeCode = data.roomTypeCode;
    const numberOfRooms = data.numberOfRooms;
    const guests = data.guests;
    const email = data.email;
    const phone = data.phone;
    const checkInDate = data.checkInDate ? new Date(data.checkInDate).toISOString() : '';
    const checkOutDate = data.checkOutDate ? new Date(data.checkOutDate).toISOString() : '';
    const amountBeforeTax = data.amountBeforeTax;
    const reservationId = data.reservationId || (0, uuid_1.v4)();
    const currencyCode = data.currencyCode;
    const ageCodeSummary = data.ageCodeSummary;
    const xmlObj = {
        'OTA_HotelResModifyNotifRQ': {
            '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
            '@xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
            '@xmlns': 'http://www.opentravel.org/OTA/2003/05',
            '@EchoToken': (0, uuid_1.v4)(),
            '@TimeStamp': new Date().toISOString(),
            '@Version': '1.0',
            '@ResStatus': 'Modify',
            'POS': {
                'Source': {
                    'RequestorID': { '@ID': 'OTA', '@Type': 'OTA' },
                    'BookingChannel': {
                        '@Type': 'OTA',
                        'CompanyName': 'Channel Manager',
                    },
                },
            },
            'HotelResModifies': {
                'HotelResModify': {
                    '@CreateDateTime': new Date().toISOString(),
                    'UniqueID': { '@ID': reservationId, '@Type': '14', '@ID_Context': 'Trip Swift' },
                    'RoomStays': {
                        'RoomStay': [{
                                'BasicPropertyInfo': { '@HotelCode': hotelCode, '@HotelName': hotelName },
                                'RatePlans': {
                                    'RatePlan': { '@RatePlanCode': ratePlanCode },
                                },
                                'RoomTypes': {
                                    'RoomType': { '@RoomTypeCode': roomTypeCode, '@NumberOfUnits': numberOfRooms },
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
                                                    '@AmountBeforeTax': (amountBeforeTax === null || amountBeforeTax === void 0 ? void 0 : amountBeforeTax.toString()) || '',
                                                    '@CurrencyCode': currencyCode,
                                                },
                                            },
                                        },
                                    },
                                },
                                'Total': {
                                    '@AmountBeforeTax': (amountBeforeTax === null || amountBeforeTax === void 0 ? void 0 : amountBeforeTax.toString()) || '',
                                    '@CurrencyCode': currencyCode,
                                },
                            }],
                    },
                    'ResGlobalInfo': {
                        'Total': {
                            '@AmountBeforeTax': (amountBeforeTax === null || amountBeforeTax === void 0 ? void 0 : amountBeforeTax.toString()) || '',
                            '@CurrencyCode': currencyCode,
                        },
                    },
                },
            },
        },
    };
    return (0, xmlbuilder2_1.create)(xmlObj).end({ prettyPrint: true });
}
//# sourceMappingURL=amendReservationXmlFormatter.js.map