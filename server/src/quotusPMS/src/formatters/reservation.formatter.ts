import { IReservationInput, IQuotusPMSReservation, IGuest, IRoom } from '../interfaces/reservation.interface';

export class QuotusPMSFormatter {
  /**
   * Convert internal reservation input to QuotusPMS format
   */
  formatReservation(input: IReservationInput): IQuotusPMSReservation {
    // Format guests
    const guests: IGuest[] = input.guests.map((guest) => ({
      firstName: guest.firstName,
      lastName: guest.lastName,
      email: guest.email || null,
      phoneNumber: guest.phone || null,
      userType: guest.userType,
      address: guest.address || null,
      city: guest.city || null,
      state: guest.state || null,
      country: guest.country || null,
      zipCode: guest.zipCode || null,
    }));

    // Format rooms
    const rooms: IRoom[] = input.rooms.map((room) => ({
      noOfRooms: room.numberOfRooms,
      ratePlanCode: room.ratePlanCode,
      roomCode: room.roomTypeCode,
      roomName: room.roomTypeName,
      ratePlanName: room.ratePlanName,
      noOfAdults: room.numberOfAdults,
      noOfChildren: room.numberOfChildren,
      noOfInfants: room.numberOfInfants,
    }));

    // Create QuotusPMS reservation object
    const reservation: IQuotusPMSReservation = {
      from: new Date(input.bookingDetails.checkInDate),
      to: new Date(input.bookingDetails.checkOutDate),
      Guests: guests,
      bookedAt: new Date(),
      totalAmount: input.payment.totalAmount,
      paidAmount: input.payment.paidAmount,
      discountedAmount: input.payment.discountedAmount,
      paymentNote: input.payment.paymentNote || null,
      currencyCode: input.payment.currencyCode,
      paymentMethod: input.payment.paymentMethod,
      Rooms: rooms,
      additionalNotes: input.additionalNotes || null,
    };

    return reservation;
  }

  /**
   * Validate reservation data
   */
  validateReservation(reservation: IQuotusPMSReservation): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate dates
    if (!(reservation.from instanceof Date) || isNaN(reservation.from.getTime())) {
      errors.push('Invalid check-in date');
    }
    if (!(reservation.to instanceof Date) || isNaN(reservation.to.getTime())) {
      errors.push('Invalid check-out date');
    }
    if (reservation.from >= reservation.to) {
      errors.push('Check-in date must be before check-out date');
    }

    // Validate guests
    if (!reservation.Guests || reservation.Guests.length === 0) {
      errors.push('At least one guest is required#########');
    } else {
      reservation.Guests.forEach((guest, index) => {
        if (!guest.firstName || !guest.lastName) {
          errors.push(`Guest ${index + 1}: First name and last name are required`);
        }
      });
    }

    // Validate rooms
    if (!reservation.Rooms || reservation.Rooms.length === 0) {
      errors.push('At least one room is required');
    } else {
      reservation.Rooms.forEach((room, index) => {
        if (!room.roomCode || !room.ratePlanCode) {
          errors.push(`Room ${index + 1}: Room code and rate plan code are required`);
        }
        if (room.noOfRooms <= 0) {
          errors.push(`Room ${index + 1}: Number of rooms must be greater than 0`);
        }
      });
    }

    // Validate payment
    if (reservation.totalAmount < 0) {
      errors.push('Total amount cannot be negative');
    }
    if (reservation.paidAmount < 0) {
      errors.push('Paid amount cannot be negative');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
