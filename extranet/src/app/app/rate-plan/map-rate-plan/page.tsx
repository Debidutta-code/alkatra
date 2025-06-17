'use client';

import React, { useState, useEffect } from 'react';
import { Filters } from './components/Filters';
import { RatePlanTable } from './components/RatePlanTable';
import { SaveButton } from './components/SaveButton';
import { filterData, updatePrice, updateAvailability, saveData, ratePlanServices, getAllRatePlanServices } from './services/dataService';
import { RatePlanInterFace, DateRange, paginationTypes } from './types';
import toast, { Toaster } from 'react-hot-toast';

const MapRatePlanPage: React.FC = () => {
  const [data, setData] = useState<RatePlanInterFace[]>([]);
  const [filteredData, setFilteredData] = useState<RatePlanInterFace[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedRoomType, setSelectedRoomType] = useState<string>('');
  const [selectedRatePlan, setSelectedRatePlan] = useState<string>('');
  const [editingRows, setEditingRows] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [allRoomTypes, setAllRoomTypes] = useState<any[]>([]);
  const [roomTypesLoaded, setRoomTypesLoaded] = useState<boolean>(false);
  const [paginationResults, setPaginationResults] = useState<paginationTypes>({
    currentPage: 1,
    totalPage: 10,
    totalResults: 200,
    hasNextPage: true,
    hasPreviousPage: false,
    resultsPerPage: 20
  });
  const [editButtonClicked, setEditButtonClicked] = useState<boolean>(false);
  const [modifiedValues, setModifiedValues] = useState<{[key: string]: any}>({});
  const [originalData, setOriginalData] = useState<RatePlanInterFace[]>([]);

  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const allRoomTypes = await getAllRatePlanServices();
        if (allRoomTypes?.roomTypes && allRoomTypes?.roomTypes.length > 0) {
          setAllRoomTypes(allRoomTypes?.roomTypes);
          setRoomTypesLoaded(true);
        }
      } catch (error) {
        console.error('Error fetching room types:', error);
        setRoomTypesLoaded(true);
      }
    };

    fetchRoomTypes();
  }, []);

  const fetchRatePlans = async () => {
    try {
      setIsLoading(true);
      const response = await ratePlanServices("WINCLOUD", currentPage, selectedRoomType, dateRange?.from, dateRange?.to);
      
      setData(response.data);
      setOriginalData([...response.data]);
      
      setEditingRows(new Set());
      setEditButtonClicked(false);
      setModifiedValues({});
      
    } catch (error) {
      console.error('Error fetching rate plans:', error);
      toast.error('Failed to fetch rate plans data');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (roomTypesLoaded) {
      fetchRatePlans();
    }
  }, [currentPage, dateRange, selectedRatePlan, selectedRoomType, roomTypesLoaded]);

  // Update filtered data whenever data or filters change
  useEffect(() => {
    setFilteredData(filterData(data, dateRange, selectedRoomType, selectedRatePlan, allRoomTypes));
  }, [dateRange, selectedRoomType, selectedRatePlan, data, allRoomTypes]);

  const handlePriceChange = (index: number, newPrice: number) => {
    const updatedData = [...data];
    const itemToUpdate = filteredData[index];

    // Find the item in the original data array
    const originalIndex = data.findIndex(item => item._id === itemToUpdate._id);

    if (originalIndex !== -1) {
      // Update the price (amountBeforeTax) in the rates.baseByGuestAmts
      updatedData[originalIndex] = {
        ...updatedData[originalIndex],
        rates: {
          ...updatedData[originalIndex].rates,
          baseByGuestAmts: {
            ...updatedData[originalIndex].rates.baseByGuestAmts,
            amountBeforeTax: newPrice
          }
        }
      };
      setData(updatedData);
      
      // Track modified values
      setModifiedValues(prev => ({
        ...prev,
        [`${itemToUpdate._id}_price`]: newPrice
      }));
    }
  };

  const toggleEditButton = () => {
    setEditButtonClicked(!editButtonClicked);
    
    // If disabling edit mode, clear all editing rows
    if (editButtonClicked) {
      setEditingRows(new Set());
    }
  };

  const handleAvailabilityChange = (index: number, newAvailability: number) => {
    const updatedData = [...data];
    const itemToUpdate = filteredData[index];

    // Find the item in the original data array
    const originalIndex = data.findIndex(item => item._id === itemToUpdate._id);

    if (originalIndex !== -1) {
      // Update the availability count
      updatedData[originalIndex] = {
        ...updatedData[originalIndex],
        availability: {
          ...updatedData[originalIndex].availability,
          count: newAvailability
        }
      };
      setData(updatedData);
      
      // Track modified values
      setModifiedValues(prev => ({
        ...prev,
        [`${itemToUpdate._id}_availability`]: newAvailability
      }));
    }
  };

  const handleSave = async () => {
    try {
      // Only save the rows that were being edited
      const rowsToSave = data.filter((_, index) => editingRows.has(index));
      
      if (rowsToSave.length > 0) {
        // Save the data
        await saveData(rowsToSave);
        
        // Show success message
        toast.success(`Successfully saved ${rowsToSave.length} row(s)!`);
        
        // Fetch fresh data from server to reload UI
        await fetchRatePlans();
        
      } else {
        toast.error('No changes to save');
      }
    } catch (error) {
      toast.error('Failed to save data');
      console.error('Save error:', error);
    }
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

  const cancelAllEdits = () => {
    // Restore original data
    setData([...originalData]);
    setEditingRows(new Set());
    setEditButtonClicked(false);
    setModifiedValues({});
    // toast.info('All changes cancelled');
  };

  // Helper function to get unique room types (invTypeCode)
  const getRoomTypes = () => {
    return Array.from(new Set(data.map(item => item.invTypeCode))).filter(Boolean);
  };

  // Helper function to get unique hotel codes (for rate plans)
  const getHotelCodes = () => {
    return Array.from(new Set(data.map(item => item.hotelCode))).filter(Boolean);
  };

  // Check if there are any unsaved changes
  const hasUnsavedChanges = editingRows.size > 0 || Object.keys(modifiedValues).length > 0;

  return (
    <div className="px-10 min-h-screen" style={{ height: 'calc(100vh - 100px)' }}>
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">
        {roomTypesLoaded && (
          <>
            <Filters
              dateRange={dateRange}
              setDateRange={setDateRange}
              selectedRoomType={selectedRoomType}
              setSelectedRoomType={setSelectedRoomType}
              selectedRatePlan={selectedRatePlan}
              setSelectedRatePlan={setSelectedRatePlan}
              roomTypes={allRoomTypes}
              data={data}
              onResetFilters={resetFilters}
            />
          </>
        )}
        
        <div className="flex justify-end items-center mt-4">
          <div className="flex items-center space-x-2">
            <SaveButton
              isLoading={isLoading}
              editingRows={editingRows}
              handleSave={handleSave}
              disabled={!hasUnsavedChanges}
            />
          </div>
        </div>

        <RatePlanTable
          filteredData={filteredData}
          editingRows={editingRows}
          handlePriceChange={handlePriceChange}
          handleAvailabilityChange={handleAvailabilityChange}
          toggleEditRow={toggleEditRow}
          toggleEditButton={toggleEditButton}
          editButtonVal={editButtonClicked}
        />
      </div>
    </div>
  );
};

export default MapRatePlanPage;