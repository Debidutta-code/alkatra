// src/Redux/slices/payment.slice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PaymentData {
  token: string;
  blockchain: string;
  amount: number;
  status: string;
  payment_id: string;
  address?: string;
  checkInDate?: string;
  checkOutDate?: string;
  hotelCode?: string;
  hotelName?: string;
  ratePlanCode?: string;
  numberOfRooms?: number;
  roomTypeCode?: string;
  currencyCode?: string;
  email?: string;
  phone?: string;
  guests?: any;
}

interface PaymentState {
  paymentData: PaymentData | null;
}

const initialState: PaymentState = {
  paymentData: null,
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    setPaymentData(state, action: PayloadAction<PaymentData>) {
      state.paymentData = action.payload;
    },
    clearPaymentData(state) {
      state.paymentData = null;
    },
  },
});

export const { setPaymentData, clearPaymentData } = paymentSlice.actions;
export default paymentSlice.reducer;