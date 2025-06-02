

export interface DateRange {
  from: Date;
  to: Date;
}
export interface RatePlanInterFace {
  _id: string
  availability: {
    count: number;
    endDate: Date;
    startDate: Date;
  },
  invTypeCode: string; hotelCode: string;
  rates: {
    baseByGuestAmts: {
      numberOfGuests: number;
      amountBeforeTax: number;
      _id: string;
    };
    currencyCode: string
    _id:string;
  }
}
export interface paginationTypes{
  currentPage:number;
  totalPage:number;
  totalResults:number;
  hasNextPage:boolean;
  hasPreviousPage:boolean;
  resultsPerPage:number
}
export interface modifiedRatePlanInterface{
  rateAmountId:string;
  inventoryId:string;
  price:number;
  availability:number;
}