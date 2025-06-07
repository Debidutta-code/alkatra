import { ThirdPartyCancelReservationRepository } from '../repository/cancelReservationRepository';
import { ThirdPartyCancelReservationData } from '../interface/cancelReservationInterface';
import { ThirdPartyBooking } from '../model/reservationModel';
import { ApiClient } from '../utils/apiClient';

export class ThirdPartyCancelReservationService {
  private repository: ThirdPartyCancelReservationRepository;

  constructor() {
    this.repository = new ThirdPartyCancelReservationRepository();
  }

  async processCancelReservation(data: ThirdPartyCancelReservationData): Promise<string> {
    let xml = '';
    try {
      console.log('▶️ Starting third-party cancel reservation processing...');
      const existingReservation = await ThirdPartyBooking.findOne({ reservationId: data.reservationId });
      if (!existingReservation) {
        throw new Error(`Reservation with ID ${data.reservationId} not found`);
      }

      console.log('✅ Existing reservation found:', existingReservation.reservationId);

      const reservationData: ThirdPartyCancelReservationData = {
        reservationId: data.reservationId,
        hotelCode: data?.hotelCode,
        hotelName: data?.hotelName,
        firstName: data?.firstName,
        lastName: data?.lastName,
        checkInDate: data?.checkInDate,
        checkOutDate: data?.checkOutDate,
        status: 'Cancelled',
      };

      xml = formatCancelReservationXml({
        ...reservationData,
        checkInDate: reservationData.checkInDate,
        checkOutDate: reservationData.checkOutDate,
      });

      console.log('📤 XML to be sent:\n', xml);

      const apiClient = new ApiClient();
      const apiResponse = await apiClient.sendToThirdParty(xml);

      const enrichedReservationData = {
        ...reservationData
      };

      await this.repository.createCancelReservation(enrichedReservationData, xml, JSON.stringify(apiResponse));
      return data.reservationId;

    } catch (error: any) {
      console.error('🚨 Service Error:', error.message);
      throw new Error(error.message);
    }
  }
}

// Placeholder for XML formatter
function formatCancelReservationXml(data: {
  checkInDate: string;
  checkOutDate: string;
  reservationId: string;
  hotelCode: string;
  hotelName: string;
  firstName: string;
  lastName: string;
  status: string;
}): string {
  return `<OTA_CancelRQ xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns="http://www.opentravel.org/OTA/2003/05"
    EchoToken="987654323" TimeStamp="2025-04-30T15:00:00Z" Version="1.0" CancelType="Cancel">
    <POS>
        <Source>
            <RequestorID ID="TripSwift" Type="" />
            <BookingChannel Type=""></BookingChannel>
        </Source>
    </POS>
    <UniqueID ID="${data.reservationId}" Type="14" ID_Context="WINCLOUD" />
    <Verification>
        <PersonName>
            <GivenName>${data.firstName}</GivenName>
        </PersonName>
        <TPA_Extensions>
            <BasicPropertyInfo HotelCode="${data.hotelCode}" HotelName="${data.hotelName}" />
        </TPA_Extensions>
    </Verification>
</OTA_CancelRQ>`;
}