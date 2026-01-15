/**
 * Interface for QuotusPMS amend reservation request
 */
export interface IQuotusPMSAmendRequest {
  bookingCode: string;
  newFromDate: string; // ISO 8601 format
  newToDate: string;   // ISO 8601 format
}

/**
 * Interface for QuotusPMS amend reservation response
 */
export interface IQuotusPMSAmendResponse {
  success: boolean;
  message: string;
  data: {
    reservationId: string;
    bookingCode: string;
    oldFromDate: string;
    oldToDate: string;
    newFromDate: string;
    newToDate: string;
  };
}
