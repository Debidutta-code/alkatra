import { create } from 'xmlbuilder2';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import { ThirdPartyCancelReservationRepository } from '../repository/cancelReservationRepository';
import { ThirdPartyCancelReservationData } from '../interface/cancelReservationInterface';
import { PropertyInfo } from '../../../Property_Management/src/model/property.info.model';

interface CancelReservationInput {
  reservationId: string;
  guest?: {
    firstName: string;
    lastName: string;
  };
  bookingDetails?: {
    propertyId: string;
    checkInDate: string;
    checkOutDate: string;
    hotelCode?: string;
    hotelName?: string;
  };
}

export class ThirdPartyCancelReservationService {
  private repository: ThirdPartyCancelReservationRepository;

  constructor() {
    this.repository = new ThirdPartyCancelReservationRepository();
    console.log('ThirdPartyCancelReservationService initialized.');
  }

  async processCancelReservation(data: CancelReservationInput): Promise<string> {
    let xml = '';
    try {
      console.log('Starting third-party cancel reservation processing...');

      // Check if reservationId is provided
      if (!data.reservationId) {
        throw new Error('Booking ID required');
      }

      // Fetch property only if propertyId is provided
      let property;
      if (data.bookingDetails?.propertyId) {
        property = await PropertyInfo.findById(data.bookingDetails.propertyId).exec();
      }

      // Prepare cancel reservation data with minimal fallbacks
      const reservationData: ThirdPartyCancelReservationData = {
        hotelCode: data.bookingDetails?.hotelCode || (data.bookingDetails?.propertyId && property ? (property as any).hotelCode : 'WINCLOUD'),
        hotelName: data.bookingDetails?.hotelName || (data.bookingDetails?.propertyId && property ? (property as any).hotelName : 'Certificate Testing'),
        checkInDate: data.bookingDetails?.checkInDate ? new Date(data.bookingDetails.checkInDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        checkOutDate: data.bookingDetails?.checkOutDate ? new Date(data.bookingDetails.checkOutDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        guestFirstName: data.guest?.firstName || 'Unknown',
        guestLastName: data.guest?.lastName || 'Guest',
        status: 'Cancelled',
        reservationId: data.reservationId,
      };

      // Generate OTA_CancelRQ XML
      const xmlObj = {
        'OTA_CancelRQ': {
          '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
          '@xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
          '@xmlns': 'http://www.opentravel.org/OTA/2003/05',
          '@EchoToken': uuidv4(),
          '@TimeStamp': new Date().toISOString(),
          '@Version': '1.0',
          '@CancelType': 'Cancel',
          'POS': {
            'Source': {
              'RequestorID': { '@ID': 'OTA', '@Type': 'OTA' },
              'BookingChannel': {
                '@Type': 'OTA',
                'CompanyName': 'Channel Manager',
              },
            },
          },
          'UniqueID': {
            '@ID': data.reservationId,
            '@Type': '14',
            '@ID_Context': 'Channel Manager ID',
          },
          'Verification': {
            'PersonName': {
              'GivenName': reservationData.guestFirstName,
              'Surname': reservationData.guestLastName,
            },
            'ReservationTimeSpan': {
              '@Start': reservationData.checkInDate,
              '@End': reservationData.checkOutDate,
            },
            'TPA_Extensions': {
              'BasicPropertyInfo': {
                '@HotelCode': reservationData.hotelCode,
                '@HotelName': reservationData.hotelName,
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
      if (parsedResponse.OTA_CancelRS.Success !== undefined) {
        console.log('API call successful, saving cancel booking...');

        // Update reservation data in repository
        const enrichedReservationData = {
          ...reservationData,
          thirdPartyReservationIdType8: parsedResponse.OTA_CancelRS.HotelReservations?.HotelReservation?.ResGlobalInfo?.HotelReservationIDs?.HotelReservationID?.ResID_Value || '',
        };

        await this.repository.createCancelReservation(enrichedReservationData, xml, apiResponse.data);
        console.log('Third-party cancel reservation processing completed.');
        return data.reservationId;
      } else if (parsedResponse.OTA_CancelRS.Errors) {
        const error = parsedResponse.OTA_CancelRS.Errors.Error;
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