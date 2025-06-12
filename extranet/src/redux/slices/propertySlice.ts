import { Draft, PayloadAction, createSlice } from "@reduxjs/toolkit";

import axios from "axios";
import { store } from "../store";
import type { User } from "./authSlice";
import { jwtDecode } from "jwt-decode";

export type Property = {
  _id: string;
  user_id: User | {};
  property_name: string;
  property_email: string;
  property_contact: number;
  star_rating: string;
  property_code: string;
  property_address: any;
  property_aminite: any;
  property_room: any;
  image: string[];
  description: string;
  isDraft: boolean;
};

type PropertyState = {
  properties: Property[] | [];
  draftProperties: Property[] | [];
  allProperties: Property[] | []; // For superAdmin to see all properties
  teamProperties: Property[] | []; // For groupManager to see team properties
  loading: boolean;
  error: string | null;
  propertyCode:string|null;
};

const initialState: PropertyState = {
  propertyCode:"",
  properties: [],
  draftProperties: [],
  allProperties: [],
  teamProperties: [],
  loading: false,
  error: null,
};

const propertySlice = createSlice({
  name: "propertySlice",
  initialState,
  reducers: {
    setPropertyCode(
      state: Draft<typeof initialState>,
      action: PayloadAction<typeof initialState.propertyCode>
    ){


      state.propertyCode=action.payload
    },
    setProperties(
      state: Draft<typeof initialState>,
      action: PayloadAction<typeof initialState.properties>
    ) {
      state.properties = action.payload;
    },
    setDraftProperties(
      state: Draft<typeof initialState>,
      action: PayloadAction<typeof initialState.draftProperties>
    ) {
      state.draftProperties = action.payload;
    },
    setAllProperties(
      state: Draft<typeof initialState>,
      action: PayloadAction<typeof initialState.allProperties>
    ) {
      state.allProperties = action.payload;
    },
    setTeamProperties(
      state: Draft<typeof initialState>,
      action: PayloadAction<typeof initialState.teamProperties>
    ) {
      state.teamProperties = action.payload;
    },
    setLoading(
      state: Draft<typeof initialState>,
      action: PayloadAction<boolean>
    ) {
      state.loading = action.payload;
    },
    setError(
      state: Draft<typeof initialState>,
      action: PayloadAction<string | null>
    ) {
      state.error = action.payload;
    },
  },
});

export const {
  setProperties,
  setDraftProperties,
  setAllProperties,
  setTeamProperties,
  setLoading,
  setError,
} = propertySlice.actions;

export const getProperties =
  () =>
  async (dispatch: typeof store.dispatch, getState: typeof store.getState) => {
    try {
      dispatch(setLoading(true));
      const state = getState();
      const { accessToken } = state.auth;
      const currentUser = state.auth.user;

      if (!accessToken) {
        dispatch(setError("No access token found"));
        dispatch(setLoading(false));
        return;
      }

      // Get own properties (works for all roles)
      const myPropertiesResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/property/me`,
        {
          headers: {
            Authorization: "Bearer " + accessToken,
          },
        }
      );

      const { properties, draftProperties } = myPropertiesResponse.data.data;
      dispatch(setProperties(properties));
      dispatch(setDraftProperties(draftProperties));

      // CASE 1: Handle superAdmin role - Get all properties
      if (currentUser?.role === "superAdmin") {
        try {
          const allPropertiesResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/property/properties`,
            {
              headers: {
                Authorization: "Bearer " + accessToken,
              },
            }
          );

          const allProperties = allPropertiesResponse.data.data || [];
          dispatch(setAllProperties(allProperties));

          // Update draftProperties to include all properties
          dispatch(setDraftProperties([...draftProperties, ...allProperties]));
        } catch (error) {
          console.error("Error fetching all properties:", error);
          dispatch(setError("Failed to fetch all properties"));
        }
      }
      // CASE 2: Handle groupManager role - Get team properties
      else if (currentUser?.role === "groupManager") {
        try {
          // Get manager's email from token
          let managerEmail = "";
          try {
            const decoded = jwtDecode<{ email: string }>(accessToken);
            managerEmail = decoded.email;
          } catch (error) {
            console.error("Error decoding token:", error);
            dispatch(setError("Failed to decode token"));
            dispatch(setLoading(false));
            return;
          }

          // Step 1: Get all users
          const usersResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/user`,
            {
              headers: {
                Authorization: "Bearer " + accessToken,
              },
            }
          ); // Step 2: Filter users by createdBy field matching manager's email
          const teamUsers = usersResponse.data.data.users.filter(
            (user: any) => user.createdBy === managerEmail
          );

          console.log("Manager Email:", managerEmail);
          console.log("Team Users found:", teamUsers);

          // Step 3: Fetch properties for each team member
          const teamProperties: Property[] = [];

          // Fetch all properties
          const allPropertiesResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/property/properties`,
            {
              headers: {
                Authorization: "Bearer " + accessToken,
              },
            }
          ); // Get all properties
          const allProperties = allPropertiesResponse.data.data || [];
          console.log("All properties count:", allProperties.length);

          // Log some sample properties to examine their structure
          if (allProperties.length > 0) {
            console.log("Sample property structure:", allProperties[0]);
            if (typeof allProperties[0].user_id === "object") {
              console.log("Sample property user_id:", allProperties[0].user_id);
            }
          } // Get team user IDs - User IDs are returned as 'id' in the API response
          const teamUserIds = teamUsers.map((user: any) => user.id || user._id);
          console.log("Team user IDs:", teamUserIds);

          // Filter properties created by team members
          const filteredTeamProperties = allProperties.filter(
            (property: Property) => {
              // Check if property.user_id is a string or an object
              if (typeof property.user_id === "string") {
                return teamUserIds.includes(property.user_id);
              } else if (
                property.user_id &&
                typeof property.user_id === "object"
              ) {
                // If it's an object, check both id and _id fields
                const userId =
                  (property.user_id as any)._id || (property.user_id as any).id;
                return teamUserIds.includes(userId);
              }
              return false;
            }
          );

          console.log("Filtered team properties:", filteredTeamProperties);

          // Add filtered properties to teamProperties
          teamProperties.push(...filteredTeamProperties);

          dispatch(setTeamProperties(teamProperties));

          // Update draftProperties to include team properties
          const combinedProperties = [...draftProperties, ...teamProperties];

          // Remove duplicates by _id
          const uniqueProperties = Array.from(
            new Map(
              combinedProperties.map((property) => [property._id, property])
            ).values()
          );

          dispatch(setDraftProperties(uniqueProperties));
        } catch (error) {
          console.error("Error fetching team properties:", error);
          dispatch(setError("Failed to fetch team properties"));
        }
      }
    } catch (error) {
      console.error("Error in getProperties:", error);
      dispatch(setError("Failed to fetch properties"));
    } finally {
      dispatch(setLoading(false));
    }
  };

export default propertySlice.reducer;
