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
}

const initialState: PmsHotelCardState = {
  property_id: null,
  room_id: null,
  amount: null,
  user_id: null,
  checkInDate: null,
  checkOutDate: null,
  guestDetails: {},
};

const pmsHotelCardSlice = createSlice({
  name: "pmsHotelCard",
  initialState,
  reducers: {
    setPropertyId: (state, action: PayloadAction<string>) => {
      // console.log("1 setPropertyId called with:", action.payload);
      state.property_id = action.payload;
      // console.log("2 setPropertyId called with:", state.property_id);
    },
    setRoomId: (state, action: PayloadAction<string>) => {
      // console.log("1 setRoomId called with:", action.payload);
      state.room_id = action.payload;
      // console.log("2 setRoomId called with:", state.room_id);
    },
    setAmount: (state, action: PayloadAction<string>) => {
      // console.log("1 setAmount called with:", action.payload);
      state.amount = action.payload;
      // console.log("2 setAmount called with:", state.amount);
    },
    setUserId: (state, action: PayloadAction<string>) => {
      // console.log("1 setUserId called with:", action.payload);
      state.user_id = action.payload;
      // console.log("2 setUserId called with:", state.user_id);
    },
    setCheckInDate: (state, action: PayloadAction<string>) => {
      // console.log("1 setCheckInDate called with:", action.payload);
      state.checkInDate = action.payload;
      // console.log("2 setCheckInDate called with:", state.checkInDate);
    },
    setCheckOutDate: (state, action: PayloadAction<string>) => {
      // console.log("1 setCheckOutDate called with:", action.payload);
      state.checkOutDate = action.payload;
      // console.log("2 setCheckOutDate called with:", state.checkOutDate);
    },
    setGuestDetails: (state, action: PayloadAction<Record<string, any>>) => {
      // console.log("1 setGuestDetails called with:", action.payload);
      state.guestDetails = action.payload;
      // console.log("2 setGuestDetails called with:", state.guestDetails);
    },
  },
});

export const { setPropertyId, setRoomId, setUserId, setCheckInDate, setCheckOutDate, setAmount, setGuestDetails } = pmsHotelCardSlice.actions;

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