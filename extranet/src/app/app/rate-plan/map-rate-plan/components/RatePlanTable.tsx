import React from 'react';
import { Edit2, X } from 'lucide-react';
import { format, parseISO } from '../utils/dateUtils';
import { TABLE_HEADERS } from '../constants';
import { MapRatePlanData } from '../types';

interface RatePlanTableProps {
  filteredData: MapRatePlanData[];
  editingRows: Set<number>;
  handlePriceChange: (index: number, newPrice: number) => void;
  handleAvailabilityChange: (index: number, newAvailability: number) => void;
  toggleEditRow: (index: number) => void;
}

export const RatePlanTable: React.FC<RatePlanTableProps> = ({
  filteredData,
  editingRows,
  handlePriceChange,
  handleAvailabilityChange,
  toggleEditRow,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">
          Rate Plan Data ({filteredData.length} items)
        </h2>
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
                    className={`px-6 py-3 text-${
                      header.key === 'actions' ? 'right' : 'left'
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
                  key={`${item.date}-${item.ratePlanCode}-${item.roomTypeCode}`}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(parseISO(item.date), 'PPP')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.ratePlanName}</div>
                      <div className="text-sm text-gray-500">{item.ratePlanCode}</div>
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
                    <button
                      onClick={() => toggleEditRow(index)}
                      className="p-2 hover:bg-gray-200 rounded-full transition-colors duration-150"
                      aria-label={editingRows.has(index) ? 'Cancel edit' : 'Edit row'}
                    >
                      {editingRows.has(index) ? (
                        <X className="h-5 w-5 text-gray-500" />
                      ) : (
                        <Edit2 className="h-5 w-5 text-gray-500" />
                      )}
                    </button>
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