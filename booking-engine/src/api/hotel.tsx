import axios from "axios";


export const getHotelsByCity = async (cityCode: string) => {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      throw new Error("Backend URL is not defined in environment variables.");
    }

    const response = await axios.get(`${backendUrl}/pms/property/location/${cityCode}`);
    if (response.status === 200) {
      console.log("Hotels fetched successfully in API:", response.data);
      return response.data;
    }else if(response.status == 404){
      throw new Error(response.data.message || "No hotels found.");
    } 
    else {
      throw new Error(response.data.message || "No hotels found.");
    }

  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.message || "Axios request failed.";
      console.error(`Axios error (${status}): ${message}`);
      throw new Error(message);
    } else {
      console.error("Unexpected error:", error);
      throw new Error("Something went wrong while fetching hotels.");
    }
  }
};
