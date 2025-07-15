import axios from 'axios';
import { EditedAmenity } from './page';

// Interface for address update data
interface AddressUpdateData {
  address_line_1: string;
  address_line_2: string;
  landmark: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zip_code: string;
}
interface AddressAddData {
  property_id: string;
  address_line_1: string;
  address_line_2: string;
  landmark: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zip_code: string;
}

// Interface for room amenity data
interface RoomAmenityData {
  bed: "single" | "double" | "king" | "twin" | "queen";
  bathroom: boolean;
  towels: boolean;
  linensBedding: boolean;
  tableChairs: boolean;
  desk: boolean;
  dresserWardrobe: boolean;
  sofaSeating: boolean;
  television: boolean;
  telephone: boolean;
  wifiInternet: boolean;
  airConditioning: boolean;
  heating: boolean;
  smallRefrigerator: boolean;
  microwave: boolean;
  coffeeMaker: boolean;
  safe: boolean;
  smokeDetectors: boolean;
  fireExtinguisher: boolean;
  shampooConditioner: boolean;
  soap: boolean;
  hairdryer: boolean;
  workDesk: boolean;
  readingChair: boolean;
  additionalLighting: boolean;
  accessibleBathroom: boolean;
  wheelchairAccessibility: boolean;
}

// Interface for rate plan update data
interface UpdateRatePlan {
  adultPrice?: number;
  childrenPrice?: number;
  breakfastPrice?: number;
  lunchPrice?: number;
  dinnerPrice?: number;
}

// Interface for profile update data
interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
}




// Fetch a specific property by ID
export async function fetchProperty(accessToken: string, propertyId: string) {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/property/${propertyId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(`Error fetching property: ${error.message}`);
  }
}

// Delete a property
export async function deleteProperty(propertyId: string, accessToken: string) {
  try {
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/property/${propertyId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(`Error deleting property: ${error.message}`);
  }
}

// Property Details
// Update a property's details
export async function updateProperty(propertyId: string, accessToken: string, updatedData: any) {
  try {
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/property/${propertyId}`,
      updatedData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(`Error updating property: ${error.message}`);
  }
}

// Update a property's amenities
export async function updatePropertyAmenity(propertyId: string, accessToken: string, updatedData: any) {
  try {
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/property/Aminity/${propertyId}`,
      updatedData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(`Error updating property amenity: ${error.message}`);
  }
}

// Delete a room from a property
export async function deletePropertyRoom(roomId: string, accessToken: string) {
  try {
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/room/${roomId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(`Error deleting property room: ${error.message}`);
  }
}

// Update user profile
export async function updateProfile(accessToken: string, updatedData: UpdateProfileData) {
  try {
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/update`,
      updatedData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(`Error updating profile: ${error.message}`);
  }
}

// Add a new room to a property
export async function addPropertyRoom(propertyId: string, accessToken: string, newRoomData: any) {
  try {
    console.log("new Room Data",newRoomData);
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/room/${propertyId}`,
      newRoomData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    console.log("data we get from backend when we add a room", response.data)
    return response.data;
  } catch (error: any) {
    throw new Error(`Error adding property room: ${error.message}`);
  }
}

// Update a room in a property
export async function updatePropertyRoom(propertyId: string, accessToken: string, updatedData: any) {
  try {
    console.log("updated data we get",updatedData)
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/room/${propertyId}?roomId=${updatedData._id}`,
      updatedData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(`Error updating property room: ${error.message}`);
  }
}


// Create property amenities
export async function createPropertyAmenity(propertyId: string, accessToken: string, newAmenity: EditedAmenity) {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/property/amenities`,
      newAmenity,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(`Error creating property amenity: ${error.message}`);
  }
}

//Room Amenities API

// Update property room amenities
export async function updatePropertyRoomAmenity(propertyId: string, accessToken: string, updatedData: RoomAmenityData) {
  try {
    const newAmenity = {...updatedData, propertyInfo_id: propertyId, }
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/amenite/roomaminity`,
      newAmenity,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(`Error updating property room amenity: ${error.message}`);
  }
}

// Create property room amenities
export async function createPropertyRoomAmenity(propertyId: string, accessToken: string, newRoomAmenity: RoomAmenityData) {
  try {
    const newAmenity = {...newRoomAmenity, propertyInfo_id: propertyId}
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/amenite/roomaminity`,
      newAmenity,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(`Error creating property room amenity: ${error.message}`);
  }
}

// Update property address
export async function updatePropertyAddress(propertyId: string, accessToken: string, updatedAddress: AddressUpdateData) {
  try {
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/property/address/${propertyId}`,
      updatedAddress,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    // console.error('Error updating property address:', error.response?.data || error.message);
    throw new Error(`Error updating property address: ${error.message}`);
  }
}

export async function addPropertyAddress(accessToken: string, newPropertyAddress: AddressAddData) {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/property/address`,
      newPropertyAddress,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    // console.error('Error updating property address:', error.response?.data || error.message);
    throw new Error(`Error updating property address: ${error.message}`);
  }
}


// Rate Plan

// Fetch price by property ID
export async function fetchPriceById(propertyID: string) {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/property/price/${propertyID}`
    );
    return response.data.priceList;
  } catch (error: any) {
    throw new Error(`Error fetching rate plans: ${error.message}`);
  }
}

// Create rate plan for a property
export async function addRatePlan(propertyId: string, accessToken: string, newRatePlan: UpdateRatePlan) {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/property/price/${propertyId}`,
      newRatePlan,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(`Error updating rate plan: ${error.message}`);
  }
}

// Update rate plan for a property
export async function updateRatePlan(propertyId: string, accessToken: string, editedRatePlan: UpdateRatePlan) {
  try {
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/property/price/${propertyId}`,
      editedRatePlan,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(`Error updating rate plan: ${error.message}`);
  }
}

// Fetch all rate plans for an owner
export async function fetchAllRatePlanOfOwner(accessToken: string) {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/price/getAll`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data.priceList;
  } catch (error: any) {
    throw new Error(`Error fetching rate plans: ${error.message}`);
  }
}
