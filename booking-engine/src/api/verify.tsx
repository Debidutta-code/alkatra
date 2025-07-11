// src/api/verify.tsx
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const verifyApi = {
  // Send OTP to email
  sendEmailOtp: async (email: string) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/customers/send-otp`,
        {
          identifier: email,
          type: "mail_verification",
        },
        { withCredentials: true }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to send email OTP");
    }
  },

  // Verify email OTP
  verifyEmailOtp: async (email: string, otp: string) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/customers/verify-otp`,
        {
          identifier: email,
          otp,
          type: "mail_verification",
        },
        { withCredentials: true }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to verify email OTP");
    }
  },

  // Send OTP to phone
  sendPhoneOtp: async (phone: string) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/customers/send-otp`,
        {
          identifier: phone,
          type: "number_verification",
        },
        { withCredentials: true }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to send phone OTP");
    }
  },

  // Verify phone OTP
  verifyPhoneOtp: async (phone: string, otp: string) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/customers/verify-otp`,
        {
          identifier: phone,
          otp,
          type: "number_verification",
        },
        { withCredentials: true }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to verify phone OTP");
    }
  },
};