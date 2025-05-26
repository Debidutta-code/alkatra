"use client"

import React, { useState, useEffect } from 'react';
import Breadcrumbs from '../../../../components/ui/breadcrumbs';
import { PropertyImageGallery } from './photo-img-gallery';
import {
  fetchProperty,
  updateProperty,
  updatePropertyAmenity,
  updatePropertyRoom,
  deletePropertyRoom,
  fetchAllRatePlanOfOwner,
  addPropertyRoom,
  deleteProperty,
  createPropertyAmenity,
  updatePropertyRoomAmenity,
  createPropertyRoomAmenity,
  updatePropertyAddress,
  addPropertyAddress,
  updateRatePlan,
  fetchPriceById,
  addRatePlan
} from './api';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { PropertyDetails } from '../../../../components/propertyId/property-details';
import { Amenities } from '../../../../components/propertyId/amenities';
import { Rooms } from '../../../../components/propertyId/rooms';
import { RatePlan } from '../../../../components/propertyId/rate-plan';
import { RoomAmenities } from '../../../../components/propertyId/roomAmenities'
import { Button } from '../../../../components/ui/button';
import { Trash2 } from 'lucide-react';
import { Address } from '../../../../components/propertyId/address'; // Added this import
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { RootState } from '@src/redux/store';

// Define types for our component props and state
interface RatePlanType {
  _id: string,
  property_id: string,
  applicable_room_type: string,
  applicable_room_name: string,
  meal_plan: string,
  room_price: number,
  rate_plan_name: string,
  rate_plan_description: string,
  min_length_stay: number,
  max_length_stay: number,
  min_book_advance: number,
  max_book_advance: number
}

// interface for room
export interface RoomType {
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
}

export interface EditedAmenity {
  destination_type: string;
  property_type: string;
  no_of_rooms_available: number;
  amenities: {
    wifi?: boolean;
    swimming_pool?: boolean;
    fitness_center?: boolean;
    spa_and_wellness?: boolean;
    restaurant?: boolean;
    room_service?: boolean;
    bar_and_lounge?: boolean;
    parking?: boolean;
    concierge_services?: boolean;
    pet_friendly?: boolean;
    business_facilities?: boolean;
    laundry_services?: boolean;
    child_friendly_facilities?: boolean;
  }
}

interface AddressData {
  address_line_1: string;
  address_line_2: string;
  landmark: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zip_code: string;
}

type Props = {
  params: {
    propertyId: string;
  };
  searchParams: {
    token: string;
  };
};

export default function Page({ params, searchParams }: Props) {
  const router = useRouter();

  // State declarations
  const [property, setProperty] = useState<any>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editedProperty, setEditedProperty] = useState<any>(null);
  const [ratePlan, setRatePlan] = useState<RatePlanType | []>([]);
  const [ratePlanList, setRatePlanList] = useState<RatePlanType[]>([]);
  const [amenity, setAmenity] = useState<any>(null);
  const [editAmenityMode, setEditAmenityMode] = useState<boolean>(false);
  const [editedAmenity, setEditedAmenity] = useState<any>(null);
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [roomAmenity, setRoomAmenity] = useState<any>(null);
  const [editRoomAmenityMode, setEditRoomAmenityMode] = useState<boolean>(false);
  const [editedRoomAmenity, setEditedRoomAmenity] = useState<any>(null);
  const [address, setAddress] = useState<AddressData | null>(null);
  const [editedAddress, setEditedAddress] = useState<AddressData | null>(null);
  const [editAddressMode, setEditAddressMode] = useState<boolean>(false);

  // Get access token from cookies
  // const accessToken = Cookies.get('accessToken');
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const propertyId = params.propertyId;
  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!accessToken) {
          console.error('Access token is undefined or not set');
          return;
        }

        const propertyData = await fetchProperty(accessToken, propertyId);
        // const ratePlanList = await fetchAllRatePlanOfOwner(accessToken);
        // const choosedRatePlan = await fetchPriceById(params.propertyId);

        // Set state with fetched data
        console.log("property data at property page", propertyData.data.rate_plan)
        setProperty(propertyData);
        setRatePlanList(propertyData.data.rate_plan);
        setEditedProperty({ ...propertyData.data });
        setAmenity(propertyData.data.property_amenities);
        setEditedAmenity({ ...propertyData.data.property_amenities });

        // Set address data
        setAddress(propertyData.data.property_address);
        setEditedAddress({ ...propertyData.data.property_address });
        console.log("property datat", propertyData)
        console.log("before use effect the room data", Rooms)
        if (propertyData.data.property_room) {
          setRooms([{ ...propertyData.data.property_room }]);
        }

        if (propertyData.data.room_Aminity) {
          setRoomAmenity(propertyData.data.room_Aminity);
          setEditedRoomAmenity({ ...propertyData.data.room_Aminity });
        }
      }
      catch (error: any) {
        if (error.code === 'ECONNRESET') {
          console.log('Connection reset, retrying...');
          // Retry logic here
          fetchData();
        } else {
          console.error('Error fetching property data:', error);
        }
      }
    };

    fetchData();
  }, [propertyId, accessToken]);

  // Handlers for address
  const handleAddressEditClick = () => setEditAddressMode(!editAddressMode);

  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedAddress(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleAddressSaveClick = async () => {
    try {
      if (!accessToken || !editedAddress) {
        console.error('Access token is undefined or not set, or editedAddress is null');
        return;
      }
      const updateAmenityResponse = await updatePropertyAddress(params.propertyId, accessToken, editedAddress);
      console.log("updateAmenityResponse", updateAmenityResponse)
      setEditAddressMode(false);
      setAddress({ ...editedAddress });
    } catch (error) {
      console.error('Error updating address data:', error);
    }
  };

  const handleAddressAddClick = async (e: any) => {
    // e.preventDefault()
    try {
      if (!accessToken || !editedAddress) {
        console.error('Access token is undefined or not set, or editedAddress is null');
        return;
      }

      const newPropertyAddress = {
        ...editedAddress,
        property_id: params.propertyId
      }
      const newAddress = await addPropertyAddress(accessToken, newPropertyAddress);

      setEditAddressMode(false);
      setAddress(newAddress);
    } catch (error) {
      console.error('Error updating address data:', error);
    }
  };

  // Handler for deleting the property
  const handleDeleteClick = async () => {
    try {
      if (!accessToken) {
        console.error('Access token is undefined or not set');
        return;
      }
      const propertyId = params.propertyId;

      await deleteProperty(propertyId, accessToken);
      toast.success('Property deleted successfully!'); // Display toast message
      router.push('/app/property');
    } catch (error) {
      console.error('Error deleting property:', error);
    }
  };

  // Handlers for property details
  const handleEditClick = () => setEditMode(!editMode);
  const handleSaveClick = async () => {
    try {
      if (!accessToken) {
        console.error('Access token is undefined or not set');
        return;
      }
      const response = await updateProperty(params.propertyId, accessToken, editedProperty);
      console.log(response.data)
      setEditMode(false);
      setProperty({ data: { ...editedProperty } });
      if (response.data) {
        toast.success('Property updated successfully!');
      }
    } catch (error) {
      console.error('Error updating property data:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedProperty({ ...editedProperty, [name]: value });
  };

  // Handlers for amenities
  const handleAmenityEditClick = () => setEditAmenityMode(!editAmenityMode);

  const handleAmenityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setEditedAmenity({ ...editedAmenity, [name]: type === "checkbox" ? checked : value });
  };

  const handleAmenitySaveClick = async (data: EditedAmenity) => {
    try {
      if (!accessToken) {
        console.error('Access token is undefined or not set');
        return;
      }
      const updateAmenityResponse = await updatePropertyAmenity(params.propertyId, accessToken, data);
      setEditAmenityMode(false);
      setAmenity(updateAmenityResponse.data);
      setProperty((prev: any) => ({
        ...prev, // Spread previous state to maintain other properties
        property_amenities: updateAmenityResponse.data // Update property_amenities with new data
      }));
    } catch (error) {
      console.error('Error updating amenity data:', error);
    }
  };

  // Handler for creating new amenities
  const handleCreateAmenity = async (data: EditedAmenity) => {
    try {
      if (!accessToken) {
        console.error('Access token is undefined or not set');
        return;
      }

      const amenityCreateBody = {
        ...data,
        propertyInfo_id: params.propertyId,
      };

      const createdAmenity = await createPropertyAmenity(params.propertyId, accessToken, amenityCreateBody);

      setAmenity(createdAmenity);
      setEditedAmenity(createdAmenity);

      // Optionally, refetch the entire property data
      const updatedProperty = await fetchProperty(accessToken, params.propertyId);
      setProperty(updatedProperty);
    } catch (error) {
      console.error('Error creating amenity:', error);
      throw error;
    }
  };


  useEffect(() => {
    console.log("🔥 ROOMS STATE UPDATED:", rooms);
  }, [rooms]);

  const fetchRooms = async () => {
    if (!accessToken) return;
    try {
      const roomsFromApi = await fetchProperty(params.propertyId, accessToken);
      setRooms(roomsFromApi);
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
    }
  };
  // Handlers for rooms
  const handleAddRoom = async (newRoom: RoomType) => {
    try {
      if (!accessToken) {
        console.error('Access token is undefined or not set');
        return;
      }
      // console.log("New Room", newRoom);
      // console.log("property id",params.propertyId)
      const addedRoom = await addPropertyRoom(params.propertyId, accessToken, newRoom);
      // console.log("property id",params.propertyId);
      //     console.log("new room data after property id",newRoom);

      //         console.log("property id",accessToken);


      (addedRoom !== null ?
        toast.success('Room added successfully!') :
        toast.error('Room could not be added!')
      );

      // console.log("room data", addedRoom);
      // console.log("rooms before set",rooms)
      setRooms((prevRooms) => {
        const roomContainer = prevRooms[0] || {};
        const newKey = Object.keys(roomContainer).length;
        return [{ ...roomContainer, [newKey]: addedRoom.new_room }];
      });


      // setRooms((prevRooms)=>[...prevRooms , addedRoom.new_room])
      // console.log("rooms after set",rooms)
    } catch (error) {
      console.error('Error adding new room:', error);
    }
  };

  // console.log("updated room data",rooms)
  const handleEditRoom = async (updatedRoom: RoomType) => {
    try {
      if (!accessToken) {
        console.error('Access token is undefined or not set');
        return;
      }

      const updatedRoomData = await updatePropertyRoom(params.propertyId, accessToken, updatedRoom);

      if (
        !updatedRoomData ||
        !updatedRoomData.updated_room ||
        !updatedRoomData.updated_room._id
      ) {
        throw new Error('Invalid response from updatePropertyRoom');
      }

      setRooms((prevRooms) => {
        const container = { ...prevRooms[0] };
        const updatedRoom = updatedRoomData.updated_room;

        for (const key in container) {
          const room = (container as any)[key] as RoomType;

          if (room._id === updatedRoom._id) {
            (container as any)[key] = updatedRoom;
            break;
          }
        }


        return [container];
      });
    } catch (error) {
      console.error('Error updating room:', error);
    }
  };




  const handleDeleteRoom = async (_id: string) => {
    try {
      if (!accessToken) {
        console.error('Access token is undefined or not set');
        return;
      }

      const deleteRoomResponse = await deletePropertyRoom(_id, accessToken);

      if (deleteRoomResponse.success) {
        toast.success('Room deleted successfully!');

        setRooms((prevRooms) => {
          const container = { ...prevRooms[0] };

          for (const key in container) {
            const room = (container as any)[key] as RoomType;

            if (room._id === _id) {
              delete (container as any)[key];
              break;
            }
          }

          return [container];
        });
      }
    } catch (error) {
      console.error('Error deleting room:', error);
    }
  };




  // Room Amenities handlers
  const handleRoomAmenityEditClick = () => setEditRoomAmenityMode(!editRoomAmenityMode);

  const handleRoomAmenityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedRoomAmenity({ ...editedRoomAmenity, [name]: value });
  };

  const handleRoomAmenitySaveClick = async () => {
    try {
      if (!accessToken) {
        console.error('Access token is undefined or not set');
        return;
      }
      await updatePropertyRoomAmenity(params.propertyId, accessToken, editedRoomAmenity);
      setEditRoomAmenityMode(false);
      setRoomAmenity({ ...editedRoomAmenity });
    } catch (error) {
      console.error('Error updating room amenity data:', error);
    }
  };

  const handleCreateRoomAmenity = async (newRoomAmenity: any) => {
    try {
      if (!accessToken) {
        console.error('Access token is undefined or not set');
        return;
      }
      const createdRoomAmenity = await createPropertyRoomAmenity(params.propertyId, accessToken, newRoomAmenity);
      setRoomAmenity(createdRoomAmenity);
      setEditedRoomAmenity(createdRoomAmenity);
      // Optionally, refetch the entire property data
      const updatedProperty = await fetchProperty(accessToken, params.propertyId);
      setProperty(updatedProperty);
    } catch (error) {
      console.error('Error creating room amenity:', error);
      throw error;
    }
  };

  // Update rate plan 
  const HandleUpdateRatePlan = async (newRatePlan: any) => {
    try {
      if (!accessToken) {
        console.error('Access token is undefined or not set');
        return;
      }
      const updatedRatePlan = await updateRatePlan(params.propertyId, accessToken, newRatePlan);
      console.log("updated rate plan at page.tsxx", updatedRatePlan)
      setRatePlan(updatedRatePlan.newList)

    } catch (error) {
      console.error('Error creating room amenity:', error);
      throw error;
    }
  };

  // Add rate plan 
  const HandleAddRatePlan = async (newRatePlan: any) => {
    try {
      if (!accessToken) {
        console.error('Access token is undefined or not set');
        return;
      }
      const addedRatePlan = await addRatePlan(params.propertyId, accessToken, newRatePlan);
      console.log(addedRatePlan);
      // setRatePlan(newRatePlan.newList)

    } catch (error) {
      console.error('Error creating room amenity:', error);
      throw error;
    }
  };

  // Render the component
  return (
    <main className="py-8 px-4 md:px-8 lg:px-16 xl:px-24">
      <div className="flex items-center justify-between mb-8">
        <Breadcrumbs />
      </div>
      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> */}
      <div className="grid grid-cols-1 gap-4">

        <div>
          <PropertyImageGallery image={property?.data?.image} />
        </div>

        <div className="mt-4">
          <Button
            variant="default"
            onClick={() => router.push(`/app/rate-plan/create-form?propertyId=${propertyId}`)}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            Add/Edit Rate Plan
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {/* Property Details Component */}
          <PropertyDetails
            property={property}
            editedProperty={editedProperty}
            editMode={editMode}
            accessToken={accessToken as string}
            propertyId={propertyId}
            setProperty={setProperty}
            handleInputChange={handleInputChange}
            handleSaveClick={handleSaveClick}
            handleEditClick={handleEditClick}
          />

          {/* Address Component */}
          <Address
            address={address}
            editedAddress={editedAddress}
            editAddressMode={editAddressMode}
            handleAddressInputChange={handleAddressInputChange}
            handleAddressSaveClick={handleAddressSaveClick}
            handleAddressEditClick={handleAddressEditClick}
            handleAddressAddClick={handleAddressAddClick}
          />

          {/* Amenities Component */}
          <Amenities
            property={property}
            amenity={amenity}
            setAmenity={setAmenity}  // Added this line
            editedAmenity={editedAmenity}
            editAmenityMode={editAmenityMode}
            handleAmenityEditClick={handleAmenityEditClick}
            handleAmenityInputChange={handleAmenityInputChange}
            handleAmenitySaveClick={handleAmenitySaveClick}
            handleCreateAmenity={handleCreateAmenity}
          />

          {/* Rooms Component */}
          <Rooms
            rooms={rooms}
            onAddRoom={handleAddRoom}
            onEditRoom={handleEditRoom}
            onDeleteRoom={handleDeleteRoom}
          />

          {/* Room Amenities Component */}
          <RoomAmenities
            roomAmenity={roomAmenity}
            editedRoomAmenity={roomAmenity}
            editRoomAmenityMode={editRoomAmenityMode}
            // handleRoomAmenitySaveClick={handleRoomAmenitySaveClick}
            handleRoomAmenityEditClick={handleRoomAmenityEditClick}
            // handleCreateRoomAmenity={handleCreateRoomAmenity}
            propertyInfoId={propertyId}
            accessToken={accessToken as string}
          />

          {/* Rate Plan Component */}
          <RatePlan
            setRatePlanList={setRatePlanList}
            ratePlanList={ratePlanList}
            rooms={rooms}
            setRatePlan={setRatePlan}
            property_id={propertyId}
            accessToken={accessToken as string}
          // editMode={editRatePlanMode}
          // setEditMode={setEditRatePlanMode}
          // selectedRatePlan={selectedRatePlan}
          // setSelectedRatePlan={setSelectedRatePlan}
          // ratePlan={ratePlan}
          // HandleUpdateRatePlan
          // HandleAddRatePlan={HandleAddRatePlan}
          />
        </div>
      </div>
      {/* Delete Property Button */}
      <div className="mt-8 flex justify-end">
        <Button
          variant="destructive"
          onClick={handleDeleteClick}
          className="bg-red-500 hover:bg-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" /> Delete Property
        </Button>
      </div>
    </main>
  );
}
