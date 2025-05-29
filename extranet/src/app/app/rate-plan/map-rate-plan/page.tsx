'use client';

import React, { useState, useEffect } from 'react';
import { Filters } from './components/Filters';
import { RatePlanTable } from './components/RatePlanTable';
import { SaveButton } from './components/SaveButton';
import { filterData, updatePrice, updateAvailability, saveData } from './services/dataService';
import { MapRatePlanData, DateRange } from './types';
import mapRatePlanData from './dummy/mapRatePlanData.json';
import toast, { Toaster } from 'react-hot-toast';

const MapRatePlanPage: React.FC = () => {
  const [data, setData] = useState<MapRatePlanData[]>(mapRatePlanData.mapRatePlanData);
  const [filteredData, setFilteredData] = useState<MapRatePlanData[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedRoomType, setSelectedRoomType] = useState<string>('');
  const [selectedRatePlan, setSelectedRatePlan] = useState<string>('');
  const [editingRows, setEditingRows] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setFilteredData(filterData(data, dateRange, selectedRoomType, selectedRatePlan));
  }, [dateRange, selectedRoomType, selectedRatePlan, data]);

  const handlePriceChange = (index: number, newPrice: number) => {
    setData(updatePrice(data, filteredData, index, newPrice));
  };

  const handleAvailabilityChange = (index: number, newAvailability: number) => {
    setData(updateAvailability(data, filteredData, index, newAvailability));
  };

  const handleSave = async () => {
    setIsLoading(true);
    await saveData(data);
    setEditingRows(new Set());
    toast.success('Data saved successfully!');
    setIsLoading(false);
  };

  const resetFilters = () => {
    setDateRange(undefined);
    setSelectedRoomType('');
    setSelectedRatePlan('');
  };

  const toggleEditRow = (index: number) => {
    const newEditingRows = new Set(editingRows);
    if (newEditingRows.has(index)) {
      newEditingRows.delete(index);
    } else {
      newEditingRows.add(index);
    }
    setEditingRows(newEditingRows);
  };

  return (
    <div className="px-10 min-h-screen" style={{ height: 'calc(100vh - 100px)' }}>
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">
        <Filters
          dateRange={dateRange}
          setDateRange={setDateRange}
          selectedRoomType={selectedRoomType}
          setSelectedRoomType={setSelectedRoomType}
          selectedRatePlan={selectedRatePlan}
          setSelectedRatePlan={setSelectedRatePlan}
          data={data}
          onResetFilters={resetFilters}
        />
        <div className="flex justify-end mt-4">
          <SaveButton
            isLoading={isLoading}
            editingRows={editingRows}
            handleSave={handleSave}
          />
        </div>
        <RatePlanTable
          filteredData={filteredData}
          editingRows={editingRows}
          handlePriceChange={handlePriceChange}
          handleAvailabilityChange={handleAvailabilityChange}
          toggleEditRow={toggleEditRow}
        />
      </div>
    </div>
  );
};

export default MapRatePlanPage;