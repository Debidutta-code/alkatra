import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Plus, Bed, Check, PenTool, Loader2, Trash2 } from "lucide-react";
import { Checkbox } from "../../components/ui/checkbox";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../../components/ui/dialog";
import { Skeleton } from "../../components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Label } from "../../components/ui/label";
import axios from 'axios';
import toast from 'react-hot-toast';

// Interfaces
interface AmenityCategory {
  [key: string]: boolean;
}

interface BasicAmenities {
  bed: "single" | "double" | "king" | "twin" | "queen";
  bathroom: boolean;
  towels: boolean;
  linensBedding: boolean;
  linens: boolean;
  bidet: boolean;
  toiletPaper: boolean;
  towelsSheets: boolean;
  freeToiletries: boolean;
  shower: boolean;
  toilet: boolean;
}

interface FurnitureAmenities {
  tableChairs: boolean;
  desk: boolean;
  dresserWardrobe: boolean;
  sofaSeating: boolean;
  sofa: boolean;
  wardrobeOrCloset: boolean;
  diningTable: boolean;
  diningArea: boolean;
  sittingArea: boolean;
  readingChair: boolean;
  balcony: boolean;
}

interface TechnologyAmenities {
  television: boolean;
  telephone: boolean;
  wifiInternet: boolean;
  flatScreenTV: boolean;
  satelliteChannels: boolean;
  cableChannels: boolean;
}

interface ClimateControlAmenities {
  airConditioning: boolean;
  heating: boolean;
}

interface KitchenetteMiniBarAmenities {
  smallRefrigerator: boolean;
  microwave: boolean;
  coffeeMaker: boolean;
  refrigerator: boolean;
  kitchenware: boolean;
  electricKettle: boolean;
  oven: boolean;
  stovetop: boolean;
  teaCoffeeMaker: boolean;
  kitchen: boolean;
}

interface SafetySecurityAmenities {
  safe: boolean;
  smokeDetectors: boolean;
  fireExtinguisher: boolean;
}

interface ToiletriesAmenities {
  shampooConditioner: boolean;
  soap: boolean;
  hairDryer: boolean;
}

interface WorkLeisureAmenities {
  workDesk: boolean;
  additionalLighting: boolean;
  ironingFacilities: boolean;
  iron: boolean;
}

interface AccessibilityFeaturesAmenities {
  accessibleBathroom: boolean;
  wheelchairAccessibility: boolean;
  upperFloorsAccessibleByElevator: boolean;
  entireUnitWheelchairAccessible: boolean;
}

interface RoomAmenity {
  _id: string;
  propertyInfo_id: string;
  room_type: string;
  amenities: {
    basic: BasicAmenities;
    furniture: FurnitureAmenities;
    technology: TechnologyAmenities;
    climateControl: ClimateControlAmenities;
    kitchenetteMiniBar: KitchenetteMiniBarAmenities;
    safetySecurity: SafetySecurityAmenities;
    toiletries: ToiletriesAmenities;
    workLeisure: WorkLeisureAmenities;
    accessibilityFeatures: AccessibilityFeaturesAmenities;
  };
  __v?: number;
}

interface RoomAmenitiesProps {
  roomAmenities: RoomAmenity[] | null;
  editedRoomAmenity: RoomAmenity | null;
  editRoomAmenityMode: boolean;
  handleRoomAmenityEditClick: () => void;
  propertyInfoId: string;
  accessToken: string;
  availableRoomTypes: string[];
  onRoomTypeAdded?: (newRoomType: string) => void;
}

const bedTypes = ["single", "double", "king", "twin", "queen"];

// Updated amenity categories with all new amenities
const amenityCategories = {
  basic: [
    "bathroom", "towels", "linensBedding", "linens", "bidet", 
    "toiletPaper", "towelsSheets", "freeToiletries", "shower", "toilet"
  ],
  furniture: [
    "tableChairs", "desk", "dresserWardrobe", "sofaSeating", "sofa", 
    "wardrobeOrCloset", "diningTable", "diningArea", "sittingArea", 
    "readingChair", "balcony"
  ],
  technology: [
    "television", "telephone", "wifiInternet", "flatScreenTV", 
    "satelliteChannels", "cableChannels"
  ],
  climateControl: ["airConditioning", "heating"],
  kitchenetteMiniBar: [
    "smallRefrigerator", "microwave", "coffeeMaker", "refrigerator", 
    "kitchenware", "electricKettle", "oven", "stovetop", 
    "teaCoffeeMaker", "kitchen"
  ],
  safetySecurity: ["safe", "smokeDetectors", "fireExtinguisher"],
  toiletries: ["shampooConditioner", "soap", "hairDryer"],
  workLeisure: ["workDesk", "additionalLighting", "ironingFacilities", "iron"],
  accessibilityFeatures: [
    "accessibleBathroom", "wheelchairAccessibility", 
    "upperFloorsAccessibleByElevator", "entireUnitWheelchairAccessible"
  ],
};

// Utility functions
const formatAmenityName = (amenity: string): string => {
  if (amenity === amenity.toUpperCase()) return amenity;
  
  // Custom formatting for specific amenities
  const customNames: Record<string, string> = {
    wifiInternet: "WiFi Internet",
    flatScreenTV: "Flat Screen TV",
    satelliteChannels: "Satellite Channels",
    cableChannels: "Cable Channels",
    airConditioning: "Air Conditioning",
    smallRefrigerator: "Small Refrigerator",
    coffeeMaker: "Coffee Maker",
    electricKettle: "Electric Kettle",
    teaCoffeeMaker: "Tea/Coffee Maker",
    smokeDetectors: "Smoke Detectors",
    fireExtinguisher: "Fire Extinguisher",
    shampooConditioner: "Shampoo & Conditioner",
    hairDryer: "Hair Dryer",
    workDesk: "Work Desk",
    additionalLighting: "Additional Lighting",
    ironingFacilities: "Ironing Facilities",
    accessibleBathroom: "Accessible Bathroom",
    wheelchairAccessibility: "Wheelchair Accessibility",
    upperFloorsAccessibleByElevator: "Upper Floors Accessible by Elevator",
    entireUnitWheelchairAccessible: "Entire Unit Wheelchair Accessible",
    linensBedding: "Linens & Bedding",
    freeToiletries: "Free Toiletries",
    toiletPaper: "Toilet Paper",
    towelsSheets: "Towels & Sheets",
    wardrobeOrCloset: "Wardrobe/Closet",
    diningTable: "Dining Table",
    diningArea: "Dining Area",
    sittingArea: "Sitting Area",
    readingChair: "Reading Chair",
    dresserWardrobe: "Dresser/Wardrobe",
    sofaSeating: "Sofa Seating",
    tableChairs: "Table & Chairs"
  };

  if (customNames[amenity]) {
    return customNames[amenity];
  }

  return amenity
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, char => char.toUpperCase())
    .replace(/_/g, ' ')
    .trim();
};

const getCategoryDisplayName = (category: string): string => {
  const displayNames: Record<string, string> = {
    safetySecurity: "Safety & Security",
    kitchenetteMiniBar: "Kitchenette & Mini Bar",
    workLeisure: "Work & Leisure",
    accessibilityFeatures: "Accessibility Features",
    climateControl: "Climate Control"
  };
  return displayNames[category] ||
    category.charAt(0).toUpperCase() +
    category.slice(1).replace(/([A-Z])/g, ' $1').replace("And", " & ");
};

const createEmptyAmenityStructure = (propertyInfoId: string, selectedRoomType: string): RoomAmenity => {
  const emptyAmenities: RoomAmenity = {
    _id: "",
    propertyInfo_id: propertyInfoId,
    room_type: selectedRoomType,
    amenities: {
      basic: {
        bed: "single",
        bathroom: false,
        towels: false,
        linensBedding: false,
        linens: false,
        bidet: false,
        toiletPaper: false,
        towelsSheets: false,
        freeToiletries: false,
        shower: false,
        toilet: false
      },
      furniture: {
        tableChairs: false,
        desk: false,
        dresserWardrobe: false,
        sofaSeating: false,
        sofa: false,
        wardrobeOrCloset: false,
        diningTable: false,
        diningArea: false,
        sittingArea: false,
        readingChair: false,
        balcony: false
      },
      technology: {
        television: false,
        telephone: false,
        wifiInternet: false,
        flatScreenTV: false,
        satelliteChannels: false,
        cableChannels: false
      },
      climateControl: {
        airConditioning: false,
        heating: false
      },
      kitchenetteMiniBar: {
        smallRefrigerator: false,
        microwave: false,
        coffeeMaker: false,
        refrigerator: false,
        kitchenware: false,
        electricKettle: false,
        oven: false,
        stovetop: false,
        teaCoffeeMaker: false,
        kitchen: false
      },
      safetySecurity: {
        safe: false,
        smokeDetectors: false,
        fireExtinguisher: false
      },
      toiletries: {
        shampooConditioner: false,
        soap: false,
        hairDryer: false
      },
      workLeisure: {
        workDesk: false,
        additionalLighting: false,
        ironingFacilities: false,
        iron: false
      },
      accessibilityFeatures: {
        accessibleBathroom: false,
        wheelchairAccessibility: false,
        upperFloorsAccessibleByElevator: false,
        entireUnitWheelchairAccessible: false
      }
    }
  };

  return emptyAmenities;
};

const initializeAmenityStructure = (amenityData: RoomAmenity): RoomAmenity => {
  const clonedData = JSON.parse(JSON.stringify(amenityData));

  // Ensure all categories exist with proper structure
  if (!clonedData.amenities) {
    clonedData.amenities = {};
  }

  // Initialize with empty structure and merge existing data
  const emptyStructure = createEmptyAmenityStructure(amenityData.propertyInfo_id, amenityData.room_type);
  
  // Merge existing data with complete structure
  Object.keys(emptyStructure.amenities).forEach(category => {
    if (!clonedData.amenities[category]) {
      clonedData.amenities[category] = emptyStructure.amenities[category as keyof typeof emptyStructure.amenities];
    } else {
      // Merge existing values with defaults
      Object.keys(emptyStructure.amenities[category as keyof typeof emptyStructure.amenities]).forEach(amenity => {
        if (clonedData.amenities[category][amenity] === undefined) {
          clonedData.amenities[category][amenity] = emptyStructure.amenities[category as keyof typeof emptyStructure.amenities][amenity as keyof typeof emptyStructure.amenities[keyof typeof emptyStructure.amenities]];
        }
      });
    }
  });

  return clonedData;
};

export function RoomAmenities({
  roomAmenities,
  editedRoomAmenity,
  editRoomAmenityMode,
  handleRoomAmenityEditClick,
  propertyInfoId,
  accessToken,
  availableRoomTypes,
  onRoomTypeAdded
}: RoomAmenitiesProps) {
  const [currentRoomAmenity, setCurrentRoomAmenity] = useState<RoomAmenity | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [selectedBedType, setSelectedBedType] = useState<string>("single");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedRoomType, setSelectedRoomType] = useState<string>(availableRoomTypes[0] || "");
  const [newRoomType, setNewRoomType] = useState<string>("");

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<RoomAmenity>({
    defaultValues: editedRoomAmenity || createEmptyAmenityStructure(propertyInfoId, selectedRoomType)
  });

  const fetchRoomAmenities = async () => {
    setIsLoading(true);
    try {
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
        const amenitiesArray = response.data.data;
        
        if (amenitiesArray.length > 0) {
          // Find amenities for selected room type
          const roomAmenityData = amenitiesArray.find((item: RoomAmenity) => 
            item.room_type === selectedRoomType
          );

          if (roomAmenityData) {
            const structuredData = initializeAmenityStructure(roomAmenityData);
            setCurrentRoomAmenity(structuredData);
            setSelectedBedType(structuredData.amenities.basic.bed || "single");
            reset(structuredData);
          } else {
            setCurrentRoomAmenity(null);
            reset(createEmptyAmenityStructure(propertyInfoId, selectedRoomType));
          }
        } else {
          setCurrentRoomAmenity(null);
          reset(createEmptyAmenityStructure(propertyInfoId, selectedRoomType));
        }
      }
    } catch (error) {
      console.error('Error fetching room amenities:', error);
      setCurrentRoomAmenity(null);
      reset(createEmptyAmenityStructure(propertyInfoId, selectedRoomType));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (propertyInfoId && accessToken && selectedRoomType) {
      fetchRoomAmenities();
    }
  }, [propertyInfoId, accessToken, selectedRoomType]);

  const onSubmit = async (data: RoomAmenity) => {
    setIsSubmitting(true);
    try {
      const formData = {
        propertyInfo_id: propertyInfoId,
        room_type: selectedRoomType,
        amenities: data.amenities
      };

      // Determine if we're updating or creating
      const isUpdate = currentRoomAmenity !== null;

      const endpoint = isUpdate
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/amenite/update-room-amenity`
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/amenite/roomaminity`;
      
      const method = isUpdate ? "patch" : "post";

      const response = await axios({
        method,
        url: endpoint,
        data: formData,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200 || response.status === 201) {
        toast.success(
          isUpdate
            ? "Room amenities updated successfully!"
            : "Room amenities created successfully!"
        );
        
        // Refresh the data
        await fetchRoomAmenities();
        setShowModal(false);
        handleRoomAmenityEditClick();
      }
    } catch (error) {
      toast.error("Failed to save room amenities. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    reset(currentRoomAmenity || createEmptyAmenityStructure(propertyInfoId, selectedRoomType));
    if (currentRoomAmenity) {
      setSelectedBedType(currentRoomAmenity.amenities.basic.bed || "single");
    }
    handleRoomAmenityEditClick();
  };

  const RoomTypeSelector = () => {
    return (
      <div className="mb-4 flex items-end gap-4">
        <div className="flex-1">
          <Label htmlFor="room-type-selector">Room Type</Label>
          <Select
            value={selectedRoomType}
            onValueChange={(value) => {
              setSelectedRoomType(value);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select room type" />
            </SelectTrigger>
            <SelectContent>
              {availableRoomTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
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
          disabled={isLoading || !selectedRoomType}
        >
          {currentRoomAmenity ? (
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
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <>
            <RoomTypeSelector />
            <div className="space-y-5">
              {currentRoomAmenity ? (
                <>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {Object.entries(amenityCategories).map(([category, amenities]) => {
                      const categoryAmenities = currentRoomAmenity.amenities[category as keyof typeof currentRoomAmenity.amenities] || {};
                      const activeAmenities = amenities.filter(amenity =>
                        category === 'basic' && amenity === 'bed' ? false : (categoryAmenities as any)[amenity] === true
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
                  <div className="text-muted-foreground mb-2">No amenities configured for this room type</div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleRoomAmenityEditClick();
                      setShowModal(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1.5" />
                    Create Amenities
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>

      {/* Amenities Editor Dialog */}
      <Dialog open={showModal} onOpenChange={(open) => {
        if (!open) handleCancel();
        setShowModal(open);
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto"
          onInteractOutside={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>
              {currentRoomAmenity ? `Edit ${selectedRoomType} Amenities` : `Create ${selectedRoomType} Amenities`}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-2">
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

            <div className="space-y-4">
              {Object.entries(amenityCategories).map(([category, amenities]) => (
                <Card key={category} className="overflow-hidden border-border">
                  <CardHeader className="py-3 px-4 bg-muted/40">
                    <CardTitle className="text-sm font-medium">
                      {getCategoryDisplayName(category)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 p-4">
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