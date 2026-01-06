"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./../ui/card";
import { Label } from "./../ui/label";
import { Input } from "./../ui/input";
import { Button, buttonVariants } from "./../ui/button";
import { ReloadIcon } from "@radix-ui/react-icons";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
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
import axios from "axios";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { cn } from "./../../lib/utils";
import { Textarea } from "./../ui/textarea";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  property_code: z.string().min(1, "Property code is required"),
  description: z.string().min(1, "Description is required"),
  property_category: z.string().min(1, "Property category is required"),
  property_type: z.string().min(1, "Property type is required"),
  property_contact: z.string().min(1, "Property contact is required"),
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
  mostCommonTypes: PropertyType[];
  otherTypes: PropertyType[];
  types: PropertyType[];
  updatedAt: string;
}

interface PropertyType {
  _id: string;
  name: string;
  code: string;
  typeCategory: string;
  propertyCategory?: string;
}

export default function PropertyInfo({ onNext }: Props) {
  const [propertyDetails, setPropertyDetails] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [propertyImageUrls, setPropertyImageUrls] = useState<Array<any>>([]);
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
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
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
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get("property_id");
  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/property/${propertyId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data && response.data.data) {
        setPropertyDetails(response.data.data);
      } else {
        setPropertyDetails(null);
        toast.error("Property not found");
        router.push("/app/property/create");
      }
      setLoading(false);
    } catch (error: any) {
      if (error.code === "ECONNRESET") {
        console.log("Connection reset, retrying...");
        fetchPropertyDetails();
      } else if (error.response?.status === 404) {
        toast.error("Property not found");
        router.push("/app/property/create");
      } else {
        console.error("Error fetching property details:", error);
        toast.error("Failed to fetch property details");
      }
      setLoading(false);
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
  const { register, handleSubmit, formState, setValue, watch } = form;
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

  useEffect(() => {
    if (propertyDetails) {
      const categoryId = typeof propertyDetails.property_category === 'object'
        ? propertyDetails.property_category?._id
        : propertyDetails.property_category;

      const propertyTypeId = typeof propertyDetails.property_type === 'object'
        ? propertyDetails.property_type?._id
        : propertyDetails.property_type;

      setValue("property_name", propertyDetails.property_name || "");
      setValue("property_email", propertyDetails.property_email || "");
      setValue("property_contact", propertyDetails.property_contact || "");
      setValue("property_code", propertyDetails.property_code || "");
      setValue("description", propertyDetails.description || "");
      setValue("property_category", categoryId || "");
      setValue("property_type", propertyTypeId || "");
      setValue("star_rating", propertyDetails.star_rating || "1");
    }
  }, [propertyDetails, setValue]);

  const selectedCategory = watch("property_category");
  useEffect(() => {
    if (selectedCategory) {
      const currentPropertyType = watch("property_type");
      fetchPropertyTypes(selectedCategory).then(() => {
        if (currentPropertyType) {
          setValue("property_type", currentPropertyType, { shouldValidate: false });
        }
      });
    } else {
      fetchPropertyTypes();
    }
  }, [selectedCategory]);
  useEffect(() => {
    if (propertyDetails?.image && propertyDetails.image.length > 0) {
      setPropertyImageUrls(propertyDetails.image);
    }
  }, [propertyDetails?._id]);

  useEffect(() => {
    const storedData = localStorage.getItem("propertyData");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setPropertyData(parsedData);
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    }
  }, []);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    console.log("Property image URLs:", propertyImageUrls);
    const imageUrls = propertyImageUrls.map((img) => img.url);
    const selectedDataSourceStr = localStorage.getItem('selectedPropertyDataSource');
    let dataSource: string | null = null;

    if (selectedDataSourceStr) {
      const parsed = JSON.parse(selectedDataSourceStr);
      dataSource = parsed.providerId || null;
    }

    const propertyCreateBody = {
      ...data,
      image: imageUrls,
      dataSource,
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

    [...files].forEach((file) => {
      data.append(`file`, file, file.name);
    });
    return data;
  };

  const handlePropertyImageUpload = async () => {
    try {
      if (files.length) {
        setUploadLoading(true);

        // Store current form values BEFORE upload
        const currentFormValues = {
          property_category: watch("property_category"),
          property_type: watch("property_type"),
          property_name: watch("property_name"),
          property_email: watch("property_email"),
          property_contact: watch("property_contact"),
          property_code: watch("property_code"),
          description: watch("description"),
          star_rating: watch("star_rating"),
        };

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
        const urls = response.data.data.urls;

        const formattedUrls = urls.map((url: string) => ({
          public_id: url.split('/').pop() || '',
          url: url,
          secure_url: url
        }));

        setPropertyImageUrls(formattedUrls);
        setFiles([]);
        setUploadLoading(false);
        setOpenDialog(false);

        // Restore form values AFTER state update
        setTimeout(() => {
          Object.entries(currentFormValues).forEach(([key, value]) => {
            if (value) {
              setValue(key as keyof Inputs, value, {
                shouldValidate: false,
                shouldDirty: false
              });
            }
          });
        }, 0);

        toast.success("Images uploaded successfully!");
      }
    } catch (error) {
      console.error("Error uploading property images:", error);
      toast.error("Failed to upload images. Please try again.");
      setUploadLoading(false);
    }
  };

  const fetchPropertyTypes = async (categoryId?: string): Promise<void> => {
    try {
      setLoading(true);
      const url = categoryId
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/property/type?categoryId=${categoryId}`
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/property/type`;

      const response = await axios.get(url);
      setPropertyTypes(response.data.data.propertyTypes);
      setLoading(false);
      setError(null);
    } catch (error: any) {
      setError(error.message);
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

    fetchPropertyCategories();

    if (!watch("property_category")) {
      fetchPropertyTypes();
    }
  }, []);

  const handleFormSubmit: SubmitHandler<Inputs> = async () => {
    try {
      router.push(`${pathname}?property_id=${propertyId}`);
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
              <PhoneInput
                country={'in'}
                value={form.watch("property_contact")}
                onChange={(phone, country) => {
                  setValue("property_contact", phone, { shouldValidate: true });
                }}

                inputStyle={{
                  width: '100%',
                  height: '40px',
                  paddingLeft: '48px',
                  fontSize: '14px',
                  border: propertyContactError ? '1px solid #ef4444' : '1px solid #d1d5db',
                  borderRadius: '0 6px 6px 0',
                  backgroundColor: 'white',
                  color: '#111827',
                  outline: 'none',
                  transition: 'border-color 0.15s ease-in-out'
                }}

                containerStyle={{
                  width: '100%',
                  marginTop: '3px'
                }}

                // Enhanced button styling
                buttonStyle={{
                  borderRadius: '6px 0 0 6px',
                  border: propertyContactError ? '1px solid #ef4444' : '1px solid #d1d5db',
                  backgroundColor: '#f8fafc',
                  height: '40px',
                  borderRight: 'none',
                  transition: 'all 0.15s ease-in-out'
                }}

                // Enhanced dropdown with better search experience
                dropdownStyle={{
                  backgroundColor: 'white',
                  color: '#111827',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  maxHeight: '300px',
                  overflowY: 'auto',
                  zIndex: 9999,
                  width: '280px'
                }}

                // Enhanced search input styling
                searchStyle={{
                  margin: '8px',
                  padding: '8px 12px',
                  fontSize: '14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  outline: 'none',
                  backgroundColor: '#f8fafc',
                  width: 'calc(100% - 16px)'
                }}

                // User-friendly options
                placeholder="Enter phone number"
                enableSearch={true}
                searchPlaceholder="Search countries..."
                searchNotFound="No countries found"
                countryCodeEditable={false}
                disableSearchIcon={true}
                specialLabel=""
                autoFormat={true}

                isValid={(value, country) => {
                  if (!value) return false;
                  const phoneRegex = /^\+\d{7,15}$/;
                  return phoneRegex.test(value);
                }}

                // Input properties for accessibility
                inputProps={{
                  required: true,
                  'aria-label': 'Phone number',
                  'aria-describedby': propertyContactError ? 'phone-error' : undefined
                }}
              />

              {/* Enhanced error message display */}
              {propertyContactError && (
                <p
                  id="phone-error"
                  className="text-red-500 text-xs mt-1 flex items-center gap-1"
                >
                  <svg
                    className="w-3 h-3 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {propertyContactError.message}
                </p>
              )}

              {/* Optional: Helper text for better UX */}
              {!propertyContactError && (
                <p className="text-gray-500 text-xs mt-1">
                  Include country code (e.g., +91 for India)
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
                  style={{ resize: "none", whiteSpace: "pre-wrap" }}
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
                  value={watch("property_category")}
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

            <div className="w-full relative mt-1">
              <Label htmlFor="property_type">
                Property Type <span className="text-destructive">*</span>
              </Label>
              <div className="inline-block mt-[3px] relative w-full">
                <select
                  {...register("property_type")}
                  value={watch("property_type")}
                  disabled={!watch("property_category")}
                  className={`block appearance-none w-full border ${propertyTypeError
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                    } bg-white dark:bg-gray-900 text-gray-900 dark:text-white h-10 px-3 rounded-md text-sm leading-tight focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <option value="" disabled>
                    {!watch("property_category")
                      ? "Select Property Category First"
                      : "Select Property Type"}
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
                    <>
                      {propertyTypes.filter(type => type.typeCategory === "Most common").length > 0 && (
                        <optgroup label="Most Common" className="font-semibold">
                          {propertyTypes
                            .filter(type => type.typeCategory === "Most common")
                            .map((type) => (
                              <option
                                key={type._id}
                                value={type._id}
                                className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                              >
                                {type.name}
                              </option>
                            ))}
                        </optgroup>
                      )}

                      {propertyTypes.filter(type => type.typeCategory === "Others").length > 0 && (
                        <optgroup label="Others" className="font-semibold">
                          {propertyTypes
                            .filter(type => type.typeCategory === "Others")
                            .map((type) => (
                              <option
                                key={type._id}
                                value={type._id}
                                className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                              >
                                {type.name}
                              </option>
                            ))}
                        </optgroup>
                      )}

                      {propertyTypes.filter(type => !type.typeCategory).map((type) => (
                        <option
                          key={type._id}
                          value={type._id}
                          className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        >
                          {type.name}
                        </option>
                      ))}
                    </>
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
                      loading={uploadLoading}
                      setLoading={setUploadLoading}
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
              <PhoneInput
                country={'in'} // Default to India
                value={form.watch("property_contact")}
                onChange={(phone, country) => {
                  // Validate the phone number format on change
                  setValue("property_contact", phone, { shouldValidate: true });
                }}

                // Enhanced input styling for better consistency
                inputStyle={{
                  width: '100%',
                  height: '40px',
                  paddingLeft: '48px',
                  fontSize: '14px',
                  border: propertyContactError ? '1px solid #ef4444' : '1px solid #d1d5db',
                  borderRadius: '0 6px 6px 0', // Only right side rounded
                  backgroundColor: 'white',
                  color: '#111827',
                  outline: 'none',
                  transition: 'border-color 0.15s ease-in-out'
                }}

                containerStyle={{
                  width: '100%',
                  marginTop: '3px'
                }}

                // Enhanced button styling
                buttonStyle={{
                  borderRadius: '6px 0 0 6px',
                  border: propertyContactError ? '1px solid #ef4444' : '1px solid #d1d5db',
                  backgroundColor: '#f8fafc',
                  height: '40px',
                  borderRight: 'none',
                  transition: 'all 0.15s ease-in-out'
                }}

                // Enhanced dropdown with better search experience
                dropdownStyle={{
                  backgroundColor: 'white',
                  color: '#111827',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  maxHeight: '300px',
                  overflowY: 'auto',
                  zIndex: 9999,
                  width: '280px'
                }}

                // Enhanced search input styling
                searchStyle={{
                  margin: '8px',
                  padding: '8px 12px',
                  fontSize: '14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  outline: 'none',
                  backgroundColor: '#f8fafc',
                  width: 'calc(100% - 16px)'
                }}

                // User-friendly options
                placeholder="Enter phone number"
                enableSearch={true}
                searchPlaceholder="Search countries..."
                searchNotFound="No countries found"
                countryCodeEditable={false}
                disableSearchIcon={true}
                specialLabel=""
                autoFormat={true}

                isValid={(value, country) => {
                  if (!value) return false;
                  // Basic validation - you can enhance this based on country-specific rules
                  const phoneRegex = /^\+\d{7,15}$/;
                  return phoneRegex.test(value);
                }}

                // Input properties for accessibility
                inputProps={{
                  required: true,
                  'aria-label': 'Phone number',
                  'aria-describedby': propertyContactError ? 'phone-error' : undefined
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
                  style={{ resize: "none", whiteSpace: "pre-wrap" }}
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
                  value={watch("property_category")}
                  className={`block appearance-none w-full  border ${propertyCategoryError
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                    } bg-white dark:bg-gray-900 text-gray-900 dark:text-white h-10 px-3 rounded-md text-sm leading-tight focus:outline-none focus:border-primary-500`}
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

            <div className="w-full relative mt-1">
              <Label htmlFor="property_type">
                Property Type <span className="text-destructive">*</span>
              </Label>
              <div className="inline-block mt-[3px] relative w-full">
                <select
                  {...register("property_type")}
                  value={watch("property_type")}
                  disabled={!watch("property_category")}
                  className={`block appearance-none w-full border ${propertyTypeError
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                    } bg-white dark:bg-gray-900 text-gray-900 dark:text-white h-10 px-3 rounded-md text-sm leading-tight focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <option value="" disabled>
                    {!watch("property_category")
                      ? "Select Property Category First"
                      : "Select Property Type"}
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
                    <>
                      {/* Group by typeCategory if available */}
                      {propertyTypes.filter(type => type.typeCategory === "Most common").length > 0 && (
                        <optgroup label="Most Common" className="font-semibold">
                          {propertyTypes
                            .filter(type => type.typeCategory === "Most common")
                            .map((type) => (
                              <option
                                key={type._id}
                                value={type._id}
                                className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                              >
                                {type.name}
                              </option>
                            ))}
                        </optgroup>
                      )}

                      {propertyTypes.filter(type => type.typeCategory === "Others").length > 0 && (
                        <optgroup label="Others" className="font-semibold">
                          {propertyTypes
                            .filter(type => type.typeCategory === "Others")
                            .map((type) => (
                              <option
                                key={type._id}
                                value={type._id}
                                className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                              >
                                {type.name}
                              </option>
                            ))}
                        </optgroup>
                      )}

                      {/* Fallback for types without typeCategory */}
                      {propertyTypes.filter(type => !type.typeCategory).map((type) => (
                        <option
                          key={type._id}
                          value={type._id}
                          className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        >
                          {type.name}
                        </option>
                      ))}
                    </>
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
  setRejected,
  loading,
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