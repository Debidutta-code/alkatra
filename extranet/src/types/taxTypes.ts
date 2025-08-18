export type TaxRule = {
  _id: string;
  name: string;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  applicableOn: "TOTAL_AMOUNT" | "ROOM_RATE";
  region: {
    country: string;
  };
  description?: string;
  validFrom: string;
  isInclusive: boolean;
  priority: number;
  hotelId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
};
  
  export type TaxGroup = {
    _id: string;
    name: string;
    rules: (string | TaxRule)[];
    isActive: boolean;
    hotelId: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    code: string;
    __v: number;
  };