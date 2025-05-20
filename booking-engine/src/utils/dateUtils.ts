/**
 * Formats a date string into a user-friendly format
 * @param dateString - ISO date string
 * @param options - Formatting options
 * @returns Formatted date string
 */
export const formatDate = (
    dateString: string, 
    options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }
  ) => {
    if (!dateString) return "";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', options);
    } catch (e) {
      return dateString;
    }
  };
  
  /**
   * Calculates the number of nights between two dates
   * @param checkInDate - Check-in date string
   * @param checkOutDate - Check-out date string
   * @returns Number of nights
   */
  export const calculateNights = (checkInDate: string, checkOutDate: string): number => {
    if (!checkInDate || !checkOutDate) return 0;
  
    try {
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
  
      if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) return 0;
  
      const diffTime = checkOut.getTime() - checkIn.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch (error) {
      console.error("Error calculating nights:", error);
      return 0;
    }
  };