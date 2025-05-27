export const format = (date: Date, formatString: string): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  switch (formatString) {
    case 'yyyy-MM-dd':
      return `${year}-${month}-${day}`;
    case 'PPP':
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    default:
      return date.toLocaleDateString();
  }
};

export const isWithinInterval = (
  date: Date, 
  interval: { start: Date; end: Date }
): boolean => {
  return date >= interval.start && date <= interval.end;
};

export const parseISO = (dateString: string): Date => {
  return new Date(dateString);
};
