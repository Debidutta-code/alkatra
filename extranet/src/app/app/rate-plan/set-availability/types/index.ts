export interface DateRange {
  from: Date;
  to: Date;
}
export interface InventoryInterFace {
  _id: string;
  hotelCode: string;
  invTypeCode: string;
  availability: {
    count: number;
    startDate: Date;
    endDate: Date;
  };
}
export interface paginationTypes {
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalPage: number;
  totalCount: number;
  limit: number;
}
export interface modifiedRatePlanInterface {
  inventoryId:string;
  availability:number
}
