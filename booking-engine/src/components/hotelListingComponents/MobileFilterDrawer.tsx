import React from 'react';
import { X, Check, Star } from 'lucide-react';
import { AMENITIES } from "@/components/HotelBox/FilterModal";

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sidebarRef: React.RefObject<HTMLDivElement>;
  amenities: { [key: string]: boolean };
  sortOrder: string;
  ratingFilter: number | null; // Added the missing ratingFilter prop
  toggleAmenityFilter: (key: string) => void;
  handleSortChange: (sortOrder: string) => void;
  handleRatingChange: (rating: number | null) => void;
  resetFilters: () => void;
  filteredHotelsCount: number;
}

const MobileFilterDrawer: React.FC<MobileFilterDrawerProps> = ({
  isOpen,
  onClose,
  sidebarRef,
  amenities,
  sortOrder,
  ratingFilter, // Added to component parameters
  toggleAmenityFilter,
  handleSortChange,
  handleRatingChange,
  resetFilters,
  filteredHotelsCount
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-20 lg:hidden">
      <div
        ref={sidebarRef}
        className="fixed inset-y-0 right-0 w-full max-w-xs bg-tripswift-off-white shadow-xl p-4 overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-tripswift-bold text-sm text-tripswift-black">Filters</h2>
          <button 
            onClick={onClose} 
            className="text-tripswift-black/60 hover:text-tripswift-black transition-colors"
            aria-label="Close filters"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Sort by */}
        {/* <div className="mb-6">
          <h3 className="text-xs font-tripswift-medium text-tripswift-black mb-3">Sort by</h3>
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
                  sortOrder === option.id 
                    ? "bg-tripswift-blue/10 text-tripswift-blue" 
                    : "hover:bg-gray-50 text-tripswift-black/80"
                }`}
              >
                {sortOrder === option.id && (
                  <Check className="h-4 w-4 text-tripswift-blue mr-2" />
                )}
                <span className="text-xs font-tripswift-regular">{option.label}</span>
              </div>
            ))}
          </div>
        </div> */}
        
        {/* Property rating */}
        <div className="mb-6">
          <h3 className="text-xs font-tripswift-medium text-tripswift-black mb-3">Property rating</h3>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center">
                <input
                  id={`star-${rating}`}
                  type="checkbox"
                  checked={ratingFilter === rating}
                  onChange={() => handleRatingChange(ratingFilter === rating ? null : rating)}
                  className="h-4 w-4 text-tripswift-blue rounded border-gray-300 focus:ring-tripswift-blue"
                />
                <label
                  htmlFor={`star-${rating}`}
                  className="ml-2 text-xs text-gray-700 flex items-center cursor-pointer"
                  onClick={() => handleRatingChange(ratingFilter === rating ? null : rating)}
                >
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                  {Array.from({ length: 5 - rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-gray-300" />
                  ))}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Amenities */}
        <div>
          <h3 className="text-xs font-tripswift-medium text-tripswift-black mb-3">Amenities</h3>
          <div className="space-y-2">
            {AMENITIES.map((amenity) => (
              <div key={amenity.key} className="flex items-center">
                <input
                  id={`mobile-amenity-${amenity.key}`}
                  type="checkbox"
                  checked={!!amenities[amenity.key]}
                  onChange={() => toggleAmenityFilter(amenity.key)}
                  className="h-4 w-4 text-tripswift-blue rounded border-gray-300 focus:ring-tripswift-blue focus:ring-opacity-25"
                />
                <label 
                  htmlFor={`mobile-amenity-${amenity.key}`} 
                  className="ml-2 text-xs text-tripswift-black/80 normal-case font-tripswift-regular cursor-pointer"
                >
                  {amenity.labelKey}
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
            className="w-full py-2.5 bg-tripswift-off-white border border-tripswift-black/20 rounded-md text-sm font-tripswift-medium text-tripswift-black hover:bg-gray-50 transition-colors"
          >
            Clear all filters
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-tripswift-blue hover:bg-[#054B8F] text-tripswift-off-white rounded-md text-sm font-tripswift-medium transition-colors shadow-sm"
          >
            See {filteredHotelsCount} results
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileFilterDrawer;