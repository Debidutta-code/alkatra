"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { RoomCard } from "@/components/AppComponent/RoomCard";
import GuestInformationModal from "@/components/bookingComponents/GuestInformationModal";
import { useDispatch } from "react-redux";
import { setAmount, setRoomId } from "@/Redux/slices/pmsHotelCard.slice";

interface Room {
  _id: string;
  propertyInfo_id: string;
  room_name: string;
  room_type: string;
  total_room: number;
  floor: number;
  room_view: string;
  room_size: number;
  room_unit: string;
  smoking_policy: string;
  max_occupancy: number;
  max_number_of_adults: number;
  max_number_of_children: number;
  number_of_bedrooms: number;
  number_of_living_room: number;
  extra_bed: number;
  description: string;
  image: string[];
  available: boolean;
  rateplan_created: boolean;
  room_price: number;
  amenities?: string[]; // Make amenities optional
}

// Define the RoomData type to match what RoomCard expects
interface RoomData {
  _id: string;
  propertyInfo_id: string;
  room_name: string;
  room_type: string;
  total_room: number;
  floor: number;
  room_view: string;
  room_size: number;
  room_unit: string;
  smoking_policy: string;
  max_occupancy: number;
  max_number_of_adults: number;
  max_number_of_children: number;
  number_of_bedrooms: number;
  number_of_living_room: number;
  extra_bed: number;
  description: string;
  image: string[];
  available: boolean;
  rateplan_created: boolean;
  cancellation_policy?: string;
  original_price?: number;
  discount_percentage?: number;
  rating?: number;
  amenities?: { icon: string; name: string; }[];
  room_details_url?: string;
  default_image_url?: string;
}

interface RoomResponse {
  success: boolean;
  data: Room[];
}

const RoomsPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get("id");
  const checkInDate = searchParams.get("checkin") || "2024-11-20";
  const checkOutDate = searchParams.get("checkout") || "2024-12-24";
  const adults = Number(searchParams.get("adults")) || 1;

  const [rooms, setRooms] = useState<RoomResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchRooms = async () => {
      if (!propertyId) return;
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/room/rooms_by_propertyId/${propertyId}`
        );
        setRooms(response.data);
      } catch (error) {
        console.error("Error fetching rooms:", error);
        setRooms({ success: true, data: [] });
      } finally {
        setIsLoading(false);
      }
    };
    fetchRooms();
  }, [propertyId]);

  // Helper function to convert string[] amenities to the expected format
  const convertAmenities = (room: Room) => {
    // Map string amenities to objects with icon and name properties
    const convertedAmenities = room.amenities?.map(amenity => {
      // Default mapping of amenity strings to icon names
      const getIconName = (amenityName: string) => {
        const amenityLower = amenityName.toLowerCase();
        if (amenityLower.includes('wifi')) return 'wifi';
        if (amenityLower.includes('air') || amenityLower.includes('ac')) return 'snowflake';
        if (amenityLower.includes('smoking')) return 'smoking-ban';
        if (amenityLower.includes('bed')) return 'bed';
        if (amenityLower.includes('view')) return 'tree';
        // Default icon if no match
        return 'check-circle';
      };

      return {
        icon: getIconName(amenity),
        name: amenity
      };
    });

    // Create a new object that matches the RoomData interface
    return {
      ...room,
      amenities: convertedAmenities
    } as unknown as RoomData;
  };

  const handleBookNow = (room: Room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
    dispatch(setRoomId(room._id));
    dispatch(setAmount(room.room_price.toString()));
  };

  const confirmBooking = (formData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }) => {
    if (selectedRoom) {
      const queryParams = new URLSearchParams({
        amount: selectedRoom.room_price.toString(),
        currency: "INR",
        checkIn: checkInDate,
        checkOut: checkOutDate,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
      }).toString();

      router.push(`/payment?${queryParams}`);
    }
  };

  return (
    <div className="container mx-auto mt-2 px-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-2 p-4">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-800">Available Rooms</h1>
        <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
          <div className="flex items-center bg-blue-500 text-white px-3 py-1 rounded-full text-xs md:text-sm">
            <span>{rooms?.data?.length || 0} results</span>
          </div>
          <div className="flex items-center bg-red-500 text-white px-3 py-1 rounded-full text-xs md:text-sm">
            <span>{checkInDate}</span>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-gray-300 h-96 rounded-lg animate-pulse"></div>
          ))}
        </div>
      )}

      {!isLoading && (!rooms?.data || rooms.data.length === 0) && (
        <p className="text-center text-xl">No rooms available for these dates.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms?.data?.map((room) => (
          <RoomCard
            key={room._id}
            data={convertAmenities(room)} // Convert to the expected format
            price={`₹${room.room_price}`} // Format price with currency symbol
            onBookNow={() => handleBookNow(room)}
          />
        ))}
      </div>

      {/* Using the new GuestInformationModal component */}
      <GuestInformationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedRoom={selectedRoom}
        onConfirmBooking={confirmBooking}
      />
    </div>
  );
};

export default RoomsPage;