"use client";

import {
  useDispatch as useDispatchBase,
  useSelector as useSelectorBase,
} from "react-redux";

import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authReducer from "./slices/auth.slice";
import userFormReducer from "./slices/useForm.slice";
import hotelReducer from "./slices/hotelcard.slice";
import pmsHotelCardReducer from "./slices/pmsHotelCard.slice";
import paymentReducer from "./slices/payment.slice";
import notificationReducer from './slices/notification.slice';
import { persistReducer, persistStore } from "redux-persist";
import storage from "./storage";

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ["pmsHotelCard", "auth"],
};

const rootReducer = combineReducers({
  auth: authReducer,
  userForm: userFormReducer,
  hotel: hotelReducer,
  pmsHotelCard: pmsHotelCardReducer,
  payment: paymentReducer,
  notifications: notificationReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      // serializableCheck: {
      //   ignoredActions: ["persist/PERSIST"], // Ignore persist actions to avoid warnings
      // },
    }),
});

// Print the pmsHotelCard state
// store.subscribe(() => {
//   console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\npmsHotelCard state:', store.getState().pmsHotelCard);
// });

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useDispatch = () => useDispatchBase<AppDispatch>();

export const useSelector = <TSelected = unknown>(
  selector: (state: RootState) => TSelected
): TSelected => useSelectorBase<RootState, TSelected>(selector);