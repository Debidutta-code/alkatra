// src/api/rebook.api.ts
import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const checkRoomAvailability = async (
  hotelCode: string,
  roomTypeCode: string,
  startDate: string,
  endDate: string
) => {
  const token = Cookies.get("accessToken");
  const response = await axios.get(`${API_BASE_URL}/booking/check/availability`, {
    params: {
      hotelCode,
      invTypeCode: roomTypeCode,
      startDate,
      endDate,
    },
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    withCredentials: true,
  });

  if (!response.data.message?.toLowerCase().includes("available")) {
    throw new Error("Room not available for selected dates");
  }

  return response.data;
};

export const getRoomPrice = async (
  hotelCode: string,
  roomTypeCode: string,
  startDate: string,
  endDate: string,
  noOfAdults: number,
  noOfChildrens: number,
  noOfInfants: number,
  noOfRooms: number
) => {
  const response = await axios.post(
    `${API_BASE_URL}/rate-plan/getRoomRentPrice`,
    {
      hotelCode,
      invTypeCode: roomTypeCode,
      startDate,
      endDate,
      noOfAdults,
      noOfChildrens,
      noOfInfants,
      noOfRooms,
    },
    { withCredentials: true }
  );

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to get price");
  }

  return response.data.data;
};