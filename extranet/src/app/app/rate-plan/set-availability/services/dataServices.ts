import Cookies from "js-cookie";
import {
  getAllRatePlans,
  getAllRoomTypes,
  updateRoomAvailability,
  addRoomAvailability
} from "../API";
import { modifiedRatePlanInterface } from "../types/index";
const getAccessToken = () => {
  const accessToken = Cookies.get("accessToken");
  if (!accessToken) {
    throw new Error("No access token found. Please log in.");
  }
  return accessToken;
};
export const getAllRatePlanServices = async (
  hotelCode: string,
  invTypeCode?: string,
  startDate?: Date,
  endDate?: Date,
  page?: number
) => {
  try {
    const accessToken = getAccessToken();
    return await getAllRatePlans(
      accessToken.toString(),
      hotelCode,
      invTypeCode,
      startDate,
      endDate,
      page
    );
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const getAllRoomTypeService = async () => {
  try {
    const accessToken = getAccessToken();
    return await getAllRoomTypes(accessToken);
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const updateAvailabilityServices = async (
  updateAvailabilityArr: modifiedRatePlanInterface[]
) => {
  try {
    const accessToken = getAccessToken();
    return await updateRoomAvailability(accessToken, updateAvailabilityArr);
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};
export const addInventory = async (
  hotelCode: string,
  invTypeCode: string,
  availability: any
) => {
  try {
    const accessToken=getAccessToken()
    return await addRoomAvailability(accessToken,hotelCode,invTypeCode,availability)

  } catch (error: any) {
    return { success: false, message: error.message };
  }
};
