import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the initial state
interface HotelState {
  hotelSearchDetails: Record<string, any>;
  guestDetails: Record<string, any>;
  dateRangeDetails: Record<string, any>;
}

const initialState: HotelState = {
  hotelSearchDetails: {},
  guestDetails: {},
  dateRangeDetails: {},
};

const hotelSlice = createSlice({
  name: "hotel",
  initialState,
  reducers: {
    setHotelSearchDetails: (
      state,
      action: PayloadAction<Record<string, any>>
    ) => {
      state.hotelSearchDetails = action.payload;
    },
    setGuestDetails: (state, action: PayloadAction<Record<string, any>>) => {
      state.guestDetails = action.payload;
    },
    setDateRangeDetails: (
      state,
      action: PayloadAction<Record<string, any>>
    ) => {
      state.dateRangeDetails = action.payload;
    },
  },
});

export const { setHotelSearchDetails, setGuestDetails, setDateRangeDetails } =
  hotelSlice.actions;
export default hotelSlice.reducer;
