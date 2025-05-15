"use client";

import React from "react";
import { useFlightOffersStore } from "../context/flight-offers-provider";

export type CabinClass = {
  name: string;
  value: string;
};

const Checkbox = () => {
  const { updateSearchFormField, searchForm } = useFlightOffersStore((state) => state);

  // Create the array of cabin classes
  const cabinClasses: CabinClass[] = [
    { name: "Economy", value: "ECONOMY" },
    { name: "Premium Economy", value: "PREMIUM_ECONOMY" },
    { name: "Business", value: "BUSINESS" },
    { name: "First Class", value: "FIRST" },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto p-4 bg-white rounded-lg">
      <h2 className="text-xl font-bold text-center text-gray-800 mb-4">
        Compare and Book Flights with Ease
      </h2>

      <div className="flex flex-wrap items-center gap-4 md:gap-16">
        {/* Trip Type Options */}
        <div className="flex flex-col gap-2 md:flex-row md:gap-12 justify-center">
          {["ROUNDTRIP", "ONEWAY"].map((type) => (
            <div key={type} className="flex items-center">
              <input
                type="radio"
                name="tripType"
                id={type.toLowerCase()}
                value={type}
                checked={searchForm.tripType === type}
                className="scale-125 mr-2"
                onChange={(e) => updateSearchFormField("tripType", e.target.value)}
              />
              <label htmlFor={type.toLowerCase()} className="mt-2 text-gray-800">
                {type === "ROUNDTRIP" ? "Round Trip" : "One Way"}
              </label>
            </div>
          ))}
        </div>

        {/* Cabin Class Selector */}
        <div className="w-full md:w-auto flex items-center border rounded-lg p-2 shadow-sm hover:shadow-md transition-all">
          <select
            name="cabinClass"
            defaultValue={cabinClasses[0].value}
            className="p-2 bg-transparent focus:outline-none"
            onChange={(e) => updateSearchFormField("travelClass", e.target.value)}
          >
            {cabinClasses.map((el) => (
              <option value={el.value} key={el.value}>
                {el.name}
              </option>
            ))}
          </select>
        </div>

        {/* Direct Flight Checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="directFlight"
            id="direct-flight"
            className="scale-125 mr-2"
            checked={searchForm.directFlight}
            onChange={(e) => updateSearchFormField("directFlight", e.target.checked)}
          />
          <label htmlFor="direct-flight" className="mt-2 text-gray-800">
            Direct Flight
          </label>
        </div>
      </div>
    </div>
  );
};

export default Checkbox;
