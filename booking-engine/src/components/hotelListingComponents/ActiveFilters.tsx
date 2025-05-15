import React from 'react';
import { X } from 'lucide-react';

interface ActiveFiltersProps {
  amenities: { [key: string]: boolean };
  sortOrder: string;
  searchQuery: string;
  toggleAmenityFilter: (key: string) => void;
  handleSortChange: (sortOrder: string) => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;
}

const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  amenities,
  sortOrder,
  searchQuery,
  toggleAmenityFilter,
  handleSortChange,
  setSearchQuery,
  resetFilters
}) => {
  const activeFilterCount = Object.values(amenities).filter(Boolean).length +
    (sortOrder ? 1 : 0) + (searchQuery ? 1 : 0);

  if (activeFilterCount === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 py-2">
      <span className="text-sm text-gray-600">Active filters:</span>

      {Object.entries(amenities)
        .filter(([_, isSelected]) => isSelected)
        .map(([amenity]) => (
          <div
            key={amenity}
            className="flex items-center bg-blue-50 border border-blue-100 rounded-full px-3 py-1 text-xs text-blue-700"
          >
            <span className="capitalize">{amenity.replace('_', ' ')}</span>
            <button
              onClick={() => toggleAmenityFilter(amenity)}
              className="ml-1.5 text-blue-500 hover:text-blue-700"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

      {sortOrder && (
        <div className="flex items-center bg-blue-50 border border-blue-100 rounded-full px-3 py-1 text-xs text-blue-700">
          <span>
            {sortOrder === 'rating_desc'
              ? 'Highest Rating'
              : sortOrder === 'rating_asc'
                ? 'Lowest Rating'
                : 'Recommended'}
          </span>
          <button
            onClick={() => handleSortChange('')}
            className="ml-1.5 text-blue-500 hover:text-blue-700"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {searchQuery && (
        <div className="flex items-center bg-blue-50 border border-blue-100 rounded-full px-3 py-1 text-xs text-blue-700">
          <span>Name: {searchQuery}</span>
          <button
            onClick={() => setSearchQuery('')}
            className="ml-1.5 text-blue-500 hover:text-blue-700"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      <button
        onClick={resetFilters}
        className="text-xs text-blue-600 hover:underline ml-1"
      >
        Clear all
      </button>
    </div>
  );
};

export default ActiveFilters;