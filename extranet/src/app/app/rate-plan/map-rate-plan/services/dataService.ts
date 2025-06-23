import { DateRange, RatePlanInterFace } from '../types';
import { format, isWithinInterval, parseISO } from '../utils/dateUtils';
import Cookies from 'js-cookie';
import { fetchRatePlans, getAllRatePlans,modifyRatePlans } from "../API"


export const filterData = (
  data: RatePlanInterFace[],
  dateRange: DateRange | undefined,
  selectedRoomType: string,
  selectedRatePlan: string,
  allRoomTypes:any[]
): RatePlanInterFace[] => {
  // Handle case where data is undefined, null, or not an array
  if (!data || !Array.isArray(data) || data.length === 0) {
    return [];
  }

  let filtered = [...data];

  // Filter by date range
  if (dateRange?.from && dateRange?.to) {
    filtered = filtered.filter(item => {
      const startDate = new Date(item.availability.startDate);
      const endDate = new Date(item.availability.endDate);

      // Check if the item's availability period overlaps with the selected date range
      const hasOverlap = (
        startDate <= dateRange.to && endDate >= dateRange.from
      );

      return hasOverlap;
    });
  }

  // Filter by room type (invTypeCode)
  if (selectedRoomType) {
    filtered = filtered.filter(item => item.invTypeCode === selectedRoomType);
  }

  // Filter by rate plan (using _id as identifier)
  if (selectedRatePlan) {
    filtered = filtered.filter(item => item.rates?.ratePlanCode === selectedRatePlan);
  }

  return filtered;
};

export const updatePrice = (
  data: RatePlanInterFace[],
  filteredData: RatePlanInterFace[],
  index: number,
  newPrice: number
): RatePlanInterFace[] => {
  if (!data || !Array.isArray(data) || !filteredData || !Array.isArray(filteredData) || index < 0 || index >= filteredData.length) {
    return Array.isArray(data) ? data : [];
  }

  const updatedData = [...data];
  const targetItem = filteredData[index];

  const originalIndex = data.findIndex(item =>
    item._id === targetItem._id &&
    item.invTypeCode === targetItem.invTypeCode &&
    item.hotelCode === targetItem.hotelCode
  );

  if (originalIndex !== -1) {
    // Update the base amount for the first guest (assuming single guest pricing)
    if (updatedData[originalIndex].rates?.baseByGuestAmts) {
      updatedData[originalIndex].rates.baseByGuestAmts.amountBeforeTax = newPrice;
    }
  }

  return updatedData;
};

export const updateAvailability = (
  data: RatePlanInterFace[],
  filteredData: RatePlanInterFace[],
  index: number,
  newAvailability: number
): RatePlanInterFace[] => {
  if (!data || !Array.isArray(data) || !filteredData || !Array.isArray(filteredData) || index < 0 || index >= filteredData.length) {
    return Array.isArray(data) ? data : [];
  }

  const updatedData = [...data];
  const targetItem = filteredData[index];

  const originalIndex = data.findIndex(item =>
    item._id === targetItem._id &&
    item.invTypeCode === targetItem.invTypeCode &&
    item.hotelCode === targetItem.hotelCode
  );

  if (originalIndex !== -1) {
    updatedData[originalIndex].availability.count = newAvailability;
  }

  return updatedData;
};

// Helper function to get price from the rates? structure
export const getPrice = (item: RatePlanInterFace): number => {
  if (item.rates?.baseByGuestAmts) {
    return item.rates?.baseByGuestAmts.amountBeforeTax;
  }
  return 0;
};

// Helper function to get availability count
export const getAvailability = (item: RatePlanInterFace): number => {
  return item.availability.count;
};

// Helper function to get currency code
export const getCurrencyCode = (item: RatePlanInterFace): string => {
  return item.rates?.currencyCode;
};

// Helper function to get date range string for display
export const getDateRangeString = (item: RatePlanInterFace): string => {
  const startDate = format(new Date(item.availability.startDate), 'PPP');
  const endDate = format(new Date(item.availability.endDate), 'PPP');
  return `${startDate} - ${endDate}`;
};

export const saveData = async (data: RatePlanInterFace[]): Promise<void> => {
  try {
    const accessToken = Cookies.get('accessToken');
    if (!accessToken) {
      throw new Error('No access token found. Please log in.');
    }
    console.log("From save Data",data)
    let modifiedRatePlans = data.map((mp) => {
      const inventoryId = mp._id;
      const rateAmountId = mp.rates?._id;
      const price = mp.rates?.baseByGuestAmts.amountBeforeTax;
      const availability = mp.availability.count;
      return { inventoryId, rateAmountId, price, availability };
    });
    return await modifyRatePlans(modifiedRatePlans,accessToken)
  } catch (error: any) {
    console.error(error.message);
  }
  
  await new Promise(resolve => setTimeout(resolve, 1000));
};
export const ratePlanServices = async (hotelCode: string, pageNo: number, invTypeCode?: string, startDate?: Date, endDate?: Date) => {
  try {
    const accessToken = Cookies.get('accessToken');
    if (!accessToken) {
      throw new Error('No access token found. Please log in.');
    }
    return await fetchRatePlans(hotelCode, accessToken, pageNo, invTypeCode, startDate, endDate)
  } catch (error) {

  }
}
export const getAllRatePlanServices = async () => {
  try {
    const accessToken = Cookies.get('accessToken');
    if (!accessToken) {
      throw new Error('No access token found. Please log in.');
    }
    return await getAllRatePlans(accessToken.toString())
  } catch (error: any) {
    return {
      success: false,
      message: error.message
    }
  }
}