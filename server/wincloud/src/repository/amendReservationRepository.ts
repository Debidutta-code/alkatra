import { AmendReservationLog } from '../model/amendReservationModel';
import { ThirdPartyBooking } from '../model/reservationModel';
import { ThirdPartyAmendReservationData } from '../interface/amendReservationInterface';

export class ThirdPartyAmendReservationRepository {
    async createAmendReservation(data: ThirdPartyAmendReservationData, xmlSent: string, apiResponse: string): Promise<void> {
        console.log(`@@@@@@@@@@@@@@@@@@@@@@\nRepository Updating third-party booking: ${JSON.stringify(data, null, 2)}`);

        const updatedBooking = await ThirdPartyBooking.findOneAndUpdate(
            { reservationId: data.reservationId },
            {
                $set: {
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
                    })), // Updated to handle array of guest details
                    amountBeforeTax: data.amountBeforeTax,
                    currencyCode: data.currencyCode,
                    userId: data.userId,
                    propertyId: data.propertyId,
                    roomIds: data.roomIds, // Updated to handle array of room IDs
                    status: data.status,
                    thirdPartyReservationIdType8: data.thirdPartyReservationIdType8,
                    thirdPartyReservationIdType3: data.thirdPartyReservationIdType3,
                },
            },
            { new: true }
        );

        if (!updatedBooking) {
            throw new Error('Booking not found for update');
        }

        await this.logAmendReservationAttempt(
            { data },
            xmlSent,
            apiResponse,
            true,
            updatedBooking.reservationId
        );
    }

    async logAmendReservationAttempt(jsonInput: any, xmlSent: string, apiResponse: string, success: boolean, bookingId?: string): Promise<void> {
        console.log(`@@@@@@@@@@@@@@@@@@@@@@\nRepository Logging amend reservation attempt: ${success ? 'Success' : 'Failure'}`);

        const log = new AmendReservationLog({
            bookingId,
            jsonInput: JSON.stringify(jsonInput),
            xmlSent,
            apiResponse,
            status: success ? 'Success' : 'Failure',
            errorMessage: success ? null : apiResponse,
            timestamp: new Date(),
        });

        await log.save();
    }
}