import { ThirdPartyReservationData, ReservationInput } from "../interface/reservationInterface";
import { v4 as uuidv4 } from "uuid";   

export class ReservationProcessor {
    async processReservationInput(data: ReservationInput): Promise<ThirdPartyReservationData> {
        const { guests, roomAssociations, bookingDetails, payment } = data;

        // Validate input fields
        if (!guests || !Array.isArray(guests) || guests.length === 0) {
            throw new Error('Guests array is missing or empty');
        }
        guests.forEach((guest, index) => {
            if (!guest.firstName) throw new Error(`Guest ${index + 1}: firstName is missing`);
            if (!guest.lastName) throw new Error(`Guest ${index + 1}: lastName is missing`);
            if (!guest.email) throw new Error(`Guest ${index + 1}: email is missing`);
            if (!guest.phone) throw new Error(`Guest ${index + 1}: phone is missing`);
        });

        if (!roomAssociations || !Array.isArray(roomAssociations) || roomAssociations.length === 0) {
            throw new Error('Room associations array is missing or empty');
        }
        roomAssociations.forEach((assoc, index) => {
            if (!assoc.roomId) throw new Error(`Room association ${index + 1}: roomId is missing`);
        });

        if (!bookingDetails) {
            throw new Error('Booking details are missing');
        }
        if (!bookingDetails.propertyId) {
            throw new Error('Booking details: propertyId is missing');
        }
        if (!bookingDetails.userId) {
            throw new Error('Booking details: userId is missing');
        }
        if (!bookingDetails.checkInDate) {
            throw new Error('Booking details: checkInDate is missing');
        }
        if (!bookingDetails.checkOutDate) {
            throw new Error('Booking details: checkOutDate is missing');
        }
        if (!bookingDetails.hotelCode) {
            throw new Error('Booking details: hotelCode is missing');
        }
        if (!bookingDetails.hotelName) {
            throw new Error('Booking details: hotelName is missing');
        }
        if (!bookingDetails.ratePlanCode) {
            throw new Error('Booking details: ratePlanCode is missing');
        }
        if (!bookingDetails.roomTypeCode) {
            throw new Error('Booking details: roomTypeCode is missing');
        }
        if (!bookingDetails.currencyCode) {
            throw new Error('Booking details: currencyCode is missing');
        }
        if (!bookingDetails.status) {
            throw new Error('Booking details: status is missing');
        }

        // Validate dates
        const checkInDate = new Date(bookingDetails.checkInDate);
        const checkOutDate = new Date(bookingDetails.checkOutDate);
        if (isNaN(checkInDate.getTime())) {
            throw new Error('Booking details: checkInDate is invalid');
        }
        if (isNaN(checkOutDate.getTime())) {
            throw new Error('Booking details: checkOutDate is invalid');
        }
        if (checkInDate >= checkOutDate) {
            throw new Error('Booking details: checkInDate must be before checkOutDate');
        }

        if (!payment) {
            throw new Error('Payment details are missing');
        }
        if (!payment.amount) {
            throw new Error('Payment: amount is missing');
        }
        if (!payment.method) {
            throw new Error('Payment: method is missing');
        }
        const amount = parseFloat(payment.amount);
        if (isNaN(amount) || amount <= 0) {
            throw new Error('Payment: amount must be a valid positive number');
        }

        // Generate UniqueID for reservation
        const reservationUniqueId: string = uuidv4();

        // Prepare reservation data
        const reservationData: ThirdPartyReservationData = {
            hotelCode: bookingDetails.hotelCode,
            hotelName: bookingDetails.hotelName,
            ratePlanCode: bookingDetails.ratePlanCode,
            roomTypeCode: bookingDetails.roomTypeCode,
            checkInDate: checkInDate.toISOString().split('T')[0],
            checkOutDate: checkOutDate.toISOString().split('T')[0],
            guestDetails: guests.map(guest => ({
                firstName: guest.firstName,
                lastName: guest.lastName,
                email: guest.email,
                phone: guest.phone,
            })),
            amountBeforeTax: amount,
            currencyCode: bookingDetails.currencyCode,
            userId: bookingDetails.userId,
            propertyId: bookingDetails.propertyId,
            roomIds: roomAssociations.map(assoc => assoc.roomId),
            status: bookingDetails.status,
            reservationId: reservationUniqueId,
        };

        return reservationData;
    }
}