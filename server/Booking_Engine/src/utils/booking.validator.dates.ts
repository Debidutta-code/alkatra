
//preventing users from selecting past dates or duplicating bookings.

export const validateBookingDates = (array: string[]): boolean => {
  if (array.length === 0) return false; 

  const currentDate = new Date();
  const uniqueDates = new Set<string>();

  // Check if each element is a valid date and in the future, and there are no duplicates
  for (const date of array) {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime()) || parsedDate <= currentDate) return false;

    // Check for duplicates
    if (uniqueDates.has(parsedDate.toISOString())) return false;
    uniqueDates.add(parsedDate.toISOString());
  }

  return true;
};

interface BookingDatesResult {
  isAnyDateInPast: boolean;
  earliestDate: Date;
  latestDate: Date;
  isEarliestDateOverCurrentDate: boolean;
  isLatestDateOverCurrentDate: boolean;
}

export const bookingDatesBeforeCurrentDate = (dateArray: string[]): BookingDatesResult => {
  const currentDate = new Date();

  // Check if any date is in the past
  const isAnyDateInPast = dateArray.some((dateString) => new Date(dateString) < currentDate);

  // Convert dates to Date objects and find the earliest and latest dates
  const dateObjects = dateArray.map((dateString) => new Date(dateString).getTime());
  const earliestDate = new Date(Math.min(...dateObjects));
  const latestDate = new Date(Math.max(...dateObjects));

  // Check if the earliest date is over the current date
  const isEarliestDateOverCurrentDate = earliestDate < currentDate;

  // Check if the latest date is over the current date
  const isLatestDateOverCurrentDate = latestDate < currentDate;

  return {
    isAnyDateInPast,
    earliestDate: new Date(earliestDate),
    latestDate: new Date(latestDate),
    isEarliestDateOverCurrentDate,
    isLatestDateOverCurrentDate,
  };
};

