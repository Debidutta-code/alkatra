import axios from "axios";
import { modifiedRatePlanInterface } from "../types/index";
export const getAllRatePlans = async (
  accessToken: string,
  hotelCode: string,
  invTypeCode?: string,
  startDate?: Date,
  endDate?: Date,
  page?: number
) => {
  try {
    const pageNo = page ? page : 1;
    const ratePlans = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/ari/getInventoris?page=${pageNo}`,
      { hotelCode: hotelCode, startDate, endDate, invTypeCode },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return ratePlans.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const getAllRoomTypes = async (accessToken: string) => {
  try {
    const roomTypes = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/ari/getAllRoomType`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return roomTypes.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const updateRoomAvailability = async (
  accessToken: string,
  updateAvailabilityArr: modifiedRatePlanInterface[]
) => {
  try {
    const roomTypes = await axios.put(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/ari/updateRoomAvailability`,
      { updateAvailabilityArr },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return roomTypes.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const addRoomAvailability = async (
  accessToken: string,
  hotelCode: string,
  invTypeCode: string,
  availability: any
) => {
  try {
    const roomTypes = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/ari/createInventory`,
      { hotelCode, invTypeCode, availability },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return roomTypes.data;
  } catch (error: any) {
    throw new Error(error.message);
  }
};
