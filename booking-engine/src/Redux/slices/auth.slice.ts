"use client";

import { createSlice, PayloadAction, Draft } from "@reduxjs/toolkit";
import { AuthState } from "../states/auth.state";
import axios from "axios";
import Cookies from "js-cookie";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "../store";

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
      Cookies.set("accessToken", "");
      localStorage.removeItem("user");
      localStorage.removeItem("authToken");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = {
          ...state.user,
          _id: action.payload._id,
          firstName: action.payload.firstName,
          lastName: action.payload.lastName,
          email: action.payload.email,
          phone: action.payload.phone || state.user?.phone,
        };
        localStorage.setItem("user", JSON.stringify(action.payload));
      })
      .addCase(updateProfile.pending, (state) => {
        // Handle pending state if needed
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.user = state.user;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.accessToken = action.payload.token;
        Cookies.set("accessToken", action.payload.token);
        Cookies.set("isAuthenticated", "true");
        localStorage.setItem("authToken", action.payload.token);
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.accessToken = "";
        state.user = null;
      });
  },
});

export const { setAccessToken, logout, setUser } = authSlice.actions;

// Login thunk for email/password authentication
export const login = createAsyncThunk<
  string,
  { email: string; password: string },
  { dispatch: AppDispatch; state: RootState }
>("auth/login", async (data, { dispatch }) => {
  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/customers/login`,
    {
      ...data,
    }
  );
  const token = res.data.token;
  Cookies.set("accessToken", token);
  dispatch(setAccessToken(token));
  await dispatch(getUser());
  return token;
});

// Google login thunk
export const googleLogin = createAsyncThunk<
  { token: string },
  { code: string },
  { dispatch: AppDispatch; state: RootState }
>("auth/googleLogin", async (data, { dispatch, rejectWithValue }) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/google/auth/google`,
      { code: data.code },
      {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      }
    );
    console.log("Google login response:", response.data);
    if (response.status !== 200) {
      throw new Error(response.data.error || "Failed to login with Google");
    }

    const { token } = response.data;
    if (!token) {
      throw new Error("No token received from Google login");
    }

    // Store token in cookies and localStorage
    Cookies.set("accessToken", token);
    localStorage.setItem("authToken", token);

    // Dispatch setAccessToken to update Redux state
    dispatch(setAccessToken(token));

    // Fetch user data
    await dispatch(getUser());

    return { token };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to login with Google"
      );
    }
    return rejectWithValue("Failed to login with Google");
  }
});

// Get user thunk
export const getUser = createAsyncThunk<
  void,
  void,
  { dispatch: AppDispatch; state: RootState }
>("auth/getUser", async (_, { dispatch }) => {
  let accessToken = Cookies.get("accessToken");
  console.log(`The access token we get from cookies ${accessToken}`);
  // if (!accessToken) {
  //   accessToken = localStorage.getItem("authToken") || "";
  //   console.log(`The access token we get from localstorage ${accessToken}`);
  // }
  if (!accessToken) return;
  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/customers/me`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  dispatch(setUser(res.data.data));
  localStorage.setItem("user", JSON.stringify(res.data.data));
});

// Update profile thunk
export const updateProfile = createAsyncThunk<
  any,
  { firstName: string; lastName: string; email: string; phone?: string; password?: string },
  { dispatch: AppDispatch; state: RootState }
>("auth/updateProfile", async (data, { rejectWithValue }) => {
  try {
    const token = Cookies.get("accessToken") || localStorage.getItem("authToken") || "";
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
      return rejectWithValue(
        error.response?.data?.message || "Failed to update profile"
      );
    }
    return rejectWithValue("Failed to update profile");
  }
});

export default authSlice.reducer;