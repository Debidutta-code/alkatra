import React from 'react';
import { Edit2, X, Check } from 'lucide-react';
import { format } from '../utils/dateUtils';
import { TABLE_HEADERS } from '../constants';
import { RatePlanInterFace } from '../types';
import { getPrice, getAvailability, getCurrencyCode, getDateRangeString } from '../services/dataService';

interface RatePlanTableProps {
  filteredData: RatePlanInterFace[];
  editingRows: Set<number>;
  handlePriceChange: (id: string, newPrice: number) => void;
  toggleEditRow: (index: number) => void;
  toggleEditButton: () => void;
  editButtonVal: boolean;
}

export const RatePlanTable: React.FC<RatePlanTableProps> = ({
  filteredData,
  editingRows,
  handlePriceChange,
  toggleEditRow,
  toggleEditButton,
  editButtonVal
}) => {

  const handleEditClick = (index: number) => {
    // If global edit mode is not active, activate it first
    if (!editButtonVal) {
      toggleEditButton();
    }
    // Then toggle the specific row
    toggleEditRow(index);
  };

  const handleCancelEdit = (index: number) => {
    // Just toggle the row to cancel editing
    toggleEditRow(index);
  };

  const isRowEditable = (index: number) => {
    return editButtonVal && editingRows.has(index);
  };

  return (
    <div className="bg-white rounded-xl shadow-md">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">
          Rate Plan Data ({filteredData.length} items)
        </h2>
        {editButtonVal && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-tripswift-blue font-medium">Edit Mode Active</span>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
        )}
      </div>

      {filteredData.length === 0 ? (
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
              {filteredData.map((item, index) => (
                <tr
                  key={`${item._id}-${item.invTypeCode}-${item.hotelCode}`}
                  className={`transition-colors duration-150 ${isRowEditable(index)
                      ? 'bg-tripswift-blue/10 hover:bg-blue-100'
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
                      <div className="text-sm font-medium text-gray-900">{item.rates.ratePlanCode}</div>
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
                        onChange={(e) => handlePriceChange(item._id, parseFloat(e.target.value) || 0)}
                        className={`w-20 px-2 py-1 text-sm rounded transition-all duration-200 ${isRowEditable(index)
                            ? 'border-2 border-tripswift-blue bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm'
                            : 'border-none bg-transparent focus:outline-none'
                          }`}
                        step="0.01"
                        min={0}
                        disabled={!isRowEditable(index)}
                        readOnly={!isRowEditable(index)}
                      />
                      <span className="text-xs text-gray-500">{getCurrencyCode(item)}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      value={getAvailability(item)}
                      className={`w-16 px-2 py-1 text-sm rounded transition-all duration-200 border-none bg-transparent focus:outline-none`}
                      min={0}
                      disabled={true}
                      readOnly={true}
                    />
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end space-x-1">
                      {isRowEditable(index) ? (
                        <>
                          <button
                            onClick={() => handleCancelEdit(index)}
                            className="p-2 hover:bg-red-100 text-red-600 rounded-full transition-colors duration-150 tooltip"
                            aria-label="Cancel edit"
                            title="Cancel editing"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleEditClick(index)}
                          className="p-2 hover:bg-blue-100 text-tripswift-blue rounded-full transition-colors duration-150"
                          aria-label="Edit row"
                          title="Edit this row"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
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
  );
};