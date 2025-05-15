import { ThirdPartyBooking, ReservationLog } from '../model/reservationModel';
import { ThirdPartyReservationData } from '../interface/reservationInterface';

export class ThirdPartyReservationRepository {
    async createThirdPartyBooking(data: ThirdPartyReservationData, xmlSent: string, apiResponse: string): Promise<void> {
        console.log(`@@@@@@@@@@@@@@@@@@@@@@\nRepository Creating third-party booking: ${JSON.stringify(data, null, 2)}`);

        const booking = new ThirdPartyBooking({
            reservationId: data.reservationId,
            hotelCode: data.hotelCode,
            hotelName: data.hotelName,
            ratePlanCode: data.ratePlanCode,
            roomTypeCode: data.roomTypeCode,
            checkInDate: new Date(data.checkInDate),
            checkOutDate: new Date(data.checkOutDate),
            guestDetails: data.guestDetails.map(guest => ({
                firstName: guest.firstName,
                lastName: guest.lastName,
                email: guest.email,
                phone: guest.phone,
            })), // Store array of guest details
            amountBeforeTax: data.amountBeforeTax,
            currencyCode: data.currencyCode,
            userId: data.userId,
            propertyId: data.propertyId,
            roomIds: data.roomIds, // Store array of room IDs
            status: data.status,
            thirdPartyReservationIdType8: data.thirdPartyReservationIdType8,
            thirdPartyReservationIdType3: data.thirdPartyReservationIdType3,
        });

        const savedBooking = await booking.save();

        // Log the successful API call
        await this.logReservationAttempt(
            { data }, // Original JSON input
            xmlSent,
            apiResponse, // Raw XML response
            true,
            savedBooking._id.toString()
        );
    }

    async logReservationAttempt(jsonInput: any, xmlSent: string, apiResponse: string, success: boolean, bookingId?: string): Promise<void> {
        console.log(`@@@@@@@@@@@@@@@@@@@@@@\nRepository Logging reservation attempt: ${success ? 'Success' : 'Failure'}`);

        const log = new ReservationLog({
            bookingId,
            jsonInput: JSON.stringify(jsonInput),
            xmlSent,
            apiResponse, // Store raw XML response
            status: success ? 'Success' : 'Failure',
            errorMessage: success ? null : apiResponse, // Store raw XML for errors
            timestamp: new Date(),
        });

        await log.save();
    }
}