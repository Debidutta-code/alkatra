import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  PenTool,
  Plus,
  X,
  Wifi,
  Droplets,
  Dumbbell,
  Leaf,
  Utensils,
  Bell,
  Wine,
  Car,
  BadgeInfo,
  Dog,
  Briefcase,
  ShowerHead,
  Baby,
  Ban,
  Accessibility,
  Users,
} from "lucide-react";
import { Checkbox } from "../../components/ui/checkbox";
import { useForm } from "react-hook-form";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { Skeleton } from "../../components/ui/skeleton";
import toast from "react-hot-toast";

interface AmenityData {
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
    non_smoking_rooms?: boolean;
    facilities_for_disabled_guests?: boolean;
    family_rooms?: boolean;
  };
}

interface EditedAmenity extends AmenityData { }

type AmenityKeys = keyof AmenityData["amenities"];

interface PropertyData {
  property_amenities: {
    amenities: Record<string, boolean>;
  };
}

interface AmenitiesProps {
  amenity: AmenityData;
  setAmenity: React.Dispatch<React.SetStateAction<AmenityData | null>>;
  editedAmenity: EditedAmenity;
  editAmenityMode: boolean;
  handleAmenityInputChange: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  handleAmenitySaveClick: (newData: EditedAmenity) => Promise<void>;
  handleAmenityEditClick: () => void;
  property: { data: PropertyData };
  handleCreateAmenity: (newAmenity: EditedAmenity) => Promise<void>;
}
const AmenityData: AmenityKeys[] = [
  "wifi",
  "swimming_pool",
  "fitness_center",
  "spa_and_wellness",
  "restaurant",
  "room_service",
  "bar_and_lounge",
  "parking",
  "concierge_services",
  "pet_friendly",
  "business_facilities",
  "laundry_services",
  "child_friendly_facilities",
  "non_smoking_rooms",
  "facilities_for_disabled_guests",
  "family_rooms",
];
const destinationTypes = ["RESORT", "VACATION RENTAL"];
const propertyTypes = ["COMMERCIAL PROPERTY", "INDUSTRIAL PROPERTY"];
const amenityIcons: Record<string, React.ReactNode> = {
  wifi: <Wifi className="h-3.5 w-3.5 mr-1" />,
  swimming_pool: <Droplets className="h-3.5 w-3.5 mr-1" />,
  fitness_center: <Dumbbell className="h-3.5 w-3.5 mr-1" />,
  spa_and_wellness: <Leaf className="h-3.5 w-3.5 mr-1" />,
  restaurant: <Utensils className="h-3.5 w-3.5 mr-1" />,
  room_service: <Bell className="h-3.5 w-3.5 mr-1" />,
  bar_and_lounge: <Wine className="h-3.5 w-3.5 mr-1" />,
  parking: <Car className="h-3.5 w-3.5 mr-1" />,
  concierge_services: <BadgeInfo className="h-3.5 w-3.5 mr-1" />,
  pet_friendly: <Dog className="h-3.5 w-3.5 mr-1" />,
  business_facilities: <Briefcase className="h-3.5 w-3.5 mr-1" />,
  laundry_services: <ShowerHead className="h-3.5 w-3.5 mr-1" />,
  child_friendly_facilities: <Baby className="h-3.5 w-3.5 mr-1" />,
  non_smoking_rooms: <Ban className="h-3.5 w-3.5 mr-1" />,
  facilities_for_disabled_guests: <Accessibility className="h-3.5 w-3.5 mr-1" />,
  family_rooms: <Users className="h-3.5 w-3.5 mr-1" />,
};

const formatAmenityLabel = (amenityKey: string): string => {
  const labelMap: Record<string, string> = {
    wifi: "WiFi",
    swimming_pool: "Swimming Pool",
    fitness_center: "Fitness Center",
    spa_and_wellness: "Spa & Wellness",
    restaurant: "Restaurant",
    room_service: "Room Service",
    bar_and_lounge: "Bar & Lounge",
    parking: "Parking",
    concierge_services: "Concierge Services",
    pet_friendly: "Pet Friendly",
    business_facilities: "Business Facilities",
    laundry_services: "Laundry Services",
    child_friendly_facilities: "Child Friendly Facilities",
    non_smoking_rooms: "Non-Smoking Rooms",
    facilities_for_disabled_guests: "Facilities for Disabled Guests",
    family_rooms: "Family Rooms",
  };
  
  return labelMap[amenityKey] || amenityKey
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export function Amenities({
  amenity,
  setAmenity,
  editedAmenity,
  editAmenityMode,
  handleAmenitySaveClick,
  handleAmenityEditClick,
  property,
  handleCreateAmenity,
}: AmenitiesProps) {
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [availableAmenities, setAvailableAmenities] = useState<
    Record<string, boolean>
  >({});
  const [amenityError, setAmenityError] = useState<string | null>(null);
  const [selectedDestinationType, setSelectedDestinationType] =
    useState<string>("");
  const [selectedPropertyType, setSelectedPropertyType] = useState<string>("");
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    clearErrors,
  } = useForm<EditedAmenity>({
    defaultValues: editedAmenity,
    mode: "onChange",
  });

  useEffect(() => {
    if (editAmenityMode && amenity) {
      setValue("destination_type", amenity.destination_type);
      setValue("property_type", amenity.property_type);
      setValue("no_of_rooms_available", amenity.no_of_rooms_available);
      setSelectedDestinationType(amenity.destination_type);
      setSelectedPropertyType(amenity.property_type);
      AmenityData.forEach((key) => {
        setValue(`amenities.${key}`, amenity.amenities[key] || false);
      });
    }
  }, [editAmenityMode, amenity, setValue]);

  useEffect(() => {
    if (property?.data?.property_amenities?.amenities) {
      setAvailableAmenities(property.data.property_amenities.amenities);
    }
  }, [property]);

  const onSubmit = async (data: EditedAmenity) => {
    setIsSubmitting(true);

    try {
      const selectedAmenities = Object.fromEntries(
        Object.entries(data.amenities || {}).filter(
          ([_, value]) => value === true
        )
      );
      if (Object.keys(selectedAmenities).length === 0) {
        setAmenityError("Please select at least one amenity.");
        toast.error("Please select at least one amenity.");
        setIsSubmitting(false);
        return;
      }
      setAmenityError(null);
      const newData = {
        destination_type: selectedDestinationType || data.destination_type,
        property_type: selectedPropertyType || data.property_type,
        no_of_rooms_available: data.no_of_rooms_available,
        amenities: { ...selectedAmenities },
      };
      await handleCreateAmenity(newData);
      setShowCreateModal(false);
      reset();
      setSelectedDestinationType("");
      setSelectedPropertyType("");
      setAmenity(newData);
      toast.success("Amenities created successfully!");
    } catch (error) {
      console.error("Error creating amenities:", error);
      toast.error("Failed to create amenities. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const onEditSubmit = async (data: EditedAmenity) => {
    setIsSubmitting(true);
    try {
      const selectedAmenities = Object.fromEntries(
        Object.entries(data.amenities).filter(([, value]) => value === true)
      );
      if (Object.keys(selectedAmenities).length === 0) {
        setAmenityError("Please select at least one amenity.");
        toast.error("Please select at least one amenity.");
        setIsSubmitting(false);
        return;
      }
      setAmenityError(null);
      const newData = {
        destination_type: selectedDestinationType || data.destination_type,
        property_type: selectedPropertyType || data.property_type,
        no_of_rooms_available: data.no_of_rooms_available,
        amenities: {
          ...selectedAmenities,
        },
      };
      await handleAmenitySaveClick(newData);
      handleAmenityEditClick();
      reset();
      setAmenity(newData);
      toast.success("Property Amenities updated successfully!");
    } catch (error) {
      console.error("Error editing amenities:", error);
      toast.error("Failed to update amenities. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const getPropertyDetail = (label: string, value: string | number) => (
    <div className="flex flex-col space-y-1 mb-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
  const renderAmenityForm = (
    onSubmitHandler: (data: EditedAmenity) => Promise<void>,
    formTitle: string,
    submitButtonText: string
  ) => (
    <div className="max-h-[90vh] overflow-y-auto px-4">
      <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4">
        <div className="grid grid-cols-1 gap-2 ">
          <div className="space-y-1.5">
            <Label htmlFor="destination_type">Destination Type</Label>
            <Select
              {...register("destination_type")}
              onValueChange={(value) => {
                setSelectedDestinationType(value);
                setValue("destination_type", value);
                clearErrors("destination_type");
              }}
              value={selectedDestinationType}
              defaultValue={amenity?.destination_type}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Destination Type" />
              </SelectTrigger>
              <SelectContent>
                {destinationTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.destination_type && (
              <p className="text-destructive text-sm mt-1">
                {errors.destination_type.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="property_type">
              Property Type <span className="text-destructive">*</span>
            </Label>
            <Select
              {...register("property_type", {
                required: "Property type is required",
              })}
              onValueChange={(value) => {
                setSelectedPropertyType(value);
                setValue("property_type", value);
                clearErrors("property_type");
              }}
              value={selectedPropertyType}
              defaultValue={amenity?.property_type}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Property Type" />
              </SelectTrigger>
              <SelectContent>
                {propertyTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.property_type && (
              <p className="text-destructive text-sm mt-1">
                {errors.property_type.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="no_of_rooms_available">
              Rooms Available <span className="text-destructive">*</span>
            </Label>
            <Input
              id="no_of_rooms_available"
              {...register("no_of_rooms_available", {
                required: "Rooms Available is required",
                valueAsNumber: true,
              })}
              type="number"
              min={0}
              placeholder="Total No. of Rooms Available"
              defaultValue={amenity?.no_of_rooms_available}
            />
            {errors.no_of_rooms_available && (
              <p className="text-destructive text-sm mt-1">
                {errors.no_of_rooms_available.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-base font-medium mb-3">Available Amenities</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {AmenityData.map((amenity) => (
              <div key={amenity} className="flex items-center space-x-2">
                <Checkbox
                  id={amenity}
                  checked={watch(`amenities.${amenity}`) || false}
                  onCheckedChange={(value: boolean) => {
                    setValue(`amenities.${amenity}`, value);
                    const isAnyAmenitySelected = AmenityData.some((key) =>
                      key === amenity ? value : watch(`amenities.${key}`)
                    );

                    if (isAnyAmenitySelected) {
                      setAmenityError(null);
                    }
                  }}
                />
                <label
                  htmlFor={amenity}
                  className="text-sm font-medium leading-none flex items-center cursor-pointer"
                >
                  {amenityIcons[amenity]}
                  {formatAmenityLabel(amenity)}
                </label>
              </div>
            ))}
          </div>
          {amenityError && (
            <p className="text-destructive text-sm mt-1">{amenityError}</p>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            onClick={() =>
              formTitle === "Create Amenities"
                ? setShowCreateModal(false)
                : handleAmenityEditClick()
            }
            className="mt-2 md:mt-0"
            variant="outline"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center">
                <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                {formTitle === "Create Amenities" ? "Creating..." : "Updating..."}
              </span>
            ) : (
              submitButtonText
            )}
          </Button>
        </DialogFooter>
      </form>
    </div>
  );

  return (
    <Card className="w-full shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between border-b pb-3">
        <CardTitle className="text-primary font-semibold text-lg sm:text-xl">
          Property Amenities
        </CardTitle>
        <div className="flex gap-2">
          {editAmenityMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAmenityEditClick}
            >
              <X className="h-4 w-4 mr-1" /> Cancel
            </Button>
          )}
          {amenity ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAmenityEditClick}
            >
              <PenTool className="h-4 w-4 mr-1" />
              Edit
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Create Amenities
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Create Amenities Dialog */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent
            className="sm:max-w-md md:max-w-lg"
            onInteractOutside={(e) => e.preventDefault()}
            onPointerDownOutside={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle>Create Amenities</DialogTitle>
            </DialogHeader>
            {renderAmenityForm(onSubmit, "Create Amenities", "Create")}
          </DialogContent>
        </Dialog>

        {/* Edit Amenities Dialog */}
        <Dialog open={editAmenityMode} onOpenChange={handleAmenityEditClick}>
          <DialogContent
            className="sm:max-w-md md:max-w-lg"
            onInteractOutside={(e) => e.preventDefault()}
            onPointerDownOutside={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle>Edit Amenities</DialogTitle>
            </DialogHeader>
            {renderAmenityForm(onEditSubmit, "Edit Amenities", "Update")}
          </DialogContent>
        </Dialog>

        {/* Display current amenities */}
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-52" />
            <Skeleton className="h-4 w-40" />
          </div>
        ) : (
          <div className="space-y-6">
            {amenity ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {getPropertyDetail(
                  "Destination Type",
                  amenity.destination_type
                )}
                {getPropertyDetail("Property Type", amenity.property_type)}
                {getPropertyDetail(
                  "Rooms Available",
                  amenity.no_of_rooms_available
                )}
              </div>
            ) : (
              <div className="bg-muted/50 rounded-lg p-6 text-center">
                <p className="text-muted-foreground">
                  No amenities information found
                </p>
              </div>
            )}
          </div>
        )}

        {/* Display available amenities */}
        {amenity?.amenities &&
          !editAmenityMode &&
          Object.values(amenity.amenities).some((value) => value) && (
            <div className="mt-8 pt-6 border-t">
              <h4 className="text-sm font-medium mb-4">Available Amenities</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(amenity.amenities).map(
                  ([amenityKey, isAvailable]) => {
                    if (isAvailable) {
                      return (
                        <Badge
                          key={amenityKey}
                          variant="secondary"
                          className="bg-primary text-primary-foreground flex items-center px-3 py-1"
                        >
                          {amenityIcons[amenityKey]}
                          {formatAmenityLabel(amenityKey)}
                        </Badge>
                      );
                    }
                    return null;
                  }
                )}
              </div>
            </div>
          )}
      </CardContent>
    </Card>
  );
}