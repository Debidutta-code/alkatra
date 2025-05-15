// store/filterSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface FilterState {
  directFlight: boolean;
  includedAirlines: string[];
}

// Initial state for the filter
const initialState: FilterState = {
  directFlight: false,
  includedAirlines: [],
};

const filterSlice = createSlice({
  name: "filter",
  initialState,
  reducers: {
    setDirectFlight(state, action: PayloadAction<boolean>) {
      state.directFlight = action.payload;
    },
    setIncludedAirlines(state, action: PayloadAction<string[]>) {
      state.includedAirlines = action.payload;
    },
    // Optionally add other filter-related actions as needed
    resetFilters(state) {
      state.directFlight = initialState.directFlight;
      state.includedAirlines = initialState.includedAirlines;
    },
  },
});

export const { setDirectFlight, setIncludedAirlines, resetFilters } = filterSlice.actions;

export default filterSlice.reducer;
