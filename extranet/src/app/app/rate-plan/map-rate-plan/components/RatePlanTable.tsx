// RatePlanTable.tsx
import React from 'react';
import { format } from '../utils/dateUtils';
import { TABLE_HEADERS } from '../constants';
import { RatePlanInterFace, modifiedRatePlanInterface } from '../types';
import { getPrice, getAvailability, getCurrencyCode, getDateRangeString } from '../services/dataService';

interface RatePlanTableProps {
  filteredData: RatePlanInterFace[];
  handlePriceChange: (id: string, newPrice: number) => void;
  toggleEditButton: () => void;
  editButtonVal: boolean;
  modifiedValues: modifiedRatePlanInterface[];
}

export const RatePlanTable: React.FC<RatePlanTableProps> = ({
  filteredData,
  handlePriceChange,
  toggleEditButton,
  editButtonVal,
  modifiedValues
}) => {

  // Check if a specific item has been modified
  const isItemModified = (itemId: string) => {
    return modifiedValues.some(modified => modified.rateAmountId === itemId);
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
    ); // Show rows only when both price and availability exist and are greater than 0
  });

  return (
    <div className="bg-white rounded-xl shadow-md">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">
          Rate Plan Data ({availableData.length} items)
        </h2>
        <div className="flex items-center space-x-4">
          {modifiedValues.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-orange-600 font-medium">
                {modifiedValues.length} unsaved changes
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

      {availableData.length === 0 ? (
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
                const isModified = isItemModified(item?.rates?._id);

                return (
                  <tr
                    key={index}
                    className={`transition-colors duration-150 ${isModified
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
                              ? `border-2 ${isModified ? 'border-orange-400 bg-orange-50' : 'border-tripswift-blue bg-white'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm`
                              : 'border-none bg-transparent focus:outline-none'
                            }`}
                          // step="0.01" 
                          min={0}
                          disabled={!editButtonVal}
                          readOnly={!editButtonVal}
                        />
                        <span className="text-xs text-gray-500">{getCurrencyCode(item)}</span>
                        {isModified && (
                          <div className="w-2 h-2 bg-orange-400 rounded-full" title="Modified"></div>
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