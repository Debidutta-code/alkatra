import React from 'react';
import { X, Check } from 'lucide-react';
import { AMENITIES } from "@/components/HotelBox/FilterModal";

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sidebarRef: React.RefObject<HTMLDivElement>;
  amenities: { [key: string]: boolean };
  sortOrder: string;
  toggleAmenityFilter: (key: string) => void;
  handleSortChange: (sortOrder: string) => void;
  resetFilters: () => void;
  filteredHotelsCount: number;
}

const MobileFilterDrawer: React.FC<MobileFilterDrawerProps> = ({
  isOpen,
  onClose,
  sidebarRef,
  amenities,
  sortOrder,
  toggleAmenityFilter,
  handleSortChange,
  resetFilters,
  filteredHotelsCount
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 lg:hidden">
      <div
        ref={sidebarRef}
        className="fixed inset-y-0 right-0 w-full max-w-xs bg-white shadow-xl p-4 overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-gray-800">Filters</h2>
          <button onClick={onClose} className="text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Sort by */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-800 mb-3">Sort by</h3>
          <div className="space-y-2">
            {[
              { id: "", label: "Recommended" },
              { id: "rating_desc", label: "Rating: High to Low" },
              { id: "rating_asc", label: "Rating: Low to High" }
            ].map((option) => (
              <div
                key={option.id}
                onClick={() => handleSortChange(option.id)}
                className={`flex items-center cursor-pointer px-2 py-1.5 rounded-md ${
                  sortOrder === option.id ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50"
                }`}
              >
                {sortOrder === option.id && (
                  <Check className="h-4 w-4 text-blue-500 mr-2" />
                )}
                <span className="text-sm">{option.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Amenities */}
        <div>
          <h3 className="text-sm font-medium text-gray-800 mb-3">Amenities</h3>
          <div className="space-y-2">
            {AMENITIES.map((amenity) => (
              <div key={amenity.key} className="flex items-center">
                <input
                  id={`mobile-amenity-${amenity.key}`}
                  type="checkbox"
                  checked={!!amenities[amenity.key]}
                  onChange={() => toggleAmenityFilter(amenity.key)}
                  className="h-4 w-4 text-blue-500 rounded border-gray-300"
                />
                <label htmlFor={`mobile-amenity-${amenity.key}`} className="ml-2 text-sm text-gray-700">
                  {amenity.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile actions */}
        <div className="mt-8 space-y-3">
          <button
            onClick={() => {
              resetFilters();
              onClose();
            }}
            className="w-full py-2 bg-gray-100 border border-gray-300 rounded-md text-sm font-medium text-gray-700"
          >
            Clear all filters
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 bg-blue-500 rounded-md text-sm font-medium text-white"
          >
            See {filteredHotelsCount} results
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileFilterDrawer;