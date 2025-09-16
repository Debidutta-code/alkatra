export interface RoomTypeInterface {
  invTypeCode: string;
  ratePlanCodes: string[];
}

export interface DateRange {
  from: Date;
  to: Date;
}

export interface RatePlanInterFace {
  _id: string;
  availability: {
    count: number;
    endDate: Date;
    startDate: Date;
  };
  invTypeCode: string;
  hotelCode: string;
  status: 'open' | 'close';
  rates: {
    baseByGuestAmts: {
      numberOfGuests: number;
      amountBeforeTax: number;
      _id: string;
    };
    currencyCode: string;
    _id: string;
    ratePlanCode: string;
  };
}

export interface paginationTypes {
  currentPage: number;
  totalPage: number;
  totalResults: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  resultsPerPage: number;
}

export interface modifiedRatePlanInterface {
  rateAmountId: string;
  price: number;
  isStopSell?: boolean;
}

export interface SellStatusInterface {
  rateAmountId: string;
  isStopSell: boolean;
}

export interface modifiedSellStatusInterface {
  rateAmountId: string;
  isStopSell: boolean;
}