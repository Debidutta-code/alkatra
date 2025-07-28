'use client';

import React, { useState, useEffect } from 'react';
import { Filters } from './components/Filters';
import { RatePlanTable } from './components/RatePlanTable';
import { SaveButton } from './components/SaveButton';
import { filterData, updatePrice, updateAvailability, saveData, ratePlanServices, getAllRatePlanServices } from './services/dataService';
import { RatePlanInterFace, DateRange, paginationTypes, modifiedRatePlanInterface } from './types';
import toast, { Toaster } from 'react-hot-toast';
import Pagination from "./components/Pagination"
import { useSidebar } from '@src/components/ui/sidebar';
import { cn } from '@src/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';

const MapRatePlanPage: React.FC = () => {
  const [data, setData] = useState<RatePlanInterFace[]>([]);
  const [filteredData, setFilteredData] = useState<RatePlanInterFace[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedRoomType, setSelectedRoomType] = useState<string>('');
  const [selectedRatePlan, setSelectedRatePlan] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [allRoomTypes, setAllRoomTypes] = useState<any[]>([]);
  const [roomTypesLoaded, setRoomTypesLoaded] = useState<boolean>(false);
  const { state, isMobile } = useSidebar();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [paginationResults, setPaginationResults] = useState<paginationTypes>({
    currentPage: 1,
    totalPage: 10,
    totalResults: 200,
    hasNextPage: true,
    hasPreviousPage: false,
    resultsPerPage: 20
  });
  const [editButtonClicked, setEditButtonClicked] = useState<boolean>(false);
  const [modifiedValues, setModifiedValues] = useState<modifiedRatePlanInterface[]>([]);
  const [originalData, setOriginalData] = useState<RatePlanInterFace[]>([]);
  const getHotelCode = (): string | null => {
    const propertyCodeFromUrl = searchParams.get('propertyCode');
    if (propertyCodeFromUrl) {
      return propertyCodeFromUrl;
    }
    const propertyCodeFromSession = sessionStorage.getItem("propertyCode");
    if (propertyCodeFromSession) {
      return propertyCodeFromSession;
    }
    const propertyIdFromSession = sessionStorage.getItem("propertyId");
    if (propertyIdFromSession) {
      return propertyIdFromSession;
    }

    return null;
  };

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
      const hotelCode = getHotelCode();
      if (!hotelCode) {
        toast.error('Property code not found. Please navigate from the property page.');
        router.push('/app/property');
        return;
      }
      const response = await ratePlanServices(hotelCode, currentPage, selectedRoomType, dateRange?.from, dateRange?.to);

      setData(response.data);
      setOriginalData(response.data);
      setFilteredData(response.data);
      const patchedPagination = {
        ...response.pagination,
        totalPage: response.pagination.totalPages,
      };
      console.log("Pagination response", response.pagination);
      console.log("patched ", patchedPagination);
      setPaginationResults(patchedPagination)
      setEditButtonClicked(false);
      setModifiedValues([]);

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

  useEffect(() => {
    setFilteredData(filterData(data, dateRange, selectedRoomType, selectedRatePlan, allRoomTypes));
  }, [dateRange, selectedRoomType, selectedRatePlan, data, allRoomTypes]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= paginationResults.totalPage && page !== currentPage) {
      setCurrentPage(page);
      // Scroll to top when page changes
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePriceChange = (id: string, newPrice: number) => {
    // Update the data state with new price
    const updatedData = data.map(item => {
      // Add null check for item.rates before accessing _id
      if (item.rates && item.rates._id === id) {
        return {
          ...item,
          rates: {
            ...item.rates,
            baseByGuestAmts: {
              ...item.rates.baseByGuestAmts,
              amountBeforeTax: newPrice
            }
          }
        };
      }
      return item;
    });

    setData(updatedData);

    setModifiedValues(prev => {
      const filtered = prev.filter(item => item.rateAmountId !== id);

      return [
        ...filtered,
        {
          rateAmountId: id,
          price: newPrice
        }
      ];
    });
  };

  const toggleEditButton = () => {
    setEditButtonClicked(!editButtonClicked);
  };

  const handleSave = async () => {
    try {
      if (modifiedValues.length > 0) {
        await saveData(modifiedValues); // Pass the modified values array
        toast.success(`Successfully saved ${modifiedValues.length} modification(s)!`);
        await fetchRatePlans(); // This will clear modifiedValues
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
    setCurrentPage(1); // Reset to first page when filters are reset
  };

  // Check if there are any unsaved changes
  const hasUnsavedChanges = modifiedValues.length > 0;

  return (
    <div
      className={cn(
        "flex flex-col min-h-screen transition-all overflow-x-hidden  duration-300",
        !isMobile && state === "collapsed" && "md:overflow-x-hidden ",
        !isMobile && state === "expanded" && ""
      )}
    >

      <Toaster position="top-right" />
      <div className="w-full px-4 sm:px-6 md:px-8 ">
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
              handleSave={handleSave}
              disabled={!hasUnsavedChanges} />
          </div>
        </div>

        <RatePlanTable
          filteredData={filteredData}
          handlePriceChange={handlePriceChange}
          toggleEditButton={toggleEditButton}
          editButtonVal={editButtonClicked}
          modifiedValues={modifiedValues} // Pass modified values to show which items are modified
        />

        {/* Pagination Component */}
        {filteredData.length > 0 && (
          <div className="mt-6 mb-4">
            <Pagination
              currentPage={paginationResults.currentPage}
              totalPages={paginationResults.totalPage}
              totalResults={paginationResults.totalResults}
              resultsPerPage={paginationResults.resultsPerPage}
              hasNextPage={paginationResults.hasNextPage}
              hasPreviousPage={paginationResults.hasPreviousPage}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MapRatePlanPage;