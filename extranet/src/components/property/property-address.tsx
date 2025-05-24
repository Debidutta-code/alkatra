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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from "./../ui/dropdown-menu";

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
import Cookies from "js-cookie";
import { City, Country, State } from "country-state-city";
import error from "next/error";
import { ICountry, IState, ICity } from 'country-state-city'

const createPropertyAddressSchema = z.object({
  address_line_1: z.string().min(1, "Address line 1 is required"),
  address_line_2: z.string().min(1, "Address line 2 is required"),
  country: z.string().min(1, "Country is required"),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  landmark: z.string().min(1, "LandMark Required"),
  // zip_code: z.string().min(1, "Zipcode is required"),
  zip_code: z.string().refine((value) => /^\d{6}$/.test(value), {
    message: "Please provide a valid 6-digit Zip Code",
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

type State = {
  countryCode: any;
  isoCode: string;
  name: string;
};

type Country = {
  isoCode: string;
  name: string;
};

interface City {
  // id: string;
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
      console.log("States - ", fetchedStates)
      setStates(fetchedStates);
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedState && selectedCountry) {
      const fetchedCities: any = City.getCitiesOfState(selectedCountry, selectedState);
      setCities(fetchedCities);
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

  const toggleCountryOptions = () => {
    setShowCountryOptions(!showCountryOptions);
  };

  // useEffect(() => {
  //   if (selectedCountry && selectedState) {
  //     const fetchedCities = City.getCitiesOfState(
  //       selectedCountry,
  //       selectedState
  //     );
  //     console.log("Fetched Cities:", fetchedCities);
  //     setCities(fetchedCities);
  //   }
  // }, [selectedCountry, selectedState]);

  // const { accessToken } = useSelector((state: RootState) => state.auth);
  //  const property_id = useSearchParams().get("property_id");

  const property_id: string = useSearchParams().get("property_id") ?? "";

  const router = useRouter();
  // console.log("Router Details",router);
  const pathname = usePathname();

  const form = useForm<Inputs>({
    defaultValues: {
      address_line_1: "",
      address_line_2: "",
      country: "",
      state: "",
      city: "",
      landmark: "",
      zip_code: "0",
    },
    resolver: zodResolver(createPropertyAddressSchema),
  });

  const { register, control, handleSubmit, formState, setValue } = form;
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
      if (error.code === 'ECONNRESET') {
        console.log('Connection reset, retrying...');
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

      // setValue("country", propertyAddress.country || "");
      // setValue("state", propertyAddress.state || "");
      // setValue("city", propertyAddress.city || "");

      const selectedCountryObj: any = countries.find(
        (country) => country.isoCode === propertyAddress.country
      );
      console.log("Selected Country Object:", selectedCountryObj);
      setSelectedCountry(selectedCountryObj?.isoCode);
      const countryIsoCode = selectedCountryObj
        ? selectedCountryObj.isoCode
        : "";
      setValue("country", countryIsoCode);

      const selectedStateObj: any = states.find(
        (state) =>
          state.isoCode === propertyAddress.state &&
          state.countryCode === countryIsoCode
        // console.log(state.isoCode ,"===", countryIsoCode)
      );
      const stateName = selectedStateObj ? selectedStateObj.isoCode : "";
      setValue("state", stateName);
      console.log("Selected state Object:", selectedStateObj);
      setSelectedState(selectedStateObj?.isoCode)

      const selectedCityObj = cities.find(
        (city) => city.name === propertyAddress.city
      );
      const cityName = selectedCityObj ? selectedCityObj.name : "";
      console.log('city name _________________________', cityName)
      setValue("city", cityName);
      console.log("Selected city Object:", selectedCityObj);
      setSelectedCity(cityName)


      console.log("States Array:", states);
      console.log("Property Address State:", propertyAddress.state);
      console.log("Property Address Country:", propertyAddress.country);
      console.log("Country ISO Code:", countryIsoCode);

      setValue("landmark", propertyAddress.landmark || "");
      setValue("zip_code", propertyAddress.zip_code.toString() || "");
    }
  }, [propertyAddress, setValue, countries, states, cities]);

  const handlePrevious = async (property_id: string) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/property/${property_id}`
      );
      const propertyInfoData = response.data;
      onPrevious();
    } catch (error) {
      console.error("Error fetching property info data:", error);
    }
  };

  // useEffect(() => {
  //   addressLine1Error && toast.error(addressLine1Error.message!);
  //   addressLine2Error && toast.error(addressLine2Error.message!);
  //   countryError && toast.error(countryError.message!);
  //   stateError && toast.error(stateError.message!);
  //   cityError && toast.error(cityError.message!);
  //   landmarkError && toast.error(landmarkError.message!);
  //   zipCodeError && toast.error(zipCodeError.message!);
  // }, [
  //   addressLine1Error,
  //   addressLine2Error,
  //   countryError,
  //   stateError,
  //   cityError,
  //   landmarkError,
  //   zipCodeError,
  // ]);
  // const accessToken = Cookies.get("accessToken");

  // console.log("Token from proerty adress tsx",accessToken)

  // const onSubmit: SubmitHandler<Inputs> = async (data) => {
  //   // console.log({ addressData: data });

  //   const propertyCreateBody = {
  //     ...data,
  //     property_id: property_id,
  //   };

  //   setFormLoading(true);

  //   try {
  //     const {
  //       data: { data: propertyAddressCreateResponse },
  //     } = await axios.post(
  //       `http://localhost:8040/api/v1/property/address`,
  //       propertyCreateBody,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${accessToken}`,
  //         },
  //       }
  //     );
  //     console.log(propertyAddressCreateResponse);
  //     setFormLoading(false);

  //     onNext();
  //     console.log("create new one")
  //   } catch (err) {
  //     if (axios.isAxiosError(err)) {
  //       setFormLoading(false);
  //       toast.error(err?.response?.data?.message);
  //     }
  //   }
  // };

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
        // const selectedCountryObj = countries.find(
        //   (country) => country.isoCode === selectedCountry
        // );
        // const countryName = selectedCountryObj ? selectedCountryObj.name : "";
        // const selectedStateObj = states.find(
        //   (state) => state.isoCode === selectedState
        // );
        // const stateName = selectedStateObj ? selectedStateObj.name : "";

        const propertyCreateBody = {
          ...data,
          property_id: property_id,
          // country: countryName,
          // state: stateName,
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <CardTitle>Property Address</CardTitle>
        <div className="items-center justify-center gap-4">
          <div className="w-full mb-3">
            <Label htmlFor="address_line_1">Address Line 1 <span className="text-destructive"><span className="text-destructive">*</span></span></Label>
            <Input
              id="address_line_1"
              {...register("address_line_1")}
              size={"md"}
              type="text"
              variant={addressLine1Error && "error"}
            />
            {addressLine1Error && (
              <p className="text-red-500 text-sm mt-1">{addressLine1Error.message}</p>
            )}
          </div>
          <div className="w-full">
            <Label htmlFor="address_line_2">Address Line 2 <span className="text-destructive"><span className="text-destructive">*</span></span></Label>
            <Input
              id="address_line_2"
              size={"md"}
              variant={addressLine2Error && "error"}
              {...register("address_line_2")}
              type="text"
            />
            {addressLine2Error && (
              <p className="text-red-500 text-sm mt-1">{addressLine2Error.message}</p>
            )}
          </div>
        </div>

        <div className="items-center justify-center gap-4">
          {/* Commented inputs for country and state */}

          <div className="self-end w-full relative mb-3">
            <Label htmlFor="country" className="text-gray-700 dark:text-gray-300">Country <span className="text-destructive">*</span></Label>
            <div className="inline-block relative w-full">
              <select
                {...register("country")}
                className={`block appearance-none w-full border ${countryError ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  } bg-white dark:bg-gray-900 text-gray-900 dark:text-white py-2 px-3 md:h-12.1 md:px-3 md:py-4 rounded-md leading-tight focus:outline-none focus:border-primary-500`}
                value={selectedCountry}
                onChange={(e) => handleCountryChange(e.target.value)}
              >
                {loading ? (
                  <option value="" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">Loading...</option>
                ) : error ? (
                  <option value="" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">Error: {error}</option>
                ) : (
                  countries.map((country) => (
                    <option key={country.name} value={country.isoCode} className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                      {country.name}
                    </option>
                  ))
                )}
              </select>
              {countryError && (
                <p className="text-red-500 text-sm mt-1">{countryError.message}</p>
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

          <div className="self-end w-full relative">
            <Label htmlFor="state" className="text-gray-700 dark:text-gray-300">State <span className="text-destructive">*</span></Label>
            <div className="inline-block relative w-full">
              <select
                {...register("state")}
                className={`block appearance-none w-full border ${stateError ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  } bg-white dark:bg-gray-900 text-gray-900 dark:text-white py-2 px-3 md:h-12.1 md:px-3 md:py-4 rounded-md leading-tight focus:outline-none focus:border-primary-500`}
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
              >
                {loading ? (
                  <option value="" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">Loading...</option>
                ) : error ? (
                  <option value="" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">Error: {error}</option>
                ) : (
                  states?.map((state) => (
                    <option key={state.isoCode} value={state.isoCode} className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                      {state.name}
                    </option>
                  ))
                )}
              </select>
              {stateError && (
                <p className="text-red-500 text-sm mt-1">{stateError.message}</p>
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

        <div className="items-center justify-center gap-4">
          {/* Commented city input */}

          <div className="self-end w-full relative mb-3">
            <Label htmlFor="city" className="text-gray-700 dark:text-gray-300">City <span className="text-destructive">*</span></Label>
            <div className="inline-block relative w-full">
              <select
                {...register("city")}
                className={`block appearance-none w-full border ${stateError ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  } bg-white dark:bg-gray-900 text-gray-900 dark:text-white py-2 px-3 md:h-12.1 md:px-3 md:py-4 rounded-md leading-tight focus:outline-none focus:border-primary-500`}
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                {loading ? (
                  <option value="" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">Loading...</option>
                ) : error ? (
                  <option value="" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">Error: {error}</option>
                ) : (
                  cities?.map((city) => (
                    <option key={city.name} value={city.name} className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                      {city.name}
                    </option>
                  ))
                )}
              </select>
              {cityError && (
                <p className="text-red-500 text-sm mt-1">{cityError.message}</p>
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

          <div className="w-full mb-3">
            <Label htmlFor="landmark">Landmark <span className="text-destructive">*</span></Label>
            <Input
              variant={landmarkError && "error"}
              id="landmark"
              {...register("landmark")}
              type="text"
              size={"md"}
            />
            {landmarkError && (
              <p className="text-red-500 text-sm mt-1">{landmarkError.message}</p>
            )}
          </div>

          <div className="items-center gap-2">
            <Label htmlFor="zip_code">Zip Code <span className="text-destructive">*</span></Label>
            <Input
              size={"md"}
              id="zip_code"
              type="text"
              maxLength={6}
              variant={zipCodeError && "error"}
              {...register("zip_code")}
            />
            {zipCodeError && (
              <p className="text-red-500 text-sm mt-1">{zipCodeError.message}</p>
            )}
          </div>
          <div className="self-end flex w-full justify-between mt-4">
            <Button
              className="w-[200px]"
              onClick={() => handlePrevious(property_id)}
              variant={"secondary"}
              type="button"
            >
              Back
            </Button>

            <Button className="w-[200px]" type="submit">
              Next
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}