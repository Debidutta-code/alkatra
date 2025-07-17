"use client"

import React, { useState, useEffect } from 'react';
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
import { DeleteSuccessModal } from '../../../../components/propertyId/DeleteSuccessModal';
import { PropertyDetails } from '../../../../components/propertyId/property-details';
import { Amenities } from '../../../../components/propertyId/amenities';
import { Rooms } from '../../../../components/propertyId/rooms';
import { RatePlan } from '../../../../components/propertyId/rate-plan';
import { RoomAmenities } from '../../../../components/propertyId/roomAmenities'
import { Button } from '../../../../components/ui/button';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Address } from '../../../../components/propertyId/address'; // Added this import
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { RootState } from '@src/redux/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../../components/ui/tabs";


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
  const [roomType, setRoomType] = useState<string | null>(null);
  const [availableRoomTypes, setAvailableRoomTypes] = useState<string[]>([]);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState<boolean>(false);


  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const propertyId = params.propertyId;


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

  const handleDeleteClick = async () => {
    try {
      if (!accessToken) {
        console.error('Access token is undefined or not set');
        return;
      }
      const propertyId = params.propertyId;

      await deleteProperty(propertyId, accessToken);
      toast.success('Property deleted successfully!'); // Display toast message

      // Show the modal instead of navigating immediately
      setShowDeleteSuccessModal(true);
    } catch (error) {
      console.error('Error deleting property:', error);
      toast.error('Failed to delete property. Please try again.');
    }
  };

  // Add these handler functions
  const handleCreateProperty = () => {
    setShowDeleteSuccessModal(false);
    router.push('/app/property/create');
  };

  const handleGoBack = () => {
    setShowDeleteSuccessModal(false);
    router.push('/app');
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

  useEffect(() => {
    if (rooms && rooms.length > 0) {
      const roomTypes = Object.values(rooms[0] || {})
        .map((room: any) => room.room_type)
        .filter((type: string, index: number, array: string[]) => array.indexOf(type) === index);
      setAvailableRoomTypes(roomTypes);
    }
  }, [rooms]);

  // Handlers for rooms
  const handleAddRoom = async (newRoom: RoomType) => {
    try {
      if (!accessToken) {
        console.error('Access token is undefined or not set');
        return;
      }
      const addedRoom = await addPropertyRoom(params.propertyId, accessToken, newRoom);
      // (addedRoom !== null ?
      //   toast.success('Room added successfully!') : toast.error('Room could not be added!')
      // );
      setRooms((prevRooms) => {
        const roomContainer = prevRooms[0] || {};
        const newKey = Object.keys(roomContainer).length;
        return [{ ...roomContainer, [newKey]: addedRoom.new_room }];
      });
      // Store room_type and open RoomAmenities modal
      setRoomType(addedRoom.new_room.room_type);
      setEditRoomAmenityMode(true); // Open RoomAmenities modal
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
  const handleBack = () => {
    window.history.back();
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
      const createdRoomAmenity = await createPropertyRoomAmenity(params.propertyId, accessToken, newRoomAmenity,);
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
      {/* Header with back button and breadcrumb */}
      <header className="sticky top-0 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto pr-4 sm:pr-6 lg:pr-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="bg-slate-100 hover:bg-slate-100/80 transition-all duration-200 rounded-lg px-3 py-2"
                aria-label="Go back to previous page"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> */}
      <div className="grid grid-cols-1 gap-4">
        <div>
          <PropertyImageGallery image={property?.data?.image} />
        </div>

        {/* <div className="flex flex-col md:flex-row gap-2 items-center"> */}
        {/* Quick Action Buttons */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>
                Manage your property's rate and inventory allotment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Button
                  variant="default"
                  onClick={() => router.push(`/app/rate-plan/map-rate-plan`)}
                  className="bg-tripswift-blue hover:bg-tripswift-blue-600 text-white"
                >
                  Rate and Inventory Allotment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* <div className="mb-4 mt-4">
            <Button
              variant="default"
              onClick={() => router.push(`/app/rate-plan/map-rate-plan`)}
              className="bg-tripswift-blue hover:bg-tripswift-blue-600 text-white mx-2"
              >
              Rate and Inventory Allotment
            </Button>
          </div> */}

        {/* Main Content Tabs */}
        <Tabs className="space-y-6" defaultValue="overview">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 h-auto p-1 bg-slate-100">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="address"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
              >
                Address
              </TabsTrigger>
              <TabsTrigger
                value="amenities"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
              >
                Amenities
              </TabsTrigger>
              <TabsTrigger
                value="rooms"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
              >
                Rooms
              </TabsTrigger>
              <TabsTrigger
                value="room-amenities"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
              >
                Room Amenities
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="animate-fade-in">
            <TabsContent value="overview" className="mt-6 space-y-6">
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
            </TabsContent>

            <TabsContent value="address" className="mt-6">
              <Address
                address={address}
                editedAddress={editedAddress}
                editAddressMode={editAddressMode}
                handleAddressInputChange={handleAddressInputChange}
                handleAddressSaveClick={handleAddressSaveClick}
                handleAddressEditClick={handleAddressEditClick}
                handleAddressAddClick={handleAddressAddClick}
              />
            </TabsContent>

            <TabsContent value="amenities" className="mt-6">
              <Amenities
                property={property}
                amenity={amenity}
                setAmenity={setAmenity}
                editedAmenity={editedAmenity}
                editAmenityMode={editAmenityMode}
                handleAmenityEditClick={handleAmenityEditClick}
                handleAmenityInputChange={handleAmenityInputChange}
                handleAmenitySaveClick={handleAmenitySaveClick}
                handleCreateAmenity={handleCreateAmenity}
              />
            </TabsContent>

            <TabsContent value="rooms" className="mt-6">
              <Rooms
                rooms={rooms}
                onAddRoom={handleAddRoom}
                onEditRoom={handleEditRoom}
                onDeleteRoom={handleDeleteRoom}
              />
            </TabsContent>

            <TabsContent value="room-amenities" className="mt-6">
              <RoomAmenities
                roomAmenities={roomAmenity}
                editedRoomAmenity={roomAmenity}
                editRoomAmenityMode={editRoomAmenityMode}
                handleRoomAmenityEditClick={handleRoomAmenityEditClick}
                propertyInfoId={propertyId}
                accessToken={accessToken as string}
                availableRoomTypes={availableRoomTypes}
              />
            </TabsContent>
          </div>
        </Tabs>
        {/* </div> */}
      </div>
      {/* Danger Zone */}
      <Card className="border-red-200 bg-red-50/50 mt-8">
        <CardHeader>
          {/* <CardTitle className="text-red-700 flex items-center">
              <Trash2 className="h-5 w-5 mr-2" />
              Danger Zone
            </CardTitle> */}
          <CardDescription className="text-red-600">
            Deleting this property will remove all associated data permanently. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={handleDeleteClick}
            className="bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Property
          </Button>
        </CardContent>
      </Card>
      <DeleteSuccessModal
        isOpen={showDeleteSuccessModal}
        onCreateProperty={handleCreateProperty}
        onGoBack={handleGoBack}
      />
    </main>
  );
}