export interface BookingOffer {
  id: string;
  title: string;
  description: string;
  offerType: 'room_discount' | 'seasonal' | 'early_bird' | 'last_minute' | 'group_booking' | 'extended_stay';
  discountType: 'percentage' | 'fixed' | 'per_night';
  discountValue: number;
  minStayNights?: number;
  maxStayNights?: number;
  advanceBookingDays?: number;
  groupSize?: number;
  startDate: string;
  endDate: string;
  bookingPeriodStart?: string;
  bookingPeriodEnd?: string;
  status: 'active' | 'inactive' | 'expired' | 'scheduled';
  applicableRoomTypes: string[];
  properties: string[];
  usageLimit?: number;
  bookingsCount: number;
  totalRevenue: number;
  averageBookingValue: number;
  conditions: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface OfferFilters {
  search: string;
  status: string;
  offerType: string;
  property: string;
  dateRange: {
    start: string;
    end: string;
  };
  roomType: string;
}

export interface OfferStats {
  totalOffers: number;
  activeOffers: number;
  totalBookings: number;
  totalRevenue: number;
  avgConversionRate: number;
  topPerformingOffer: string;
}