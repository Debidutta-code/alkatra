import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Plus, Bed, Check, PenTool, X, Loader2 } from "lucide-react";
import { Checkbox } from "../../components/ui/checkbox";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Skeleton } from "../../components/ui/skeleton";
import axios from 'axios';
import toast from 'react-hot-toast';

// Interfaces
interface AmenityCategory {
  [key: string]: boolean;
}

interface BasicAmenities {
  bed: "single" | "double" | "king" | "twin" | "queen";
  [key: string]: boolean | string;
}

interface RoomAmenityData {
  propertyInfo_id: string;
  amenities: {
    basic: BasicAmenities;
    furniture?: AmenityCategory;
    technology?: AmenityCategory;
    climateControl?: AmenityCategory;
    kitchenetteMiniBar?: AmenityCategory;
    safetySecurity?: AmenityCategory;
    toiletries?: AmenityCategory;
    workLeisure?: AmenityCategory;
    accessibilityFeatures?: AmenityCategory;
    [key: string]: any;
  };
}

interface RoomAmenitiesProps {
  roomAmenity: RoomAmenityData | null;
  editedRoomAmenity: RoomAmenityData;
  editRoomAmenityMode: boolean;
  handleRoomAmenityEditClick: () => void;
  propertyInfoId: string;
  accessToken: string;
}

const bedTypes = ["single", "double", "king", "twin", "queen"];

const amenityCategories = {
  basic: ["bathroom", "towels", "linensBedding"],
  furniture: ["tableChairs", "desk", "dresserWardrobe", "sofaSeating"],
  technology: ["television", "telephone", "wifiInternet"],
  climateControl: ["airConditioning", "heating"],
  kitchenetteMiniBar: ["smallRefrigerator", "microwave", "coffeeMaker"],
  safetySecurity: ["cctv", "smokeDetectors", "fireExtinguisher"],
  toiletries: ["shampooConditioner", "soap", "hairdryer"],
  workLeisure: ["workDesk", "readingChair", "additionalLighting"],
  accessibilityFeatures: ["accessibleBathroom", "wheelchairAccessibility"],
};

// Utility function to convert camelCase or snake_case to Title Case
const formatAmenityName = (amenity: string): string => {
  return amenity
    .replace(/([A-Z])/g, ' $1')  // Add space before capital letters
    .replace(/^./, char => char.toUpperCase())  // Capitalize first letter
    .replace(/_/g, ' ')  // Replace underscores with spaces
    .trim();
};

const getCategoryDisplayName = (category: string): string => {
  const displayNames: Record<string, string> = {
    safetySecurity: "Safety and Security",
    kitchenetteMiniBar: "Kitchenette & Mini Bar",
    workLeisure: "Work & Leisure",
    accessibilityFeatures: "Accessibility Features",
    climateControl: "Climate Control"
  };

  return displayNames[category] ||
    category.charAt(0).toUpperCase() +
    category.slice(1).replace(/([A-Z])/g, ' $1').replace("And", " and");
};

export function RoomAmenities({
  roomAmenity,
  editedRoomAmenity,
  editRoomAmenityMode,
  handleRoomAmenityEditClick,
  propertyInfoId,
  accessToken
}: RoomAmenitiesProps) {
  const [currentRoomAmenity, setCurrentRoomAmenity] = useState<RoomAmenityData | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [selectedBedType, setSelectedBedType] = useState<string>("single");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<RoomAmenityData>({
    defaultValues: editedRoomAmenity
  });

  const fetchRoomAmenities = async () => {
    setIsLoading(true);
    try {
      console.log(`@#@@#@#@#@#@#@#@##@#@#@#@#The url is ${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/amenite/${propertyInfoId}`);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/amenite/${propertyInfoId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      );
  
      if (response.status === 200 && response.data.data) {
        const amenityData = response.data.data;
        console.log("Raw Amenity Data:", amenityData);
  
        if (Object.keys(amenityData.amenities || {}).length > 0) {
          const structuredData = initializeAmenityStructure(amenityData);
          console.log("@@@@@@@@@@@@@@@@@@@The Room amenities are:", structuredData);
  
          setCurrentRoomAmenity(structuredData);
          setSelectedBedType(structuredData.amenities.basic.bed || "single");
          reset(structuredData);
        } else {
          setCurrentRoomAmenity(null); // No amenities available
        }
      }
    } catch (error) {
      console.error('Error fetching room amenities:', error);
      setCurrentRoomAmenity(null); // On error, reset currentRoomAmenity
    } finally {
      setIsLoading(false);
    }
  };

  const createEmptyAmenityStructure = (): RoomAmenityData => {
    const emptyAmenities: RoomAmenityData = {
      propertyInfo_id: propertyInfoId,
      amenities: {
        basic: { bed: "single" } as BasicAmenities
      }
    };

    Object.entries(amenityCategories).forEach(([category, amenities]) => {
      if (category !== 'basic') {
        emptyAmenities.amenities[category] = {} as AmenityCategory;
      }

      amenities.forEach(amenity => {
        if (category === 'basic' && amenity !== 'bed') {
          emptyAmenities.amenities.basic[amenity] = false;
        } else if (category !== 'basic') {
          (emptyAmenities.amenities[category as keyof typeof emptyAmenities.amenities] as AmenityCategory)[amenity] = false;
        }
      });
    });

    return emptyAmenities;
  };

  const initializeAmenityStructure = (amenityData: RoomAmenityData) => {
    const clonedData = JSON.parse(JSON.stringify(amenityData));

    clonedData.propertyInfo_id = clonedData.propertyInfo_id || propertyInfoId;

    if (!clonedData.amenities) {
      clonedData.amenities = {};
    }

    Object.entries(amenityCategories).forEach(([category, amenities]) => {
      if (!clonedData.amenities[category]) {
        clonedData.amenities[category] = {};

        if (category === 'basic') {
          clonedData.amenities.basic.bed = "single";
        }
      }

      amenities.forEach(amenity => {
        if (category === 'basic' && amenity === 'bed') {
          if (!clonedData.amenities.basic.bed) {
            clonedData.amenities.basic.bed = "single";
          }
        } else if (clonedData.amenities[category][amenity] === undefined) {
          clonedData.amenities[category][amenity] = false;
        }
      });
    });

    return clonedData;
  };

  useEffect(() => {
    if (propertyInfoId && accessToken) {
      fetchRoomAmenities();
    }
  }, [propertyInfoId, accessToken]);

  // Updated onSubmit function
  const onSubmit = async (data: RoomAmenityData) => {
    console.log("@@@@@@@@@@@@$$$$$$$$$$$$$$$\nEntering into onSubmit");
    setIsSubmitting(true); 
    try {
      console.log("@@@@@@@@@@@@$$$$$$$$$$$$$$$\nEntering into try");
      console.log("@@@@@@@@@@@@$$$$$$$$$$$$$$$\nEntering into try-1");  
      const formData = JSON.parse(JSON.stringify(data));
      console.log("@@@@@@@@@@@@$$$$$$$$$$$$$$$\nEntering into try-2");
  
      // Ensure all amenity categories have default values
      Object.entries(amenityCategories).forEach(([category, amenities]) => {
        if (!formData.amenities[category]) {
          formData.amenities[category] = {};
        }
        amenities.forEach((amenity) => {
          if (category === "basic" && amenity === "bed") return;
          if (formData.amenities[category][amenity] === undefined) {
            formData.amenities[category][amenity] = false;
          }
        });
      });
      console.log("@@@@@@@@@@@@$$$$$$$$$$$$$$$\nEntering into try-3");
  
      // Prepare the request payload
      const requestData = {
        propertyInfo_id: propertyInfoId,
        amenities: formData.amenities,
      };
      console.log("@@@@@@@@@@@@$$$$$$$$$$$$$$$\nEntering into try-4");
      console.log("Request Data to be sent:", requestData);
  
      // Determine the API endpoint and HTTP method
      const endpoint = currentRoomAmenity
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/amenite/update-room-amenity`
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/amenite/roomaminity`;
      const method = currentRoomAmenity ? "patch" : "post";
  
      console.log("API Endpoint:", endpoint);
      console.log("HTTP Method:", method);
  
      // Make the API request
      const response = await axios({
        method,
        url: endpoint,
        data: requestData,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
      });
  
      console.log("API Response:", response.data);
  
      // Handle success response
      if (response.status === 200 || response.status === 201) {
        toast.success(
          currentRoomAmenity
            ? "Room amenities updated successfully!"
            : "Room amenities created successfully!"
        );
  
        const updatedData = response.data.data || response.data;
        const structuredUpdatedData = initializeAmenityStructure(updatedData);
  
        setCurrentRoomAmenity(structuredUpdatedData);
        reset(structuredUpdatedData);
  
        await fetchRoomAmenities();
  
        setShowModal(false);
        handleRoomAmenityEditClick();
      }
    } catch (error) {
      // console.error("Error during API request:", error.response || error);
      toast.error("Failed to save room amenities. Please try again.");
    } finally {
      setIsSubmitting(false); // Reset submitting state
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    reset(currentRoomAmenity || undefined);
    if (currentRoomAmenity) {
      setSelectedBedType(currentRoomAmenity.amenities.basic.bed || "single");
    }
    handleRoomAmenityEditClick();
  };

  return (
    <Card className="w-full shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between border-b pb-1">
        <div>
          <CardTitle className="text-primary text-xl font-semibold flex items-center">
            Room Amenities
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm mt-0.5">
            Configure amenities available in your rooms
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            handleRoomAmenityEditClick();
            setShowModal(true);
          }}
          disabled={isLoading}
        >
          {currentRoomAmenity && Object.keys(currentRoomAmenity.amenities || {}).length > 0 ? (
            <>
              <PenTool className="h-4 w-4 mr-1.5" />
              <span>Edit</span>
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-1.5" />
              <span>Create</span>
            </>
          )}
        </Button>
      </CardHeader>

      <CardContent className="p-6">
        {/* Loading state */}
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <>
            {/* Display current room amenities */}
            <div className="space-y-5">
              {currentRoomAmenity ? (
                <>
                  {/* Bed Type */}
                  <div className="flex items-center bg-accent/40 p-4 rounded-lg">
                    <div className="mr-4 bg-primary text-primary-foreground p-2 rounded-full">
                      <Bed className="h-5 w-5" />
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-muted-foreground">Bed Type</h5>
                      <p className="text-foreground font-semibold">
                        {currentRoomAmenity.amenities.basic?.bed
                          ? formatAmenityName(currentRoomAmenity.amenities.basic.bed)
                          : "Not specified"}
                      </p>
                    </div>
                  </div>

                  {/* Other Amenities */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {Object.entries(amenityCategories).map(([category, amenities]) => {
                      // Only show categories with at least one active amenity
                      const categoryAmenities = currentRoomAmenity.amenities[category] || {};
                      const activeAmenities = amenities.filter(amenity =>
                        category === 'basic' && amenity === 'bed' ? false : categoryAmenities[amenity] === true
                      );

                      if (activeAmenities.length === 0) return null;

                      return (
                        <Card key={category} className="overflow-hidden border-border">
                          <CardHeader className="py-3 px-4 bg-muted/40">
                            <CardTitle className="text-sm text-foreground font-medium">
                              {getCategoryDisplayName(category)}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-4">
                            <div className="flex flex-wrap gap-2">
                              {activeAmenities.map((amenity) => (
                                <Badge
                                  key={amenity}
                                  variant="outline"
                                  className="bg-primary/10 text-foreground border-primary/20 hover:bg-primary/20 transition-colors"
                                >
                                  <Check className="h-3 w-3 mr-1 text-primary" />
                                  {formatAmenityName(amenity)}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 bg-accent/20 rounded-lg border border-border/50">
                  <div className="text-muted-foreground mb-2">No room amenities found</div>
{/*                   <Button
                    onClick={() => {
                      handleRoomAmenityEditClick();
                      setShowModal(true);
                    }}
                    variant="outline"
                    className="mt-2"
                  >
                    <PenTool className="h-4 w-4 mr-2" />
                    Create Room Amenities
                  </Button> */}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>

      {/* Dialog for editing amenities */}
      <Dialog open={showModal} onOpenChange={(open) => {
        if (!open) handleCancel();
        setShowModal(open);
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {currentRoomAmenity ? 'Edit Room Amenities' : 'Create Room Amenities'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-2">
            {/* Bed Type Section */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground">Bed Type</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {bedTypes.map((type) => (
                  <div
                    key={type}
                    className={`
                      flex items-center justify-center p-3 rounded-md border cursor-pointer transition-all
                      ${selectedBedType === type
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card hover:bg-accent/50 border-border'}
                    `}
                    onClick={() => {
                      setSelectedBedType(type);
                      setValue("amenities.basic.bed", type as any);
                    }}
                  >
                    <Bed className={`h-4 w-4 mr-1.5 ${selectedBedType === type ? 'text-primary-foreground' : 'text-primary'}`} />
                    <span className="text-sm capitalize">{type}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Amenity Categories */}
            <div className="space-y-4">
              {Object.entries(amenityCategories).map(([category, amenities]) => (
                <Card key={category} className="overflow-hidden border-border">
                  <CardHeader className="py-3 px-4 bg-muted/40">
                    <CardTitle className="text-sm font-medium">
                      {getCategoryDisplayName(category)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-4">
                    {amenities.map((amenity) => (
                      category === 'basic' && amenity === 'bed' ? null : (
                        <div key={amenity} className="flex items-center space-x-2 p-2 rounded hover:bg-accent/30">
                          <Checkbox
                            id={`${category}-${amenity}`}
                            checked={watch(`amenities.${category}.${amenity}` as any) || false}
                            onCheckedChange={(checked: boolean) => {
                              setValue(`amenities.${category}.${amenity}` as any, checked);
                            }}
                            className="h-4 w-4 text-primary rounded-sm"
                          />
                          <label
                            htmlFor={`${category}-${amenity}`}
                            className="text-sm font-medium text-foreground flex-grow cursor-pointer"
                          >
                            {formatAmenityName(amenity)}
                          </label>
                        </div>
                      )
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>

            <DialogFooter>
              <Button
                type="button"
                onClick={handleCancel}
                variant="outline"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="relative"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {currentRoomAmenity ? 'Updating...' : 'Creating...'}
                  </div>
                ) : (
                  currentRoomAmenity ? 'Update Amenities' : 'Create Amenities'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
