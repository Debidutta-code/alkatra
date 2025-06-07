export interface ThirdPartyCancelReservationData {
  reservationId: string;
  hotelCode: string;
  hotelName: string;
  firstName: string;
  lastName: string;
  checkInDate?: string;
  checkOutDate?: string;
  status: string;
}