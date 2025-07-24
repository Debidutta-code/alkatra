// cancelReservationXmlFormatter.ts

import { create } from 'xmlbuilder2';
import { v4 as uuidv4 } from 'uuid';
import { ThirdPartyCancelReservationData } from '../interface/cancelReservationInterface';

interface ExtendedReservationData extends ThirdPartyCancelReservationData {
  checkInDate?: string;
  checkOutDate?: string;
}

export function formatCancelReservationXml(data: ExtendedReservationData): string {
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
          'GivenName': data.firstName,
          'Surname': data.lastName,
        },
        'ReservationTimeSpan': {
          '@Start': data.checkInDate,
          '@End': data.checkOutDate,
        },
        'TPA_Extensions': {
          'BasicPropertyInfo': {
            '@HotelCode': data.hotelCode,
            '@HotelName': data.hotelName,
          },
        },
      },
    },
  };

  return create(xmlObj).end({ prettyPrint: true });
}
