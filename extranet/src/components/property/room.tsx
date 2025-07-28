"use client";

import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./../ui/card";
import { Label } from "./../ui/label";
import { Input } from "./../ui/input";
import { Button, buttonVariants } from "./../ui/button";
import { ReloadIcon } from "@radix-ui/react-icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./../ui/dialog";
import Image from "next/image";
import { FileRejection, useDropzone } from "react-dropzone";
import Dropzone from "../dropzone";
import { Checkbox } from "./../ui/checkbox";
import axios, { } from "axios";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { cn } from "./../../lib/utils";
import { Textarea } from "./../ui/textarea";
import { useSearchParams } from "next/navigation";
import { RootState, useSelector } from "../../redux/store";

export const roomSchema = z.object({
  room_name: z.string().min(1, "Room name is required"),
  room_type: z.string().min(1, "Room type is required"),
  total_room: z
    .number({ required_error: "Total rooms is required" })
    // .nonnegative("Room count must be positive")
    .min(1, { message: "Value must be greater than or equal to 1" }),

  floor: z
    .number()
    .nonnegative("Value must be greater than or equal to 0")
    .optional(),
  room_view: z.string().optional(),
  room_size: z
    .number({ required_error: "Room size is required" })
    .min(1, { message: "Value must be greater than or equal to 1" }),
  room_unit: z.string().min(1, "Room unit is required"),
  smoking_policy: z.string().min(1, "Smoking policy is required"),
  max_occupancy: z
    .number({ required_error: "Max occupancy is required" })
    .min(1, { message: "Value must be greater than or equal to 1" }),
  max_number_of_adults: z
    .number({ required_error: "Enter max adults" })
    .min(1, { message: "Value must be greater than or equal to 1" }),
  max_number_of_children: z
    .number()
    .nonnegative("Value must be greater than or equal to 0")
    .optional(),
  number_of_bedrooms: z
    .number({ required_error: "Enter number of bedrooms" })
    .min(1, { message: "Value must be greater than or equal to 1" }),
  number_of_living_room: z
    .number()
    .nonnegative("Value must be greater than or equal to 0")
    .optional(),
  extra_bed: z
    .number()
    .nonnegative("Value must be greater than or equal to 0")
    .optional(),
  description: z.string().optional(),
  image: z.array(z.string()).optional(),
  available: z.boolean(),
});

type Inputs = {
  room_name: string;
  room_type: string;
  total_room: number;
  floor?: number;
  room_view?: string;
  room_size: number;
  room_unit: string;
  smoking_policy: string;
  max_occupancy: number;
  max_number_of_adults: number;
  max_number_of_children?: number;
  number_of_bedrooms: number;
  number_of_living_room?: number;
  extra_bed?: number;
  description?: string;
  image?: string[];
  available: boolean;
};

interface IFileWithPreview extends File {
  preview: string;
}

interface RoomDetails {
  room_name: string;
  room_type: string;
  total_room: number;
  floor?: number;
  room_view?: string;
  room_size: number;
  room_unit: string;
  smoking_policy: string;
  max_occupancy: number;
  max_number_of_adults: number;
  max_number_of_children: number;
  number_of_bedrooms: number;
  number_of_living_room: number;
  extra_bed: number;
  description?: string;
  image?: string[];
  available: boolean;
}

type Props = {
  onPrevious: () => void;
  onNext: () => void;
};

export default function XRooms({ onNext, onPrevious }: Props) {
  // const accessToken = Cookies.get("accessToken");
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const property_id = useSearchParams().get("property_id");

  const [openDialog, setOpenDialog] = useState(false);
  const [roomDetails, setRoomDetails] = useState<RoomDetails | null>(null);
  const [newRoomDetails, setNewRoomDetails] = useState<boolean>(true);

  // const [propertyImageUrls, setPropertyImageUrls] = useState<
  //   { public_id: string; url: string; secure_url: string }[]
  // >([]);
  const [propertyImageUrls, setPropertyImageUrls] = useState<Array<any>>([]);

  const [propertyImagePreviewDialog, setPropertyImagePreviewDialog] =
    useState(false);
  const [files, setFiles] = useState<IFileWithPreview[]>([]);
  const [rejected, setRejected] = useState<FileRejection[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [priceCategory, setPriceCategory] = useState<any[]>([]);
  const [category, setCategory] = useState<any[]>([]);

  const form = useForm<Inputs>({
    defaultValues: {
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
      number_of_bedrooms: 1,
      number_of_living_room: 0,
      extra_bed: 0,
      description: "",
      image: [],
      available: false,
    },
    resolver: zodResolver(roomSchema),
  });

  const { register, handleSubmit, setValue, formState } = form;
  const {
    errors: {
      room_name: room_nameError,
      room_type: room_typeError,
      total_room: total_roomError,
      floor: floorError,
      room_view: room_viewError,
      room_size: room_sizeError,
      room_unit: room_unitError,
      smoking_policy: smoking_policyError,
      max_occupancy: max_occupancyError,
      max_number_of_adults: max_number_of_adultsError,
      max_number_of_children: max_number_of_childrenError,
      number_of_bedrooms: number_of_bedroomsError,
      number_of_living_room: number_of_living_roomError,
      extra_bed: extra_bedError,
      description: descriptionError,
      image: imageError,
    },
  } = formState;

  function handleCategoryChange(e: any) {
    const price_list = priceCategory.filter(
      (category: any) => category.price_category == e.target.value
    );
    setCategory(price_list);
  }

  useEffect(() => {
    console.log({ errors: formState.errors });
  }, [formState.errors]);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      // const imageUrls = propertyImageUrls.map(
      //   (propertyImage) => propertyImage.url
      // );
      const imageUrls = propertyImageUrls;

      const roomBody = {
        ...data,
        propertyInfo_id: property_id,
        image: imageUrls,
      };

      setFormLoading(true);

      if (!newRoomDetails) {
        const updatedRoomBody = { ...roomDetails, ...roomBody };
        console.log("Updated Room", updatedRoomBody);
        await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/room/${property_id}`,
          updatedRoomBody,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        toast.success("Room details updated successfully!");
      } else {
        const {
          data: { data: newRoom },
        } = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/room`,
          roomBody,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        console.log({ newRoom });
        toast.success("Room created successfully!");
      }

      setFormLoading(false);
      onNext();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setFormLoading(false);
        toast.error(err?.response?.data?.message);
      }
    }
  };

  const packFiles = (files: IFileWithPreview[]) => {
    const data = new FormData();

    [...files].forEach((file, i) => {
      data.append(`file`, file, file.name);
    });
    return data;
  };

  const handlePropertyImageUpload = async () => {
    try {
      if (files.length) {
        setLoading(true);
        const data = packFiles(files);
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/upload`,
          data,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        const urls = response.data.data.urls;
        setOpenDialog(false);
        setPropertyImageUrls(urls);
      }
    } catch (error) {
      console.error("Error uploading room images:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/property/${property_id}`
        );
        if (response.data.data.property_room) {
          setNewRoomDetails(false);
        }
        setRoomDetails(response.data.data.property_room);
        console.log("Room details", response.data.data.property_room);
      } catch (error) {
        console.error("Error fetching room details:", error);
      }
    };

    if (property_id) {
      fetchRoomDetails();
    }
  }, [property_id]);

  useEffect(() => {
    if (roomDetails) {
      setValue("room_name", roomDetails.room_name || "");
      setValue("room_type", roomDetails.room_type || "");
      setValue("total_room", roomDetails.total_room);
      setValue("floor", roomDetails.floor);
      setValue("room_view", roomDetails.room_view || "");
      setValue("room_size", roomDetails.room_size);
      setValue("room_unit", roomDetails.room_unit || "");
      setValue("smoking_policy", roomDetails.smoking_policy || "");
      setValue("max_occupancy", roomDetails.max_occupancy);
      setValue("max_number_of_adults", roomDetails.max_number_of_adults);
      setValue("max_number_of_children", roomDetails.max_number_of_children);
      setValue("number_of_bedrooms", roomDetails.number_of_bedrooms);
      setValue("number_of_living_room", roomDetails.number_of_living_room);
      setValue("extra_bed", roomDetails.extra_bed);
      setValue("description", roomDetails.description || "");
      setValue("image", roomDetails.image || []);
    }
  }, [roomDetails, setValue]);

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardTitle>Rooms</CardTitle>

        {/* box 1 */}
        <div className=" flex md:flex-row flex-col justify-center mt-1  md:gap-1 lg:gap-3 ">
          {/* Room Name field */}
          <div className="w-full md:w-1/2">
            <Label htmlFor="room_name">
              Room Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="room_name"
              className="h-9"
              value={roomDetails?.room_name}
              {...register("room_name")}
              onChange={(e) =>
                setRoomDetails((prevDetails) => ({
                  ...prevDetails!,
                  room_name: e.target.value,
                }))
              }
              placeholder="Business Suite"
            />
            {room_nameError && (
              <p className="text-red-500 text-sm">
                {room_nameError.message}
              </p>
            )}
          </div>

          {/* Room Type field */}
          <div className="w-full md:w-1/2">
            <Label htmlFor="room_type">
              Room Type <span className="text-destructive">*</span>
            </Label>
            <Input
              id="room_type"
              className="h-9"
              value={roomDetails?.room_type}
              {...register("room_type")}
              onChange={(e) =>
                setRoomDetails((prevDetails) => ({
                  ...prevDetails!,
                  room_type: e.target.value,
                }))
              }
              type="string"
              placeholder="Single Room"
            />
            {room_typeError && (
              <p className="text-red-500 text-sm ">
                {room_typeError.message}
              </p>
            )}
          </div>
        </div>

        {/* box 2 */}
        <div className="flex items-start md:flex-row flex-col justify-center  md:gap-1 lg:gap-3">
          {/* Total Room field */}
          <div className="w-full">
            <Label htmlFor="total_room">
              Total Room <span className="text-destructive">*</span>
            </Label>
            <Input
              id="total_room"
              className="h-9"
              // min={1}
              value={roomDetails?.total_room}
              {...register("total_room", { valueAsNumber: true })}
              onChange={(e) =>
                setRoomDetails((prevDetails) => ({
                  ...prevDetails!,
                  total_room: parseInt(e.target.value),
                }))
              }
              type="number"
              placeholder="Total Rooms"
            />
            {total_roomError && (
              <p className="text-red-500 text-sm">
                {total_roomError.message}
              </p>
            )}
          </div>

          {/* Total Room field */}
          <div className="w-full">
            <Label htmlFor="floor">Floor</Label>
            <Input
              id="floor"
              className="h-9"
              // min={0}
              value={roomDetails?.floor}
              {...register("floor", { valueAsNumber: true })}
              onChange={(e) =>
                setRoomDetails((prevDetails) => ({
                  ...prevDetails!,
                  floor: parseInt(e.target.value),
                }))
              }
              type="number"
              placeholder="Floor"
            />
            {floorError && (
              <p className="text-red-500 text-sm ">{floorError.message}</p>
            )}
          </div>

          {/* Room View field  */}
          <div className="w-full">
            <Label htmlFor="room_view">Room View</Label>
            <Input
              id="room_view"
              className="h-9"
              value={roomDetails?.room_view}
              {...register("room_view")}
              onChange={(e) =>
                setRoomDetails((prevDetails) => ({
                  ...prevDetails!,
                  room_view: e.target.value,
                }))
              }
              type="string"
              placeholder="Sea facing"
            />
            {room_viewError && (
              <p className="text-red-500 text-sm ">
                {room_viewError.message}
              </p>
            )}
          </div>
        </div>

        {/* box 3 */}
        <div className="flex items-start md:flex-row flex-col justify-center  md:gap-1 lg:gap-3">
          {/* Room Size field */}
          <div className="w-full ">
            <Label htmlFor="room_size">
              Room Size <span className="text-destructive">*</span>
            </Label>
            <Input
              id="room_size"
              className="h-9"
              // min={1}
              value={roomDetails?.room_size}
              {...register("room_size", { valueAsNumber: true })}
              onChange={(e) =>
                setRoomDetails((prevDetails) => ({
                  ...prevDetails!,
                  room_size: parseInt(e.target.value),
                }))
              }
              type="number"
              placeholder="Room Size"
            />
            {room_sizeError && (
              <p className="text-red-500 text-sm ">
                {room_sizeError.message}
              </p>
            )}
          </div>

          {/* Room unit field */}
          <div className="w-full">
            <Label htmlFor="room_unit">
              Room Unit <span className="text-destructive">*</span>
            </Label>
            <div className="relative w-full">
              <select
                {...register("room_unit")}
                onChange={(e) =>
                  setRoomDetails((prevDetails) => ({
                    ...prevDetails!,
                    room_unit: e.target.value,
                  }))
                }
                className={`block appearance-none w-full border 
        ${room_unitError
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                  }
        bg-white dark:bg-gray-800 
        text-gray-700 dark:text-gray-200 
        py-2 px-3 h-9 rounded-md text-sm 
        leading-tight focus:outline-none focus:border-blue-500`}
              >
                <option value="" disabled>
                  Select Unit
                </option>
                <option value="sq. ft">Sq. Ft</option>
                <option value="sq. mtr.">Sq. Mtr.</option>
              </select>
              {room_unitError && (
                <p className="text-red-500 text-sm ">
                  {room_unitError.message}
                </p>
              )}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
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

          {/* Smoking policy field */}
          <div className="w-full">
            <Label htmlFor="smoking_policy">
              Smoking Policy <span className="text-destructive">*</span>
            </Label>
            <div className="relative w-full">
              <select
                {...register("smoking_policy")}
                onChange={(e) =>
                  setRoomDetails((prevDetails) => ({
                    ...prevDetails!,
                    smoking_policy: e.target.value,
                  }))
                }
                className={`block appearance-none w-full border 
        ${smoking_policyError
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                  }
        bg-white dark:bg-gray-800 
        text-gray-700 dark:text-gray-200 
        py-2 px-3 h-9 rounded-md text-sm 
        leading-tight focus:outline-none focus:border-blue-500`}
              >
                <option value="" disabled>
                  Select Policy
                </option>
                <option value="No-Smoking">No-Smoking</option>
                <option value="Smoking allowed">Smoking allowed</option>
              </select>
              {smoking_policyError && (
                <p className="text-red-500 text-sm ">
                  {smoking_policyError.message}
                </p>
              )}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
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

        {/* box 4 */}
        <div className="flex w-full flex-col md:flex-row items-start justify-center md:gap-1 lg:gap-3 ">
          {/* Max Occupancy field */}
          <div className="w-full md:1/3 ">
            <Label htmlFor="max_occupancy" className="whitespace-nowrap">
              Max Occupancy <span className="text-destructive">*</span>
            </Label>
            <Input
              id="max_occupancy"
              className="h-9"
              // min={1}
              value={roomDetails?.max_occupancy}
              {...register("max_occupancy", { valueAsNumber: true })}
              onChange={(e) =>
                setRoomDetails((prevDetails) => ({
                  ...prevDetails!,
                  max_occupancy: parseInt(e.target.value),
                }))
              }
              type="number"
              placeholder="Max Occupancy"
            />
            {max_occupancyError && (
              <p className="text-red-500 text-sm ">
                {max_occupancyError.message}
              </p>
            )}
          </div>

          {/* Max number of Adults field */}
          <div className="w-full md:1/3 ">
            <Label
              htmlFor="max_number_of_adults"
              className="whitespace-nowrap pr-1"
            >
              Max Adults <span className="text-destructive">*</span>
            </Label>
            <Input
              id="max_number_of_adults"
              className="h-9"
              // min={1}
              value={roomDetails?.max_number_of_adults}
              {...register("max_number_of_adults", { valueAsNumber: true })}
              onChange={(e) =>
                setRoomDetails((prevDetails) => ({
                  ...prevDetails!,
                  max_number_of_adults: parseInt(e.target.value),
                }))
              }
              type="number"
              placeholder="Max Adults"
            />
            {max_number_of_adultsError && (
              <p className="text-red-500 text-sm ">
                {max_number_of_adultsError.message}
              </p>
            )}
          </div>

          {/* Max number of Children field */}
          <div className="w-full md:1/3">
            <Label
              htmlFor="max_number_of_children"
              className="whitespace-nowrap pr-1"
            >
              Max Children{" "}
            </Label>
            <Input
              id="max_number_of_children"
              className="h-9"
              // min={0}
              value={roomDetails?.max_number_of_children}
              {...register("max_number_of_children", { valueAsNumber: true })}
              onChange={(e) =>
                setRoomDetails((prevDetails) => ({
                  ...prevDetails!,
                  max_number_of_children: parseInt(e.target.value),
                }))
              }
              type="number"
              placeholder="Max Children"
            />
            {max_number_of_childrenError && (
              <p className="text-red-500 text-sm ">
                {max_number_of_childrenError.message}
              </p>
            )}
          </div>
        </div>

        {/* box 5 */}
        <div className="flex md:flex-row flex-col items-start justify-center md:gap-1 lg:gap-3">
          {/* Number of Bedrooms field */}
          <div className="w-full md:w-1/3">
            <Label htmlFor="number_of_bedrooms" className="whitespace-nowrap">
              Bedrooms <span className="text-destructive">*</span>
            </Label>
            <Input
              id="number_of_bedrooms"
              className="h-9"
              // min={1}
              value={roomDetails?.number_of_bedrooms}
              {...register("number_of_bedrooms", { valueAsNumber: true })}
              onChange={(e) =>
                setRoomDetails((prevDetails) => ({
                  ...prevDetails!,
                  number_of_bedrooms: parseInt(e.target.value),
                }))
              }
              type="number"
              placeholder="Bedrooms"
            />
            {number_of_bedroomsError && (
              <p className="text-red-500 text-sm ">
                {number_of_bedroomsError.message}
              </p>
            )}
          </div>

          {/* Number of Living Room field */}
          <div className="w-full md:w-1/3">
            <Label
              htmlFor="number_of_living_room"
              className="whitespace-nowrap"
            >
              Living Rooms
            </Label>
            <Input
              id="number_of_living_room"
              className="h-9"
              // min={0}
              value={roomDetails?.number_of_living_room}
              {...register("number_of_living_room", { valueAsNumber: true })}
              onChange={(e) =>
                setRoomDetails((prevDetails) => ({
                  ...prevDetails!,
                  number_of_living_room: parseInt(e.target.value),
                }))
              }
              type="number"
              placeholder="Living Rooms"
            />
            {number_of_living_roomError && (
              <p className="text-red-500 text-sm ">
                {number_of_living_roomError.message}
              </p>
            )}
          </div>

          {/* Extra Bed field */}
          <div className="w-full md:w-1/3">
            <Label htmlFor="extra_bed">Extra Bed</Label>
            <Input
              id="extra_bed"
              className="h-9"
              // min={0}
              value={roomDetails?.extra_bed}
              {...register("extra_bed", { valueAsNumber: true })}
              onChange={(e) =>
                setRoomDetails((prevDetails) => ({
                  ...prevDetails!,
                  extra_bed: parseInt(e.target.value),
                }))
              }
              type="number"
              placeholder="Extra Bed"
            />
            {extra_bedError && (
              <p className="text-red-500 text-sm">
                {extra_bedError.message}
              </p>
            )}
          </div>
        </div>

        {/* Description field  */}
        <div className="w-full">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={roomDetails?.description}
            {...register("description")}
            onChange={(e) =>
              setRoomDetails((prevDetails) => ({
                ...prevDetails!,
                description: e.target.value,
              }))
            }
            style={{ resize: "none" }}
            placeholder="Enter room description..."
          />
        </div>

        {/* Image field  */}
        <div className="flex w-full lg:flex-row flex-col gap-2">
          <div className="flex mt-2 lg:w-1/2 w-full lg:gap-3 gap-2 items-center">
            <div className="lg:w-2/3 w-full">
              {propertyImageUrls?.length ? (
                <PreviewPropertyImages
                  open={propertyImagePreviewDialog}
                  setOpen={setPropertyImagePreviewDialog}
                  files={propertyImageUrls}
                />
              ) : (
                <UploadPropertyImages
                  files={files}
                  setFiles={setFiles}
                  rejected={rejected}
                  loading={loading}
                  setLoading={setLoading}
                  setRejected={setRejected}
                  open={openDialog}
                  setOpen={setOpenDialog}
                  handlePropertyImageUpload={handlePropertyImageUpload}
                />
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="available"
                {...register("available")}
                checked={roomDetails?.available || false}
                onCheckedChange={(value: boolean) => {
                  setValue("available", value);
                  setRoomDetails((prev: any) => {
                    return { ...prev, available: value };
                  });
                }}
              />
              <Label htmlFor="available">Available</Label>
            </div>
          </div>

          {/* Submit button */}
          <div className="flex md:w-1/2 md:items-start lg:justify-end gap-4 w-full">
            <div className="mt-2">
              <Button
                className=" md:w-[120px] w-[134px] text-right"
                onClick={onPrevious}
                variant={"secondary"}
                type="button"
              >
                Back
              </Button>
            </div>

            <div className="mt-2">
              <Button className=" md:w-[120px]  w-[134px]" type="submit">
                Next
              </Button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}

function PreviewPropertyImages({
  open,
  setOpen,
  files,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  files: {
    public_id: string;
    url: string;
    secure_url: string;
  }[];
}) {
  const [currentImage, setCurrentImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={buttonVariants({
          variant: "outline",
        })}
      >
        Add Room Images
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>image</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2">
          {!files.length
            ? "No preview available"
            : files?.map((file, i) => (
              <div
                key={`${JSON.stringify(file) + i}`}
                onClick={() => setCurrentImage(i)}
                className="rounded-md cursor-pointer overflow-hidden"
              >
                <Image
                  key={file?.public_id}
                  src={file?.url}
                  height={60}
                  width={60}
                  alt=""
                />
              </div>
            ))}
        </div>
        <div className="rounded-md min-h-[250px] max-h-[350px] overflow-hidden">
          <Image
            key={files[currentImage]?.public_id}
            src={files[currentImage]?.url}
            className={cn(
              "duration-700 ease-in-out",
              isLoading
                ? "grayscale blur-2xl scale-110"
                : "grayscale-0 blur-0 scale-100"
            )}
            onLoadingComplete={() => setIsLoading(false)}
            height={500}
            width={500}
            alt=""
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function UploadPropertyImages({
  files,
  setFiles,
  rejected,
  setRejected,
  loading,
  setLoading,
  open,
  setOpen,
  handlePropertyImageUpload,
}: {
  open: boolean;
  files: IFileWithPreview[];
  setFiles: React.Dispatch<React.SetStateAction<IFileWithPreview[]>>;
  rejected: any;
  setRejected: any;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handlePropertyImageUpload: any;
}) {
  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (acceptedFiles?.length) {
        setFiles((previousFiles: any) => [
          ...previousFiles,
          ...acceptedFiles.map((file) =>
            Object.assign(file, { preview: URL.createObjectURL(file) })
          ),
        ]);
      }

      if (rejectedFiles?.length) {
        setRejected((previousFiles: any) => [
          ...previousFiles,
          ...rejectedFiles,
        ]);
      }
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/*": [],
    },
    onDrop,
  });

  const removeFile = (name: string) => {
    setFiles((files) => files.filter((file) => file.name !== name));
  };

  const removeAll = () => {
    setFiles([]);
    setRejected([]);
  };

  const removeRejected = (name: string) => {
    setRejected((files: any) =>
      files.filter(({ file }: { file: any }) => file.name !== name)
    );
  };

  const handleFileUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handlePropertyImageUpload();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={buttonVariants({
          variant: "outline",
        })}
      >
        Add Room Images
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Room Images</DialogTitle>
          <DialogDescription>
            Add your Room images, which will be visible to the end user.
          </DialogDescription>
        </DialogHeader>
        <form>
          <Dropzone
            getRootProps={getRootProps}
            getInputProps={getInputProps}
            isDragActive={isDragActive}
          />
          <div className="mt-4 flex items-center justify-center">
            <Button
              type="button"
              className="mr-2 w-2/5"
              onClick={() => setOpen(false)}
              variant={"ghost"}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={(e: any) => handleFileUpload(e)}
              className="w-[200px]"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </span>
              ) : (
                "Upload"
              )}
            </Button>
          </div>
        </form>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {!files.length ? (
                "No preview available"
              ) : (
                files.map((file) => (
                  <div key={file.name} className="relative group">
                    <Image
                      src={file.preview}
                      height={80}
                      width={80}
                      alt="Preview"
                      className="rounded-md object-cover"
                    />
                    {/* Cross (Remove) Icon */}
                    <button
                      type="button"
                      onClick={() => removeFile(file.name)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}