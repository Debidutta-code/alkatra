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
import { Button, buttonVariants } from "./../ui/button";
import { ReloadIcon } from "@radix-ui/react-icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
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
import Image from "next/image";
import { FileRejection, useDropzone } from "react-dropzone";
import Dropzone from "../dropzone";
import { Checkbox } from "./../ui/checkbox";
import axios, { Axios, AxiosError } from "axios";
import { boolean, number, z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { BookOpen, MapPinned, ShowerHead } from "lucide-react";
import { cn } from "./../../lib/utils";
import { Textarea } from "./../ui/textarea";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { RootState, useSelector } from "../../redux/store";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./../ui/accordion";
import { ScrollArea } from "./../ui/scrollarea";
import Cookies from "js-cookie";

export const roomSchema = z.object({
  room_name: z.string().min(1, "Room name is required"),
  room_type: z.string().min(1, "Room type is required"),
  total_room: z
    .number( {required_error : "Total rooms is required"})
    .nonnegative("Room count must be positive"),
  floor: z
    .number()
    .nonnegative("Floor must be a positive number")
    .optional(),
  room_view: z.string().optional(),
  room_size: z
    .number({required_error : "Room size is required"})
    .nonnegative("Room size must be positive"),
  room_unit: z.string().min(1, "Room unit is required"),
  smoking_policy: z.string().min(1, "Smoking policy is required"),
  max_occupancy: z
    .number({required_error:"Max occupancy is required"})
    .nonnegative("Max occupancy must be positive"),
  max_number_of_adults: z
    .number({ required_error:"Enter max adults" })
    .nonnegative("Adults cannot be negative"),
  max_number_of_children: z
    .number()
    .nonnegative("Children cannot be negative")
    .optional(), // Changed to min(1) - required
  number_of_bedrooms: z
    .number({ required_error: "Enter number of bedrooms" })
    .nonnegative("Bedrooms can't be negative"), // Changed to min(1) - required
  number_of_living_room: z
    .number()
    .nonnegative("Living rooms can't be negative")
    .optional(), // Changed to min(1) - required
  extra_bed: z
    .number()
    .nonnegative("Provide a positive bed count")
    .optional(), // Changed to min(1) - required
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

/////////
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

  const [propertyImageUrls, setPropertyImageUrls] = useState<
    { public_id: string; url: string; secure_url: string }[]
  >([]);
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

  // useEffect(() => {
  //   async function getAllPrice() {
  //     try {
  //       const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/price/getAll`, {
  //         headers: {
  //           Authorization: `Bearer ${accessToken}`,
  //         }
  //       },
  //       )
  //       console.log(response.data?.priceList[0])
  //       setPriceCategory(response.data?.priceList)
  //     } catch (error) {
  //       console.log(error)
  //       toast.error("Failed to fetch Rateplans")
  //     }
  //   }

  //   getAllPrice()
  // }, [])

  function handleCategoryChange(e: any) {
    const price_list = priceCategory.filter(
      (category: any) => category.price_category == e.target.value
    );
    setCategory(price_list);
  }

  // useEffect(() => {
  //   room_nameError && toast.error(room_nameError.message!);
  //   room_typeError && toast.error(room_typeError.message!);
  //   total_roomError && toast.error(total_roomError.message!);
  //   floorError && toast.error(floorError.message!);
  //   room_viewError && toast.error(room_viewError.message!);
  //   room_sizeError && toast.error(room_sizeError.message!);
  //   room_unitError && toast.error(room_unitError.message!);
  //   smoking_policyError && toast.error(smoking_policyError.message!);
  //   max_occupancyError && toast.error(max_occupancyError.message!);
  //   max_number_of_adultsError && toast.error(max_number_of_adultsError.message!);
  //   max_number_of_childrenError && toast.error(max_number_of_childrenError.message!);
  //   number_of_bedroomsError && toast.error(number_of_bedroomsError.message!);
  //   number_of_living_roomError && toast.error(number_of_living_roomError.message!);
  //   extra_bedError && toast.error(extra_bedError.message!);
  //   descriptionError && toast.error(descriptionError.message!);
  //   imageError && toast.error(imageError.message!);
  // }, [
  //   room_nameError, room_typeError, total_roomError,
  //   floorError, room_viewError, room_sizeError, room_unitError,
  //   smoking_policyError, max_occupancyError, max_number_of_adultsError,
  //   max_number_of_childrenError, number_of_bedroomsError, number_of_living_roomError, extra_bedError, descriptionError, imageError
  // ]);

  useEffect(() => {
    console.log({ errors: formState.errors });
  }, [formState.errors]);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    console.log(data);
    try {
      const imageUrls = propertyImageUrls.map(
        (propertyImage) => propertyImage.url
      );
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
        setLoading(true); // Start loading
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
      console.error("Error uploading property images:", error);
    } finally {
      setLoading(false); // Stop loading
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
              // placeholder="Single Room"
            />
            {room_typeError && (
              <p className="text-red-500 text-sm ">
                {room_typeError.message}
              </p>
            )}
          </div>

          {/* <div className="self-end w-full relative">
            <Label htmlFor="Name">Room Name </Label>
            <div className="inline-block relative w-full">
              <select
                {...register("room_name")}
                onChange={(e) => setRoomDetails(prevDetails => ({ ...prevDetails!, name: e.target.value }))}
                className={`block appearance-none w-full border ${room_nameError ? "border-red-500" : "border-gray-300"
                  } text-white-700py-2 px-3 md:h-12.1 md:px-3 md:py-3 rounded-md leading-tight focus:outline-none focus:border-blue-500`}
              >
                <option value="SINGLE ROOM" className="bg-white-300 text-white-800">SINGLE ROOM</option>
                <option value="DOUBLE ROOM" className="bg-white-300 text-white-800">DOUBLE ROOM</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 0 1 1.414-1.414L10 8.586l3.293-3.293a1 1 0 1 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4z" />
                </svg>
              </div>
            </div>
          </div> */}

          {/* <div className="self-end w-full relative">
            <Label htmlFor="type">Room Type </Label>
            <div className="inline-block relative w-full">
              <select
                {...register("room_type")}
                onChange={(e) => setRoomDetails(prevDetails => ({ ...prevDetails!, type: e.target.value }))}
                className={`block appearance-none w-full border ${room_typeError ? "border-red-500" : "border-gray-300"
                  } text-white-700py-2 px-3 md:h-12.1 md:px-3 md:py-3 rounded-md leading-tight focus:outline-none focus:border-blue-500`}
              >
                <option value="QUEEN ROOM" className="bg-white-300 text-white-800">QUEEN ROOM</option>
                <option value="KING ROOM" className="bg-white-300 text-white-800">KING ROOM</option>
                <option value=" TWIN ROOM" className="bg-white-300 text-white-800">TWIN ROOM</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 0 1 1.414-1.414L10 8.586l3.293-3.293a1 1 0 1 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4z" />
                </svg>
              </div>
            </div>
          </div> */}
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
              min={0}
              value={roomDetails?.total_room}
              {...register("total_room", { valueAsNumber: true })}
              onChange={(e) =>
                setRoomDetails((prevDetails) => ({
                  ...prevDetails!,
                  total_room: parseInt(e.target.value),
                }))
              }
              type="number"
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
              min={0}
              value={roomDetails?.floor}
              {...register("floor", { valueAsNumber: true })}
              onChange={(e) =>
                setRoomDetails((prevDetails) => ({
                  ...prevDetails!,
                  floor: parseInt(e.target.value),
                }))
              }
              type="number"
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
              placeholder="Sea facing, Garden etc."
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
              min={0}
              value={roomDetails?.room_size}
              {...register("room_size", { valueAsNumber: true })}
              onChange={(e) =>
                setRoomDetails((prevDetails) => ({
                  ...prevDetails!,
                  room_size: parseInt(e.target.value),
                }))
              }
              type="number"
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
        ${
          room_unitError
            ? "border-red-500"
            : "border-gray-300 dark:border-gray-600"
        }
        bg-white dark:bg-gray-800 
        text-gray-700 dark:text-gray-200 
        py-2 px-3 h-9 rounded-md 
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
        ${
          smoking_policyError
            ? "border-red-500"
            : "border-gray-300 dark:border-gray-600"
        }
        bg-white dark:bg-gray-800 
        text-gray-700 dark:text-gray-200 
        py-2 px-3 h-9 rounded-md 
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
              min={0}
              value={roomDetails?.max_occupancy}
              {...register("max_occupancy", { valueAsNumber: true })}
              onChange={(e) =>
                setRoomDetails((prevDetails) => ({
                  ...prevDetails!,
                  max_occupancy: parseInt(e.target.value),
                }))
              }
              type="number"
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
              min={0}
              value={roomDetails?.max_number_of_adults}
              {...register("max_number_of_adults", { valueAsNumber: true })}
              onChange={(e) =>
                setRoomDetails((prevDetails) => ({
                  ...prevDetails!,
                  max_number_of_adults: parseInt(e.target.value),
                }))
              }
              type="number"
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
              min={0}
              value={roomDetails?.max_number_of_children}
              {...register("max_number_of_children", { valueAsNumber: true })}
              onChange={(e) =>
                setRoomDetails((prevDetails) => ({
                  ...prevDetails!,
                  max_number_of_children: parseInt(e.target.value),
                }))
              }
              type="number"
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
              min={0}
              value={roomDetails?.number_of_bedrooms}
              {...register("number_of_bedrooms", { valueAsNumber: true })}
              onChange={(e) =>
                setRoomDetails((prevDetails) => ({
                  ...prevDetails!,
                  number_of_bedrooms: parseInt(e.target.value),
                }))
              }
              type="number"
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
              min={0}
              value={roomDetails?.number_of_living_room}
              {...register("number_of_living_room", { valueAsNumber: true })}
              onChange={(e) =>
                setRoomDetails((prevDetails) => ({
                  ...prevDetails!,
                  number_of_living_room: parseInt(e.target.value),
                }))
              }
              type="number"
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
              min={0}
              value={roomDetails?.extra_bed}
              {...register("extra_bed", { valueAsNumber: true })}
              onChange={(e) =>
                setRoomDetails((prevDetails) => ({
                  ...prevDetails!,
                  extra_bed: parseInt(e.target.value),
                }))
              }
              type="number"
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
      {/* <DialogTrigger
        className={buttonVariants({
          variant: "outline",
        })}
      >
        image
      </DialogTrigger> */}
      <DialogTrigger className="flex items-center justify-center w-full px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-blue-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500">
        <span className="mr-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </span>
        Upload Images
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
          // If allowing multiple files
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
      {/* <DialogTrigger
        className={buttonVariants({
          variant: "outline",
        })}
      >
        image
      </DialogTrigger> */}
      <DialogTrigger className="flex items-center justify-center w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500">
        <span className="mr-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </span>
        Upload Images
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Images</DialogTitle>
          <DialogDescription>
            Add your images, which will be visible to the end user.
          </DialogDescription>
        </DialogHeader>
        <form>
          <Dropzone
            getRootProps={getRootProps}
            getInputProps={getInputProps}
            isDragActive={isDragActive}
          />
          <div className="mt-4 flex  items-center justify-center">
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
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
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
            <CardContent className="flex items-center gap-2">
              {!files.length
                ? "No preview available"
                : files?.map((file) => (
                    <Image
                      key={file?.name}
                      src={file?.preview}
                      height={60}
                      width={60}
                      alt=""
                    />
                  ))}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
{
  /* <div class="p-2 pt-0"><div class="space-y-2"><div class="gap-10 tracking-normal"><div class="gap-2"><div class=" flex flex-row gap-2 "><p class="dark:text-gray-300 whitespace-nowrap">Property ID :</p><p class="font-semibold">66e41c557a463a764b29723c</p></div><div class=" flex flex-row gap-2 "><p class="dark:text-gray-300 ">Name :</p><p class="font-semibold">Kafil's Plaza</p></div><div class=" flex flex-row gap-2 "><p class="dark:text-gray-300 ">Email :</p><p class="font-semibold">kafils@gmail.com</p></div><div class=" flex flex-row gap-2 "><p class="dark:text-gray-300 ">Contact :</p><p class="font-semibold">6371545555</p></div></div></div></div></div> */
}

{
  /* <div class="p-2 pt-0"><div class="space-y-2"><div class="gap-10 tracking-normal"><div class="gap-2"><div class=" flex flex-row gap-2 "><p class="dark:text-gray-300 whitespace-nowrap">Property ID :</p><p class="font-semibold">66e41c557a463a764b29723c</p></div><div class=" flex flex-row gap-6 "><p class="dark:text-gray-300 ">Name :</p><p class="font-semibold flex">Kafil's Plaza</p></div><div class=" flex flex-row gap-2 "><p class="dark:text-gray-300 ">Email :</p><p class="font-semibold">kafils@gmail.com</p></div><div class=" flex flex-row gap-2 "><p class="dark:text-gray-300 ">Contact :</p><p class="font-semibold">6371545555</p></div></div></div></div></div> */
}

// const roomSchema = z.object({
//   name: z.string().min(1, "Room name is required"),
//   type: z.string().min(1, "Room type is required"),
//   price: z
//     .string()
//     .min(1, "Room price is required")
//     .refine((price) => parseInt(price) > 0, {
//       message: "Price cannot be 0 ",
//     }),
//   available: z.boolean(),
//   capacity: z
//     .string()
//     .min(1, "Room capacity is required")
//     .refine((capacity) => parseInt(capacity) > 0, {
//       message: "Capacity cannot be 0 ",
//     }),
//   description: z.string(),
//   total_room: z
//     .string()
//     .min(1, "Total room should be at least 1")
//     .refine((total_room) => parseInt(total_room) > 0, {
//       message: "Total room cannot be 0 ",
//     }),
// });

// type Inputs = {
//   name: string;
//   type: string;
//   price: string;
//   available: boolean;
//   capacity: string;
//   description: string;
//   total_room: string;
// };

// interface RoomDetails {
//   name: string;
//   type: string;
//   price: string;
//   available: boolean;
//   capacity: string;
//   description: string;
//   total_room: string;
// }

// const form = useForm<Inputs>({
//   defaultValues: {
//     name: "",
//     type: "",
//     price: "0",
//     available: false,
//     capacity: "0",
//     description: "",
//     total_room: "0",
//   },
//   resolver: zodResolver(roomSchema),
// });

// const onSubmit: SubmitHandler<Inputs> = async (data) => {
//   /////////////
//   const imageUrls = propertyImageUrls.map(
//     (propertyImage) => propertyImage.url
//   );
//   console.log(data);
//   const roomBody = {
//     ...data,
//     propertyInfo_id: property_id,
//     image: imageUrls,
//   };

//   setFormLoading(true);

//   try {
//     const {
//       data: { data: newRoom },
//     } = await axios.post(`http://localhost:8040/api/v1/room`, roomBody, {
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//       },
//     });
//     console.log({ newRoom });
//     setFormLoading(false);

//     onNext();
//   } catch (err) {
//     if (axios.isAxiosError(err)) {
//       setFormLoading(false);
//       toast.error(err?.response?.data?.message);
//     }
//   }
// };

{
  /* <div className="w-full">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              size={"md"}
              value={roomDetails?.price}
              {...register("price")}
              onChange={(e) => setRoomDetails(prevDetails => ({
                ...prevDetails!,
                price: e.target.value
              }))}
              type="number"
            />
          </div> */
}

{
  /* <div className="self-end w-full relative">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              size={"md"}
              value={roomDetails?.price}
              {...register("price")}
              onChange={(e) => setRoomDetails(prevDetails => ({
                ...prevDetails!,
                price: e.target.value
              }))}
              type="number"
            />
          </div> */
}

{
  /* <div className="self-end w-full relative">
            <Label htmlFor="roomPlan">Room Plan</Label>
            <div className="inline-block relative w-full">
              <select
                id="price"
                onChange={handleCategoryChange}
                className={`block appearance-none w-full border ${typeError ? "border-red-500" : "border-gray-300"} 
                  text-white-700py-2 px-3 md:h-12.1 md:px-3 md:py-3 rounded-md leading-tight focus:outline-none focus:border-blue-500`
                }>
                <option value="default" disabled>
                  Select a plan
                </option>
                {
                  priceCategory?.map((category: any) => (
                    <option key={category?._id} value={category?.price_category}>
                      {category?.price_category}
                    </option>
                  ))
                }
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white-700">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M5.293 7.293a1 1 0 0 1 1.414-1.414L10 8.586l3.293-3.293a1 1 0 1 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4z"
                  />
                </svg>
              </div>
            </div>
          </div> */
}

{
  /* <div className="w-full">
            <Label htmlFor="capacity">Capacity</Label>
            <Input
              // variant={capacityError && "error"}
              value={roomDetails?.capacity}
              id="capacity"
              {...register("capacity")}
              onChange={(e) => setRoomDetails(prevDetails => ({
                ...prevDetails!,
                capacity: e.target.value
              }))}
              type="number"
              size={"md"}
            />
          </div>
          <div className="w-full">
            <Label htmlFor="total_room">Total Room</Label>
            <Input
              id="total_room"
              value={roomDetails?.total_room}
              {...register("total_room")}
              onChange={(e) => setRoomDetails(prevDetails => ({
                ...prevDetails!,
                total_room: e.target.value
              }))}
              type="number"
              size="md"
            />
          </div> */
}
// </div>

{
  /* <div className="w-full flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Label htmlFor="available">Available</Label>
              <Checkbox
                id="available"
                {...register("available")}
                checked={roomDetails?.available || false}
                onCheckedChange={(value: boolean) => {
                  setValue("available", value)
                  setRoomDetails((prev: any) => {
                    return { ...prev, available: value };
                  });
                }}
              />
            </div>
          </div> */
}
