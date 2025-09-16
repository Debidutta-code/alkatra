import { DateRange, RatePlanInterFace, modifiedRatePlanInterface, modifiedSellStatusInterface } from '../types';
import { format } from '../utils/dateUtils';
import Cookies from 'js-cookie';
import { fetchRatePlans, getAllRatePlans, modifyRatePlans, updateSellStatus } from "../API"

export const filterData = (
  data: RatePlanInterFace[],
  dateRange: DateRange | undefined,
  selectedRoomType: string,
  selectedRatePlan: string,
  allRoomTypes: any[]
): RatePlanInterFace[] => {

  if (!data || !Array.isArray(data) || data.length === 0) {
    return [];
  }

  return [...data];
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

export const getPrice = (item: RatePlanInterFace): number => {
  if (!item.rates || !item.rates.baseByGuestAmts) {
    return 0;
  }
  return item.rates.baseByGuestAmts.amountBeforeTax;
};

export const getAvailability = (item: RatePlanInterFace): number => {
  return item.availability.count || 0;
};

export const getCurrencyCode = (item: RatePlanInterFace): string => {
  if (!item.rates) {
    return 'N/A';
  }
  return item.rates.currencyCode || 'N/A';
};

export const getRatePlanCode = (item: RatePlanInterFace): string => {
  if (!item.rates) {
    return 'No Rate Plan';
  }
  return item.rates.ratePlanCode || 'No Rate Plan';
};

export const getDateRangeString = (item: RatePlanInterFace): string => {
  const startDate = format(new Date(item.availability.startDate), 'PPP');
  const endDate = format(new Date(item.availability.endDate), 'PPP');
  return `${startDate} - ${endDate}`;
};

export const hasRateData = (item: RatePlanInterFace): boolean => {
  return item.rates !== null && item.rates !== undefined;
};

export const functioncanEditPrice = (item: RatePlanInterFace): boolean => {
  return hasRateData(item) && item.rates?.baseByGuestAmts !== undefined;
};

export const getSellStatus = (item: RatePlanInterFace): boolean => {
  return item.status === 'close';
};

export const canEditSellStatus = (item: RatePlanInterFace): boolean => {
  return hasRateData(item) && item.status !== undefined;
};

export const saveData = async (
  priceData: modifiedRatePlanInterface[],
  sellStatusData?: modifiedSellStatusInterface[]
): Promise<void> => {
  try {
    const accessToken = Cookies.get('accessToken');
    if (!accessToken) {
      throw new Error('No access token found. Please log in.');
    }

    console.log("From save Data - Price changes:", priceData);
    console.log("From save Data - Sell status changes:", sellStatusData);

    // Handle price modifications
    if (priceData && priceData.length > 0) {
      let modifiedRatePlans = priceData.map((mp) => {
        const rateAmountId = mp.rateAmountId;
        const price = mp.price;
        return { rateAmountId, price };
      });
      await modifyRatePlans(modifiedRatePlans, accessToken);
    }

    // Handle sell status modifications (API call will be added later)
    if (sellStatusData && sellStatusData.length > 0) {
      // TODO: Add API call for sell status when API is ready
      // await modifySellStatus(sellStatusData, accessToken);
      console.log("Sell status changes ready for API integration:", sellStatusData);
    }

  } catch (error: any) {
    console.error(error.message);
    throw error;
  }

  await new Promise(resolve => setTimeout(resolve, 1000));
};

export const ratePlanServices = async (
  hotelCode: string,
  pageNo: number,
  invTypeCode?: string,
  startDate?: Date,
  endDate?: Date,
  ratePlanCode?: string,
  pageSize: number = 10
) => {
  try {
    const accessToken = Cookies.get('accessToken');
    if (!accessToken) {
      throw new Error('No access token found. Please log in.');
    }

    // Call the existing fetchRatePlans function with pageSize
    const response = await fetchRatePlans(
      hotelCode,
      accessToken,
      pageNo,
      invTypeCode,
      startDate,
      endDate,
      ratePlanCode,
      pageSize
    );

    return response;
  } catch (error) {
    console.error('Error fetching rate plans:', error);
    return {
      success: false,
      message: 'Failed to fetch rate plans',
      data: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalResults: 0,
        resultsPerPage: pageSize,
        hasNextPage: false,
        hasPreviousPage: false
      }
    };
  }
}

export const getAllRatePlanServices = async () => {
  try {
    const accessToken = Cookies.get('accessToken');
    if (!accessToken) {
      throw new Error('No access token found. Please log in.');
    }
    const storedHotelCode = sessionStorage.getItem('hotelCode');
    if (!storedHotelCode) {
      throw new Error('No hotel code found in session storage.');
    }
    return await getAllRatePlans(accessToken.toString(), storedHotelCode);
  } catch (error: any) {
    return {
      success: false,
      message: error.message
    }
  }
}

export const bulkUpdateSellStatus = async (
  hotelCode: string,
  roomRatePlan: string,
  dateStatusList: { date: string; status: "open" | "close" }[]
) => {
  const accessToken = Cookies.get('accessToken');
  if (!accessToken) {
    throw new Error('No access token found. Please log in.');
  }

  const [invTypeCode, ratePlanCode] = roomRatePlan.split(' - ');
  if (!invTypeCode) {
    throw new Error('Invalid room/rate plan format');
  }

  return await updateSellStatus(
    {
      hotelCode,
      invTypeCode,
      dateStatusList,
    },
    accessToken
  );
}