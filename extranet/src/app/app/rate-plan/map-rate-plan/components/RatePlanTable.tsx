// RatePlanTable.tsx
import React from 'react';
import { format } from '../utils/dateUtils';
import { TABLE_HEADERS } from '../constants';
import { RatePlanInterFace, modifiedRatePlanInterface, modifiedSellStatusInterface } from '../types';
import { getPrice, getAvailability, getCurrencyCode, getSellStatus, canEditSellStatus } from '../services/dataService';

interface RatePlanTableProps {
  filteredData: RatePlanInterFace[];
  handlePriceChange: (id: string, newPrice: number) => void;
  handleSellStatusChange: (id: string, isStopSell: boolean) => void;
  toggleEditButton: () => void;
  editButtonVal: boolean;
  modifiedValues: modifiedRatePlanInterface[];
  modifiedSellStatus: modifiedSellStatusInterface[];
  isLoading: boolean;
}

export const RatePlanTable: React.FC<RatePlanTableProps> = ({
  filteredData,
  handlePriceChange,
  handleSellStatusChange,
  toggleEditButton,
  editButtonVal,
  modifiedValues,
  modifiedSellStatus,
  isLoading
}) => {

  // Check if a specific item's price has been modified
  const isItemPriceModified = (itemId: string) => {
    return modifiedValues.some(modified => modified.rateAmountId === itemId);
  };

  // Check if a specific item's sell status has been modified
  const isItemSellStatusModified = (itemId: string) => {
    return modifiedSellStatus.some(modified => modified.rateAmountId === itemId);
  };

  // Check if any modification exists for an item
  const hasAnyModification = (itemId: string) => {
    return isItemPriceModified(itemId) || isItemSellStatusModified(itemId);
  };

  // Filter data to only show rate plans with both price and availability
  const availableData = filteredData.filter(item => {
    const price = getPrice(item);
    const availability = getAvailability(item);
    return (
      price !== null &&
      price !== undefined &&
      availability !== null &&
      availability !== undefined &&
      item.rates?.ratePlanCode
    );
  });

  // Calculate total modifications
  const totalModifications = modifiedValues.length + modifiedSellStatus.length;

  return (
    <div className="bg-white rounded-xl shadow-md">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">
          Rate Plan Data ({availableData.length} items)
        </h2>
        <div className="flex items-center space-x-4">
          {totalModifications > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-orange-600 font-medium">
                {totalModifications} unsaved changes
              </span>
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            </div>
          )}
          {editButtonVal && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-tripswift-blue font-medium">Edit Mode Active</span>
              <div className="w-2 h-2 bg-tripswift-dark-blue rounded-full animate-pulse"></div>
            </div>
          )}
          <button
            onClick={toggleEditButton}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${editButtonVal
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-blue-100 text-tripswift-dark-blue hover:bg-blue-200'
              }`}
          >
            {editButtonVal ? 'Disable Edit' : 'Enable Edit'}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="w-6 h-6 border-4 border-tripswift-blue border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600 font-medium">Loading rate plans...</span>
        </div>
      ) : availableData.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          No data found. Try adjusting your filters.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                {TABLE_HEADERS.map(header => (
                  <th
                    key={header.key}
                    className={`px-6 py-3 text-${header.key === 'actions' ? 'right' : 'left'
                      } text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200`}
                  >
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {availableData.map((item, index) => {
                const isPriceModified = isItemPriceModified(item?.rates?._id);
                const isSellStatusModified = isItemSellStatusModified(item?.rates?._id);
                const hasModifications = hasAnyModification(item?.rates?._id);
                const currentSellStatus = getSellStatus(item);
                const canEditStatus = canEditSellStatus(item);

                return (
                  <tr
                    key={index}
                    className={`transition-colors duration-150 ${hasModifications
                      ? 'bg-orange-50 hover:bg-orange-100 border-l-4 border-orange-400'
                      : editButtonVal
                        ? 'hover:bg-blue-50'
                        : 'hover:bg-gray-50'
                      }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {format(new Date(item.availability.startDate), 'PPP')}
                        </div>
                        <div className="text-xs text-gray-500">
                          to {format(new Date(item.availability.endDate), 'PPP')}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.rates?.ratePlanCode}</div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.invTypeCode}</div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          value={getPrice(item)}
                          onChange={(e) => handlePriceChange(item.rates._id, parseFloat(e.target.value) || 0)}
                          className={`w-20 px-2 py-1 text-sm rounded transition-all duration-200 ${editButtonVal
                            ? `border-2 ${isPriceModified ? 'border-orange-400 bg-orange-50' : 'border-tripswift-blue bg-white'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm`
                            : 'border-none bg-transparent focus:outline-none'
                            }`}
                          min={0}
                          disabled={!editButtonVal}
                          readOnly={!editButtonVal}
                        />
                        <span className="text-xs text-gray-500">{getCurrencyCode(item)}</span>
                        {isPriceModified && (
                          <div className="w-2 h-2 bg-orange-400 rounded-full" title="Price Modified"></div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={getAvailability(item)}
                        className="w-16 px-2 py-1 text-sm rounded transition-all duration-200 border-none bg-transparent focus:outline-none"
                        min={0}
                        disabled={true}
                        readOnly={true}
                      />
                    </td>

                    {/* New Sell Status Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {canEditStatus ? (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleSellStatusChange(item.rates._id, !currentSellStatus)}
                              disabled={!editButtonVal}
                              className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                                !editButtonVal
                                  ? 'cursor-not-allowed opacity-50'
                                  : 'cursor-pointer hover:scale-105'
                              } ${
                                currentSellStatus
                                  ? `bg-red-100 text-red-700 ${editButtonVal ? 'hover:bg-red-200' : ''} ${isSellStatusModified ? 'ring-2 ring-orange-400' : ''}`
                                  : `bg-green-100 text-green-700 ${editButtonVal ? 'hover:bg-green-200' : ''} ${isSellStatusModified ? 'ring-2 ring-orange-400' : ''}`
                              }`}
                              title={editButtonVal ? (currentSellStatus ? 'Click to Start Sell' : 'Click to Stop Sell') : 'Enable edit mode to change'}
                            >
                              {currentSellStatus ? 'Stop Sell' : 'Start Sell'}
                            </button>
                            {isSellStatusModified && (
                              <div className="w-2 h-2 bg-orange-400 rounded-full" title="Sell Status Modified"></div>
                            )}
                          </div>
                        ) : (
                          <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
                            N/A
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};