const formatDate = (date: Date) => {
    const dateObject = new Date(date);
  
    const options: Intl.DateTimeFormatOptions = { 
      weekday: "short", 
      day: "numeric", 
      month: "short" 
    };
  
    const currentYear = new Date().getFullYear();
    const yearOfDate = dateObject.getFullYear();
  
    if (yearOfDate !== currentYear) {
      options.year = "numeric";
    }
  
    const formattedDate = dateObject.toLocaleDateString("en-GB", options);
    return formattedDate;
  };
  
  export default formatDate;
  