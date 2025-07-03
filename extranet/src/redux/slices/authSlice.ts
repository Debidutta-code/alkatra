import { Draft, PayloadAction, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState, store, useSelector } from "../store";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";

// Strongly typed User interface
export interface User {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  id: string; // Changed from _id to id for consistency
  noOfProperties: number;
}

interface InitialState {
  accessToken: string;
  isAuthenticated: boolean;
  authLoading: boolean;
  user: User | null; // Changed from undefined to null for better type safety
}

const initialState: InitialState = {
  accessToken: Cookies.get("accessToken") || "",
  isAuthenticated: Cookies.get("isAuthenticated") === "true",
  authLoading: false,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAccessToken(
      state: Draft<InitialState>,
      action: PayloadAction<string>
    ) {
      state.accessToken = action.payload;
      state.isAuthenticated = true;
      Cookies.set("accessToken", action.payload, { 
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        expires: 1 // 1 day
      });
      Cookies.set("isAuthenticated", "true", {
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict"
      });
    },
    removeAccessToken(state: Draft<InitialState>) {
      state.accessToken = "";
      state.isAuthenticated = false;
      state.user = null;
      Cookies.remove("accessToken");
      Cookies.remove("isAuthenticated");
      Cookies.remove("ownerId");
      localStorage.clear();
    },
    setUser(
      state: Draft<InitialState>,
      action: PayloadAction<User | null>
    ) {
      state.user = action.payload;
      if (action.payload) {
        Cookies.set("ownerId", action.payload.id, { 
          secure: process.env.NODE_ENV === "production",
          sameSite: "Strict"
        });
      }
    },
    setAuthLoading(
      state: Draft<InitialState>,
      action: PayloadAction<boolean>
    ) {
      state.authLoading = action.payload;
    }
  },
});

// Thunk actions
export const login = (data: { email: string; password: string }) => 
  async (dispatch: typeof store.dispatch) => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`, 
        data
      );
      
      const { accessToken, user } = res.data.data;
      if (!accessToken) {
        throw new Error("No access token received");
      }

      // Transform user object to use 'id' instead of '_id' if needed
      const normalizedUser = user._id ? { ...user, id: user._id } : user;

      dispatch(setAccessToken(accessToken));
      dispatch(setUser(normalizedUser));
      
      return accessToken;
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || "Login failed";
        toast.error(message);
      } else {
        toast.error("An unexpected error occurred");
      }
      throw error;
    }
  };

export const logout = () => 
  async (dispatch: typeof store.dispatch, getState: typeof store.getState) => {
    const { accessToken } = getState().auth;
    
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout`, 
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout API error:", error);
      toast.success("Logged out (session cleared)");
    } finally {
      dispatch(removeAccessToken());
    }
  };

export const getUser = () => 
  async (dispatch: typeof store.dispatch, getState: typeof store.getState) => {
    const { accessToken, isAuthenticated } = getState().auth;
    
    if (!isAuthenticated || !accessToken) {
      dispatch(logout());
      return;
    }

    try {
      // Verify token expiration
      const decoded = jwtDecode(accessToken);
      if (decoded.exp && decoded.exp < Date.now() / 1000) {
        dispatch(logout());
        return;
      }

      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/me`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      const user = res.data.data?.user;
      if (user) {
        // Normalize user object to use 'id'
        const normalizedUser = user._id ? { ...user, id: user._id } : user;
        dispatch(setUser(normalizedUser));
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        dispatch(logout());
      }
      console.error("Failed to fetch user:", error);
    }
  };

// Selectors
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.auth.authLoading;

export const { 
  setAccessToken, 
  removeAccessToken, 
  setUser,
  setAuthLoading 
} = authSlice.actions;

export default authSlice.reducer;