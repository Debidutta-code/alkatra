import moment from 'moment-timezone';

const convertToLocalTime = (): Date => {
  const timezone = process.env.TIMEZONE;
  if (!timezone) {
    throw new Error ("The time zone not found. Please set in Environment");
  }
  const currentTimeUTC = new Date(); 
  // const localTime = moment(currentTimeUTC).tz(timezone); 
  const localTime = moment().tz("Asia/Kolkata").toDate();
  // if (!localTime.isValid()) {
  //   throw new Error ("Can't convert to local time zone");
  // }
  // return localTime.toDate();
  return localTime;
};

export default convertToLocalTime;  