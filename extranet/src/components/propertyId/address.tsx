import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Save, ChevronDown, Plus, PenTool } from "lucide-react";
import {
  Country,
  State,
  City,
  ICountry,
  IState,
  ICity,
} from "country-state-city";
import toast from "react-hot-toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";

// Define the address data interface
interface AddressData {
  address_line_1: string;
  address_line_2: string;
  landmark: string;
  city: string;
  state: string;
  country: string;
  zip_code: string;
}

// Define the component props with more specific event handler types
interface AddressProps {
  address: AddressData | null;
  editedAddress: AddressData | null;
  editAddressMode: boolean;
  handleAddressInputChange: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  handleAddressSaveClick: () => Promise<void>;
  handleAddressEditClick: () => void;
  handleAddressAddClick: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}
export function Address({
  address,
  editedAddress,
  editAddressMode,
  handleAddressInputChange,
  handleAddressSaveClick,
  handleAddressEditClick,
  handleAddressAddClick,
}: AddressProps) {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  const [countries, setCountries] = useState<ICountry[]>([]);
  const [states, setStates] = useState<IState[]>([]);
  const [cities, setCities] = useState<ICity[]>([]);

  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedCountryName, setSelectedCountryName] = useState<string>("");
  const [selectedStateName, setSelectedStateName] = useState<string>("");

  useEffect(() => {
    const fetchedCountries = Country.getAllCountries();
    setCountries(fetchedCountries);
  }, []);
  // console.log("countries", countries);
  useEffect(() => {
    if (selectedCountry) {
      // console.log("selected ", selectedCountry);
      const fetchedStates = State.getStatesOfCountry(selectedCountry);
      setStates(fetchedStates);
      // Reset state and city when country changes
      // setSelectedState("");
      // setSelectedCity("");
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedState && selectedCountry) {
      const fetchedCities = City.getCitiesOfState(
        selectedCountry,
        selectedState
      );
      setCities(fetchedCities);
      // Reset city when state changes
      // setSelectedCity("");
    }
  }, [selectedState, selectedCountry]);
  // console.log("country", address);

  useEffect(() => {
    if (editAddressMode && address) {
      setSelectedCountry(address.country);
      setSelectedState(address.state);
      setSelectedCity(address.city);
    }
  }, [editAddressMode, address]);

  // Validation function
  const validateField = (name: string, value: any): string | null => {
    const stringValue = String(value || ""); // Ensure value is a string

    switch (name) {
      case "address_line_1":
        return !stringValue.trim() ? "Address Line 1 is required" : null;
      case "address_line_2":
        return !stringValue.trim() ? "Address Line 2 is required" : null;
      case "landmark":
        return !stringValue.trim() ? "Landmark is required" : null;
      case "city":
        return !stringValue.trim() ? "City is required" : null;
      case "state":
        return !stringValue.trim() ? "State is required" : null;
      case "country":
        return !stringValue.trim() ? "Country is required" : null;
      case "zip_code":
        return !stringValue.trim()
          ? "Zip Code is required"
          : !/^\d{6}$/.test(stringValue)
          ? "Zip Code must be 6 digits"
          : null;
      default:
        return null;
    }
  };
  // console.log("address", address);

  // Validate all fields
  const validateAllFields = () => {
    const errors: { [key: string]: string } = {};

    // Mandatory fields to check
    const mandatoryFields = [
      "address_line_1",
      "address_line_2",
      "landmark",
      "city",
      "state",
      "country",
      "zip_code",
    ];

    mandatoryFields.forEach((field) => {
      const value = editedAddress?.[field as keyof AddressData] || "";
      const error = validateField(field, value);
      if (error) errors[field] = error;
    });

    // Special validation for dropdowns
    if (!selectedCountry) errors["country"] = "Country is required";
    if (!selectedState) errors["state"] = "State is required";
    if (!selectedCity) errors["city"] = "City is required";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Modify existing input change handler to include validation
  const handleValidatedInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;

    // Clear previous error for this field
    const newErrors = { ...validationErrors };
    delete newErrors[name];
    setValidationErrors(newErrors);

    // Call original input change handler
    handleAddressInputChange(event);
  };

  const handleSelectChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
    fieldName: string
  ) => {
    const syntheticEvent = {
      target: {
        name: fieldName,
        value: event.target.value,
      },
    } as React.ChangeEvent<HTMLInputElement>;

    handleAddressInputChange(syntheticEvent);
  };

  const handleCountryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const countryCode = event.target.value;
    setSelectedCountry(countryCode);
    setSelectedState("");
    setSelectedCity("");

    // 🔍 Store country name based on isoCode
    const selected = countries.find((c) => c.isoCode === countryCode);
    setSelectedCountryName(selected?.name || "");

    // Clear validation errors
    const newErrors = { ...validationErrors };
    delete newErrors["country"];
    delete newErrors["state"];
    delete newErrors["city"];
    setValidationErrors(newErrors);

    handleSelectChange(event, "country");
  };

  const handleStateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const stateCode = event.target.value;
    setSelectedState(stateCode);
    setSelectedCity("");

    // 🔍 Store state name based on isoCode
    const selected = states.find((s) => s.isoCode === stateCode);
    setSelectedStateName(selected?.name || "");

    // Clear state-related validation errors
    const newErrors = { ...validationErrors };
    delete newErrors["state"];
    delete newErrors["city"];
    setValidationErrors(newErrors);

    handleSelectChange(event, "state");
  };

  const handleCityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const cityName = event.target.value;
    setSelectedCity(cityName);

    // Clear city error
    const newErrors = { ...validationErrors };
    delete newErrors["city"];
    setValidationErrors(newErrors);

    handleSelectChange(event, "city");
  };

  // Modify save click to validate before saving
  const handleSaveWithValidation = async () => {
    if (validateAllFields()) {
      try {
        await handleAddressSaveClick();
        toast.success("Address updated successfully");
      } catch (error) {
        toast.error("Failed to update address");
      }
    }
  };

  // Modify add click to validate before adding
  const handleAddWithValidation = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    if (validateAllFields()) {
      try {
        await handleAddressAddClick(e);
        setShowModal(false);
        toast.success("Address added successfully");
      } catch (error) {
        toast.error("Failed to add address");
      }
    }
  };

  // Custom select dropdown component
  const SelectDropdown = ({
    name,
    value,
    onChange,
    options,
    placeholder,
    error,
  }: {
    name: string;
    value: string;
    onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { value: string; label: string }[];
    placeholder: string;
    error?: string;
  }) => {
    return (
      <div className="relative w-full">
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={`block appearance-none w-full border ${
            error ? "border-destructive" : "border-input"
          } bg-background py-2 px-3 pr-8 rounded-md leading-tight focus:outline-none focus:ring-2 ${
            error ? "focus:ring-destructive" : "focus:ring-primary"
          }`}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-muted-foreground">
          <ChevronDown className="h-4 w-4" />
        </div>
        {error && <p className="text-destructive text-sm mt-1">{error}</p>}
      </div>
    );
  };

  // Render edit form with validation
  const renderEditForm = () => (
    <div className="pt-4 space-y-6">
      <div className="grid grid-cols-[120px_1fr] items-center">
        <label className="text-sm text-gray-500">
          Address Line 1 <span className="text-destructive">*</span>
        </label>
        <div>
          <Input
            name="address_line_1"
            value={editedAddress?.address_line_1 || ""}
            onChange={handleValidatedInputChange}
            placeholder="Address Line 1"
            className={`w-full ${
              validationErrors.address_line_1 ? "border-destructive" : ""
            }`}
          />
          {validationErrors.address_line_1 && (
            <p className="text-destructive text-sm mt-1">
              {validationErrors.address_line_1}
            </p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-[120px_1fr] items-center">
        <label className="text-sm text-gray-500">
          Address Line 2 <span className="text-destructive">*</span>
        </label>
        <div>
          <Input
            name="address_line_2"
            value={editedAddress?.address_line_2 || ""}
            onChange={handleValidatedInputChange}
            placeholder="Address Line 2"
            className={`w-full ${
              validationErrors.address_line_2 ? "border-destructive" : ""
            }`}
          />
          {validationErrors.address_line_2 && (
            <p className="text-destructive text-sm mt-1">
              {validationErrors.address_line_2}
            </p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-[120px_1fr] items-center">
        <label className="text-sm text-gray-500">
          Landmark <span className="text-destructive">*</span>
        </label>
        <div>
          <Input
            name="landmark"
            value={editedAddress?.landmark || ""}
            onChange={handleValidatedInputChange}
            placeholder="Landmark"
            className={`w-full ${
              validationErrors.landmark ? "border-destructive" : ""
            }`}
          />
          {validationErrors.landmark && (
            <p className="text-destructive text-sm mt-1">
              {validationErrors.landmark}
            </p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-[120px_1fr] items-center">
        <label className="text-sm text-gray-500">
          Country <span className="text-destructive">*</span>
        </label>
        <SelectDropdown
          name="country"
          value={selectedCountry}
          onChange={handleCountryChange}
          options={countries.map((country) => ({
            value: country.isoCode,
            label: country.name,
          }))}
          placeholder="Select Country"
          error={validationErrors.country}
        />
      </div>
      <div className="grid grid-cols-[120px_1fr] items-center">
        <label className="text-sm text-gray-500">
          State <span className="text-destructive">*</span>
        </label>
        <SelectDropdown
          name="state"
          value={selectedState}
          onChange={handleStateChange}
          options={states.map((state) => ({
            value: state.isoCode,
            label: state.name,
          }))}
          placeholder="Select State"
          error={validationErrors.state}
        />
      </div>
      <div className="grid grid-cols-[120px_1fr] items-center">
        <label className="text-sm text-gray-500">
          City <span className="text-destructive">*</span>
        </label>
        <SelectDropdown
          name="city"
          value={selectedCity}
          onChange={handleCityChange}
          options={cities.map((city) => ({
            value: city.name,
            label: city.name,
          }))}
          placeholder="Select City"
          error={validationErrors.city}
        />
      </div>
      <div className="grid grid-cols-[120px_1fr] items-center">
        <label className="text-sm text-gray-500">
          Zip Code <span className="text-destructive">*</span>
        </label>
        <div>
          <Input
            name="zip_code"
            value={editedAddress?.zip_code || ""}
            maxLength={6}
            onChange={(e) => {
              const digitsOnly = e.target.value.replace(/\D/g, "");
              const syntheticEvent = {
                target: {
                  name: "zip_code",
                  value: digitsOnly,
                },
              } as React.ChangeEvent<HTMLInputElement>;
              handleValidatedInputChange(syntheticEvent);
            }}
            onInput={(e) => {
              const target = e.target as HTMLInputElement;
              target.value = target.value.replace(/\D/g, "");
            }}
            placeholder="Zip Code"
            className={`w-full ${
              validationErrors.zip_code ? "border-destructive" : ""
            }`}
          />
          {validationErrors.zip_code && (
            <p className="text-destructive text-sm mt-1">
              {validationErrors.zip_code}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  // Render address form for modal
  const renderAddressFormDialog = () => (
    <div className="lg:max-h-[90vh] max-h-[70vh] overflow-y-auto px-4 space-y-2 w-full">
      <div className="grid mt-3 grid-cols-1">
        <label className="mb-1  text-sm text-muted-foreground">
          Address Line 1 <span className="text-destructive">*</span>
        </label>
        <div>
          <Input
            name="address_line_1"
            value={editedAddress?.address_line_1 || ""}
            onChange={handleValidatedInputChange}
            placeholder="Address Line 1"
            className={`w-full ${
              validationErrors.address_line_1 ? "border-destructive" : ""
            }`}
          />
          {validationErrors.address_line_1 && (
            <p className="text-destructive text-sm mt-1">
              {validationErrors.address_line_1}
            </p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1">
        <label className="mb-1 text-sm text-muted-foreground">
          Address Line 2 <span className="text-destructive">*</span>
        </label>
        <div>
          <Input
            name="address_line_2"
            value={editedAddress?.address_line_2 || ""}
            onChange={handleValidatedInputChange}
            placeholder="Address Line 2"
            className={`w-full ${
              validationErrors.address_line_2 ? "border-destructive" : ""
            }`}
          />
          {validationErrors.address_line_2 && (
            <p className="text-destructive text-sm mt-1">
              {validationErrors.address_line_2}
            </p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1">
        <label className="mb-1 text-sm text-muted-foreground">
          Landmark <span className="text-destructive">*</span>
          </label>
        <Input
          name="landmark"
          value={editedAddress?.landmark || ""}
          onChange={handleValidatedInputChange}
          placeholder="Landmark"
          className="w-full"
        />
        {validationErrors.landmark && (
          <p className="text-destructive text-sm mt-1">
            {validationErrors.landmark}
          </p>
        )}
      </div>
      <div className="md:flex md:gap-3">
        <div className="grid md:w-1/2 grid-cols-1">
        <label className="mb-1 text-sm text-muted-foreground">
          Country <span className="text-destructive">*</span>
        </label>
        <SelectDropdown
          name="country"
          value={selectedCountry}
          onChange={handleCountryChange}
          options={countries.map((country) => ({
            value: country.isoCode,
            label: country.name,
          }))}
          placeholder="Select Country"
          error={validationErrors.country}
        />
      </div>
      <div className="grid md:w-1/2 grid-cols-1">
        <label className="mb-1 text-sm text-muted-foreground">
          State <span className="text-destructive">*</span>
        </label>
        <SelectDropdown
          name="state"
          value={selectedState}
          onChange={handleStateChange}
          options={states.map((state) => ({
            value: state.isoCode,
            label: state.name,
          }))}
          placeholder="Select State"
          error={validationErrors.state}
        />
      </div>
      </div>
      <div className="md:flex md:gap-3">
        <div className="grid md:w-1/2 grid-cols-1">
        <label className="mb-1  text-sm text-muted-foreground">
          City <span className="text-destructive">*</span>
        </label>
        <SelectDropdown
          name="city"
          value={selectedCity}
          onChange={handleCityChange}
          options={cities.map((city) => ({
            value: city.name,
            label: city.name,
          }))}
          placeholder="Select City"
          error={validationErrors.city}
        />
      </div>
      <div className="grid grid-cols-1">
        <label className="mb-1 text-sm text-muted-foreground">
          Zip Code <span className="text-destructive">*</span>
        </label>
        <div>
          <Input
            name="zip_code"
            value={editedAddress?.zip_code || ""}
            maxLength={6}
            onChange={handleValidatedInputChange}
            placeholder="Zip Code"
            className={`w-full ${
              validationErrors.zip_code ? "border-destructive" : ""
            }`}
          />
          {validationErrors.zip_code && (
            <p className="text-destructive text-sm mt-1">
              {validationErrors.zip_code}
            </p>
          )}
        </div>
      </div>
      </div>
    </div>
  );

  return (
    <Card className="w-full shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between border-b pb-3">
        <CardTitle className="text-primary font-semibold">
          Address Details
        </CardTitle>
        <div className="flex gap-2">
          {editAddressMode && (
            <Button
              variant="outline"
              size="sm"
              className="mt-2 md:mt-0"
              onClick={handleAddressEditClick}
            >
              Cancel
            </Button>
          )}
          {address ? (
            <Button
              variant="outline"
              size="sm"
              onClick={
                editAddressMode
                  ? handleSaveWithValidation
                  : handleAddressEditClick
              }
            >
              {editAddressMode ? (
                <Save className="mr-2 h-4 w-4" />
              ) : (
                <PenTool className="mr-2 h-4 w-4" />
              )}
              {editAddressMode ? "Update" : "Edit"}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowModal(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Address
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent
            className="sm:max-w-md"
            onInteractOutside={(e) => e.preventDefault()}
            onPointerDownOutside={(e) => e.preventDefault()}
          >
            <form onSubmit={handleAddWithValidation}>
              <DialogHeader>
                <DialogTitle>Add Address</DialogTitle>
              </DialogHeader>
              <div className="w-full">
                {renderAddressFormDialog()}
                <DialogFooter className="mt-6">
                  <Button
                    type="button"
                    className="mt-2 md:mt-0"
                    onClick={() => setShowModal(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Add Address</Button>
                </DialogFooter>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {editAddressMode ? (
          renderEditForm()
        ) : (
          <div className="space-y-0">
            {address ? (
              <div className="">
                <div className="py-2 flex flex-col sm:flex-row sm:items-start">
                  <div className="w-full sm:w-1/4 text-sm text-gray-500 sm:pr-2">
                    Address Line 1
                  </div>
                  <div className="w-full sm:w-3/4 text-sm font-medium break-words sm:pl-2">
                    {address.address_line_1 ||  "N/A"}
                  </div>
                </div>
                <div className="py-2 flex flex-col sm:flex-row sm:items-start">
                  <div className="w-full sm:w-1/4 text-sm text-gray-500 sm:pr-2">
                    Address Line 2
                  </div>
                  <div className="w-full sm:w-3/4 text-sm font-medium break-words sm:pl-2">
                    {address.address_line_2 || "N/A"}
                  </div>
                </div>
                <div className="py-2 flex flex-col sm:flex-row sm:items-start">
                  <div className="w-full sm:w-1/4 text-sm text-gray-500 sm:pr-2">
                    Landmark
                  </div>
                  <div className="w-full sm:w-3/4 text-sm font-medium break-words sm:pl-2">
                    {address.landmark || "N/A"}
                  </div>
                </div>
                <div className="py-2 flex flex-col sm:flex-row sm:items-start">
                  <div className="w-full sm:w-1/4 text-sm text-gray-500 sm:pr-2">
                    City
                  </div>
                  <div className="w-full sm:w-3/4 text-sm font-medium break-words sm:pl-2">
                    {address.city || "N/A"}
                  </div>
                </div>
                <div className="py-2 flex flex-col sm:flex-row sm:items-start">
                  <div className="w-full sm:w-1/4 text-sm text-gray-500 sm:pr-2">
                    State
                  </div>
                  <div className="w-full sm:w-3/4 text-sm font-medium break-words sm:pl-2">
                    {states.find((s) => s.isoCode === address.state)?.name ||
                      address.state ||
                      "N/A"}
                  </div>
                </div>
                <div className="py-2 flex flex-col sm:flex-row sm:items-start">
                  <div className="w-full sm:w-1/4 text-sm text-gray-500 sm:pr-2">
                    Country
                  </div>
                  <div className="w-full sm:w-3/4 text-sm font-medium break-words sm:pl-2">
                    {countries.find((c) => c.isoCode === address.country)
                      ?.name || "N/A"}
                  </div>
                </div>
                <div className="py-2 flex flex-col sm:flex-row sm:items-start">
                  <div className="w-full sm:w-1/4 text-sm text-gray-500 sm:pr-2">
                    Zip Code
                  </div>
                  <div className="w-full sm:w-3/4 text-sm font-medium break-words sm:pl-2">
                    {address.zip_code || "N/A"}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-muted/50 rounded-lg p-6 text-center">
                <p className="text-muted-foreground">
                  No address details found
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
