// Guest type for reservation
export type GuestType = 'adult' | 'child' | 'infant';

// Payment methods supported
export type PaymentMethod = 'credit_card' | 'debit_card' | 'cash' | 'company' | 'none';

// Currency codes supported
export type CurrencyCode = 'USD' | 'EUR' | 'INR';

// Guest information interface
export interface IGuest {
  firstName: string;
  lastName: string;
  email: string | null;
  phoneNumber: string | null;
  userType: GuestType;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  zipCode: string | null;
}

// Room information for reservation
export interface IRoom {
  noOfRooms: number;
  ratePlanCode: string;
  roomCode: string;
  roomName: string;
  ratePlanName: string;
  noOfAdults: number;
  noOfChildren: number;
  noOfInfants: number;
}

// Main reservation interface - what QuotusPMS expects
export interface IQuotusPMSReservation {
  from: Date;
  to: Date;
  Guests: IGuest[];
  bookedAt: Date;
  totalAmount: number;
  paidAmount: number;
  discountedAmount: number;
  paymentNote: string | null;
  currencyCode: CurrencyCode;
  paymentMethod: PaymentMethod;
  Rooms: IRoom[];
  additionalNotes: string | null;
}

// Internal reservation input from our booking engine
export interface IReservationInput {
  propertyId: string;
  bookingDetails: {
    checkInDate: string;
    checkOutDate: string;
    reservationId: string;
    userId: string;
  };
  guests: Array<{
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    userType: GuestType;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  }>;
  rooms: Array<{
    numberOfRooms: number;
    ratePlanCode: string;
    roomTypeCode: string;
    roomTypeName: string;
    ratePlanName: string;
    numberOfAdults: number;
    numberOfChildren: number;
    numberOfInfants: number;
  }>;
  payment: {
    totalAmount: number;
    paidAmount: number;
    discountedAmount: number;
    currencyCode: CurrencyCode;
    paymentMethod: PaymentMethod;
    paymentNote?: string;
  };
  additionalNotes?: string;
}

// Database model for storing QuotusPMS reservations
export interface IQuotusPMSReservationRecord {
  propertyId: string;
  reservationId: string;
  reservationData: IQuotusPMSReservation;
  requestPayload: string; // JSON string of what we sent
  responsePayload: string; // JSON string of response from QuotusPMS
  status: 'pending' | 'confirmed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}
