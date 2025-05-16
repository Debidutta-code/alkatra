export const currentDateTime = () => {
  const date = new Date();
  const currentDataTime = date.toLocaleString([], { hour12: true });

  return currentDataTime;
};