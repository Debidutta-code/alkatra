import { Draft, PayloadAction, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState, store, useSelector } from "../store";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";

export type User = {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  _id: string;
  noOfProperties:number;
};

type InitialState = {
  accessToken: string;
  isAuthenticated: boolean;
  authLoading: boolean;
  user: User | undefined;
};

const initialState: InitialState = {
  accessToken: Cookies.get("accessToken") || "",
  isAuthenticated: Cookies.get("isAuthenticated") === "true",
  authLoading: false,
  user: undefined,
};

const authSlice = createSlice({
  name: "authSlice",
  initialState,
  reducers: {
    setAccessToken(
      state: Draft<typeof initialState>,
      action: PayloadAction<typeof initialState.accessToken>
    ) {
      state.accessToken = action.payload;
      state.isAuthenticated = true;
      Cookies.set("accessToken", action.payload, { secure: true, sameSite: "Strict" });
      Cookies.set("isAuthenticated", "true", { secure: true, sameSite: "Strict" });
    },
    removeAccessToken(state: Draft<typeof initialState>) {
      state.accessToken = "";
      state.isAuthenticated = false;
      state.user = undefined;
      Cookies.remove("accessToken");
      Cookies.remove("isAuthenticated");
      Cookies.remove("ownerId");
    },
    setUser(
      state: Draft<typeof initialState>,
      action: PayloadAction<typeof initialState.user>
    ) {
      state.user = action.payload;
    },
  },
});

export const { setAccessToken, removeAccessToken, setUser } = authSlice.actions;


export const login =
  (data: { email: string; password: string }) =>
  async (dispatch: typeof store.dispatch) => {
    try {
      console.log(process.env.NEXT_PUBLIC_BACKEND_URL);
      const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`, data);
      const { accessToken, user } = res.data.data;
      if (!accessToken) {
        toast.error("Login failed. No access token received.");
        return;
      }

      Cookies.set("accessToken", accessToken, {
        expires: 1,
        secure: process.env.NODE_ENV === 'production', 
        sameSite: process.env.NODE_ENV === 'production' ? "Lax" : "Strict", 
        path: "/",
        domain: process.env.NODE_ENV === 'production' ? 'dashboard.trip-swift.ai' : 'localhost' 
      });
      dispatch(setAccessToken(accessToken));
      dispatch(setUser(user));

      return accessToken;
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          toast.error("Invalid Email or Password");
        } 
        // else {
        //   toast.error(error.response?.data?.message || "Login failed");
        // }
      } else {
        toast.error("An unexpected error occurred");
      }
      throw error;
    }
  };

  export const logout = () => async (dispatch: typeof store.dispatch, getState: typeof store.getState) => {
    const state = getState();
    const accessToken = state.auth.accessToken;
    
    let logoutSuccess = false;
    
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout`, {}, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
      });
      logoutSuccess = true;
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      dispatch(removeAccessToken());
      
      if (logoutSuccess) {
        toast.success("Successfully logged out!");
      } else {
        toast.success("Logged out successfully");
        // Changed message to be more user-friendly
      }
    }
  };

export const getUser =
  () => async (dispatch: typeof store.dispatch, getState: typeof store.getState) => {
    const state = getState();
    const accessToken = state.auth.accessToken;
    const isAuthenticated = state.auth.isAuthenticated;

    if (!isAuthenticated || !accessToken) {
      dispatch(logout());
      return;
    }

    try {
      const decodedToken: any = jwtDecode(accessToken);
      const currentTime = Date.now() / 1000; // Convert to seconds

      if (decodedToken.exp < currentTime) {
        console.warn("Token expired. Logging out...");
        dispatch(logout());
        return;
      }

      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const user = res?.data?.data?.user;
      if (user) {
        dispatch(setUser(user));
        Cookies.set("ownerId", user._id, { secure: true, sameSite: "Strict" });
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.warn("Unauthorized! Logging out...");
        dispatch(logout());
      } else {
        console.error("Error fetching user:", error);
      }
    }
  };


export default authSlice.reducer;
