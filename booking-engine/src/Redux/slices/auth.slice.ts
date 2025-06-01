"use client";

import { createSlice, PayloadAction, Draft } from "@reduxjs/toolkit";
import { AuthState } from "../states/auth.state";
import axios from "axios";
import { store } from "../store";
import Cookies from "js-cookie";
import { createAsyncThunk } from "@reduxjs/toolkit";

const initialState: AuthState = {
  isAuthenticated: false,
  accessToken: "",
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAccessToken: (
      state,
      action: PayloadAction<typeof initialState.accessToken>
    ) => {
      state.isAuthenticated = true;
      state.accessToken = action.payload;
      Cookies.set("accessToken", action.payload);
      Cookies.set("isAuthenticated", "true");
    },
    setUser(
      state: Draft<typeof initialState>,
      action: PayloadAction<typeof initialState.user>
    ) {
      state.user = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      Cookies.set("accessToken", '');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = {
          ...state.user,
          firstName: action.payload.firstName,
          lastName: action.payload.lastName,
          email: action.payload.email,
          phone: action.payload.phone || state.user?.phone,
        };
        localStorage.setItem("user", JSON.stringify(action.payload));
      })
      .addCase(updateProfile.pending, (state) => {
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.user = state.user;
      });
  },
});

export const { setAccessToken, logout, setUser } = authSlice.actions;

export const login = (data: { email: string; password: string }) =>
  async (dispatch: typeof store.dispatch) => {
    const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/customers/login`, {
      ...data,
    });
    const token = res.data.token;
    Cookies.set("accessToken", token);
    dispatch(setAccessToken(token));
    dispatch(getUser());
    return token;
  };

export const getUser = () =>
  async (dispatch: typeof store.dispatch) => {
    const accessToken = Cookies.get("accessToken");

    const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/customers/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    dispatch(setUser(res.data.data));
    localStorage.setItem("user", JSON.stringify(res.data.data));
  };

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (
    data: {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      password?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const token = Cookies.get("accessToken");
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/customers/update`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || "Failed to update profile");
      }
      return rejectWithValue("Failed to update profile");
    }
  }
);

export default authSlice.reducer;