"use client";

import React, { useEffect } from 'react';
import { Calendar } from './Calender';
import { Popover, PopoverTrigger } from './Popover';
import { format } from '../utils/dateUtils';
import { DateRange, RatePlanInterFace } from '../types';
import { useRouter } from 'next/navigation';
import { Button } from '@src/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface FiltersProps {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  selectedRoomType: string;
  setSelectedRoomType: (roomType: string) => void;
  selectedRatePlan: string;
  setSelectedRatePlan: (ratePlan: string) => void;
  data: RatePlanInterFace[];
  roomTypes: any[];
  onResetFilters: () => void;
}

export const Filters: React.FC<FiltersProps> = ({
  dateRange,
  setDateRange,
  selectedRoomType,
  setSelectedRoomType,
  selectedRatePlan,
  setSelectedRatePlan,
  data,
  roomTypes,
  onResetFilters,
}) => {
  // Helper function to get unique rate plans based on selected room type
  const getUniqueRatePlans = (roomTypes: any[], selectedRoomType: string) => {
    if (!roomTypes || roomTypes.length === 0) return [];
    
    if (selectedRoomType) {
      // If a room type is selected, show only its rate plans
      const selectedRoom = roomTypes.find(room => room.invTypeCode === selectedRoomType);
      return selectedRoom ? selectedRoom.ratePlanCodes : [];
    } else {
      // If no room type selected, show all unique rate plans
      const allRatePlans = roomTypes.flatMap(room => room.ratePlanCodes);
      return [...new Set(allRatePlans)]; // Remove duplicates
    }
  };

  const ratePlans = getUniqueRatePlans(roomTypes, selectedRoomType);

  useEffect(() => {
    console.log(roomTypes);
  }, [roomTypes]);

  // Reset rate plan when room type changes
  useEffect(() => {
    if (selectedRoomType) {
      setSelectedRatePlan('');
    }
  }, [selectedRoomType, setSelectedRatePlan]);

  const router = useRouter();
  
  return (
    <div className="bg-tripswift-off-white rounded-lg p-4 sm:px-6">
      {/* Title and Reset */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-2 mb-4">
        <div className="flex flex-wrap w-full items-center justify-between gap-2">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="px-3 py-2 text-gray-600 hover:text-tripswift-black border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-tripswift-medium"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="text-xl sm:text-2xl font-tripswift-bold text-tripswift-black">
            Rate and Inventory Allotment
          </h1>
          <button
            onClick={onResetFilters}
            className="px-3 py-2 text-gray-600 hover:text-tripswift-black border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-tripswift-medium"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-tripswift-medium text-gray-700 mb-2">
            Date Range
          </label>
          <Popover
            content={
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={(range: any) => setDateRange(range)}
              />
            }
          >
            <PopoverTrigger>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:border-tripswift-blue transition-colors duration-200 bg-white">
                {dateRange?.from ? (
                  dateRange.to ? (
                    `${format(dateRange.from, 'PPP')} - ${format(dateRange.to, 'PPP')}`
                  ) : (
                    format(dateRange.from, 'PPP')
                  )
                ) : (
                  <span className="text-gray-500">Select date range</span>
                )}
              </div>
            </PopoverTrigger>
          </Popover>
        </div>

        {/* Room Type Filter */}
        <div>
          <label className="block text-sm font-tripswift-medium text-gray-700 mb-2">
            Room Type
          </label>
          <select
            value={selectedRoomType}
            onChange={(e) => {
              setSelectedRoomType(e.target.value);
              // Rate plan will be reset automatically by useEffect
              e.currentTarget.blur();
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tripswift-blue focus:border-tripswift-blue transition-colors duration-200 bg-white"
          >
            <option value="">All Room Types</option>
            {roomTypes.map((room) => (
              <option key={room.invTypeCode} value={room.invTypeCode}>
                {room.invTypeCode}
              </option>
            ))}
          </select>
        </div>

        {/* Rate Plan Filter */}
        <div>
          <label className="block text-sm font-tripswift-medium text-gray-700 mb-2">
            Rate Plan
          </label>
          <select
            value={selectedRatePlan}
            onChange={(e) => {
              setSelectedRatePlan(e.target.value);
              e.currentTarget.blur();
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tripswift-blue focus:border-tripswift-blue transition-colors duration-200 bg-white"
            disabled={ratePlans.length === 0}
          >
            <option value="">
              {ratePlans.length === 0 ? "No Rate Plans Available" : "All Rate Plans"}
            </option>
            {ratePlans.map((plan: string, index: number) => (
              <option key={plan || `plan-${index}`} value={plan}>
                {plan}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};