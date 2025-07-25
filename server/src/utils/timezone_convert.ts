import moment from 'moment-timezone';

const convertToLocalTime = (date: Date): string => {
  const timezone = process.env.TIMEZONE;
  if (!timezone) {
    throw new Error ("The time zone not found. Please set in Environment");
  }
  const localTime = moment(date).tz(timezone).format(); 
  if (!localTime) {
    throw new Error ("Can't convert to local time zone");
  }
  return localTime;
};

export default convertToLocalTime;