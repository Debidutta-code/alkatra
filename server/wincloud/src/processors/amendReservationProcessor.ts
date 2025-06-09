// amendReservationProcessor.ts
import { AmendReservationInput, ThirdPartyAmendReservationData } from '../interface/amendReservationInterface';
import { PropertyInfo } from '../../../Property_Management/src/model/property.info.model';
import { ThirdPartyBooking } from '../model/reservationModel';



export async function prepareAmendReservationData(data: AmendReservationInput): Promise<ThirdPartyAmendReservationData> {
    const hotelData = await ThirdPartyBooking.findOne({ reservationId: data.bookingDetails?.reservationId });
    if (!hotelData) {
        throw new Error(`Reservation with ID ${data.bookingDetails?.reservationId} not found`);
    }
    return {
        hotelCode: data.bookingDetails?.hotelCode,
        hotelName: data.bookingDetails?.hotelName,
        ratePlanCode: data.bookingDetails?.ratePlanCode,
        roomTypeCode: data.bookingDetails?.roomTypeCode,
        guests: data.bookingDetails?.guests,
        email: data.bookingDetails?.email,
        phone: data.bookingDetails?.phone,
        checkInDate: data.bookingDetails?.checkInDate,
        checkOutDate: data.bookingDetails?.checkOutDate,
        ageCodeSummary: data.ageCodeSummary,
        amountBeforeTax: data.bookingDetails?.roomTotalPrice,
        currencyCode: 'INR',
        userId: data.bookingDetails?.userId || '',
        status: 'Modified',
        reservationId: data.bookingDetails?.reservationId,
    };
}
