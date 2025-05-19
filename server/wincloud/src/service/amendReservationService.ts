import { create } from 'xmlbuilder2';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import { ThirdPartyAmendReservationRepository } from '../repository/amendReservationRepository';
import { ThirdPartyAmendReservationData } from '../interface/amendReservationInterface';
import { PropertyInfo } from '../../../Property_Management/src/model/property.info.model';

interface AmendReservationInput {
    reservationId: string;
    guests?: Array<{
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
    }>;
    roomAssociations?: Array<{
        roomId: string;
    }>;
    bookingDetails?: {
        propertyId: string;
        userId: string;
        checkInDate: string;
        checkOutDate: string;
    };
    payment?: {
        amount: string;
        method: string;
    };
}

export class ThirdPartyAmendReservationService {
    private repository: ThirdPartyAmendReservationRepository;

    constructor() {
        this.repository = new ThirdPartyAmendReservationRepository();
        console.log('ThirdPartyAmendReservationService initialized.');
    }

    async processAmendReservation(data: AmendReservationInput): Promise<string> {
        let xml = '';
        try {
            console.log('Starting third-party amend reservation processing...');

            // Check if reservationId is provided
            if (!data.reservationId) {
                throw new Error('Booking ID required');
            }

            // Fetch property only if propertyId is provided
            let property;
            if (data.bookingDetails?.propertyId) {
                property = await PropertyInfo.findById(data.bookingDetails.propertyId).exec();
            }

            // Prepare amend reservation data with minimal fallbacks
            const reservationData: ThirdPartyAmendReservationData = {
                hotelCode: data.bookingDetails?.propertyId && property ? (property as any).hotelCode : data.bookingDetails?.propertyId || 'WINCLOUD',
                hotelName: data.bookingDetails?.propertyId && property ? (property as any).hotelName : data.bookingDetails?.propertyId || 'Certificate Testing',
                ratePlanCode: data.roomAssociations?.length && data.roomAssociations[0].roomId ? data.roomAssociations[0].roomId : 'DLX',
                roomTypeCode: data.roomAssociations?.length && data.roomAssociations[0].roomId ? data.roomAssociations[0].roomId : 'DLX',
                checkInDate: data.bookingDetails?.checkInDate ? new Date(data.bookingDetails.checkInDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                checkOutDate: data.bookingDetails?.checkOutDate ? new Date(data.bookingDetails.checkOutDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                guestDetails: data.guests?.length ? data.guests.map(guest => ({
                    firstName: guest.firstName || 'Unknown',
                    lastName: guest.lastName || 'Guest',
                    email: guest.email || '',
                    phone: guest.phone || '',
                })) : [{ firstName: 'Unknown', lastName: 'Guest', email: '', phone: '' }],
                amountBeforeTax: data.payment?.amount ? parseFloat(data.payment.amount) : 0,
                currencyCode: 'INR',
                userId: data.bookingDetails?.userId || '',
                propertyId: data.bookingDetails?.propertyId || '',
                roomIds: data.roomAssociations?.map(assoc => assoc.roomId) || [''],
                status: 'Modified',
                reservationId: data.reservationId,
            };

            // Generate XML with all provided data
            const xmlObj = {
                'OTA_HotelResModifyNotifRQ': {
                    '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
                    '@xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
                    '@xmlns': 'http://www.opentravel.org/OTA/2003/05',
                    '@EchoToken': uuidv4(),
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
                            'UniqueID': { '@ID': data.reservationId, '@Type': '14', '@ID_Context': 'Channel Manager ID' },
                            'RoomStays': {
                                'RoomStay': reservationData.roomIds.map((roomId, index) => ({
                                    'BasicPropertyInfo': { '@HotelCode': reservationData.hotelCode, '@HotelName': reservationData.hotelName },
                                    'RatePlans': {
                                        'RatePlan': { '@RatePlanCode': reservationData.ratePlanCode || 'DLX' },
                                    },
                                    'RoomTypes': {
                                        'RoomType': { '@RoomTypeCode': reservationData.roomTypeCode || 'DLX', '@NumberOfUnits': '1' },
                                    },
                                    'GuestCounts': {
                                        'GuestCount': { '@AgeQualifyingCode': '10', '@Count': reservationData.guestDetails.length.toString() },
                                    },
                                    'ResGuestRPHs': {
                                        'ResGuestRPH': reservationData.guestDetails.map((_, guestIndex) => ({ '@RPH': guestIndex.toString() })),
                                    },
                                    'TimeSpan': {
                                        '@Start': reservationData.checkInDate,
                                        '@End': reservationData.checkOutDate,
                                    },
                                    'RoomRates': {
                                        'RoomRate': {
                                            'Rates': {
                                                'Rate': {
                                                    '@EffectiveDate': reservationData.checkInDate,
                                                    'Base': {
                                                        '@AmountBeforeTax': (reservationData.amountBeforeTax / reservationData.roomIds.length).toString(),
                                                        '@CurrencyCode': reservationData.currencyCode,
                                                    },
                                                },
                                            },
                                        },
                                    },
                                    'Total': {
                                        '@AmountBeforeTax': (reservationData.amountBeforeTax / reservationData.roomIds.length).toString(),
                                        '@CurrencyCode': reservationData.currencyCode,
                                    },
                                })),
                            },
                            'ResGuests': {
                                'ResGuest': reservationData.guestDetails.map((guest, index) => ({
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
                                    '@AmountBeforeTax': reservationData.amountBeforeTax.toString(),
                                    '@CurrencyCode': reservationData.currencyCode,
                                },
                            },
                        },
                    },
                },
            };

            xml = create(xmlObj).end({ prettyPrint: true });
            console.log('Generated XML:', xml);

            // Send to third-party API
            const apiResponse = await axios.post('http://18.142.34.107:9006/Booking.aspx', xml, {
                headers: { 'Content-Type': 'application/xml' },
            });

            console.log('Full API Response:', apiResponse.data);

            // Check if response is valid XML
            if (!apiResponse.data.trim().startsWith('<?xml')) {
                const errorMessage = apiResponse.data.split('\r\n')[0].replace(/System\.NullReferenceException:.*/, 'Unexpected server failure') || 'Unknown server error';
                throw new Error(`API server error: ${errorMessage}`);
            }

            // Parse XML response
            const parsedResponse = await parseStringPromise(apiResponse.data, { explicitArray: false, mergeAttrs: true });

            // Check for success or error
            if (parsedResponse.OTA_HotelResModifyNotifRS.Success !== undefined) {
                console.log('API call successful, saving amend booking...');
                // Extract HotelReservationID values
                const reservationIds = parsedResponse.OTA_HotelResModifyNotifRS.HotelReservations?.HotelReservation?.ResGlobalInfo?.HotelReservationIDs?.HotelReservationID;
                const reservationIdMap: { [key: string]: string } = {};
                if (Array.isArray(reservationIds)) {
                    reservationIds.forEach((id: { ResID_Type: string; ResID_Value: string }) => {
                        reservationIdMap[id.ResID_Type] = id.ResID_Value;
                    });
                } else if (reservationIds?.ResID_Type) {
                    reservationIdMap[reservationIds.ResID_Type] = reservationIds.ResID_Value;
                }

                // Add reservation IDs to reservationData
                const enrichedReservationData = {
                    ...reservationData,
                    thirdPartyReservationIdType8: reservationIdMap['8'] || '',
                    thirdPartyReservationIdType3: reservationIdMap['3'] || '',
                };

                await this.repository.createAmendReservation(enrichedReservationData, xml, apiResponse.data);
                console.log('Third-party amend reservation processing completed.');
                return data.reservationId;
            } else if (parsedResponse.OTA_HotelResModifyNotifRS.Errors) {
                const error = parsedResponse.OTA_HotelResModifyNotifRS.Errors.Error;
                const errorMessage = error.ShortText || 'Unknown error';
                console.error('API call failed:', errorMessage);
                throw new Error(errorMessage);
            } else {
                const errorMessage = 'Unknown error in API response';
                console.error('API call failed:', errorMessage);
                throw new Error(errorMessage);
            }
        } catch (error: any) {
            console.error('Service Error:', error.message);
            throw new Error(error.message);
        }
    }
}