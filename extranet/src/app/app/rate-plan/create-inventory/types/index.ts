// app/rate-plan/create-inventory/types/index.ts

export interface Availability {
    startDate: string;
    endDate: string;
    count: number;
  }
  
  export interface CreateInventoryPayload {
    hotelCode: string;
    invTypeCode: string;
    availability: Availability;
  }
  
  export interface InventoryResponse {
    success: boolean;
    message: string;
    data?: any;
  }