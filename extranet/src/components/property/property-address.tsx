"use client";

import React, {
  useEffect,
  useState,
} from "react";
import {
  CardTitle,
} from "./../ui/card";
import { Label } from "./../ui/label";
import { Input } from "./../ui/input";
import { Button } from "./../ui/button";
import axios, {  } from "axios";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { RootState, useSelector } from "../../redux/store";
import { Country, State, City, IState, ICity } from "country-state-city";

const createPropertyAddressSchema = z.object({
  address_line_1: z.string().min(1, "Address line 1 is required"),
  address_line_2: z.string(),
  country: z.string().min(1, "Country is required"),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  landmark: z.string().min(1, "Landmark is required"),
  zip_code: z.string()
    .min(3, "Zip Code must be at least 3 digits")
    .max(6, "Zip Code cannot exceed 6 digits")
    .refine((value) => /^\d+$/.test(value), {
      message: "Zip Code must contain only numbers",
    }),
});

type Inputs = {
  address_line_1: string;
  address_line_2: string;
  country: string;
  state: string;
  city: string;
  landmark: string;
  zip_code: string;
};

type Country = {
  isoCode: string;
  name: string;
};

type State = IState;
interface City {
  name: string;
  countryIsoCode: string;
  stateIsoCode: string;
}

type Props = {
  onPrevious: () => void;
  onNext: () => void;
};

export default function PropertyAddress({ onNext, onPrevious }: Props) {
  const [openDialog, setOpenDialog] = useState(false);
  const [currenStep, setCurrentStep] = useState(0);
  const [propertyAddress, setProppertyAddress] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [error, setError] = useState(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const [showCountryOptions, setShowCountryOptions] = useState(false);

  useEffect(() => {
    const fetchedCountries = Country.getAllCountries();
    setCountries(fetchedCountries);
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      const fetchedStates = State.getStatesOfCountry(selectedCountry);
      console.log("States - ", fetchedStates);
      setStates(fetchedStates);
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedState && selectedCountry) {
      const fetchedCities: ICity[] = City.getCitiesOfState(selectedCountry, selectedState);
      setCities(fetchedCities.map((city: ICity) => ({
        name: city.name,
        countryIsoCode: selectedCountry,
        stateIsoCode: selectedState,
      })) || []); // Critical fix
    }
  }, [selectedState, selectedCountry]);

  console.log("All Countries:", countries);
  console.log("All state:", states);
  console.log("All City:", cities);

  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode);
    setShowCountryOptions(false);

    const fetchedStates = State.getStatesOfCountry(countryCode);
    console.log("Fetched States:", fetchedStates);
    setStates(fetchedStates);
    setSelectedState("");
    setCities([]);
    setSelectedCity("");
  };
  const property_id: string = useSearchParams().get("property_id") ?? "";
  const form = useForm<Inputs>({
    defaultValues: {
      address_line_1: "",
      address_line_2: "",
      country: "",
      state: "",
      city: "",
      landmark: "",
      zip_code: "",
    },
    resolver: zodResolver(createPropertyAddressSchema),
  });

  const { register, handleSubmit, formState, setValue } = form;
  const {
    errors: {
      address_line_1: addressLine1Error,
      address_line_2: addressLine2Error,
      country: countryError,
      state: stateError,
      city: cityError,
      landmark: landmarkError,
      zip_code: zipCodeError,
    },
  } = formState;

  const featPropertyAddress = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/property/${property_id}`
      );
      console.log(
        "Featching Adress From PropertyAddress",
        response.data.data.property_address
      );
      setProppertyAddress(response.data.data.property_address);
      setLoading(false);
    } catch (error: any) {
      if (error.code === "ECONNRESET") {
        console.log("Connection reset, retrying...");
        // Retry logic here
        featPropertyAddress();
      } else {
        console.error("error featching Property details:", error);
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (property_id) {
      featPropertyAddress();
    }
  }, []);

  useEffect(() => {
    if (propertyAddress) {
      setValue("address_line_1", propertyAddress.address_line_1 || "");
      setValue("address_line_2", propertyAddress.address_line_2 || "");

      setSelectedCountry(propertyAddress.country || "");
      setValue("country", propertyAddress.country || "");
      setSelectedState(propertyAddress.state || "");
      setValue("state", propertyAddress.state || "");
      setSelectedCity(propertyAddress.city || "");
      setValue("city", propertyAddress.city || "");
      setValue("landmark", propertyAddress.landmark || "");
      setValue("zip_code", propertyAddress.zip_code.toString() || "");
    }
  }, [propertyAddress, setValue]);

  const handlePrevious = async (property_id: string) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/property/${property_id}`
      );
      onPrevious();
    } catch (error) {
      console.error("Error fetching property info data:", error);
    }
  };


  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setFormLoading(true);

    try {
      if (propertyAddress) {
        const updatedData = { ...propertyAddress, ...data };
        await axios.patch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/property/addressbyid/${property_id}`,
          updatedData,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        toast.success("Property address updated successfully!");
      } else {
        const propertyCreateBody = {
          ...data,
          property_id: property_id,
        };
        await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/property/address`,
          propertyCreateBody,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        toast.success("Property address created successfully!");
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

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        <CardTitle>Property Address</CardTitle>
        <div className="items-center justify-center">
          <div className="w-full mb-1">
            <Label htmlFor="address_line_1">
              Address Line 1{" "}
              <span className="text-destructive">
                <span className="text-destructive">*</span>
              </span>
            </Label>
            <Input
              id="address_line_1"
              className="mt-1"
              {...register("address_line_1")}
              type="text"
              variant={addressLine1Error && "error"}
            />
            {addressLine1Error && (
              <p className="text-red-500 text-sm mt-1">
                {addressLine1Error.message}
              </p>
            )}
          </div>
          <div className="w-full">
            <Label htmlFor="address_line_2 ">
              Address Line 2{" "}
              <span className="text-destructive">
              </span>
            </Label>
            <Input
              id="address_line_2"
              className="mt-1"
              variant={addressLine2Error && "error"}
              {...register("address_line_2")}
              type="text"
            />
            {addressLine2Error && (
              <p className="text-red-500 text-sm mt-1">
                {addressLine2Error.message}
              </p>
            )}
          </div>
        </div>

        <div className=" flex md:flex-row w-full flex-col justify-center md:gap-3">
          <div className=" md:w-2/3  relative flex flex-col md:flex-row md:gap-3 ">
            <div className="md:w-1/2 w-full">
              <Label
                htmlFor="country"
              >
                Country <span className="text-destructive">*</span>
              </Label>
              <div className=" mt-1 relative">
                <select
                  {...register("country")}
                  className={`block appearance-none w-full border ${countryError ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    } bg-white dark:bg-gray-900 text-gray-900 dark:text-white h-10 px-3 md:h-12.1 md:px-3 rounded-md text-sm leading-tight focus:outline-none focus:border-primary-500`}
                  value={selectedCountry}
                  onChange={(e) => {
                    handleCountryChange(e.target.value);
                    setValue("country", e.target.value);
                  }}
                >
                  <option value="" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                    Select Country
                  </option>
                  {loading ? (
                    <option value="" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                      Loading...
                    </option>
                  ) : error ? (
                    <option value="" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                      Error: {error}
                    </option>
                  ) : (
                    countries.map((country) => (
                      <option
                        key={country.isoCode}
                        value={country.isoCode}
                        className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      >
                        {country.name}
                      </option>
                    ))
                  )}
                </select>
                {countryError && (
                  <p className="text-red-500 text-sm mt-1">
                    {countryError.message}
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

            <div className=" md:w-1/2 w-full relative">
              <Label
                htmlFor="state"
              >
                State <span className="text-destructive">*</span>
              </Label>
              <div className="inline-block mt-1 relative w-full">
                <select
                  {...register("state")}
                  className={`block appearance-none w-full border ${stateError ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    } bg-white dark:bg-gray-900 text-gray-900 dark:text-white h-10 px-3 md:h-12.1 md:px-3 rounded-md text-sm leading-tight focus:outline-none focus:border-primary-500`}
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    setValue("state", e.target.value);
                  }}
                >
                  <option value="" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                    Select State
                  </option>
                  {loading ? (
                    <option value="" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                      Loading...
                    </option>
                  ) : error ? (
                    <option value="" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                      Error: {error}
                    </option>
                  ) : (
                    states?.map((state) => (
                      <option
                        key={state.isoCode}
                        value={state.isoCode}
                        className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      >
                        {state.name}
                      </option>
                    ))
                  )}
                </select>
                {stateError && (
                  <p className="text-red-500 text-sm mt-1">
                    {stateError.message}
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
          <div className="md:w-1/3 w-full">
            <div className="self-end w-full relative">
              <Label
                htmlFor="city"
              >
                City <span className="text-destructive">*</span>
              </Label>
              <div className="inline-block mt-1 relative w-full">
                <select
                  {...register("city")}
                  className={`block appearance-none w-full border ${cityError ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    } bg-white dark:bg-gray-900 text-gray-900 dark:text-white h-10 px-3 md:h-12.1 md:px-3 rounded-md text-sm leading-tight focus:outline-none focus:border-primary-500`}
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                    setValue("city", e.target.value);
                  }}
                >
                  <option value="" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                    Select City
                  </option>
                  {loading ? (
                    <option value="" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                      Loading...
                    </option>
                  ) : error ? (
                    <option value="" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                      Error: {error}
                    </option>
                  ) : (
                    cities?.map((city) => (
                      <option
                        key={city.name}
                        value={city.name}
                        className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      >
                        {city.name}
                      </option>
                    ))
                  )}
                </select>
                {cityError && (
                  <p className="text-red-500 text-sm mt-1">
                    {cityError.message}
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
        </div>

        <div className="items-center justify-center gap-4">
          <div className="flex md:flex-row flex-col md:gap-3  ">
            <div className="w-full md:w-1/2 ">
              <Label htmlFor="landmark">
                Landmark <span className="text-destructive">*</span>
              </Label>
              <Input
                variant={landmarkError && "error"}
                className="mt-1"
                id="landmark"
                {...register("landmark")}
                type="text"
              />
              {landmarkError && (
                <p className="text-red-500 text-sm mt-1">
                  {landmarkError.message}
                </p>
              )}
            </div>

            <div className="items-center w-full md:w-1/2">
              <Label htmlFor="zip_code">
                Zip Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="zip_code"
                type="text"
                className="mt-1"
                minLength={3}
                maxLength={6}
                variant={zipCodeError && "error"}
                {...register("zip_code")}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 6) {
                    e.target.value = value;
                    setValue("zip_code", value, { shouldValidate: true });
                  }
                }}
              />
              {zipCodeError && (
                <p className="text-red-500 text-sm mt-1">
                  {zipCodeError.message}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-4 w-full mt-4">
          <div className="mt-2">
            <Button
              className="lg:w-[180px] md:w-[120px] w-[100px] text-right"
              onClick={() => handlePrevious(property_id)}
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