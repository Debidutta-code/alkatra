import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Checkbox } from "../../components/ui/checkbox";
import { Label } from "../../components/ui/label";
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Plus, Save, Trash2, Upload, PenTool } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";

// Define the RoomType interface
interface RoomType {
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

interface RoomsProps {
  rooms: RoomType[];
  onAddRoom: (room: RoomType) => Promise<void>;
  onEditRoom: (room: RoomType) => Promise<void>;
  onDeleteRoom: (id: string) => Promise<void>;
}

function convertObjectOfObjectsToArray(obj: any): RoomType[] {
  if (obj && typeof obj === 'object') {
    return Object.values(obj);
  }
  return []; // Return an empty array if input is undefined or null
}

export function Rooms({ rooms, onAddRoom, onEditRoom, onDeleteRoom }: RoomsProps) {
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [newRoom, setNewRoom] = useState<RoomType>({
    _id: "",
    propertyInfo_id: "",
    room_name: "",
    room_type: "",
    total_room: 0,
    floor: 0,
    room_view: "",
    room_size: 0,
    room_unit: "",
    smoking_policy: "",
    max_occupancy: 0,
    max_number_of_adults: 0,
    max_number_of_children: 0,
    number_of_bedrooms: 0,
    number_of_living_room: 0,
    extra_bed: 0,
    description: "",
    image: [],
    available: false
  });
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const arrayOfRooms = convertObjectOfObjectsToArray(rooms[0] || rooms);
  const [expandedDescriptions, setExpandedDescriptions] = useState<{ [key: string]: boolean }>({});

  // Function to toggle description expansion
  const toggleDescription = (roomId: string) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [roomId]: !prev[roomId]
    }));
  };
  // Function to count words
  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).length;
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!newRoom.room_name) errors.room_name = "Room Name is required.";
    if (!newRoom.room_type) errors.room_type = "Room Type is required.";
    if (newRoom.total_room <= 0) errors.total_room = "Total Room is required.";
    if (newRoom.floor < 0) errors.floor = "Floor cannot be negative.";
    // if (!newRoom.room_view) errors.room_view = "Room View is required.";
    if (newRoom.room_size <= 0) errors.room_size = "Room Size is required.";
    if (!newRoom.room_unit) errors.room_unit = "Room Unit is required.";
    if (!newRoom.smoking_policy) errors.smoking_policy = "Smoking Policy is required.";
    if (newRoom.max_occupancy <= 0) errors.max_occupancy = "Max Occupancy is required.";
    if (newRoom.max_number_of_adults <= 0) errors.max_number_of_adults = "Max number of adults is required.";
    if (newRoom.max_number_of_children < 0) errors.max_number_of_children = "Max number of children cannot be negative.";
    if (newRoom.number_of_bedrooms <= 0) errors.number_of_bedrooms = "Number of bedrooms is required.";
    if (newRoom.number_of_living_room < 0) errors.number_of_living_room = "Number of living rooms cannot be negative.";
    if (newRoom.extra_bed < 0) errors.extra_bed = "Extra Bed cannot be negative.";
    // if (!newRoom.description) errors.description = "Description is required.";
    // if (newRoom.image.length === 0) errors.image = "Room image is required.";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetRoomForm = () => {
    setNewRoom({
      _id: "",
      propertyInfo_id: "",
      room_name: "",
      room_type: "",
      total_room: 0,
      floor: 0,
      room_view: "",
      room_size: 0,
      room_unit: "",
      smoking_policy: "",
      max_occupancy: 0,
      max_number_of_adults: 0,
      max_number_of_children: 0,
      number_of_bedrooms: 0,
      number_of_living_room: 0,
      extra_bed: 0,
      description: "",
      image: [],
      available: false
    });
    setSelectedImage(null);
    setValidationErrors({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewRoom({ ...newRoom, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewRoom({ ...newRoom, [name]: value });
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setNewRoom({ ...newRoom, [name]: checked });
  };

  const handleCreateRoom = () => {
    setShowModal(true);
    setEditMode(false);
    resetRoomForm();
  };

  const handleEditRoom = (room: RoomType) => {
    setNewRoom(room);
    setSelectedImage(room.image?.[0] || null);
    setShowModal(true);
    setEditMode(true);
  };

  const resizeImage = (file: File, maxSize: number) => {
    return new Promise<string>((resolve, reject) => {
      const img = document.createElement('img');
      const reader = new FileReader();

      reader.onload = (event) => {
        img.src = event.target?.result as string;
      };

      reader.onerror = reject;
      reader.readAsDataURL(file);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const scale = maxSize / Math.max(img.width, img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const resizedFile = new File([blob], file.name, { type: file.type });
                const resizedReader = new FileReader();
                resizedReader.onload = (e) => resolve(e.target?.result as string);
                resizedReader.onerror = reject;
                resizedReader.readAsDataURL(resizedFile);
              }
            },
            file.type,
            0.75 // Quality factor
          );
        }
      };

      img.onerror = reject;
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const resizedImage = await resizeImage(file, 1024);
        setSelectedImage(resizedImage);
        setNewRoom({ ...newRoom, image: [resizedImage] });
      } catch (error) {
        console.error('Error resizing image:', error);
      }
    }
  };

  const handleSaveRoom = async () => {
    if (!validateForm()) return; // Validate before saving
    setIsSubmitting(true);
    try {
      if (editMode) {
        await onEditRoom(newRoom);
        toast.success(`Room ${newRoom.room_name} updated successfully!`);
      } else {
        await onAddRoom(newRoom);
        toast.success(`Room ${newRoom.room_name} added successfully!`);
      }
      setShowModal(false);
      resetRoomForm();
    } catch (error) {
      console.error('Error saving room:', error);
      toast.error(`Failed to ${editMode ? 'update' : 'add'} room. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRoom = async (roomId: string, roomName: string) => {
    try {
      await onDeleteRoom(roomId);
      // toast.success(`Room ${roomName} deleted successfully!`);
    } catch (error) {
      console.error('Error deleting room:', error);
      toast.error('Failed to delete room. Please try again.');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetRoomForm();
  };

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden"; // Disable scrolling on background
    } else {
      document.body.style.overflow = "auto"; // Re-enable scrolling when modal closes
    }
    return () => {
      document.body.style.overflow = "auto"; // Cleanup when component unmounts
    };
  }, [showModal]);

  // Render the Room Form in Dialog
  const renderRoomForm = () => (
    <>
      <div className="space-y-4">
        {/* Room Name and Room Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="room_name">Room Name <span className="text-destructive">*</span></Label>
            <Input
              id="room_name"
              name="room_name"
              value={newRoom.room_name}
              onChange={handleInputChange}
              placeholder="Business Suite"
              className={validationErrors.room_name ? "border-destructive" : ""}
            />
            {validationErrors.room_name && <p className="text-destructive text-sm">{validationErrors.room_name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="room_type">Room Type <span className="text-destructive">*</span></Label>
            <Input
              id="room_type"
              name="room_type"
              value={newRoom.room_type}
              onChange={handleInputChange}
              placeholder="Single Room"
              className={validationErrors.room_type ? "border-destructive" : ""}
            />
            {validationErrors.room_type && <p className="text-destructive text-sm">{validationErrors.room_type}</p>}
          </div>
        </div>

        {/* Total Rooms, Floor and Room View */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="total_room">Total Room <span className="text-destructive">*</span></Label>
            <Input
              id="total_room"
              name="total_room"
              type="number"
              value={newRoom.total_room}
              onChange={handleInputChange}
              placeholder="Total rooms"
              className={validationErrors.total_room ? "border-destructive" : ""}
            />
            {validationErrors.total_room && <p className="text-destructive text-sm">{validationErrors.total_room}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="floor">Floor </Label>
            <Input
              id="floor"
              name="floor"
              type="number"
              value={newRoom.floor}
              onChange={handleInputChange}
              placeholder="Floor"
              className={validationErrors.floor ? "border-destructive" : ""}
            />
            {validationErrors.floor && <p className="text-destructive text-sm">{validationErrors.floor}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="room_view">Room View </Label>
            <Input
              id="room_view"
              name="room_view"
              value={newRoom.room_view}
              onChange={handleInputChange}
              placeholder="Garden/City/Ocean View"
              className={validationErrors.room_view ? "border-destructive" : ""}
            />
            {validationErrors.room_view && <p className="text-destructive text-sm">{validationErrors.room_view}</p>}
          </div>
        </div>

        {/* Room Size, Room Unit and Smoking Policy */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="room_size">Room Size <span className="text-destructive">*</span></Label>
            <Input
              id="room_size"
              name="room_size"
              type="number"
              value={newRoom.room_size}
              onChange={handleInputChange}
              placeholder="Room Size"
              className={validationErrors.room_size ? "border-destructive" : ""}
            />
            {validationErrors.room_size && <p className="text-destructive text-sm">{validationErrors.room_size}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="room_unit">Room Unit <span className="text-destructive">*</span></Label>
            <Select
              value={newRoom.room_unit}
              onValueChange={(value) => handleSelectChange("room_unit", value)}
            >
              <SelectTrigger className={validationErrors.room_unit ? "border-destructive" : ""}>
                <SelectValue placeholder="Select Unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sq. ft">Sq. Ft</SelectItem>
                <SelectItem value="sq. mtr.">Sq. mtr.</SelectItem>
              </SelectContent>
            </Select>
            {validationErrors.room_unit && <p className="text-destructive text-sm">{validationErrors.room_unit}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="smoking_policy">Smoking Policy <span className="text-destructive">*</span></Label>
            <Select
              value={newRoom.smoking_policy}
              onValueChange={(value) => handleSelectChange("smoking_policy", value)}
            >
              <SelectTrigger className={validationErrors.smoking_policy ? "border-destructive" : ""}>
                <SelectValue placeholder="Select Policy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="No-Smoking">No-Smoking</SelectItem>
                <SelectItem value="Smoking allowed">Smoking allowed</SelectItem>
              </SelectContent>
            </Select>
            {validationErrors.smoking_policy && <p className="text-destructive text-sm">{validationErrors.smoking_policy}</p>}
          </div>
        </div>

        {/* Occupancy Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="max_occupancy">Max Occupancy <span className="text-destructive">*</span></Label>
            <Input
              id="max_occupancy"
              name="max_occupancy"
              type="number"
              value={newRoom.max_occupancy}
              onChange={handleInputChange}
              placeholder="Max Occupancy"
              className={validationErrors.max_occupancy ? "border-destructive" : ""}
            />
            {validationErrors.max_occupancy && <p className="text-destructive text-sm">{validationErrors.max_occupancy}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_number_of_adults">Max Adults <span className="text-destructive">*</span></Label>
            <Input
              id="max_number_of_adults"
              name="max_number_of_adults"
              type="number"
              value={newRoom.max_number_of_adults}
              onChange={handleInputChange}
              placeholder="Max number of adults"
              className={validationErrors.max_number_of_adults ? "border-destructive" : ""}
            />
            {validationErrors.max_number_of_adults && <p className="text-destructive text-sm">{validationErrors.max_number_of_adults}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_number_of_children">Max Children </Label>
            <Input
              id="max_number_of_children"
              name="max_number_of_children"
              type="number"
              value={newRoom.max_number_of_children}
              onChange={handleInputChange}
              placeholder="Max number of children"
              className={validationErrors.max_number_of_children ? "border-destructive" : ""}
            />
            {validationErrors.max_number_of_children && <p className="text-destructive text-sm">{validationErrors.max_number_of_children}</p>}
          </div>
        </div>

        {/* Room Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="number_of_bedrooms">Bedrooms <span className="text-destructive">*</span></Label>
            <Input
              id="number_of_bedrooms"
              name="number_of_bedrooms"
              type="number"
              value={newRoom.number_of_bedrooms}
              onChange={handleInputChange}
              placeholder="Number of bedrooms"
              className={validationErrors.number_of_bedrooms ? "border-destructive" : ""}
            />
            {validationErrors.number_of_bedrooms && <p className="text-destructive text-sm">{validationErrors.number_of_bedrooms}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="number_of_living_room">Living Rooms </Label>
            <Input
              id="number_of_living_room"
              name="number_of_living_room"
              type="number"
              value={newRoom.number_of_living_room}
              onChange={handleInputChange}
              placeholder="Number of living rooms"
              className={validationErrors.number_of_living_room ? "border-destructive" : ""}
            />
            {validationErrors.number_of_living_room && <p className="text-destructive text-sm">{validationErrors.number_of_living_room}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="extra_bed">Extra Bed </Label>
            <Input
              id="extra_bed"
              name="extra_bed"
              type="number"
              value={newRoom.extra_bed}
              onChange={handleInputChange}
              placeholder="Extra Bed"
              className={validationErrors.extra_bed ? "border-destructive" : ""}
            />
            {validationErrors.extra_bed && <p className="text-destructive text-sm">{validationErrors.extra_bed}</p>}
          </div>
        </div>

        {/* Description Input */}
        <div className="space-y-2">
          <Label htmlFor="description" className="flex items-center">
            Description
            <span className="ml-2 text-xs text-muted-foreground">
              {newRoom.description.length} / 500 characters
            </span>
          </Label>
          <textarea
            id="description"
            name="description"
            value={newRoom.description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              // Create a synthetic event object compatible with handleInputChange
              const syntheticEvent = {
                target: {
                  name: 'description',
                  value: e.target.value
                }
              } as React.ChangeEvent<HTMLInputElement>;

              // Limit input to 500 characters
              const inputValue = e.target.value;
              if (inputValue.length <= 500) {
                handleInputChange(syntheticEvent);
              }
            }}
            placeholder="Provide a detailed description of the room (max 500 characters)"
            className={`w-full p-2 border rounded-md ${validationErrors.description ? "border-destructive" : ""} ${newRoom.description.length > 450 ? "border-yellow-500" : ""} h-24 resize-y`}
          />
          {validationErrors.description && (
            <p className="text-destructive text-sm">{validationErrors.description}</p>
          )}
          {newRoom.description.length > 450 && (
            <p className="text-yellow-600 text-sm">
              You are approaching the maximum character limit
            </p>
          )}
        </div>

        {/* Availability and Image Upload */}
        <div className="flex flex-col md:flex-row justify-between gap-4 pt-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="available"
              checked={newRoom.available}
              onCheckedChange={(checked) =>
                handleCheckboxChange("available", checked === true)
              }
            />
            <Label htmlFor="available">Available</Label>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={validationErrors.image ? "border-destructive" : ""}
            >
              <Upload className="h-4 w-4 mr-2" /> Upload Image
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              style={{ display: 'none' }}
            />

            {selectedImage ? (
              <div className="flex items-center gap-2">
                <span className="text-sm">Preview:</span>
                <Image
                  src={selectedImage}
                  alt="Room preview"
                  className="w-12 h-12 object-cover rounded"
                  width={48}
                  height={48}
                />
              </div>
            ) : (
              validationErrors.image && <p className="text-destructive text-sm">{validationErrors.image}</p>
            )}
          </div>
        </div>
      </div>

      <DialogFooter className="mt-6 flex-col sm:flex-row gap-2">
        <Button
          variant="outline"
          type="button"
          onClick={handleCloseModal}
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSaveRoom}
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
              {editMode ? 'Updating...' : 'Creating...'}
            </span>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {editMode ? 'Update Room' : 'Add Room'}
            </>
          )}
        </Button>
      </DialogFooter>
    </>
  );

  return (
    <Card className="w-full shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between border-b pb-3">
      <CardTitle className="text-primary font-semibold text-lg sm:text-xl">Room Management</CardTitle>
  <Button
    variant="outline"
    size="sm"
    onClick={handleCreateRoom}
    aria-label="Add a new room"
  >
    <Plus className="h-4 w-4 mr-1" /> Add Room
  </Button>
      </CardHeader>

      <CardContent className="pt-6">
        {/* Create/Edit Room Dialog */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-[95vw] md:max-w-[80vw] lg:max-w-[65vw] xl:max-w-[50vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editMode ? 'Edit Room' : 'Add New Room'}
              </DialogTitle>
            </DialogHeader>
            {renderRoomForm()}
          </DialogContent>
        </Dialog>

        {/* Display Room List */}
        <div className="space-y-8">
          {arrayOfRooms.length > 0 ? (
            <div className="grid grid-cols-1 gap-8">
              {arrayOfRooms.map((room) => (
                <Card
                  key={room._id}
                  className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-2"
                >
                  <CardContent className="p-0">
                    {/* Large Image Section */}
                    <div className="w-full h-64 md:h-80 overflow-hidden">
                      {room.image && room.image.length > 0 ? (
                        <Image
                          src={room.image[0]}
                          alt={room.room_name}
                          className="w-full h-full object-cover"
                          width={1000}
                          height={400}
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <p className="text-muted-foreground">No Image Available</p>
                        </div>
                      )}
                    </div>

                    {/* Details Grid */}
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Basic Room Info */}
                        <div className="space-y-4">
                          <h3 className="text-xl font-semibold text-gray-400 border-b pb-2">
                            Room Details
                          </h3>
                          <div>
                            <span className="text-sm text-muted-foreground">Room Name</span>
                            <p className="font-medium text-lg">{room.room_name}</p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Room Type</span>
                            <p className="font-medium">{room.room_type}</p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Floor</span>
                            <p className="font-medium">{room.floor}</p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Room View</span>
                            <p className="font-medium">{room.room_view || "N/A"}</p>
                          </div>
                        </div>

                        {/* Capacity & Size */}
                        <div className="space-y-4">
                          <h3 className="text-xl font-semibold text-gray-400 border-b pb-2">
                            Capacity & Size
                          </h3>
                          <div>
                            <span className="text-sm text-muted-foreground">Room Size</span>
                            <p className="font-medium">{room.room_size} {room.room_unit}</p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Max Occupancy</span>
                            <p className="font-medium">{room.max_occupancy}</p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Max Adults</span>
                            <p className="font-medium">{room.max_number_of_adults}</p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Max Children</span>
                            <p className="font-medium">{room.max_number_of_children}</p>
                          </div>
                        </div>

                        {/* Additional Information */}
                        <div className="space-y-4">
                          <h3 className="text-xl font-semibold text-gray-400 border-b pb-2">
                            Additional Info
                          </h3>
                          <div>
                            <span className="text-sm text-muted-foreground">Bedrooms</span>
                            <p className="font-medium">{room.number_of_bedrooms}</p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Extra Beds</span>
                            <p className="font-medium">{room.extra_bed}</p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Smoking Policy</span>
                            <p className="font-medium">{room.smoking_policy}</p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Availability</span>
                            <p className={`font-medium ${room.available ? "text-green-600" : "text-red-600"}`}>
                              {room.available ? 'Available' : 'Not Available'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Description with See More functionality */}
                      <div className="mt-6 border-t pt-2">
                        <h3 className="text-lg font-semibold text-gray-400 mb-2">Description</h3>
                        <div>
                          <p className="font-medium text-gray-800 text-muted-foreground">
                            {getWordCount(room.description) > 10 && !expandedDescriptions[room._id]
                              ? room.description.split(' ').slice(0, 10).join(' ')
                              : room.description}
                            {getWordCount(room.description) > 10 && (
                              <span
                                onClick={() => toggleDescription(room._id)}
                                className="text-tripswift-blue hover:underline text-sm ml-2 cursor-pointer"
                              >
                                {expandedDescriptions[room._id] ? '(See Less)' : '(See More)'}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>


                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row sm:justify-end mt-6 space-y-2 sm:space-y-0 sm:space-x-4 px-4 sm:px-0">                        <Button
                          variant="destructive"
                          onClick={() => handleDeleteRoom(room._id, room.room_name)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete Room
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleEditRoom(room)}
                        >
                          <PenTool className="h-4 w-4 mr-2" /> Edit Room
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-muted/50 rounded-lg p-8 text-center">
              <p className="text-xl text-muted-foreground">
                No rooms added yet. Click "Add Room" to create your first room.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
