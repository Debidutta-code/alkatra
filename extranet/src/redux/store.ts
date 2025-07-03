import {
  useDispatch as useDispatchBase,
  useSelector as useSelectorBase,
  TypedUseSelectorHook,
} from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import propertyReducer from "./slices/propertySlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    propertyReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Properly typed hooks for use in components
export const useDispatch = () => useDispatchBase<AppDispatch>();
export const useSelector: TypedUseSelectorHook<RootState> = useSelectorBase;