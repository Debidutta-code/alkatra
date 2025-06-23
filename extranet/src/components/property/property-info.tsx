"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./../ui/card";
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
import Dropzone from "../dropzone";
import { FileRejection, useDropzone } from "react-dropzone";
import Image from "next/image";
import axios, { Axios, AxiosError } from "axios";
import { boolean, number, z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { cn } from "./../../lib/utils";
import { Textarea } from "./../ui/textarea";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
// import { RootState, useSelector } from "../../redux/store";
// import {
//   DropdownMenu,
//   DropdownMenuTrigger,
//   DropdownMenuContent,
//   DropdownMenuItem,
// } from "@radix-ui/react-dropdown-menu";

import Cookies from "js-cookie";
import { useSelector } from "react-redux";
import { RootState } from "@src/redux/store";

const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
const createPropertySchema = z.object({
  property_name: z.string().min(1, "Property name is required"),
  property_email: z
    .string()
    .min(1, "Property email is required")
    .email("Please provide a valid email address")
    .regex(gmailRegex, "Please provide a valid email address"),
  // property_contact: z.string().min(1, "Property contact is reuqired"),
  property_contact: z
    .string()
    // .refine((value) => /^\d{10}$/.test(value))
    // .refine((value) => /^[6-9]\d{9}$/.test(value), {
    .refine((value) => /^\d{10}$/.test(value), {
      message: "Please provide a valid 10-digit phone number ",
    }),

  star_rating: z
    .string()
    .default("1")
    .refine(
      (rating) => {
        const parsedRating = parseInt(rating);
        return parsedRating > 0 && parsedRating <= 5;
      },
      {
        message: "Rating must range from 1 to 5",
      }
    ),

  // property_code: z.string().min(1, "Property code is required"),
  // property_code: z.string().refine((value) => /^\d{6}$/.test(value), {
  //   message: "Please provide a valid 6-digit property code",
  // }),
  property_code: z.string().min(1, "Property code is required"),
  description: z.string().min(1, "Description is required"),

  property_category: z.string().min(1, "Property category is required"),
  property_type: z.string().min(1, "Property type is required"),
});

type Inputs = {
  property_name: string;
  property_email: string;
  property_contact: string;
  star_rating: string;
  property_code: string;
  description: string;
  property_category: string;
  property_type: string;
};

interface IFileWithPreview extends File {
  preview: string;
}

type Props = {
  onNext: () => void;
};

interface PropertyCategory {
  _id: string;
  category: string;
  createdAt: string;
  types: any[];
  updatedAt: string;
}

interface PropertyType {
  _id: string;
  name: string;
}

property_contact: z.string()
  .length(10, "Please provide a valid 10-digit phone number") // Ensure exactly 10 digits
  .refine((value) => /^[6-9]\d{9}$/.test(value), {
    message: "Please provide a valid 10-digit phone number",
  });

export default function PropertyInfo({ onNext }: Props) {
  const [propertyDetails, setPropertyDetails] = useState<any>(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [currenStep, setCurrentStep] = useState(0);
  const [propertyImageUrls, setPropertyImageUrls] = useState<
    {
      public_id: string;
      url: string;
      secure_url: string;
    }[]
  >([]);
  const [editMode, setEditMode] = useState(false);
  const [propertyCategories, setPropertyCategories] = useState<
    PropertyCategory[]
  >([]);
  const [error, setError] = useState(null);

  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);

  const [propertyImagePreviewDialog, setPropertyImagePreviewDialog] =
    useState(false);

  const [files, setFiles] = useState<IFileWithPreview[]>([]);
  const [rejected, setRejected] = useState<FileRejection[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [propertyData, setPropertyData] = useState({
    property_name: "",
    property_email: "",
    property_contact: "",
    property_code: "",
    description: "",
    star_rating: "",
    property_category: "",
    property_type: "",
  });

  // const accessToken = Cookies.get("accessToken");
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  // console.log("Token from proerty info tsx", accessToken);

  const router = useRouter();
  const pathname = usePathname();

  const searchParams = useSearchParams();
  const propertyId = searchParams.get("property_id");

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/property/${propertyId}`
      );
      setPropertyDetails(response.data.data);
      setLoading(false);
    } catch (error: any) {
      if (error.code === "ECONNRESET") {
        console.log("Connection reset, retrying...");
        // Retry logic here
        fetchPropertyDetails();
      } else {
        console.error("Error fetching property details:", error);
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (propertyId) {
      fetchPropertyDetails();
    }
  }, [propertyId]);

  useEffect(() => {
    if (propertyId && !editMode) {
      fetchPropertyDetails();
    }
  }, [propertyId, editMode]);

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleBack = () => {
    setEditMode(false);
  };

  const form = useForm<Inputs>({
    defaultValues: {
      property_name: "",
      property_email: "",
      property_contact: "",
      star_rating: "1",
      property_code: "",
      description: "",
      property_category: "",
      property_type: "",
    },
    resolver: zodResolver(createPropertySchema),
  });

  const { register, control, handleSubmit, formState, setValue } = form;
  const {
    errors: {
      property_email: propertyEmailError,
      property_name: propertyNameError,
      property_contact: propertyContactError,
      star_rating: starRatingError,
      property_code: propertyCodeError,
      property_category: propertyCategoryError,
      property_type: propertyTypeError,
      description: propertydescription,
    },
  } = formState;

  // useEffect(() => {
  //   propertyEmailError && toast.error(propertyEmailError.message!);
  //   propertyNameError && toast.error(propertyNameError.message!);
  //   propertyContactError && toast.error(propertyContactError.message!);
  //   starRatingError && toast.error(starRatingError.message!);
  //   propertyCodeError && toast.error(propertyCodeError.message!);
  //   propertyCategoryError && toast.error(propertyCategoryError.message!);
  //   propertyTypeError && toast.error(propertyTypeError.message!);
  //   propertydescription && toast.error(propertydescription.message!);
  // }, [
  //   propertyEmailError,
  //   propertyNameError,
  //   propertyContactError,
  //   starRatingError,
  //   propertyCodeError,
  //   propertyCategoryError,
  //   propertyTypeError,
  //   propertydescription
  // ]);

  useEffect(() => {
    if (propertyDetails) {
      setValue("property_name", propertyDetails.property_name || "");
      setValue("property_email", propertyDetails.property_email || "");
      setValue("property_contact", propertyDetails.property_contact || "");
      setValue("property_code", propertyDetails.property_code || "");
      setValue("description", propertyDetails.description || "");
      setValue("property_category", propertyDetails?.property_category?._id || "");
      setValue("property_type", propertyDetails?.property_type || "");
      setValue("star_rating", propertyDetails.star_rating || "1");
      // setValue("image", propertyDetails.image || "")
      if (propertyDetails.image.length > 0) {
        setPropertyImageUrls(propertyDetails?.image);
      }
    }
  }, [propertyDetails]);
  // console.log("property details",propertyDetails?.property_category)
  useEffect(() => {
    const storedData = localStorage.getItem("propertyData");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setPropertyData(parsedData);
      } catch (error) {
        console.error("Error parsing JSON:", error);
        // Handle parsing error if necessary
      }
    }
  }, []);

  // In the onSubmit function where you create a new property
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const imageUrls = propertyImageUrls.map(
      (propertyImage) => propertyImage.url
    );

    const propertyCreateBody = {
      ...data,
      image: imageUrls,
    };

    setFormLoading(true);

    try {
      const {
        data: { data: newPropertyInfo },
      } = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/property`,
        propertyCreateBody,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      localStorage.setItem("propertyData", JSON.stringify(data));
      router.push(`${pathname}?property_id=${newPropertyInfo.property?._id}`);
      setFormLoading(false);

      // Add success toast message
      toast.success("Property created successfully!");

      onNext();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setFormLoading(false);
        if (err?.response?.data?.message.includes("property code")) {
          toast.error("This property code is already in use. Please choose a different one.");
        } else {
          toast.error(err?.response?.data?.message || "Failed to create property");
        }
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

  // Also add a success message when images are uploaded
  const handlePropertyImageUpload = async () => {
    try {
      if (files.length) {
        setLoading(true);
        const data = packFiles(files);
        console.log("Uploading files:", files);

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/upload`,
          data,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        console.log("Upload response:", response.data);
        const urls = response.data.data.urls;
        setOpenDialog(false);
        setPropertyImageUrls(urls);

        // Add success toast for image upload
        toast.success("Images uploaded successfully!");
      }
    } catch (error) {
      console.error("Error uploading property images:", error);
      toast.error("Failed to upload images. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchPropertyCategories = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/property/category`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        if (!response) {
          throw new Error("Failed to fetch property categories");
        }
        // console.log(response.data.error)
        const data = await response.data;
        setPropertyCategories(data.data.categories);
        setLoading(false);
        setError(null);
      } catch (error: any) {
        console.log("error category", error);
        setError(error.message);
        setLoading(false);
      }
    };
    const fetchPropertyTypes = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/property/type`
        );
        setPropertyTypes(response.data.data.propertyTypes);
        setLoading(false);
        setError(null);
      } catch (error: any) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchPropertyTypes();

    fetchPropertyCategories();
  }, []);
  // useEffect(() => {
  //   const fetchPropertyTypes = async () => {
  //     try {
  //       const response = await axios.get(
  //         "http://localhost:8040/api/v1/property/type"
  //       );
  //       console.log("FeatchType-Data", response.data.data.propertyTypes);
  //       setPropertyTypes(response.data.data.propertyTypes);
  //       setLoading(false);
  //     } catch (error: any) {
  //       setError(error.message);
  //       setLoading(false);
  //     }
  //   };

  //   fetchPropertyTypes();
  // }, []);

  // In the handleFormSubmit function where you update a property
  const handleFormSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      const imageUrls = propertyImageUrls
        .filter((propertyImage) => propertyImage && propertyImage.url) // Add null checks
        .map((propertyImage) => propertyImage.url);

      const propertyCreateBody = {
        ...data,
        image: imageUrls,
      };

      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/property/${propertyId}`,
        propertyCreateBody,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      router.push(`${pathname}?property_id=${propertyId}`);

      // Add success toast message
      toast.success("Property updated successfully!");

      onNext();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error?.response?.data?.message.includes("property code")) {
          toast.error("This property code is already in use. Please choose a different one.");
        } else {
          toast.error("Failed to update property details. Please try again later.");
        }
      }
    }
  };


  if (propertyId && !editMode) {
    return (
      <>
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-2 pt-0 p-6 min-h-screen"
        >
          <CardTitle>Property Details</CardTitle>
          <div className="flex flex-col md:flex-row gap-3 mt-2 items-start">
            {/* Property Name */}
            <div className="w-full md:w-1/2 flex flex-col">
              <Label htmlFor="property_name">
                Property Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="property_name"
                className="mt-[5px]"
                {...register("property_name")}
                type="text"
                variant={propertyNameError && "error"}
              />
              {propertyNameError && (
                <p className="text-red-500 text-sm mt-1">
                  {propertyNameError.message}
                </p>
              )}
            </div>

            {/* Property Email */}
            <div className="w-full md:w-1/2 flex flex-col">
              <Label htmlFor="property_email">
                Property Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="property_email"
                className="mt-[5px]"
                variant={propertyEmailError && "error"}
                {...register("property_email")}
                type="email"
              />
              {propertyEmailError && (
                <p className="text-red-500 text-sm mt-1">
                  {propertyEmailError.message}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-3 mt-2 items-start">
            {/* Property Contact */}
            <div className="w-full md:w-1/2 flex flex-col">
              <Label htmlFor="property_contact">
                Property Contact <span className="text-destructive">*</span>
              </Label>
              <Input
                id="property_contact"
                className="mt-[3px]"
                variant={propertyContactError && "error"}
                {...register("property_contact")}
                type="tel"
                inputMode="numeric"
                pattern="[0-9]{10}"
                maxLength={10}
                onChange={(e) => {
                  // Only allow numbers
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 10) {
                    setValue("property_contact", value, { shouldValidate: true });
                  }
                }}
              />
              {propertyContactError && (
                <p className="text-red-500 text-sm mt-1">
                  {propertyContactError.message}
                </p>
              )}
            </div>

            {/* Property Code */}
            <div className="w-full md:w-1/2 flex flex-col">
              <Label htmlFor="property_code">
                Property Code <span className="text-destructive">*</span>
              </Label>
              <Input
                variant={propertyCodeError && "error"}
                id="property_code"
                className="mt-[3px]"
                {...register("property_code")}
                type="text"
              />
              {propertyCodeError && (
                <p className="text-red-500 text-sm mt-1">
                  {propertyCodeError.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <div className="w-full">
              <Label htmlFor="description">
                Property Description <span className="text-destructive">*</span>
              </Label>
              <div className="mt-[3px]">
                <Textarea
                  id="description"
                  {...register("description")}
                  className={
                    propertydescription
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }
                  style={{ resize: "none" }}

                />
              </div>
              {propertydescription && (
                <p className="text-red-500 text-sm mt-1">
                  {propertydescription.message}
                </p>
              )}
            </div>
          </div>
          <div className="flex md:flex-row md:gap-2 flex-col">
            <div className="w-full relative mt-1">
              <Label htmlFor="property_category ">
                Property Category <span className="text-destructive">*</span>
              </Label>
              <div className="inline-block mt-[3px] relative w-full ">
                <select
                  {...register("property_category")}
                  className={`block appearance-none w-full  border ${propertyCategoryError
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                    } bg-white dark:bg-gray-900 text-gray-900 dark:text-white h-10 px-3 rounded-md leading-tight focus:outline-none focus:border-primary-500`}
                >
                  <option value="" disabled>
                    Select Property Category
                  </option>

                  {loading ? (
                    <option
                      value=""
                      className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    >
                      Loading...
                    </option>
                  ) : error ? (
                    <option
                      value=""
                      className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    >
                      Error: {error}
                    </option>
                  ) : (
                    propertyCategories?.map((category) => (
                      <option
                        key={category._id}
                        value={category._id}
                        className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      >
                        {category.category}
                      </option>
                    ))
                  )}
                </select>
                {propertyCategoryError && (
                  <p className="text-red-500 text-sm mt-1 ">
                    {propertyCategoryError.message}
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

            <div className=" w-full relative mt-1">
              <Label htmlFor="property_type ">
                Property Type{" "}
                <span className="text-destructive">
                  <span className="text-destructive">*</span>
                </span>
              </Label>
              <div className="inline-block mt-[3px] relative w-full">
                <select
                  {...register("property_type")}
                  className={`block appearance-none w-full border ${propertyTypeError
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                    } bg-white dark:bg-gray-900 text-gray-900 dark:text-white h-10 px-3 rounded-md leading-tight focus:outline-none focus:border-blue-500`}
                >
                  <option value="" disabled>
                    Select Property Type
                  </option>

                  {loading ? (
                    <option
                      value=""
                      className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    >
                      Loading...
                    </option>
                  ) : error ? (
                    <option
                      value=""
                      className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    >
                      Error: {error}
                    </option>
                  ) : (
                    propertyTypes?.map((type) => (
                      <option
                        key={type._id}
                        value={type._id}
                        className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      >
                        {type.name}
                      </option>
                    ))
                  )}
                </select>
                {propertyTypeError && (
                  <p className="text-red-500 text-sm mt-1">
                    {propertyTypeError.message}
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
          <div className="items-center gap-4 mb-5">
            <div className="flex flex-col lg:flex-row lg:items-start gap-3 ">
              <div className="lg:w-[80%] flex flex-row items-start gap-4">
                <div className="w-full md:w-1/2">
                  <Label htmlFor="property_star_rating">Rating </Label>
                  <Input
                    className="mt-[3px]"
                    id="property_star_rating"
                    type="text"
                    variant={starRatingError && "error"}
                    {...register("star_rating")}
                  />
                  {starRatingError && (
                    <p className="text-red-500 text-sm mt-1">
                      {starRatingError.message}
                    </p>
                  )}
                </div>
                <div className="h-15 mt-7 relative">
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
              </div>
              <div className=" text-right">
                <div className="inline-block lg:mt-7 w-full lg:w-auto">
                  <Button className="w-[120px] rounded-full" type="submit">
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </>
    );
  } else {
    return (
      <>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="pt-0 px-2 lg:px-6 py-6 min-h-screen"
        >
          <CardTitle>Property Details</CardTitle>
          <div className="flex flex-col md:flex-row gap-3 mt-2 items-start">
            {/* Property Name */}
            <div className="w-full md:w-1/2 flex flex-col">
              <Label htmlFor="property_name">
                Property Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="property_name"
                className="mt-[5px]"
                {...register("property_name")}
                type="text"
                variant={propertyNameError && "error"}
              />
              {propertyNameError && (
                <p className="text-red-500 text-sm mt-1">
                  {propertyNameError.message}
                </p>
              )}
            </div>

            {/* Property Email */}
            <div className="w-full md:w-1/2 flex flex-col">
              <Label htmlFor="property_email">
                Property Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="property_email"
                className="mt-[5px]"
                variant={propertyEmailError && "error"}
                {...register("property_email")}
                type="email"
              />
              {propertyEmailError && (
                <p className="text-red-500 text-sm mt-1">
                  {propertyEmailError.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 mt-2 items-start">
            {/* Property Contact */}
            <div className="w-full md:w-1/2 flex flex-col">
              <Label htmlFor="property_contact">
                Property Contact <span className="text-destructive">*</span>
              </Label>
              <Input
                id="property_contact"
                className="mt-[3px]"
                variant={propertyContactError && "error"}
                {...register("property_contact")}
                type="tel"
                inputMode="numeric"
                pattern="[0-9]{10}"
                maxLength={10}
                onChange={(e) => {
                  // Only allow numbers
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 10) {
                    setValue("property_contact", value, { shouldValidate: true });
                  }
                }}
              />
              {propertyContactError && (
                <p className="text-red-500 text-sm mt-1">
                  {propertyContactError.message}
                </p>
              )}
            </div>

            {/* Property Code */}
            <div className="w-full md:w-1/2 flex flex-col">
              <Label htmlFor="property_code">
                Property Code <span className="text-destructive">*</span>
              </Label>
              <Input
                variant={propertyCodeError && "error"}
                id="property_code"
                className="mt-[3px]"
                {...register("property_code")}
                type="text"
              />
              {propertyCodeError && (
                <p className="text-red-500 text-sm mt-1">
                  {propertyCodeError.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <div className="w-full ">
              <Label htmlFor="description  ">
                Property Description <span className="text-destructive">*</span>
              </Label>
              <div className="mt-[3px]">
                <Textarea
                  id="description"
                  {...register("description")}
                  className={
                    propertydescription
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }
                  style={{ resize: "none" }}
                />
              </div>
              {propertydescription && (
                <p className="text-red-500 text-sm mt-1">
                  {propertydescription.message}
                </p>
              )}
            </div>
          </div>
          <div className="flex md:flex-row md:gap-2 flex-col">
            <div className="w-full relative mt-1">
              <Label htmlFor="property_category ">
                Property Category <span className="text-destructive">*</span>
              </Label>
              <div className="inline-block mt-[3px] relative w-full ">
                <select
                  {...register("property_category")}
                  className={`block appearance-none w-full  border ${propertyCategoryError
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                    } bg-white dark:bg-gray-900 text-gray-900 dark:text-white h-10 px-3 rounded-md leading-tight focus:outline-none focus:border-primary-500`}
                >
                  <option value="" disabled>
                    Select Property Category
                  </option>

                  {loading ? (
                    <option
                      value=""
                      className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    >
                      Loading...
                    </option>
                  ) : error ? (
                    <option
                      value=""
                      className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    >
                      Error: {error}
                    </option>
                  ) : (
                    propertyCategories?.map((category) => (
                      <option
                        key={category._id}
                        value={category._id}
                        className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      >
                        {category.category}
                      </option>
                    ))
                  )}
                </select>
                {propertyCategoryError && (
                  <p className="text-red-500 text-sm mt-1 ">
                    {propertyCategoryError.message}
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

            <div className=" w-full relative mt-1">
              <Label htmlFor="property_type ">
                Property Type{" "}
                <span className="text-destructive">
                  <span className="text-destructive">*</span>
                </span>
              </Label>
              <div className="inline-block mt-[3px] relative w-full">
                <select
                  {...register("property_type")}
                  className={`block appearance-none w-full border ${propertyTypeError
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                    } bg-white dark:bg-gray-900 text-gray-900 dark:text-white h-10 px-3 rounded-md leading-tight focus:outline-none focus:border-blue-500`}
                >
                  <option value="" disabled>
                    Select Property Type
                  </option>

                  {loading ? (
                    <option
                      value=""
                      className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    >
                      Loading...
                    </option>
                  ) : error ? (
                    <option
                      value=""
                      className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    >
                      Error: {error}
                    </option>
                  ) : (
                    propertyTypes?.map((type) => (
                      <option
                        key={type._id}
                        value={type._id}
                        className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      >
                        {type.name}
                      </option>
                    ))
                  )}
                </select>
                {propertyTypeError && (
                  <p className="text-red-500 text-sm mt-1">
                    {propertyTypeError.message}
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
          <div className="items-center gap-4 mb-5">
            <div className="flex flex-col lg:flex-row lg:items-start gap-3 ">
              <div className="lg:w-[80%] flex flex-row items-start gap-4">
                <div className="w-full md:w-1/2">
                  <Label htmlFor="property_star_rating">Rating </Label>
                  <Input
                    className="mt-[3px]"
                    id="property_star_rating"
                    type="text"
                    variant={starRatingError && "error"}
                    {...register("star_rating")}
                  />
                  {starRatingError && (
                    <p className="text-red-500 text-sm mt-1">
                      {starRatingError.message}
                    </p>
                  )}
                </div>
                <div className="h-15 mt-7 relative">
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
              </div>
              <div className=" text-right">
                <div className="inline-block lg:mt-7 w-full lg:w-auto">
                  <Button className="w-[120px] rounded-full" type="submit">
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </>
    );
  }
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
        property images
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Property Images</DialogTitle>
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
        Add Property Images
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Property Images</DialogTitle>
          <DialogDescription>
            Add your property images, which will be visible to the end user.
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
              className="mr-2  w-2/5"
              onClick={() => setOpen(false)}
              variant={"ghost"}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={(e: any) => handleFileUpload(e)}
              className="w-[200px]"
              disabled={loading} // Disable button while loading
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
            <CardContent className="flex items-center gap-2">
              {!files.length
                ? "No preview available"
                : files.map((file) => (
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
  /* <main class="py-8 px-4 md:px-8 lg:px-16 xl:px-24"><div class="flex items-center justify-between"><nav data-slot="base" aria-label="Breadcrumbs"><ol data-slot="list" class="flex flex-wrap list-none rounded-small"><li data-slot="base" class="flex items-center" href="http://localhost:3000/app"><a href="http://localhost:3000/app" data-slot="item" class="flex gap-1 items-center cursor-pointer whitespace-nowrap line-clamp-1 tap-highlight-transparent outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 text-foreground/50 text-small hover:opacity-80 active:opacity-disabled transition-opacity no-underline"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-home"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>Home</a><span data-slot="separator" aria-hidden="true" class="px-1 text-foreground/50"><svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="1em"><path d="m9 18 6-6-6-6"></path></svg></span></li><li data-slot="base" class="flex items-center" href="http://localhost:3000/app/property"><a href="http://localhost:3000/app/property" data-slot="item" class="flex gap-1 items-center cursor-pointer whitespace-nowrap line-clamp-1 tap-highlight-transparent outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 text-foreground/50 text-small hover:opacity-80 active:opacity-disabled transition-opacity no-underline"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-land-plot"><path d="m12 8 6-3-6-3v10"></path><path d="m8 11.99-5.5 3.14a1 1 0 0 0 0 1.74l8.5 4.86a2 2 0 0 0 2 0l8.5-4.86a1 1 0 0 0 0-1.74L16 12"></path><path d="m6.49 12.85 11.02 6.3"></path><path d="M17.51 12.85 6.5 19.15"></path></svg>Property</a><span data-slot="separator" aria-hidden="true" class="px-1 text-foreground/50"><svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="1em"><path d="m9 18 6-6-6-6"></path></svg></span></li><li data-slot="base" class="flex items-center" href="http://localhost:3000/app/property/create"><span data-slot="item" data-current="true" class="flex gap-1 items-center whitespace-nowrap line-clamp-1 tap-highlight-transparent outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 text-small no-underline cursor-default transition-opacity text-foreground" aria-disabled="true" role="link" aria-current="page"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pen-line"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>Create</span></li></ol></nav></div><div class="mt-10 gap-2"><div class="w-full flex justify-center gap-4"><ol class="relative text-gray-500 border-s border-gray-200 dark:border-gray-700 dark:text-gray-400 hidden "><li class="mb-10 ms-6"><span class="absolute flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full -start-4 ring-4 ring-white dark:ring-gray-900 dark:bg-gray-700"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-book-open"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg></span><h3 class="font-medium leading-tight">Property Information</h3><p class="text-sm">General property information</p></li><li class="mb-10 ms-6"><span class="absolute flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full -start-4 ring-4 ring-white dark:ring-gray-900 dark:bg-gray-700"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pinned"><path d="M18 8c0 4.5-6 9-6 9s-6-4.5-6-9a6 6 0 0 1 12 0"></path><circle cx="12" cy="8" r="2"></circle><path d="M8.835 14H5a1 1 0 0 0-.9.7l-2 6c-.1.1-.1.2-.1.3 0 .6.4 1 1 1h18c.6 0 1-.4 1-1 0-.1 0-.2-.1-.3l-2-6a1 1 0 0 0-.9-.7h-3.835"></path></svg></span><h3 class="font-medium leading-tight">Property Address</h3><p class="text-sm">Location of property</p></li><li class="mb-10 ms-6"><span class="absolute flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full -start-4 ring-4 ring-white dark:ring-gray-900 dark:bg-gray-700"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shower-head"><path d="m4 4 2.5 2.5"></path><path d="M13.5 6.5a4.95 4.95 0 0 0-7 7"></path><path d="M15 5 5 15"></path><path d="M14 17v.01"></path><path d="M10 16v.01"></path><path d="M13 13v.01"></path><path d="M16 10v.01"></path><path d="M11 20v.01"></path><path d="M17 14v.01"></path><path d="M20 11v.01"></path></svg></span><h3 class="font-medium leading-tight">Property Amenities</h3><p class="text-sm">Available room types and their facilities</p></li><li class="mb-10 ms-6"><span class="absolute flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full -start-4 ring-4 ring-white dark:ring-gray-900 dark:bg-gray-700"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-door-open"><path d="M13 4h3a2 2 0 0 1 2 2v14"></path><path d="M2 20h3"></path><path d="M13 20h9"></path><path d="M10 12v.01"></path><path d="M13 4.562v16.157a1 1 0 0 1-1.242.97L5 20V5.562a2 2 0 0 1 1.515-1.94l4-1A2 2 0 0 1 13 4.561Z"></path></svg></span><h3 class="font-medium leading-tight">Room</h3><p class="text-sm">Amenities availabilty</p></li><li class="mb-10 ms-6"><span class="absolute flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full -start-4 ring-4 ring-white dark:ring-gray-900 dark:bg-gray-700"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shower-head"><path d="m4 4 2.5 2.5"></path><path d="M13.5 6.5a4.95 4.95 0 0 0-7 7"></path><path d="M15 5 5 15"></path><path d="M14 17v.01"></path><path d="M10 16v.01"></path><path d="M13 13v.01"></path><path d="M16 10v.01"></path><path d="M11 20v.01"></path><path d="M17 14v.01"></path><path d="M20 11v.01"></path></svg></span><h3 class="font-medium leading-tight">Room Amenities</h3><p class="text-sm">Room Amenities availabilty</p></li><li class="mb-10 ms-6"><span class="absolute flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full -start-4 ring-4 ring-white dark:ring-gray-900 dark:bg-gray-700"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-dollar-sign"><line x1="12" x2="12" y1="2" y2="22"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg></span><h3 class="font-medium leading-tight">Rate Plan</h3><p class="text-sm"></p></li></ol><div class="w-[60%]"><form class="space-y-4 "><h3 class="text-2xl font-semibold leading-none tracking-tight">Property Details</h3><div class="items-center justify-center gap-2"><div class="w-full"><label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" for="property_name">Property Name</label><div class="relative flex"><input class="flex text-sm placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 w-full rounded-md border border-input file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background h-12 px-3 py-4" id="property_name" type="text" name="property_name"></div></div><div class="w-full"><label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" for="property_email">Property Email</label><div class="relative flex"><input class="flex text-sm placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 w-full rounded-md border border-input file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background h-12 px-3 py-4" id="property_email" type="email" name="property_email"></div></div></div><div class="flex items-center justify-center gap-4"><div class="w-full"><label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" for="property_contact">Property Contact</label><div class="relative flex"><input class="flex text-sm placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 w-full rounded-md border border-input file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background h-12 px-3 py-4" id="property_contact" type="text" name="property_contact"></div></div><div class="w-full"><label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" for="property_code">Property Code</label><div class="relative flex"><input class="flex text-sm placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 w-full rounded-md border border-input file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background h-12 px-3 py-4" id="property_code" type="text" name="property_code"></div></div></div><div class="flex items-center justify-center gap-4"><div class="w-full"><label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" for="description">Property Description</label><textarea class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" id="description" name="description"></textarea></div></div><div class="flex items-center gap-2"><div class="w-40"><label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" for="property_star_rating">Star Rating</label><div class="relative flex"><input class="flex text-sm placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 w-full rounded-md border border-input file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background h-10 px-3 py-2" id="property_star_rating" type="text" name="star_rating"></div></div><div class="self-end h-15 relative"><button type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="radix-:r0:" data-state="closed" class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">Add property images</button></div><div class="self-end w-full relative"><label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" for="property_category">Enter property category</label><div class="inline-block relative w-full"><select name="property_category" class="block appearance-none w-full border border-gray-300 text-white-700 py-2 px-3 rounded-md leading-tight focus:outline-none focus:border-primary-500"><option value="66c81618e4088b6257dcf4e8">ADVENTURE DESTINATION</option><option value="66cd7e86d0823ebb00f3598d">HOTEL</option><option value="66cd8057d0823ebb00f35992">HOMESTAY</option><option value="66cd807bd0823ebb00f3599a">WILDLIFE SAFARI</option><option value="66cd80b8d0823ebb00f359a2">BEACH RESORT</option><option value="66cd80edd0823ebb00f359ad">MOUNTAIN RETREAT</option><option value="66cd8112d0823ebb00f359b5">CULTURAL CITY</option></select><div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white-700"><svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 0 1 1.414-1.414L10 8.586l3.293-3.293a1 1 0 1 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4z"></path></svg></div></div></div><div class="self-end w-full relative"><label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" for="property_type">Enter property type </label><div class="inline-block relative w-full"><select name="property_type" class="block appearance-none w-full border border-gray-300 text-white-700 py-2 px-3 rounded-md leading-tight focus:outline-none focus:border-blue-500"><option value="66c84e5462ef300d489a970a">1BHK</option><option value="66cd7ee6d0823ebb00f3598f">2BHK</option><option value="66cd806dd0823ebb00f35997">3BHK</option><option value="66cd809cd0823ebb00f3599c">RESORT</option><option value="66cd80a1d0823ebb00f3599f">PG</option><option value="66cd80c9d0823ebb00f359a4">APPARTMENT</option><option value="66cd80fdd0823ebb00f359af">TREE HOUSE</option></select><div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white-700"><svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 0 1 1.414-1.414L10 8.586l3.293-3.293a1 1 0 1 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4z"></path></svg></div></div></div><div class="self-end w-mid relative"><div class="inline-block relative w-full"><button class="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-[120px] rounded-full" type="submit">Next</button></div></div></div></form></div></div></div></main> */
}