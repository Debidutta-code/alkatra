"use client";
import React, { useEffect, useState } from "react";
import Loader from "@src/components/Loader";
import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";
import { addInventory } from "../services/dataServices";

export default function InventoryModal() {
  const [invTypeCode, setInvTypeCode] = useState("");
  const [hotelCode, setHotelCode] = useState("");
  const [availability, setAvailability] = useState({
    startDate: "",
    endDate: "",
    count: 0,
  });
  const [message, setMessage] = useState({
    isGood: false,
    text: "",
  });
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const PropertyCode = localStorage.getItem("propertyCode");
    if (!PropertyCode) return;
    setHotelCode(PropertyCode);
  }, []);
  const handleSave = async () => {
    try {
      setMessage({ ...message, text: "" });
      setLoading(true);
      if (
        !hotelCode ||
        !invTypeCode ||
        !availability.count ||
        !availability.startDate ||
        !availability.endDate
      ) {
        setMessage({
          ...message,
          isGood: false,
          text: "All fields are required.",
        });
        return;
      }
      const response = await addInventory(hotelCode, invTypeCode, availability);
      setInvTypeCode("");
      setAvailability({ startDate: "", endDate: "", count: 0 });
      setMessage({
        ...message,
        isGood: response?.success,
        text: response.message,
      });
    } catch (error: any) {
      setMessage({
        ...message,
        isGood: false,
        text: "Error occurred while adding availability.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto rounded-lg shadow-lg bg-white dark:bg-gray-900">
      {loading &&<div className="absolute top-0 left-0"> <Loader /></div>}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
          Add Room Inventory
        </h2>
      </div>

      <div className="space-y-4">
        {message.text && (
          <p
            className={`text-sm ${
              message.isGood
                ? "text-green-500 dark:text-green-400"
                : "text-red-500 dark:text-red-400"
            }`}
          >
            {message.text}
          </p>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Inventory Type Code
          </label>
          <Input
            className="w-full dark:bg-gray-800 dark:text-gray-100"
            type="text"
            placeholder="Inventory Type Code"
            value={invTypeCode}
            onChange={(e) => setInvTypeCode(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Start Date
            </label>
            <Input
              className="w-full dark:bg-gray-800 dark:text-gray-100"
              type="date"
              value={availability.startDate}
              onChange={(e) =>
                setAvailability((prev) => ({
                  ...prev,
                  startDate: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              End Date
            </label>
            <Input
              className="w-full dark:bg-gray-800 dark:text-gray-100"
              type="date"
              value={availability.endDate}
              onChange={(e) =>
                setAvailability((prev) => ({
                  ...prev,
                  endDate: e.target.value,
                }))
              }
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Availability Count
          </label>
          <Input
            className="w-full dark:bg-gray-800 dark:text-gray-100"
            type="number"
            placeholder="Count"
            value={availability.count}
            onChange={(e) =>
              setAvailability((prev) => ({
                ...prev,
                count: Number(e.target.value),
              }))
            }
          />
        </div>
      </div>

      <Button
        className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
        onClick={handleSave}
        disabled={loading}
      >
        {loading ? "Saving..." : "Save"}
      </Button>
    </div>
  );
}
