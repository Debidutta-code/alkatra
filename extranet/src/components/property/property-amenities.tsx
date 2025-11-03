"use client";

import React, {
  useEffect,
  useState,
} from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./../ui/card";
import { Button } from "./../ui/button";
import { Checkbox } from "./../ui/checkbox";
import axios from "axios";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import { RootState, useSelector } from "../../redux/store";

const createPropertyAmenitiesSchema = z.object({
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
  non_smoking_rooms: z.boolean(),
  facilities_for_disabled_guests: z.boolean(),
  family_rooms: z.boolean(),
});

type Inputs = {
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
  non_smoking_rooms: boolean;
  facilities_for_disabled_guests: boolean;
  family_rooms: boolean;
};

type Props = {
  onPrevious: () => void;
  onNext: () => void;
};

export default function PropertyAddress({ onNext, onPrevious }: Props) {
  const [propertyAminity, setPropertyAminity] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [newPropertyAminity, setnewPropertyAminity] = useState<boolean>(false);

  const { accessToken } = useSelector((state: RootState) => state.auth);
  const property_id = useSearchParams().get("property_id");
  const form = useForm<Inputs>({
    defaultValues: {
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
      non_smoking_rooms: false,
      facilities_for_disabled_guests: false,
      family_rooms: false,
    },
    resolver: zodResolver(createPropertyAmenitiesSchema),
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState,
    getValues,
  } = form;
  const {
    errors: {
    },
  } = formState;


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
      non_smoking_rooms: !!data.non_smoking_rooms,
      facilities_for_disabled_guests: !!data.facilities_for_disabled_guests,
      family_rooms: !!data.family_rooms,
    };

    setFormLoading(true);

    try {
      let propertyAmenitiesCreateResponse;

      if (!newPropertyAminity) {
        const updatedProperty = {
          ...propertyAminity,
          ...data,
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
        toast.success("Property Amenities updated successfully!");
      } else {
        const propertyCreateBody = {
          ...data,
          propertyInfo_id: property_id,
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
        toast.success("Property Amenities Created Successfully!");
      }

      console.log("property data:", data);
      console.log("NewRoom Data:", propertyAmenitiesCreateResponse);
      setFormLoading(false);

      onNext();
    } catch (err) {
      console.log("error from update aminity", err);
      if (axios.isAxiosError(err)) {
        setFormLoading(false);
        // toast.error(err?.response?.data?.message);
        toast.error("Failed to create property amenities. Please try again.");
      }
    }
  };

  const featchPropertyAminity = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/property/${property_id}`
      );
      if (!response.data.data.property_amenities) {
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

  useEffect(() => {
    if (propertyAminity) {
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
      setValue(
        "non_smoking_rooms",
        propertyAminity?.amenities?.non_smoking_rooms || false
      );
      setValue(
        "facilities_for_disabled_guests",
        propertyAminity?.amenities?.facilities_for_disabled_guests || false
      );
      setValue(
        "family_rooms",
        propertyAminity?.amenities?.family_rooms || false
      );
    }
  }, [propertyAminity]);
  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 ">
        <CardTitle>Property Amenities</CardTitle>
        <Card className="">
          <CardHeader>
            <CardTitle>Guest’s favorites</CardTitle>
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
            <div className="flex items-center space-x-2">
              <Checkbox
                id="non_smoking_rooms"
                checked={propertyAminity?.amenities?.non_smoking_rooms}
                {...register("non_smoking_rooms")}
                onCheckedChange={(value: boolean) => {
                  setValue("non_smoking_rooms", value);
                  setPropertyAminity((prev: any) => {
                    const newAmenities = prev?.amenities
                      ? { ...prev.amenities, non_smoking_rooms: value }
                      : { non_smoking_rooms: value };
                    return { ...prev, amenities: newAmenities };
                  });
                }}
              />
              <label
                htmlFor="non_smoking_rooms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Non-Smoking Rooms
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="facilities_for_disabled_guests"
                checked={propertyAminity?.amenities?.facilities_for_disabled_guests}
                {...register("facilities_for_disabled_guests")}
                onCheckedChange={(value: boolean) => {
                  setValue("facilities_for_disabled_guests", value);
                  setPropertyAminity((prev: any) => {
                    const newAmenities = prev?.amenities
                      ? { ...prev.amenities, facilities_for_disabled_guests: value }
                      : { facilities_for_disabled_guests: value };
                    return { ...prev, amenities: newAmenities };
                  });
                }}
              />
              <label
                htmlFor="facilities_for_disabled_guests"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Facilities for disabled guests
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="family_rooms"
                checked={propertyAminity?.amenities?.family_rooms}
                {...register("family_rooms")}
                onCheckedChange={(value: boolean) => {
                  setValue("family_rooms", value);
                  setPropertyAminity((prev: any) => {
                    const newAmenities = prev?.amenities
                      ? { ...prev.amenities, family_rooms: value }
                      : { family_rooms: value };
                    return { ...prev, amenities: newAmenities };
                  });
                }}
              />
              <label
                htmlFor="family_rooms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Family rooms
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