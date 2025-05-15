import { RootState } from "@src/redux/store";
import Cookies from "js-cookie";
import { useSelector } from "react-redux";
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
// const BASE_URL = "${backendUrl}";

// Define Room interface
interface Room {
    _id: string;
    room_name: string;
    room_type: string;
}

// Define Property interface
interface Property {
    _id: string;
    property_name: string;
}

// Define Latest Booking interface
interface LatestBooking {
    _id: string;
    booking_user_name: string;
    amount: number;
    booking_dates: string;
    status: string;
    checkInDate?: string; 
    checkOutDate?: string; 
    property?: Property; 
    room?: Room;
}

// Define Revenue Details interface
interface RevenueDetail {
    _id: string;
    totalAmount: number;
    status: string[];
    property_name: string;
}

// Owner Revenue Response
interface OwnerRevenue {
    success: boolean;
    totalRevenue: number;
    latestBookings: LatestBooking[];
    revenueDetails: RevenueDetail[];
}

// Property Revenue Response
interface PropertyRevenue {
    success: boolean;
    totalRevenue: number;
    totalBookings: number;
    totalPages: number;
    currentPage: number;
    bookingDetails: LatestBooking[];
}

// Helper function to build the query string with filters
const buildQueryString = (filters: { [key: string]: string | undefined }) => {
    const query = Object.entries(filters)
        .filter(([_, value]) => value !== undefined && value !== "")
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value!)}`)
        .join("&");
    return query ? `?${query}` : "";
};

// Fetch Revenue Data for Owner
export const fetchOwnerRevenue = async (filters: {
    startDate?: string;
    endDate?: string;
    guestName?: string;
    roomId?: string;
}, accessToken: string): Promise<OwnerRevenue | null> => {
    try {
        const ownerId = Cookies.get("ownerId");
        // const accessToken = Cookies.get("accessToken");
        // const accessToken = useSelector((state: RootState) => state.auth.accessToken);
        if (!ownerId || !accessToken) {
            console.error("Owner ID or Access Token not found! Redirecting to login...");
            return null;
        }

        const queryString = buildQueryString({
            page: "1",
            limit: "5",
            ...filters,
        });

        const response = await fetch(`${backendUrl}/booking/owner/revenue/${ownerId}${queryString}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch owner revenue data: ${errorText}`);
        }

        const data: OwnerRevenue = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching owner revenue:", error);
        return null;
    }
};

// Fetch Revenue Data for Property
export const fetchPropertyRevenue = async (
propertyId: string, filters: {
    startDate?: string;
    endDate?: string;
    guestName?: string;
    roomId?: string;
}, accessToken: string): Promise<PropertyRevenue | null> => {
    try {
        // const accessToken = Cookies.get("accessToken");
        // const accessToken = useSelector((state: RootState) => state.auth.accessToken);
        if (!propertyId || !accessToken) return null;

        // Create base query params
        const baseParams = {
            page: "1",
            limit: "5",
            guestName: filters.guestName,
            roomId: filters.roomId
        };

        // Handle date filters - only add if both are present
        const dateFilters = (filters.startDate && filters.endDate) 
            ? { startDate: filters.startDate, endDate: filters.endDate }
            : {};

        // Combine all parameters
        const queryParams = {
            ...baseParams,
            ...dateFilters
        };

        // Build query string with proper type safety
        const queryString = Object.entries(queryParams)
            .filter((entry): entry is [string, string] => 
                entry[1] !== undefined && entry[1] !== ""
            )
            .map(([key, value]) => 
                `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
            )
            .join("&");

        const response = await fetch(
            `${backendUrl}/booking/property/revenue/${propertyId}${queryString ? `?${queryString}` : ""}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch property revenue data: ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching property revenue:", error);
        return null;
    }
};