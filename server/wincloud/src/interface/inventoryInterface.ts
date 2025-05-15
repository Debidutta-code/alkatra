export interface InventoryData {
  hotelCode: string;
  hotelName: string;
  invTypeCode: string;
  startDate: string;
  endDate: string;
  count: number;
}

export interface OTAHotelInvCountNotifRQ {
  OTA_HotelInvCountNotifRQ: {
    EchoToken?: string;
    TimeStamp?: string;
    Target?: string;
    Version?: string;
    POS?: {
      Source: {
        RequestorID: {
          ID: string;
          ID_Context: string;
          MessagePassword?: string;
        };
      };
    };
    Inventories: {
      $: {
        HotelCode: string;
        HotelName: string;
      };
      Inventory: Array<{
        StatusApplicationControl: {
          $: {
            InvTypeCode: string;
            Start: string;
            End: string;
          };
        };
        InvCounts: {
          InvCount: {
            $: {
              Count: string;
            };
          };
        };
      }> | {
        StatusApplicationControl: {
          $: {
            InvTypeCode: string;
            Start: string;
            End: string;
          };
        };
        InvCounts: {
          InvCount: {
            $: {
              Count: string;
            };
          };
        };
      };
    };    
  };
}