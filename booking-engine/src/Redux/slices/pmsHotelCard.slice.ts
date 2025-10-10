import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { store } from "../store";
import Cookies from "js-cookie";
import axios from "axios";

interface PmsHotelCardState {
  property_id: string | null;
  room_id: string | null;
  amount: number | null;
  user_id: string | null;
  checkInDate: string | null;
  checkOutDate: string | null;
  guestDetails: Record<string, any>;
  baseRatePerNight: string | null;
  additionalGuestCharges: string | null;
  requestedRooms: string | null;
  hotelCode: string | null;
  ratePlanCode: string | null;
  roomType: string | null;
  currency: string | null;
  hotelName: string | null;
  finalAmount?: number;
  promoCode?: string | null;
  promoCodeName?: string | null;
  originalAmount?: number;
}

const initialState: PmsHotelCardState = {
  property_id: null,
  room_id: null,
  amount: null,
  user_id: null,
  checkInDate: null,
  checkOutDate: null,
  guestDetails: {},
  baseRatePerNight: null,
  additionalGuestCharges: null,
  requestedRooms: null,
  hotelCode: null,
  ratePlanCode: null,
  roomType: null,
  currency: null,
  hotelName: null,
  finalAmount: undefined,
  promoCode: null,
  promoCodeName: null,
  originalAmount: undefined,
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
    setAmount: (state, action: PayloadAction<number>) => {
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
    setBaseRatePerNight: (state, action: PayloadAction<string>) => {
      state.baseRatePerNight = action.payload;
    },
    setAdditionalGuestCharges: (state, action: PayloadAction<string>) => {
      state.additionalGuestCharges = action.payload;
    },
    setRequestedRooms: (state, action: PayloadAction<string>) => {
      state.requestedRooms = action.payload;
    },
    setHotelCode: (state, action: PayloadAction<string>) => {
      state.hotelCode = action.payload;
    },
    setRatePlanCode: (state, action: PayloadAction<string>) => {
      state.ratePlanCode = action.payload;
    },
    setRoomType: (state, action: PayloadAction<string>) => {
      state.roomType = action.payload;
    },
    setCurrency: (state, action: PayloadAction<string>) => {
      state.currency = action.payload;
    },
    setHotelName: (state, action: PayloadAction<string>) => {
      state.hotelName = action.payload;
    },
    setFinalAmount: (state, action: PayloadAction<number>) => {
      state.finalAmount = action.payload;
    },
    setPromoCode: (state, action: PayloadAction<string | null>) => {
      state.promoCode = action.payload;
    },
    setPromoCodeName: (state, action: PayloadAction<string | null>) => {
      state.promoCodeName = action.payload;
    },
    setOriginalAmount: (state, action: PayloadAction<number>) => {
      state.originalAmount = action.payload;
    },
    resetPmsHotelCard: (state) => {
      return { ...initialState };
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
  setBaseRatePerNight,
  setAdditionalGuestCharges,
  setRequestedRooms,
  setHotelCode,
  setRatePlanCode,
  setRoomType,
  setCurrency,
  setHotelName,
  setFinalAmount,
  setPromoCode,
  setPromoCodeName,
  setOriginalAmount,
  resetPmsHotelCard,
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