import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { store } from "../store";
import Cookies from "js-cookie";
import axios from "axios";

interface PmsHotelCardState {
  property_id: string | null;
  room_id: string | null;
  amount: string | null;
  user_id: string | null;
  checkInDate: string | null;
  checkOutDate: string | null;
  guestDetails: Record<string, any>;
  baseRatePerNight: string | null; // Added
  additionalGuestCharges: string | null; // Added
  requestedRooms: string | null; // Added
}

const initialState: PmsHotelCardState = {
  property_id: null,
  room_id: null,
  amount: null,
  user_id: null,
  checkInDate: null,
  checkOutDate: null,
  guestDetails: {},
  baseRatePerNight: null, // Added
  additionalGuestCharges: null, // Added
  requestedRooms: null, // Added
};

const pmsHotelCardSlice = createSlice({
  name: "pmsHotelCard",
  initialState,
  reducers: {
    setPropertyId: (state, action: PayloadAction<string>) => {
      state.property_id = action.payload;
    },
    setRoomId: (state, action: PayloadAction<string>) => {
      state.room_id = action.payload;
    },
    setAmount: (state, action: PayloadAction<string>) => {
      state.amount = action.payload;
    },
    setUserId: (state, action: PayloadAction<string>) => {
      state.user_id = action.payload;
    },
    setCheckInDate: (state, action: PayloadAction<string>) => {
      state.checkInDate = action.payload;
    },
    setCheckOutDate: (state, action: PayloadAction<string>) => {
      state.checkOutDate = action.payload;
    },
    setGuestDetails: (state, action: PayloadAction<Record<string, any>>) => {
      state.guestDetails = action.payload;
    },
    setBaseRatePerNight: (state, action: PayloadAction<string>) => { // Added
      state.baseRatePerNight = action.payload;
    },
    setAdditionalGuestCharges: (state, action: PayloadAction<string>) => { // Added
      state.additionalGuestCharges = action.payload;
    },
    setRequestedRooms: (state, action: PayloadAction<string>) => { // Added
      state.requestedRooms = action.payload;
    },
  },
});

export const {
  setPropertyId,
  setRoomId,
  setUserId,
  setCheckInDate,
  setCheckOutDate,
  setAmount,
  setGuestDetails,
  setBaseRatePerNight, // Added
  setAdditionalGuestCharges, // Added
  setRequestedRooms, // Added
} = pmsHotelCardSlice.actions;

export const getUser =
  () =>
  async (dispatch: typeof store.dispatch, getState: typeof store.getState) => {
    const accessToken = Cookies.get("accessToken");
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/customers/me`, {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      });
      const user = res?.data?.data;
      console.log("API response user:", user);
      dispatch(setUserId(user._id));
      console.log("2 setUserId called with:", user._id);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

export default pmsHotelCardSlice.reducer;