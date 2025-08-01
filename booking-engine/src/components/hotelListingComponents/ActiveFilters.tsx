import React from 'react';
import { X } from 'lucide-react';
import { AMENITIES } from "@/components/hotelBox/FilterModal";
import { useTranslation } from 'react-i18next';

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

  // Function to find the label for an amenity key
  const getAmenityLabel = (key: string) => {
    const amenity = AMENITIES.find(a => a.key === key);
    return amenity ? amenity.labelKey : key.replace(/_/g, ' ');
  };

  if (activeFilterCount === 0) return null;
  const {i18n}=useTranslation();
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 py-2">
      <span className="text-xs text-gray-600 font-tripswift-medium">Active filters :</span>

      {Object.entries(amenities)
        .filter(([_, isSelected]) => isSelected)
        .map(([amenityKey]) => (
          <div
            key={amenityKey}
            className="flex items-center bg-tripswift-blue/5 border border-tripswift-blue/20 rounded-full px-3 py-1 text-xs text-tripswift-blue font-tripswift-regular"
          >
            <span>{getAmenityLabel(amenityKey)}</span>
            <button
              onClick={() => toggleAmenityFilter(amenityKey)}
              className={` text-tripswift-blue/80 hover:text-tripswift-blue ${i18n.language==="ar"?"mr:1.5":"ml:1.5"}` }
              aria-label={`Remove ${getAmenityLabel(amenityKey)} filter`}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

      {sortOrder && (
        <div className="flex items-center bg-tripswift-blue/5 border border-tripswift-blue/20 rounded-full px-3 py-1 text-xs text-tripswift-blue font-tripswift-regular">
          <span>
            {sortOrder === 'rating_desc'
              ? 'Highest Rating'
              : sortOrder === 'rating_asc'
                ? 'Lowest Rating'
                : 'Recommended'}
          </span>
          <button
            onClick={() => handleSortChange('')}
            className={` text-tripswift-blue/80 hover:text-tripswift-blue ${i18n.language ==="ar"?"mr-1.5":"ml-1.5"}`}
            aria-label="Remove sort filter"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {searchQuery && (
        <div className="flex items-center bg-tripswift-blue/5 border border-tripswift-blue/20 rounded-full px-3 py-1 text-xs text-tripswift-blue font-tripswift-regular">
          <span >Name: {searchQuery}</span>
          <button
            onClick={() => setSearchQuery('')}
            className={` text-tripswift-blue/80 hover:text-tripswift-blue ${i18n.language ==="ar"?"mr-1.5":"ml-1.5"}`}
            aria-label="Remove search filter"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* <button
        onClick={resetFilters}
        className="text-xs text-tripswift-blue font-tripswift-medium hover:underline ml-1"
      >
        Clear all
      </button> */}
    </div>
  );
};

export default ActiveFilters;