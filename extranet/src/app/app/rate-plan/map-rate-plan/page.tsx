'use client';

import React, { useState, useEffect } from 'react';
import { Calendar } from './components/Calender';
import { Popover, PopoverTrigger, PopoverContent } from './components/Popover';
import { format, isWithinInterval, parseISO } from './utils/dateUtils';
import { MoreVertical, X } from 'lucide-react';
import mapRatePlanData from './dummy/mapRatePlanData.json';
import toast, { Toaster } from 'react-hot-toast';

interface MapRatePlanData {
  date: string;
  ratePlanCode: string;
  ratePlanName: string;
  roomTypeCode: string;
  roomTypeName: string;
  price: number;
  availability: number;
}

interface DateRange {
  from: Date;
  to: Date;
}

const MapRatePlanPage: React.FC = () => {
  const [data, setData] = useState<MapRatePlanData[]>(mapRatePlanData.mapRatePlanData);
  const [filteredData, setFilteredData] = useState<MapRatePlanData[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedRoomType, setSelectedRoomType] = useState<string>('');
  const [selectedRatePlan, setSelectedRatePlan] = useState<string>('');
  const [editingRows, setEditingRows] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);

  // Get unique values for filters
  const roomTypes = Array.from(new Set(data.map(item => item.roomTypeCode)));
  const ratePlans = Array.from(new Set(data.map(item => item.ratePlanCode)));

  useEffect(() => {
    filterData();
  }, [dateRange, selectedRoomType, selectedRatePlan, data]);

  const filterData = () => {
    let filtered = [...data];

    // Filter by date range
    if (dateRange?.from && dateRange?.to) {
      filtered = filtered.filter(item => {
        const itemDate = parseISO(item.date);
        return isWithinInterval(itemDate, { start: dateRange.from, end: dateRange.to });
      });
    }

    // Filter by room type
    if (selectedRoomType) {
      filtered = filtered.filter(item => item.roomTypeCode === selectedRoomType);
    }

    // Filter by rate plan
    if (selectedRatePlan) {
      filtered = filtered.filter(item => item.ratePlanCode === selectedRatePlan);
    }

    setFilteredData(filtered);
  };

  const handlePriceChange = (index: number, newPrice: number) => {
    const updatedData = [...data];
    const originalIndex = data.findIndex(item => 
      item.date === filteredData[index].date &&
      item.ratePlanCode === filteredData[index].ratePlanCode &&
      item.roomTypeCode === filteredData[index].roomTypeCode
    );
    
    if (originalIndex !== -1) {
      updatedData[originalIndex].price = newPrice;
      setData(updatedData);
    }
  };

  const handleAvailabilityChange = (index: number, newAvailability: number) => {
    const updatedData = [...data];
    const originalIndex = data.findIndex(item => 
      item.date === filteredData[index].date &&
      item.ratePlanCode === filteredData[index].ratePlanCode &&
      item.roomTypeCode === filteredData[index].roomTypeCode
    );
    
    if (originalIndex !== -1) {
      updatedData[originalIndex].availability = newAvailability;
      setData(updatedData);
    }
  };

  const handleRatePlanChange = (index: number, newRatePlanCode: string) => {
    const updatedData = [...data];
    const originalIndex = data.findIndex(item => 
      item.date === filteredData[index].date &&
      item.ratePlanCode === filteredData[index].ratePlanCode &&
      item.roomTypeCode === filteredData[index].roomTypeCode
    );
    
    if (originalIndex !== -1) {
      const ratePlanName = data.find(item => item.ratePlanCode === newRatePlanCode)?.ratePlanName || '';
      updatedData[originalIndex].ratePlanCode = newRatePlanCode;
      updatedData[originalIndex].ratePlanName = ratePlanName;
      setData(updatedData);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Saved data:', data);
    setEditingRows(new Set());
    toast.success('Data saved successfully!');
    setIsLoading(false);
  };

  const resetFilters = () => {
    setDateRange(undefined);
    setSelectedRoomType('');
    setSelectedRatePlan('');
  };

  const toggleDropdown = (index: number) => {
    setDropdownOpen(dropdownOpen === index ? null : index);
  };

  const toggleEditRow = (index: number) => {
    const newEditingRows = new Set(editingRows);
    if (newEditingRows.has(index)) {
      newEditingRows.delete(index);
    } else {
      newEditingRows.add(index);
    }
    setEditingRows(newEditingRows);
    setDropdownOpen(null);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Map Rate Plan</h1>
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Reset Filters
            </button>
          </div>

          {/* Filters */}
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
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 bg-white">
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
                onChange={(e) => setSelectedRoomType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Room Types</option>
                {roomTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
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
                onChange={(e) => setSelectedRatePlan(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Rate Plans</option>
                {ratePlans.map(plan => (
                  <option key={plan} value={plan}>{plan}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Rate Plan Data ({filteredData.length} items)
            </h2>
            <button
              onClick={handleSave}
              disabled={isLoading || editingRows.size === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          {filteredData.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No data found. Try adjusting your filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rate Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Room Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Availability
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.map((item, index) => (
                    <tr key={`${item.date}-${item.ratePlanCode}-${item.roomTypeCode}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(parseISO(item.date), 'PPP')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          {editingRows.has(index) ? (
                            <select
                              value={item.ratePlanCode}
                              onChange={(e) => handleRatePlanChange(index, e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              {ratePlans.map(plan => (
                                <option key={plan} value={plan}>{plan}</option>
                              ))}
                            </select>
                          ) : (
                            <>
                              <div className="text-sm font-medium text-gray-900">{item.ratePlanName}</div>
                              <div className="text-sm text-gray-500">{item.ratePlanCode}</div>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.roomTypeName}</div>
                          <div className="text-sm text-gray-500">{item.roomTypeCode}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => handlePriceChange(index, parseFloat(e.target.value) || 0)}
                          className={`w-20 px-2 py-1 text-sm rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            editingRows.has(index) ? 'border border-gray-300' : 'border-none bg-transparent'
                          }`}
                          step="0.01"
                          min="0"
                          disabled={!editingRows.has(index)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          value={item.availability}
                          onChange={(e) => handleAvailabilityChange(index, parseInt(e.target.value) || 0)}
                          className={`w-16 px-2 py-1 text-sm rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            editingRows.has(index) ? 'border border-gray-300' : 'border-none bg-transparent'
                          }`}
                          min="0"
                          disabled={!editingRows.has(index)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="relative">
                          <button
                            onClick={() => toggleDropdown(index)}
                            className="p-2 hover:bg-gray-100 rounded-full"
                          >
                            {dropdownOpen === index ? (
                              <X className="h-5 w-5 text-gray-500" />
                            ) : (
                              <MoreVertical className="h-5 w-5 text-gray-500" />
                            )}
                          </button>
                          {dropdownOpen === index && (
                            <div className="absolute right-0 top-10 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                              <button
                                onClick={() => toggleEditRow(index)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                {editingRows.has(index) ? 'Cancel Edit' : 'Edit'}
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapRatePlanPage;