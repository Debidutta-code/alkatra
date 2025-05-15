"use client";

import React, { useEffect, useState } from "react";
import { PlaneTakeoff, PlaneLanding, ArrowLeftRight, Users, Search, Loader2 } from "lucide-react";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import Select from "react-select";
import Traveler, { Child } from "@/components/ui/flight-ui/travelerUi";
import { DateRangePicker, DatePicker } from "rsuite";
import "rsuite/dist/rsuite.min.css";
import format from "date-fns/format";
import axios, { isAxiosError } from "axios";
import { useFlightOffersStore } from "../context/flight-offers-provider";
import { useDebounce } from "@/hooks/useDebounce";
import { addDays } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/flight-ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/flight-ui/popover";
import Checkbox from "@/components/Search/Checkbox";
import { useRouter } from "next/navigation";

const SearchForm: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [flightState, setFlightState] = useState({
    isFromOpen: false,
    isToOpen: false,
  });

  const [isRotated, setIsRotated] = useState(false);

  const { setFlightOffers, searchForm, updateSearchFormField } = useFlightOffersStore((state) => state);

  const [searchTerm, setSearchTerm] = useState("");
  const [departureLocations, setDepartureLocations] = useState([]);
  const [destinationLocations, setDestinationLocations] = useState([]);
  const debouncedSearchTerm = useDebounce(searchTerm);

  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState<Child[]>([]);
  const [openTraveler, setOpenTraveler] = useState<boolean>(false);

  const handleDepartureSearchChange = async (value: string) => {
    if (!value) {
      setDepartureLocations([]);
      return;
    }
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL_AIRLINE}/locations?keyword=${value}`);
      const locations = response.data?.data?.data
        .filter((el: any) => el.subType === "CITY")
        .map((el: any) => ({
          label: el.address.cityName + ` (${el.iataCode})`,
          value: el.iataCode,
        }));
      setDepartureLocations(locations);
    } catch (error) {
      console.error("Error fetching departure locations:", error);
      setDepartureLocations([]);
    }
  };

  const handleDestinationSearchChange = async (value: string) => {
    if (!value) {
      setDestinationLocations([]);
      return;
    }
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL_AIRLINE}/locations?keyword=${value}`);
      const locations = response.data?.data?.data
        .filter((el: any) => el.subType === "CITY")
        .map((el: any) => ({
          label: el.address.cityName + ` (${el.iataCode})`,
          value: el.iataCode,
        }));
      setDestinationLocations(locations);
    } catch (error) {
      console.error("Error fetching destination locations:", error);
      setDestinationLocations([]);
    }
  };

  useEffect(() => {
    handleDepartureSearchChange(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    handleDestinationSearchChange(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!searchForm.origin?.value || !searchForm.destination?.value || !searchForm.departureDate) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const searchParams = {
        originLocationCode: searchForm.origin.value,
        destinationLocationCode: searchForm.destination.value,
        departureDate: searchForm.departureDate,
        adults: searchForm.adult || adults,
        children: searchForm.child || children.length,
        returnDate: searchForm.tripType === "ROUNDTRIP" ? searchForm.returnDate : undefined,
        travelClass: searchForm.travelClass || "ECONOMY",
        nonStop: searchForm.directFlight || false,
        includedAirlineCodes: searchForm.includedAirlines?.length ? searchForm.includedAirlines.join(",") : undefined
      };

      // Remove undefined values from searchParams
      const cleanedParams = Object.fromEntries(
        Object.entries(searchParams).filter(([_, value]) => value !== undefined)
      );

      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL_AIRLINE}/flights/flight-offers`, {
        params: cleanedParams
      });

      if (!response.data || !response.data.data) {
        throw new Error("Invalid response structure");
      }

      // Store the search parameters and results in localStorage
      localStorage.setItem('flightSearchParams', JSON.stringify(cleanedParams));
      localStorage.setItem('flightOffers', JSON.stringify(response.data));

      setFlightOffers(response.data);

      // Convert search params to URL query string
      const queryString = new URLSearchParams(cleanedParams as any).toString();
      router.push(`/flight?${queryString}`);

    } catch (error) {
      console.error("Search Error:", error);
      if (isAxiosError(error)) {
        setError(error.response?.data?.message || "Failed to search flights");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isRotated) {
      const tempOrigin = { ...searchForm.origin };
      const tempDestination = { ...searchForm.destination };

      updateSearchFormField("origin", tempDestination);
      updateSearchFormField("destination", tempOrigin);
    }
  }, [isRotated]);

  const customSelectStyles = {
    control: (provided: any) => ({
      ...provided,
      border: '1px solid #e2e8f0',
      borderRadius: '0.5rem',
      minHeight: '2.5rem',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#94a3b8',
      },
    }),
    menu: (provided: any) => ({
      ...provided,
      borderRadius: '0.5rem',
      overflow: 'hidden',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#e2e8f0' : 'white',
      color: state.isSelected ? 'white' : '#1e293b',
      cursor: 'pointer',
    }),
  };

  useEffect(() => {
    // Update the store with travelers count
    updateSearchFormField("adult", adults);
    updateSearchFormField("child", children.length);
  }, [adults, children]);

  return (
    <div className="container mx-auto px-4 py-4 ">
      <Card className="w-full max-w-6xl mx-auto">
        <Checkbox />
        <CardContent className="p-6">
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4">
              <div className="md:col-span-4 space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                  <PlaneTakeoff size={16} />
                  <span>From</span>
                </div>
                <Select
                  className="w-full"
                  onInputChange={(value, { action }) => {
                    if (action === "input-change") {
                      setSearchTerm(value);
                    }
                  }}
                  onChange={(value) => updateSearchFormField("origin", value!)}
                  options={departureLocations}
                  placeholder="Enter city or airport"
                  styles={customSelectStyles}
                  value={searchForm.origin}
                />
              </div>

              <div className="md:col-span-1 flex items-center justify-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-blue-50"
                  onClick={() => setIsRotated(!isRotated)}
                >
                  <ArrowLeftRight
                    className={`transform transition-transform duration-300 ${isRotated ? "rotate-180" : ""
                      }`}
                    size={20}
                  />
                </Button>
              </div>

              <div className="md:col-span-4 space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                  <PlaneLanding size={16} />
                  <span>To</span>
                </div>
                <Select
                  className="w-full"
                  onInputChange={(value, { action }) => {
                    if (action === "input-change") {
                      setSearchTerm(value);
                    }
                  }}
                  onChange={(value) => updateSearchFormField("destination", value!)}
                  options={destinationLocations}
                  placeholder="Enter city or airport"
                  styles={customSelectStyles}
                  value={searchForm.destination}
                />
              </div>

              <div className="md:col-span-3 space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                  <span>Date</span>
                </div>
                {searchForm.tripType === "ROUNDTRIP" ? (
                  <DateRangePicker
                    className="w-full"
                    editable={false}
                    placeholder="Select dates"
                    value={[
                      searchForm.departureDate ? new Date(searchForm.departureDate) : new Date(),
                      searchForm.returnDate ? new Date(searchForm.returnDate) : new Date()
                    ]}
                    onChange={(value) => {
                      if (value && value[0] && value[1]) {
                        updateSearchFormField(
                          "departureDate",
                          format(value[0], "yyyy-MM-dd")
                        );
                        updateSearchFormField(
                          "returnDate",
                          format(value[1], "yyyy-MM-dd")
                        );
                      }
                    }}
                  />
                ) : (
                  <DatePicker
                    placeholder="Select date"
                    value={searchForm.departureDate ? new Date(searchForm.departureDate) : null}
                    onChange={(value) =>
                      updateSearchFormField(
                        "departureDate",
                        value ? format(value, "yyyy-MM-dd") : ""
                      )
                    }
                    className="w-full"
                  />
                )}
              </div>
            </div>

            <div className="w-full flex flex-wrap gap-4 items-center justify-between pt-4">
              <Popover open={openTraveler} onOpenChange={setOpenTraveler}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full md:w-auto flex items-center space-x-2"
                  >
                    <Users size={18} />
                    <span>
                      {adults} Adult{adults > 1 && "s"}, {children.length} Child
                      {children.length !== 1 && "ren"}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <Traveler
                    adults={adults}
                    setAdults={setAdults}
                    child={children}
                    setChildren={setChildren}
                    onDone={() => setOpenTraveler(false)}
                  />
                </PopoverContent>
              </Popover>

              <Button
                type="submit"
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                {loading ? "Searching..." : "Search Flights"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};

export default SearchForm;