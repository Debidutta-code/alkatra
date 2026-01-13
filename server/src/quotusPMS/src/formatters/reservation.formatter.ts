import { IReservationInput, IQuotusPMSReservation, IGuest, IRoom } from '../interfaces/reservation.interface';

export class QuotusPMSFormatter {
  /**
   * Convert internal reservation input to QuotusPMS format
   */
  formatReservation(input: IReservationInput): IQuotusPMSReservation {
    // Extract guests from bookingDetails.guests or root level guests (for backward compatibility)
    const guestsSource = (input.bookingDetails as any)?.guests || input.guests || [];
    
    // Format guests
    const guests: IGuest[] = guestsSource.map((guest) => ({
      firstName: guest.firstName,
      lastName: guest.lastName,
      email: guest.email || (guest as any).phoneNumber || null,
      phoneNumber: (guest as any).phoneNumber || (guest as any).phone || null,
      userType: guest.userType,
      address: guest.address || null,
      city: guest.city || null,
      state: guest.state || null,
      country: guest.country || null,
      zipCode: guest.zipCode || null,
    }));

    // Extract rooms from input.rooms
    const roomsSource = input.rooms || [];
    
    // Format rooms
    const rooms: IRoom[] = roomsSource.map((room) => ({
      noOfRooms: (room as any).noOfRooms || (room as any).numberOfRooms || 1,
      ratePlanCode: room.ratePlanCode || '',
      roomCode: (room as any).roomCode || (room as any).roomTypeCode || '',
      roomName: (room as any).roomName || (room as any).roomTypeName || '',
      ratePlanName: room.ratePlanName || '',
      noOfAdults: (room as any).noOfAdults || (room as any).numberOfAdults || 0,
      noOfChildren: (room as any).noOfChildren || (room as any).numberOfChildren || 0,
      noOfInfants: (room as any).noOfInfants || (room as any).numberOfInfants || 0,
    }));

    // Extract payment info from bookingDetails or payment object (for backward compatibility)
    const totalAmount = (input.bookingDetails as any)?.roomTotalPrice || input.payment?.totalAmount || 0;
    const paidAmount = (input.bookingDetails as any)?.paidAmount || input.payment?.paidAmount || 0;
    const discountedAmount = (input.bookingDetails as any)?.discountedAmount || input.payment?.discountedAmount || 0;
    const currencyCode = (input.bookingDetails as any)?.currencyCode || input.payment?.currencyCode || 'INR';
    const paymentMethod = (input.bookingDetails as any)?.paymentMethod || input.payment?.paymentMethod || 'none';
    const paymentNote = (input.bookingDetails as any)?.paymentNote || input.payment?.paymentNote || null;
    const additionalNotes = (input.bookingDetails as any)?.additionalNotes || input.additionalNotes || null;

    // Create QuotusPMS reservation object
    const reservation: IQuotusPMSReservation = {
      from: new Date(input.bookingDetails.checkInDate),
      to: new Date(input.bookingDetails.checkOutDate),
      Guests: guests,
      bookedAt: new Date(),
      totalAmount,
      paidAmount,
      discountedAmount,
      paymentNote,
      currencyCode: currencyCode as any,
      paymentMethod: paymentMethod as any,
      Rooms: rooms,
      additionalNotes,
    };

    return reservation;
  }

  /**
   * Validate reservation data
   */
  validateReservation(reservation: IQuotusPMSReservation): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    console.log('Validating reservation:', reservation);
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
