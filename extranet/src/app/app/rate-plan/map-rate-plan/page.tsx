'use client';

import React, { useState, useEffect } from 'react';
import { Filters } from './components/Filters';
import { RatePlanTable } from './components/RatePlanTable';
import { SaveButton } from './components/SaveButton';
import { filterData, saveData, ratePlanServices, getAllRatePlanServices, bulkUpdateSellStatus } from './services/dataService';
import { RatePlanInterFace, DateRange, paginationTypes, modifiedRatePlanInterface, modifiedSellStatusInterface } from './types';
import toast, { Toaster } from 'react-hot-toast';
import Pagination from "./components/Pagination"
import { useSidebar } from '@src/components/ui/sidebar';
import { cn } from '@src/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@src/components/ui/button';
import { CheckCircle, Plus, XCircle } from "lucide-react";
import { BulkSellModal } from './components/BulkSellModal';

const MapRatePlanPage: React.FC = () => {
  const [data, setData] = useState<RatePlanInterFace[]>([]);
  const [filteredData, setFilteredData] = useState<RatePlanInterFace[]>([]);
  const getDefaultDateRange = (): DateRange => {
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);
    today.setHours(0, 0, 0, 0);
    nextMonth.setHours(0, 0, 0, 0);
    return { from: today, to: nextMonth };
  };
  const [dateRange, setDateRange] = useState<DateRange | undefined>(getDefaultDateRange());
  const [selectedRoomType, setSelectedRoomType] = useState<string>('');
  const [selectedRatePlan, setSelectedRatePlan] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [allRoomTypes, setAllRoomTypes] = useState<any[]>([]);
  const [roomTypesLoaded, setRoomTypesLoaded] = useState<boolean>(false);
  const { state, isMobile } = useSidebar();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [modifiedSellStatus, setModifiedSellStatus] = useState<modifiedSellStatusInterface[]>([]);
  const [availableCombinations, setAvailableCombinations] = useState<string[]>([]);
  const [paginationResults, setPaginationResults] = useState<paginationTypes>({
    currentPage: 1,
    totalPage: 0,
    totalResults: 0,
    hasNextPage: false,
    hasPreviousPage: false,
    resultsPerPage: 10
  });
  const [editButtonClicked, setEditButtonClicked] = useState<boolean>(false);
  const [modifiedValues, setModifiedValues] = useState<modifiedRatePlanInterface[]>([]);
  const [originalData, setOriginalData] = useState<RatePlanInterFace[]>([]);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<'start' | 'stop'>('stop');
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

  const fetchRatePlans = async (resetPage = false) => {
    try {
      setIsLoading(true);
      const hotelCode = getHotelCode();
      if (!hotelCode) {
        toast.error('Property code not found. Please navigate from the property page.');
        router.push('/app/property/single');
        return;
      }

      const pageToUse = resetPage ? 1 : currentPage;

      const response = await ratePlanServices(
        hotelCode,
        pageToUse,
        selectedRoomType,
        dateRange?.from,
        dateRange?.to,
        selectedRatePlan,
        pageSize
      );

      setData(response.data);
      setOriginalData(response.data);
      setFilteredData(response.data);

      const patchedPagination = {
        ...response.pagination,
        totalPage: response.pagination.totalPages,
        resultsPerPage: pageSize
      };

      console.log("Pagination response", response.pagination);
      console.log("patched ", patchedPagination);
      setPaginationResults(patchedPagination);

      if (resetPage) {
        setCurrentPage(1);
      }

      setEditButtonClicked(false);
      setModifiedValues([]);
      setModifiedSellStatus([]);
    } catch (error) {
      console.error('Error fetching rate plans:', error);
      toast.error('Failed to fetch rate plans data');
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (allRoomTypes.length > 0) {
      const roomTypesOnly = allRoomTypes.map(room => room.invTypeCode);
      setAvailableCombinations(roomTypesOnly);
    }
  }, [allRoomTypes]);

  useEffect(() => {
    if (roomTypesLoaded) {
      fetchRatePlans();
    }
  }, [currentPage, dateRange, selectedRatePlan, selectedRoomType, roomTypesLoaded, pageSize]);

  useEffect(() => {
    setFilteredData(filterData(data, dateRange, selectedRoomType, selectedRatePlan, allRoomTypes));
  }, [dateRange, selectedRoomType, selectedRatePlan, data, allRoomTypes]);

  useEffect(() => {
    if (filteredData.length > 0) {
      const stopSellCount = filteredData.filter(item => item.status === 'close').length;
      setBulkAction(stopSellCount > filteredData.length / 2 ? 'start' : 'stop');
    }
  }, [filteredData]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= paginationResults.totalPage && page !== currentPage) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    if (newPageSize !== pageSize) {
      setPageSize(newPageSize);
      setCurrentPage(1);
    }
  };

  const handlePriceChange = (id: string, newPrice: number) => {
    const updatedData = data.map(item => {
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
  const handleSellStatusChange = (id: string, isStopSell: boolean) => {
    const updatedData = data.map((item): RatePlanInterFace => {
      if (item._id === id) {
        return {
          ...item,
          status: isStopSell ? 'close' : 'open'
        };
      }
      return item;
    });
    setData(updatedData);

    setModifiedSellStatus(prev => {
      const filtered = prev.filter(item => item.rateAmountId !== id);
      return [
        ...filtered,
        {
          rateAmountId: id,
          isStopSell: isStopSell
        }
      ];
    });
  };
  const toggleEditButton = () => {
    setEditButtonClicked(!editButtonClicked);
  };

  const handleSave = async () => {
    try {
      if (modifiedValues.length > 0 || modifiedSellStatus.length > 0) {
        await saveData(modifiedValues, modifiedSellStatus); // Pass both arrays
        const totalChanges = modifiedValues.length + modifiedSellStatus.length;
        toast.success(`Successfully saved ${totalChanges} modification(s)!`);
        await fetchRatePlans(); // This will clear both modifiedValues and modifiedSellStatus
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
    fetchRatePlans(true); // Reset page when filters are reset
  };

  // Check if there are any unsaved changes
  const hasUnsavedChanges = modifiedValues.length > 0 || modifiedSellStatus.length > 0;

  return (
    <div
      className={cn(
        "flex flex-col min-h-screen transition-all overflow-x-hidden duration-300",
        !isMobile && state === "collapsed" && "md:overflow-x-hidden",
        !isMobile && state === "expanded" && ""
      )}
    >
      <Toaster position="top-right" />
      <div className="w-full px-4 sm:px-6 md:px-8">
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
        <div className="flex justify-start mt-2 px-6">
          <Button
            onClick={() => setIsBulkModalOpen(true)}
            disabled={filteredData.length === 0}
            className={`gap-2 ${bulkAction === 'start' ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'} text-white`}
          >
            {bulkAction === 'start' ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Bulk Start/Stop Sell
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4" />
                Bulk Start/Stop Sell
              </>
            )}
          </Button>
        </div>
        <BulkSellModal
          isOpen={isBulkModalOpen}
          onClose={() => setIsBulkModalOpen(false)}
          onConfirm={async (data) => {
            const hotelCode = getHotelCode();
            if (!hotelCode) {
              toast.error('Hotel code not found');
              return;
            }

            try {
              setIsLoading(true);
              for (const roomRatePlan of data.roomRatePlans) {
                await bulkUpdateSellStatus(
                  hotelCode,
                  roomRatePlan,
                  data.dateStatusList
                );
              }
              toast.success(`Successfully updated ${data.roomRatePlans.length} rate plans!`);
              setIsBulkModalOpen(false);
              await fetchRatePlans();
            } catch (error: any) {
              console.error('Bulk update error:', error);
              toast.error(error.message || 'Failed to update sell status');
            } finally {
              setIsLoading(false);
            }
          }}
          initialData={{
            dateRange: dateRange ?? getDefaultDateRange(),
            roomRatePlans: filteredData.length > 0
              ? [filteredData[0].invTypeCode]
              : []
          }}
          availableCombinations={availableCombinations}
        />

        <div className="flex justify-between items-center mt-4 px-6">
          {/* LEFT: Create Button */}
          <Button
            onClick={() => router.push('/app/rate-plan/create-rate-plan')}
            variant="default"
            className="flex items-center gap-2 bg-tripswift-blue hover:bg-tripswift-dark-blue text-white px-4 py-2 rounded-md text-sm font-medium shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="h-4 w-4" />
            Create Rate Plan
          </Button>

          {/* RIGHT: Save Button (existing) */}
          <div className="flex items-center space-x-2">
            <SaveButton
              isLoading={isLoading}
              handleSave={handleSave}
              disabled={!hasUnsavedChanges}
            />
          </div>
        </div>

        <RatePlanTable
          filteredData={filteredData}
          handlePriceChange={handlePriceChange}
          handleSellStatusChange={handleSellStatusChange}
          toggleEditButton={toggleEditButton}
          editButtonVal={editButtonClicked}
          modifiedValues={modifiedValues}
          modifiedSellStatus={modifiedSellStatus}
          isLoading={isLoading}
        />

        {/* Dynamic Pagination Component */}
        {paginationResults.totalResults > 0 && (
          <div className="mt-6 mb-4">
            <Pagination
              currentPage={paginationResults.currentPage}
              totalPages={paginationResults.totalPage}
              totalResults={paginationResults.totalResults}
              resultsPerPage={paginationResults.resultsPerPage}
              hasNextPage={paginationResults.hasNextPage}
              hasPreviousPage={paginationResults.hasPreviousPage}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              showResultsInfo={true}
              pageSizeOptions={[6, 10, 20]}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MapRatePlanPage;