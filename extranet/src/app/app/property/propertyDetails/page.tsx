//property/propertyDetails/page.tsx

"use client"

import React, { useState, useEffect } from 'react';
import { PropertyImageGallery } from './photo-img-gallery';
import {
  fetchProperty,
  updateProperty,
  updatePropertyAmenity,
  updatePropertyRoom,
  deletePropertyRoom,
  addPropertyRoom,
  deleteProperty,
  createPropertyAmenity,
  addPropertyAddress,
  updatePropertyAddress
} from './api';
import { useSearchParams, useRouter } from "next/navigation";
import { DeleteSuccessModal } from '../../../../components/propertyId/DeleteSuccessModal';
import { PropertyDetails } from '../../../../components/propertyId/property-details';
import { Amenities } from '../../../../components/propertyId/amenities';
import { Rooms } from '../../../../components/propertyId/rooms';
import { RoomAmenities } from '../../../../components/propertyId/roomAmenities'
import { Button } from '../../../../components/ui/button';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Address } from '../../../../components/propertyId/address';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { RootState } from '@src/redux/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../../components/ui/tabs";
import { Property } from '@src/redux/slices/propertySlice';
import { Triangle } from "react-loader-spinner";
import { PromoCodesSection } from '../../../../components/propertyId/promo-codes/PromoCodesSection';

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
const LoadingState = () => (
  <div className="flex flex-col items-center justify-center py-24 min-h-[60vh]">
    <Triangle
      visible={true}
      height={80}
      width={80}
      color="#076DB3"
      ariaLabel="triangle-loading"
    />
    <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">
      Loading property details...
    </p>
  </div>
);
export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get("propertyId");
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const [property, setProperty] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editedProperty, setEditedProperty] = useState<any>(null);
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
  const [propertyStatus, setPropertyStatus] = useState<"active" | "inactive">("active");

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!accessToken || !propertyId) {
          console.error("Access token or property ID is missing");
          router.push("/login");
          return;
        }
        setIsLoading(true);
        const propertyData = await fetchProperty(accessToken, propertyId);
        setProperty(propertyData);
        setPropertyStatus(propertyData.data.status === "close" ? "inactive" : "active");
        setRatePlanList(propertyData.data.rate_plan);
        setEditedProperty({ ...propertyData.data });
        setAmenity(propertyData.data.property_amenities);
        setEditedAmenity({ ...propertyData.data.property_amenities });
        setAddress(propertyData.data.property_address);
        setEditedAddress({ ...propertyData.data.property_address });
        if (propertyData.data.property_room) {
          setRooms([{ ...propertyData.data.property_room }]);
        }
        if (propertyData.data.room_Aminity) {
          setRoomAmenity(propertyData.data.room_Aminity);
          setEditedRoomAmenity({ ...propertyData.data.room_Aminity });
        }
      } catch (error: any) {
        if (error.code === "ECONNRESET") {
          fetchData();
        } else {
          console.error("Error fetching property data:", error);
          toast.error("Failed to load property data");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [propertyId, accessToken, router]);

  const handleAddressEditClick = () => setEditAddressMode(!editAddressMode);

  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedAddress(prev => prev ? { ...prev, [name]: value } : null);
  };

const handleAddressSaveClick = async () => {
  try {
    if (!accessToken || !editedAddress || !propertyId) {
      console.error("Access token, property ID, or editedAddress is missing");
      toast.error("Missing required data");
      return;
    }
    
    const response = await updatePropertyAddress(
      propertyId, 
      accessToken, 
      editedAddress
    );
    
    setEditAddressMode(false);
    setAddress(response.data || editedAddress); // Use response data
    toast.success("Address updated successfully!");
  } catch (error) {
    console.error("Error updating address data:", error);
    toast.error("Failed to update address");
  }
};

  const handleAddressAddClick = async () => {
    try {
      if (!accessToken || !editedAddress || !propertyId) {
        console.error("Access token, property ID, or editedAddress is missing");
        toast.error("Missing required data");
        return;
      }
      const newPropertyAddress = {
        ...editedAddress,
        property_id: propertyId,
      };
      const newAddress = await addPropertyAddress(accessToken, newPropertyAddress);
      setEditAddressMode(false);
      setAddress(newAddress);
      toast.success("Address added successfully!");
    } catch (error) {
      console.error("Error adding address data:", error);
      toast.error("Failed to add address");
    }
  };
  const handleStatusChange = async (newStatus: "active" | "inactive") => {
    try {
      if (!accessToken || !propertyId) {
        console.error("Access token or property ID is missing");
        toast.error("Missing required data");
        return;
      }
      const statusData = { status: newStatus === "inactive" ? "close" : "open" };
      await updateProperty(propertyId, accessToken, statusData);
      setPropertyStatus(newStatus);
      toast.success(`Property ${newStatus === "active" ? "activated" : "deactivated"} successfully!`);
    } catch (error) {
      console.error("Error updating property status:", error);
      toast.error("Failed to update property status");
    }
  };
  const handleDeleteClick = async () => {
    try {
      if (!accessToken || !propertyId) {
        console.error("Access token or property ID is missing");
        toast.error("Missing required data");
        return;
      }
      await deleteProperty(propertyId, accessToken);
      toast.success("Property deleted successfully!");
      setShowDeleteSuccessModal(true);
    } catch (error) {
      console.error("Error deleting property:", error);
      toast.error("Failed to delete property. Please try again.");
    }
  };

  const handleGoBack = () => {
    setShowDeleteSuccessModal(false);
    router.push('/app');
  };
  const handleEditClick = () => setEditMode(!editMode);
  const handleSaveClick = async () => {
    try {
      if (!accessToken || !propertyId) {
        console.error("Access token or property ID is missing");
        toast.error("Missing required data");
        return;
      }
      setEditMode(false);
      setProperty({ data: { ...editedProperty } } as { data: Property });
      toast.success("Property updated successfully!");
    } catch (error) {
      console.error("Error updating property data:", error);
      toast.error("Failed to update property");
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
      if (!accessToken || !propertyId) {
        console.error("Access token or property ID is missing");
        toast.error("Missing required data");
        return;
      }
      const updateAmenityResponse = await updatePropertyAmenity(propertyId, accessToken, data);
      setEditAmenityMode(false);
      setAmenity(updateAmenityResponse.data);
      setProperty((prev: any) => ({
        ...prev,
        property_amenities: updateAmenityResponse.data,
      }));
      toast.success("Amenities updated successfully!");
    } catch (error) {
      console.error("Error updating amenity data:", error);
      toast.error("Failed to update amenities");
    }
  };

  const handleCreateAmenity = async (data: EditedAmenity) => {
    try {
      if (!accessToken || !propertyId) {
        console.error("Access token or property ID is missing");
        toast.error("Missing required data");
        return;
      }
      const amenityCreateBody = {
        ...data,
        propertyInfo_id: propertyId,
      };
      const createdAmenity = await createPropertyAmenity(propertyId, accessToken, amenityCreateBody);
      setAmenity(createdAmenity);
      setEditedAmenity(createdAmenity);
      const updatedProperty = await fetchProperty(accessToken, propertyId);
      setProperty(updatedProperty);
      toast.success("Amenity created successfully!");
    } catch (error) {
      console.error("Error creating amenity:", error);
      toast.error("Failed to create amenity");
    }
  };


  useEffect(() => {
  }, [rooms]);


  useEffect(() => {
    if (rooms && rooms.length > 0) {
      const roomTypes = Object.values(rooms[0] || {})
        .map((room: any) => room.room_type)
        .filter((type: string, index: number, array: string[]) => array.indexOf(type) === index);
      setAvailableRoomTypes(roomTypes);
    }
  }, [rooms]);

  const handleAddRoom = async (newRoom: RoomType) => {
    try {
      if (!accessToken || !propertyId) {
        console.error("Access token or property ID is missing");
        toast.error("Missing required data");
        return;
      }
      const addedRoom = await addPropertyRoom(propertyId, accessToken, newRoom);
      setRooms((prevRooms) => {
        const roomContainer = prevRooms[0] || {};
        const newKey = Object.keys(roomContainer).length;
        return [{ ...roomContainer, [newKey]: addedRoom.new_room }];
      });
      setRoomType(addedRoom.new_room.room_type);
      setEditRoomAmenityMode(true);
      toast.success("Room added successfully!");
    } catch (error) {
      console.error("Error adding new room:", error);
      toast.error("Failed to add room");
    }
  };

  const handleEditRoom = async (updatedRoom: RoomType) => {
    try {
      if (!accessToken || !propertyId) {
        console.error("Access token or property ID is missing");
        toast.error("Missing required data");
        return;
      }
      const updatedRoomData = await updatePropertyRoom(propertyId, accessToken, updatedRoom);
      if (!updatedRoomData || !updatedRoomData.updated_room || !updatedRoomData.updated_room._id) {
        throw new Error("Invalid response from updatePropertyRoom");
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
      // toast.success("Room updated successfully!");
    } catch (error) {
      console.error("Error updating room:", error);
      toast.error("Failed to update room");
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

  const handleRoomAmenityEditClick = () => setEditRoomAmenityMode(!editRoomAmenityMode);

  const handleRatePlanNavigation = () => {
    if (property?.data?.property_code) {
      router.push(`/app/rate-plan/map-rate-plan?propertyCode=${property.data.property_code}`);
    } else if (propertyId) {
      router.push(`/app/rate-plan/map-rate-plan?propertyCode=${propertyId}`);
    } else {
      toast.error('Property code not found');
    }
  };

  return (
    <main className="py-8 px-4 md:px-8 lg:px-16 xl:px-24">
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

      {isLoading ? (
        <LoadingState />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4">
            <div className="relative">
              <PropertyImageGallery
                image={property?.data?.image || []}
                onImagesUpdate={(updatedImages) => {
                  setEditedProperty((prev: Partial<Property> | null) => ({
                    ...prev,
                    image: updatedImages,
                  }));
                  setProperty((prev: { data: Property } | null) => ({
                    ...prev,
                    data: {
                      ...prev!.data,
                      image: updatedImages,
                    },
                  }));
                }}
                editable={true}
                propertyId={propertyId}
                accessToken={accessToken}
              />
            </div>
            <div className="mb-2">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                  <CardDescription>
                    Manage your property's rate, inventory, and tax settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Button
                      variant="default"
                      onClick={handleRatePlanNavigation}
                      className="bg-tripswift-blue hover:bg-tripswift-blue-600 text-white"
                    >
                      Rate and Inventory Allotment
                    </Button>
                    <Button
                      variant="default"
                      onClick={() =>
                        router.push(`/app/tax-service?propertyId=${propertyId}`)
                      }
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Tax Configuration
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            <Card className="mb-1">
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  Property Status
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${propertyStatus === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                    }`}>
                    {propertyStatus === "active" ? "Active" : "Inactive"}
                  </span>
                </CardTitle>
                <CardDescription>
                  Control whether this property is available for bookings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  {propertyStatus === "active" ? (
                    <Button
                      variant="destructive"
                      onClick={() => handleStatusChange("inactive")}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Deactivate Property
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      onClick={() => handleStatusChange("active")}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Activate Property
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
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
                  <TabsTrigger
                    value="promo-codes"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                  >
                    Promo Codes
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="animate-fade-in">
                <TabsContent value="overview" className="mt-2 space-y-6">
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

                <TabsContent value="address" className="mt-2">
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

                <TabsContent value="amenities" className="mt-2">
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

                <TabsContent value="rooms" className="mt-2">
                  <Rooms
                    rooms={rooms}
                    onAddRoom={handleAddRoom}
                    onEditRoom={handleEditRoom}
                    onDeleteRoom={handleDeleteRoom}
                    accessToken={accessToken as string}
                  />
                </TabsContent>

                <TabsContent value="room-amenities" className="mt-2">
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

                <TabsContent value="promo-codes" className="mt-2">
                  {property?.data?.property_code && accessToken && propertyId ? (
                    <PromoCodesSection
                      propertyId={propertyId}
                      propertyCode={property.data.property_code}
                      accessToken={accessToken}
                    />
                  ) : (
                    <Card>
                      <CardContent className="py-8 text-center text-muted-foreground">
                        {isLoading
                          ? 'Loading property details...'
                          : 'Property code not available. Please ensure property is fully loaded.'}
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </div>
          <Card className="border-red-200 bg-red-50/50 mt-4">
            <CardHeader>
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
            // onCreateProperty={handleCreateProperty}
            onGoBack={handleGoBack}
          />
        </>
      )}
    </main>
  );
}