/**
 * Interface for QuotusPMS cancel reservation request
 */
export interface IQuotusPMSCancelRequest {
  bookingCode: string;
}

/**
 * Interface for QuotusPMS cancel reservation response
 */
export interface IQuotusPMSCancelResponse {
  success: boolean;
  message: string;
  data: {
    reservationId: string;
    bookingCode: string;
    status: string;
  };
}

/**
 * Interface for cancel reservation input from main system
 */
export interface ICancelReservationInput {
  reservationId: string;
  hotelCode?: string;
  hotelName?: string;
  firstName?: string;
  lastName?: string;
  checkInDate?: string;
  checkOutDate?: string;
  reason?: string;
}
