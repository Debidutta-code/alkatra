export interface MapRatePlanData {
  date: string;
  ratePlanCode: string;
  ratePlanName: string;
  roomTypeCode: string;
  roomTypeName: string;
  price: number;
  availability: number;
}

export interface DateRange {
  from: Date;
  to: Date;
}