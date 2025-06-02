import React, { useEffect } from 'react';
import { Calendar } from './Calender';
import { Popover, PopoverTrigger } from './Popover';
import { format } from '../utils/dateUtils';
import { DateRange, RatePlanInterFace } from '../types';

interface FiltersProps {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  selectedRoomType: string;
  setSelectedRoomType: (roomType: string) => void;
  selectedRatePlan: string;
  setSelectedRatePlan: (ratePlan: string) => void;
  data: RatePlanInterFace[];
  roomTypes:any[]
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
  // Extract unique room types (invTypeCode) from the data
useEffect(()=>{
  console.log(roomTypes)
},[roomTypes])
  // For rate plans, since there's no direct ratePlanCode, we might need to use _id or another identifier
  // Assuming we use _id as the rate plan identifier, or you might want to add a ratePlanCode field
  // const ratePlans = Array.from(new Set(data.map(item => item._id)));

  return (
    <div className="bg-white rounded-lg pt-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Rate Plan Allotment</h1>
        <button
          onClick={onResetFilters}
          className="px-4 py-2 text-gray-600 hover:text-gray-900 border rounded-lg hover:bg-gray-50"
        >
          Reset Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
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
              <div className="w-full px-3 py-2 border rounded-lg cursor-pointer hover:border-gray-400">
                {dateRange?.from ? (
                  dateRange.to ? (
                    `${format(dateRange.from, 'PPP')} - ${format(dateRange.to, 'PPP')}`
                  ) : (
                    format(dateRange.from, 'PPP')
                  )
                ) : (
                  'Select date range'
                )}
              </div>
            </PopoverTrigger>
          </Popover>
        </div>

        {/* Room Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Room Type
          </label>
          <select
            value={selectedRoomType}
            onChange={(e) => {
              setSelectedRoomType(e.target.value);
              e.currentTarget.blur(); // Force blur to fix focus bug
            }}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Room Types</option>
            {roomTypes.map((type:string,index:number) => (
              <option key={index} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Rate Plan Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rate Plan
          </label>
          <select
            value={selectedRatePlan}
            onChange={(e) => {
              setSelectedRatePlan(e.target.value);
              e.currentTarget.blur(); // Force blur to fix focus bug
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Rate Plans</option>
            {/* {ratePlans.map(plan => (
              <option key={plan} value={plan}>{plan}</option>
            ))} */}
          </select>
        </div>
      </div>
    </div>
  );
};