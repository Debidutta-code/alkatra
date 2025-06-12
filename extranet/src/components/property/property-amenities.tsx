"use client";

import React, {
  MouseEventHandler,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./../ui/card";
import { Label } from "./../ui/label";
import { Input } from "./../ui/input";
import { Button } from "./../ui/button";
// import { ReloadIcon } from "@radix-ui/react-icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./../ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./../ui/dialog";
import { Checkbox } from "./../ui/checkbox";
import axios, { Axios, AxiosError } from "axios";
import { boolean, number, z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { BookOpen, MapPinned, ShowerHead } from "lucide-react";
import { cn } from "./../../lib/utils";
import { Textarea } from "./../ui/textarea";
import { useRouter, useSearchParams } from "next/navigation";
import { RootState, useSelector } from "../../redux/store";

const createPropertyAmenitiesSchema = z.object({
  destination_type: z.string().min(1, "Destination type is required"),
  property_type: z.string().min(1, "Property type is required"),
  no_of_rooms_available: z.string().min(1, "No of rooms is required"),
  wifi: z.boolean(),
  swimming_pool: z.boolean(),
  fitness_center: z.boolean(),
  spa_and_wellness: z.boolean(),
  restaurant: z.boolean(),
  room_service: z.boolean(),
  bar_and_lounge: z.boolean(),
  parking: z.boolean(),
  concierge_services: z.boolean(),
  pet_friendly: z.boolean(),
  business_facilities: z.boolean(),
  laundry_services: z.boolean(),
  child_friendly_facilities: z.boolean(),
});

type Inputs = {
  destination_type: string;
  property_type: string;
  no_of_rooms_available: string;
  wifi: boolean;
  swimming_pool: boolean;
  fitness_center: boolean;
  spa_and_wellness: boolean;
  restaurant: boolean;
  room_service: boolean;
  bar_and_lounge: boolean;
  parking: boolean;
  concierge_services: boolean;
  pet_friendly: boolean;
  business_facilities: boolean;
  laundry_services: boolean;
  child_friendly_facilities: boolean;
};

type Props = {
  onPrevious: () => void;
  onNext: () => void;
};

export default function PropertyAddress({ onNext, onPrevious }: Props) {
  const [openDialog, setOpenDialog] = useState(false);
  const [propertyAminity, setPropertyAminity] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [newPropertyAminity, setnewPropertyAminity] = useState<boolean>(false);

  const { accessToken } = useSelector((state: RootState) => state.auth);
  const property_id = useSearchParams().get("property_id");
  const router = useRouter();

  const form = useForm<Inputs>({
    defaultValues: {
      destination_type: "",
      property_type: "",
      no_of_rooms_available: "1",
      wifi: false,
      swimming_pool: false,
      fitness_center: false,
      spa_and_wellness: false,
      restaurant: false,
      room_service: false,
      bar_and_lounge: false,
      parking: false,
      concierge_services: false,
      pet_friendly: false,
      business_facilities: false,
      laundry_services: false,
      child_friendly_facilities: false,
    },
    resolver: zodResolver(createPropertyAmenitiesSchema),
  });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState,
    getValues,
    formState: { errors, isSubmitting },
  } = form;
  const {
    errors: {
      destination_type: destinationTypeError,
      property_type: propertyTypeError,
      no_of_rooms_available: noOfRoomsAvailableError,
    },
  } = formState;

  console.log("-----#########_______", errors);

  // useEffect(() => {
  //   destinationTypeError && toast.error(destinationTypeError.message!);
  //   propertyTypeError && toast.error(propertyTypeError.message!);
  //   noOfRoomsAvailableError && toast.error(noOfRoomsAvailableError.message!);
  // }, [destinationTypeError, propertyTypeError, noOfRoomsAvailableError]);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    console.log("on submit called");
    const amenities = {
      wifi: !!data.wifi,
      swimming_pool: !!data.swimming_pool,
      fitness_center: !!data.fitness_center,
      spa_and_wellness: !!data.spa_and_wellness,
      restaurant: !!data.restaurant,
      room_service: !!data.room_service,
      bar_and_lounge: !!data.bar_and_lounge,
      parking: !!data.parking,
      concierge_services: !!data.concierge_services,
      pet_friendly: !!data.pet_friendly,
      business_facilities: !!data.business_facilities,
      laundry_services: !!data.laundry_services,
      child_friendly_facilities: !!data.child_friendly_facilities,
    };

    console.log("_____+_+_+_+_+_+_+_+_+_+_+_+_+_+_", amenities);

    setFormLoading(true);

    try {
      let propertyAmenitiesCreateResponse;

      if (!newPropertyAminity) {
        const updatedProperty = {
          ...propertyAminity,
          ...data,
          no_of_rooms_available: data.no_of_rooms_available,
          amenities,
        };
        const {
          data: { data: updatedPropertyResponse },
        } = await axios.patch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/property/aminity/${property_id}`,
          updatedProperty,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        propertyAmenitiesCreateResponse = updatedPropertyResponse;
        console.log(
          "propertyAmenitiesCreateResponse ========",
          propertyAmenitiesCreateResponse
        );
        toast.success("Property Amenities updated successfully!");
      } else {
        const propertyCreateBody = {
          ...data,
          propertyInfo_id: property_id,
          no_of_rooms_available: data.no_of_rooms_available,
          amenities,
        };

        const {
          data: { data: createdPropertyResponse },
        } = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/property/amenities`,
          propertyCreateBody,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        propertyAmenitiesCreateResponse = createdPropertyResponse;
        toast.success("Property Aminity Create successfully!");
      }

      console.log("property data:", data);
      console.log("NewRoom Data:", propertyAmenitiesCreateResponse);
      setFormLoading(false);

      onNext();
    } catch (err) {
      console.log("error from update aminity", err);
      if (axios.isAxiosError(err)) {
        setFormLoading(false);
        toast.error(err?.response?.data?.message);
      }
    }
  };

  const featchPropertyAminity = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/property/${property_id}`
      );
      console.log(
        "Featching  From PropertyAminity",
        response.data.data.property_amenities
      );
      console.log(
        "~~~~~~~~~~~~~~~~~~~~~~",
        response.data.data.property_amenities
      );
      console.log(
        "!response.data.data.property_amenities._id",
        !response.data.data?.property_amenities
      );
      if (!response.data.data.property_amenities) {
        console.log("new called_)_)_)_)_)_)___)_)_)_)_)_)__)_))_");
        setnewPropertyAminity(true);
      }
      setPropertyAminity(response.data.data.property_amenities);
      setLoading(false);
    } catch (error) {
      console.error("error featching Property details:", error);
      setLoading(false);
    }
  };
  console.log("setnewPropertyAminity", newPropertyAminity);
  useEffect(() => {
    if (property_id) {
      console.log("fetch property called");
      featchPropertyAminity();
    }
  }, []);

  console.log("form value", getValues());
  console.log("propertyAminity details", propertyAminity);

  useEffect(() => {
    if (propertyAminity) {
      console.log("set values %^%^%^%^%^%^%^%^%^%^%^5");
      setValue("destination_type", propertyAminity.destination_type || "");
      setValue("property_type", propertyAminity.property_type || "");
      setValue(
        "no_of_rooms_available",
        propertyAminity?.no_of_rooms_available?.toString() || "1"
      );
      setValue("wifi", propertyAminity?.amenities?.wifi || false);
      setValue(
        "swimming_pool",
        propertyAminity?.amenities?.swimming_pool || false
      );
      setValue(
        "fitness_center",
        propertyAminity?.amenities?.fitness_center || false
      );
      setValue(
        "spa_and_wellness",
        propertyAminity?.amenities?.spa_and_wellness || false
      );
      setValue("restaurant", propertyAminity?.amenities?.restaurant || false);
      setValue(
        "room_service",
        propertyAminity?.amenities?.room_service || false
      );
      setValue(
        "bar_and_lounge",
        propertyAminity?.amenities?.bar_and_lounge || false
      );
      setValue("parking", propertyAminity?.amenities?.parking || false);
      setValue(
        "concierge_services",
        propertyAminity?.amenities?.concierge_services || false
      );
      setValue(
        "pet_friendly",
        propertyAminity?.amenities?.pet_friendly || false
      );
      setValue(
        "business_facilities",
        propertyAminity?.amenities?.business_facilities || false
      );
      setValue(
        "laundry_services",
        propertyAminity?.amenities?.laundry_services || false
      );
      setValue(
        "child_friendly_facilities",
        propertyAminity?.amenities?.child_friendly_facilities || false
      );
    }
  }, [propertyAminity]);
  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 ">
        <CardTitle>Property Amenities</CardTitle>
        <div className="items-center flex flex-col md:flex-row md:gap-4 ">
          {/* Destination Type Select */}
          <div className=" inline self-end w-full md:w-1/2 relative">
            <Label htmlFor="destination_type">
              Destination Type <span className="text-destructive">*</span>
            </Label>
            <div className="inline-block relative w-full mt-1">
              <select
                {...register("destination_type")}
                onChange={(e) =>
                  setPropertyAminity((prev: any) => ({
                    ...prev,
                    destination_type: e.target.value,
                  }))
                }
                className={`block appearance-none w-full bg-background border ${
                  destinationTypeError ? "border-red-500" : "border-input"
                } py-2 px-3 h-10  rounded-md leading-tight focus:outline-none focus:border-blue-500`}
              >
                <option value="" disabled>
                  Select Destination Type
                </option>
                <option value="RESORT">RESORT</option>
                <option value="VACATION RENTAL">VACATION RENTAL</option>
              </select>
              {destinationTypeError && (
                <p className="text-red-500 text-sm mt-1">
                  {destinationTypeError.message}
                </p>
              )}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 0 1 1.414-1.414L10 8.586l3.293-3.293a1 1 0 1 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Property Type Select */}
          <div className="self-end w-full md:w-1/2 relative">
            <Label htmlFor="property_type">
              Property Type <span className="text-destructive">*</span>
            </Label>
            <div className="inline-block relative w-full  mt-1">
              <select
                {...register("property_type")}
                onChange={(e) =>
                  setPropertyAminity((prev: any) => ({
                    ...prev,
                    property_type: e.target.value,
                  }))
                }
                className={`block appearance-none w-full bg-background border ${
                  propertyTypeError ? "border-red-500" : "border-input"
                } py-2 px-3 h-10 rounded-md leading-tight focus:outline-none focus:border-blue-500`}
              >
                <option value="" disabled>
                  Select Property Type
                </option>
                <option value="COMMERCIAL PROPERTY">COMMERCIAL PROPERTY</option>
                <option value="INDUSTRIAL PROPERTY">INDUSTRIAL PROPERTY</option>
              </select>
              {propertyTypeError && (
                <p className="text-red-500 text-sm mt-1">
                  {propertyTypeError.message}
                </p>
              )}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 0 1 1.414-1.414L10 8.586l3.293-3.293a1 1 0 1 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 pr-4">
          <div className="min-w-max">
            <Label htmlFor="no_of_rooms_available">
              No. Of Rooms Available <span className="text-destructive">*</span>
            </Label>
            <Input
              id="no_of_rooms_available"
              type="number"
              min={1}
              variant={noOfRoomsAvailableError && "error"}
              {...register("no_of_rooms_available")}
              value={propertyAminity?.no_of_rooms_available}
              onChange={(e) =>
                setPropertyAminity((prev: any) => ({
                  ...propertyAminity,
                  no_of_rooms_available: e.target.value.toString(),
                }))
              }
            />
            {noOfRoomsAvailableError && (
              <p className="text-red-500 text-sm mt-1">
                {noOfRoomsAvailableError.message}
              </p>
            )}
          </div>
        </div>
        <Card className="">
          <CardHeader>
            <CardTitle>Other Amenities</CardTitle>
          </CardHeader>
          <CardContent className="flex lg:gap-4 gap-2 flex-wrap">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="wifi"
                checked={propertyAminity?.amenities?.wifi || false}
                {...register("wifi")}
                onCheckedChange={(value: boolean) => {
                  setValue("wifi", value);
                  setPropertyAminity((prev: any) => {
                    const newAmenities = prev?.amenities
                      ? { ...prev.amenities, wifi: value }
                      : { wifi: value };
                    return { ...prev, amenities: newAmenities };
                  });
                }}
              />
              <label
                htmlFor="wifi"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Wifi
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="swimming_pool"
                {...register("swimming_pool")}
                checked={propertyAminity?.amenities?.swimming_pool}
                onCheckedChange={(value: boolean) => {
                  setValue("swimming_pool", value);
                  setPropertyAminity((prev: any) => {
                    const newAmenities = prev?.amenities
                      ? { ...prev.amenities, swimming_pool: value }
                      : { swimming_pool: value };
                    return { ...prev, amenities: newAmenities };
                  });
                }}
              />
              <label
                htmlFor="swimming_pool"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Swimming Pool
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="fitness_center"
                checked={propertyAminity?.amenities?.fitness_center}
                {...register("fitness_center")}
                onCheckedChange={(value: boolean) => {
                  setValue("fitness_center", value);
                  setPropertyAminity((prev: any) => {
                    const newAmenities = prev?.amenities
                      ? { ...prev.amenities, fitness_center: value }
                      : { fitness_center: value };
                    return { ...prev, amenities: newAmenities };
                  });
                }}
              />
              <label
                htmlFor="fitness_center"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Fitness Center
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="spa_and_wellness"
                checked={propertyAminity?.amenities?.spa_and_wellness}
                {...register("spa_and_wellness")}
                onCheckedChange={(value: boolean) => {
                  setValue("spa_and_wellness", value);
                  setPropertyAminity((prev: any) => {
                    const newAmenities = prev?.amenities
                      ? { ...prev.amenities, spa_and_wellness: value }
                      : { spa_and_wellness: value };
                    return { ...prev, amenities: newAmenities };
                  });
                }}
              />
              <label
                htmlFor="spa_and_wellness"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Spa and Wellness
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="restaurant"
                checked={propertyAminity?.amenities?.restaurant}
                {...register("restaurant")}
                onCheckedChange={(value: boolean) => {
                  setValue("restaurant", value);
                  setPropertyAminity((prev: any) => {
                    const newAmenities = prev?.amenities
                      ? { ...prev.amenities, restaurant: value }
                      : { restaurant: value };
                    return { ...prev, amenities: newAmenities };
                  });
                }}
              />
              <label
                htmlFor="restaurant"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Restaurant
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="room_service"
                checked={propertyAminity?.amenities?.room_service}
                {...register("room_service")}
                onCheckedChange={(value: boolean) => {
                  setValue("room_service", value);
                  setPropertyAminity((prev: any) => {
                    const newAmenities = prev?.amenities
                      ? { ...prev.amenities, room_service: value }
                      : { room_service: value };
                    return { ...prev, amenities: newAmenities };
                  });
                }}
              />
              <label
                htmlFor="room_service"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Room Service
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="bar_and_lounge"
                checked={propertyAminity?.amenities?.bar_and_lounge}
                {...register("bar_and_lounge")}
                onCheckedChange={(value: boolean) => {
                  setValue("bar_and_lounge", value);
                  setPropertyAminity((prev: any) => {
                    const newAmenities = prev?.amenities
                      ? { ...prev.amenities, bar_and_lounge: value }
                      : { bar_and_lounge: value };
                    return { ...prev, amenities: newAmenities };
                  });
                }}
              />
              <label
                htmlFor="bar_and_lounge"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Bar and Lounge
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="parking"
                checked={propertyAminity?.amenities?.parking}
                {...register("parking")}
                onCheckedChange={(value: boolean) => {
                  setValue("parking", value);
                  setPropertyAminity((prev: any) => {
                    const newAmenities = prev?.amenities
                      ? { ...prev.amenities, parking: value }
                      : { parking: value };
                    return { ...prev, amenities: newAmenities };
                  });
                }}
              />
              <label
                htmlFor="parking"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Parking
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="concierge_services"
                checked={propertyAminity?.amenities?.concierge_services}
                {...register("concierge_services")}
                onCheckedChange={(value: boolean) => {
                  setValue("concierge_services", value);
                  setPropertyAminity((prev: any) => {
                    const newAmenities = prev?.amenities
                      ? { ...prev.amenities, concierge_services: value }
                      : { concierge_services: value };
                    return { ...prev, amenities: newAmenities };
                  });
                }}
              />
              <label
                htmlFor="concierge_services"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Concierge Services
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="pet_friendly"
                checked={propertyAminity?.amenities?.pet_friendly}
                {...register("pet_friendly")}
                onCheckedChange={(value: boolean) => {
                  setValue("pet_friendly", value);
                  setPropertyAminity((prev: any) => {
                    const newAmenities = prev?.amenities
                      ? { ...prev.amenities, pet_friendly: value }
                      : { pet_friendly: value };
                    return { ...prev, amenities: newAmenities };
                  });
                }}
              />
              <label
                htmlFor="pet_friendly"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Pet Friendly
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="business_facilities"
                checked={propertyAminity?.amenities?.business_facilities}
                {...register("business_facilities")}
                onCheckedChange={(value: boolean) => {
                  setValue("business_facilities", value);
                  setPropertyAminity((prev: any) => {
                    const newAmenities = prev?.amenities
                      ? { ...prev.amenities, business_facilities: value }
                      : { business_facilities: value };
                    return { ...prev, amenities: newAmenities };
                  });
                }}
              />
              <label
                htmlFor="business_facilities"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Business Facilities
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="laundry_services"
                checked={propertyAminity?.amenities?.laundry_services}
                {...register("laundry_services")}
                onCheckedChange={(value: boolean) => {
                  console.log("00000", value);
                  setValue("laundry_services", value);
                  setPropertyAminity((prev: any) => {
                    const newAmenities = prev?.amenities
                      ? { ...prev.amenities, laundry_services: value }
                      : { laundry_services: value };
                    return { ...prev, amenities: newAmenities };
                  });
                }}
              />
              <label
                htmlFor="laundry_services"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Laundry Services
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="child_friendly_facilities"
                checked={propertyAminity?.amenities?.child_friendly_facilities}
                {...register("child_friendly_facilities")}
                onCheckedChange={(value: boolean) => {
                  console.log("value", getValues("child_friendly_facilities"));
                  setValue("child_friendly_facilities", value);
                  setPropertyAminity((prev: any) => {
                    const newAmenities = prev?.amenities
                      ? { ...prev.amenities, child_friendly_facilities: value }
                      : { child_friendly_facilities: value };
                    return { ...prev, amenities: newAmenities };
                  });
                }}
              />
              <label
                htmlFor="child_friendly_facilities"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Child Friendly Facilities
              </label>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end gap-4 w-full mt-4">
          <div className="mt-2">
            <Button
              className="lg:w-[180px] md:w-[120px] w-[100px] text-right"
              onClick={onPrevious}
              variant={"secondary"}
              type="button"
            >
              Back
            </Button>
          </div>

          <div className="mt-2">
            <Button
              className="lg:w-[180px] md:w-[120px] w-[100px]"
              type="submit"
            >
              Next
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}
