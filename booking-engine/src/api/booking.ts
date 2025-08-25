import axios, { AxiosError } from "axios";
import Config from '../../config'

type BookingType = {
  property: string;
  room: string;
  user: string;
  booking_user_name: string
  booking_user_email: string,
  booking_user_phone: number,
  amount: number;
  payment: string;
  booking_dates: Date;
  status: string;
  checkInDate: Date;
  checkOutDate: Date;
  reviews: string;
  createdAt: Date;
  updatedAt: Date;
};
// const createBooking = (data: BookingType) => {

//     return new Promise((resolve, reject) => {
//         axios.post(`${Config.bookingUrl}/createreservation`, {
//             data
//         })
//             .then((result: any) => {
//                 resolve(result.data)
//             })
//             .catch((error: any) => {
//                 reject(error)
//             })
//     })
// };

// export const deleteBooking = async (id: string, accessToken: string) => {
//     if (!id) {
//         console.log("Id is required");
//         return;
//     }
//     try {
//         const { data } = await axios.delete(`${Config.searchUrl}/booking/${id}`, {
//             headers: {
//                 "Authorization": `Bearer ${accessToken}`
//             }
//         });
//         return data;
//     } catch (error: any) {
//         console.error("Error deleting booking:", error);
//     }
// }

// Booking API call logic
// export const makeBookingRequest = async (payload: any, token: string) => {
//     try {
//         console.log("Making booking confirmation request to backend...");
//         const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/booking/createreservation`, payload,
//             {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                 },
//             }
//         );
//         console.log("Response:", response.data);

//         if (response.status === 201) {
//             return response.data;
//         } else {
//             throw new Error("Booking failed. Unexpected status code.");
//         }
//     } catch (error: AxiosError | any) {
//         console.log("Booking Error:", error);
//         throw new Error(error?.response?.data?.message || "Booking request failed.");
//     }
// };

// Create a Stripe SetupIntent for securely storing card details
export const createSetupIntent = async (guestData: any, token?: string) => {
  try {
    // Update the endpoint to match where you implemented it
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/payment/create-setup-intent`,
      { guestData },
      {
        headers: token ? {
          Authorization: `Bearer ${token}`,
        } : {}
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Setup Intent Error:", error);
    if (error.response?.status === 401 ||
      error.response?.data?.message?.includes('jwt') ||
      error.message?.includes('jwt')) {
      throw new Error("Authentication error. Please log in again and try.");
    }
    throw new Error(error?.response?.data?.message || "Failed to create setup intent");
  }
};

export const confirmBookingWithStoredCard = async (payload: any, token: string) => {
  try {
    // Check token before making request
    if (!token) {
      throw new Error("Authentication token is required for booking");
    }

    console.log("Making 'Pay at Hotel' booking with stored card...");
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/booking/create-reservation-with-card`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Response:", response.data);
    if (response.status === 200 || response.status === 201) {
      console.log("Booking Response:", response.data);
      return response.data;
    } else {
      throw new Error("Booking failed: Unexpected status code " + response.status);
    }
  } catch (error: any) {
    console.log("Booking Error:", error);
    if (error.response?.status === 401 ||
      error.response?.data?.message?.includes('jwt') ||
      error.message?.includes('jwt')) {
      throw new Error("Authentication error. Please log in again before completing your booking.");
    }
    throw new Error(error?.response?.data?.message || "Booking request failed.");
  }
};