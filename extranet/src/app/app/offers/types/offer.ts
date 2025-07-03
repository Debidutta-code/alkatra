export interface BookingOffer {
  id: string;
  title: string;
  description: string;
  discountValue: number;
  endDate: string;
  terms: string;
  status: 'active' | 'inactive' | 'expired' | 'scheduled';
  bookingsCount: number;
  totalRevenue: number;
  averageBookingValue: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface OfferFilters {
  search: string;
  status: string;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface OfferStats {
  totalOffers: number;
  activeOffers: number;
  totalBookings: number;
  totalRevenue: number;
  avgConversionRate: number;
  topPerformingOffer: string;
}