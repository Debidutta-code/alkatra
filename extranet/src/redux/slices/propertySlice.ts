import { Draft, PayloadAction, createSlice } from "@reduxjs/toolkit";

import axios from "axios";
import { store } from "../store";
import type { User } from "./authSlice";

export type Property = {
  _id: string;
  user_id: User | {};
  property_name: string;
  property_email: string;
  property_contact: number;
  star_rating: string;
  property_code: string;
  property_address: any;
  property_aminite: any;
  property_room: any;
  image: string[];
  description: string;
  isDraft: boolean;
};

type PropertyState = {
  properties: Property[] | [];
  draftProperties: Property[] | [];
};

const initialState: PropertyState = {
  properties: [],
  draftProperties: [],
};

const propertySlice = createSlice({
  name: "propertySlice",
  initialState,
  reducers: {
    setProperties(
      state: Draft<typeof initialState>,
      action: PayloadAction<typeof initialState.properties>
    ) {
      state.properties = action.payload;
    },
    setDraftProperties(
      state: Draft<typeof initialState>,
      action: PayloadAction<typeof initialState.draftProperties>
    ) {
      state.draftProperties = action.payload;
    },
  },
});

export const { setProperties, setDraftProperties } = propertySlice.actions;

export const getProperties =
  () =>
  async (dispatch: typeof store.dispatch, getState: typeof store.getState) => {
    const { accessToken } = getState().auth;

    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/property/me`,
      {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      }
    );

    const { properties, draftProperties } = data.data;

    dispatch(setProperties(properties));
    dispatch(setDraftProperties(draftProperties));
  };

export default propertySlice.reducer;
