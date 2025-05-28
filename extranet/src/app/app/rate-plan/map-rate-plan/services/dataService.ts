import { format, isWithinInterval, parseISO } from '../utils/dateUtils';

interface MapRatePlanData {
  date: string;
  ratePlanCode: string;
  ratePlanName: string;
  roomTypeCode: string;
  roomTypeName: string;
  price: number;
  availability: number;
}

interface DateRange {
  from: Date;
  to: Date;
}

export const filterData = (
  data: MapRatePlanData[],
  dateRange: DateRange | undefined,
  selectedRoomType: string,
  selectedRatePlan: string
): MapRatePlanData[] => {
  let filtered = [...data];

  // Filter by date range
  if (dateRange?.from && dateRange?.to) {
    filtered = filtered.filter(item => {
      const itemDate = parseISO(item.date);
      // Normalize dates to remove time components for comparison
      const itemDateStr = format(itemDate, 'yyyy-MM-dd');
      const endDateStr = format(dateRange.to, 'yyyy-MM-dd');

      // Include item if it's within the interval or matches the end date
      return (
        isWithinInterval(itemDate, { start: dateRange.from, end: dateRange.to }) ||
        itemDateStr === endDateStr
      );
    });
  }

  // Filter by room type
  if (selectedRoomType) {
    filtered = filtered.filter(item => item.roomTypeCode === selectedRoomType);
  }

  // Filter by rate plan
  if (selectedRatePlan) {
    filtered = filtered.filter(item => item.ratePlanCode === selectedRatePlan);
  }

  return filtered;
};

export const updatePrice = (
  data: MapRatePlanData[],
  filteredData: MapRatePlanData[],
  index: number,
  newPrice: number
): MapRatePlanData[] => {
  const updatedData = [...data];
  const originalIndex = data.findIndex(item =>
    item.date === filteredData[index].date &&
    item.ratePlanCode === filteredData[index].ratePlanCode &&
    item.roomTypeCode === filteredData[index].roomTypeCode
  );

  if (originalIndex !== -1) {
    updatedData[originalIndex].price = newPrice;
  }

  return updatedData;
};

export const updateAvailability = (
  data: MapRatePlanData[],
  filteredData: MapRatePlanData[],
  index: number,
  newAvailability: number
): MapRatePlanData[] => {
  const updatedData = [...data];
  const originalIndex = data.findIndex(item =>
    item.date === filteredData[index].date &&
    item.ratePlanCode === filteredData[index].ratePlanCode &&
    item.roomTypeCode === filteredData[index].roomTypeCode
  );

  if (originalIndex !== -1) {
    updatedData[originalIndex].availability = newAvailability;
  }

  return updatedData;
};

export const saveData = async (data: MapRatePlanData[]): Promise<void> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('Saved data:', data);
};