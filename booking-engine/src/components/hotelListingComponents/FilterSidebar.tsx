import React, { useState } from 'react';
import { Star, Check } from 'lucide-react';
import { AMENITIES } from "@/components/HotelBox/FilterModal";

interface FilterSidebarProps {
  amenities: { [key: string]: boolean };
  sortOrder: string;
  ratingFilter: number | null; // Added for rating filter
  toggleAmenityFilter: (key: string) => void;
  handleSortChange: (sortOrder: string) => void;
  handleRatingChange: (rating: number | null) => void; // Added for rating filter
  resetFilters: () => void;
  activeFilterCount: number;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  amenities,
  sortOrder,
  ratingFilter,
  toggleAmenityFilter,
  handleSortChange,
  handleRatingChange,
  resetFilters,
  activeFilterCount
}) => {
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  
  // Decide how many amenities to show
  const initialAmenityCount = 6;
  const amenitiesToShow = showAllAmenities 
    ? AMENITIES 
    : AMENITIES.slice(0, initialAmenityCount);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-gray-800">Filters</h2>
        {activeFilterCount > 0 && (
          <button
            onClick={resetFilters}
            className="text-blue-500 text-sm hover:underline"
          >
            Clear all
          </button>
        )}
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

      {/* Property rating - Updated with working checkboxes */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-800 mb-3">Property rating</h3>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center">
              <input
                id={`star-${rating}`}
                type="checkbox"
                checked={ratingFilter === rating}
                onChange={() => handleRatingChange(ratingFilter === rating ? null : rating)}
                className="h-4 w-4 text-blue-500 rounded border-gray-300"
              />
              <label 
                htmlFor={`star-${rating}`} 
                className="ml-2 text-sm text-gray-700 flex items-center cursor-pointer"
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
        <h3 className="text-sm font-medium text-gray-800 mb-3">Amenities</h3>
        <div className="space-y-2">
          {amenitiesToShow.map((amenity) => (
            <div key={amenity.key} className="flex items-center">
              <input
                id={`amenity-${amenity.key}`}
                type="checkbox"
                checked={!!amenities[amenity.key]}
                onChange={() => toggleAmenityFilter(amenity.key)}
                className="h-4 w-4 text-blue-500 rounded border-gray-300"
              />
              <label 
                htmlFor={`amenity-${amenity.key}`} 
                className="ml-2 text-sm text-gray-700 cursor-pointer"
                onClick={() => toggleAmenityFilter(amenity.key)}
              >
                {amenity.label}
              </label>
            </div>
          ))}
        </div>
        
        {/* Toggle button for showing all amenities */}
        {AMENITIES.length > initialAmenityCount && (
          <button
            onClick={() => setShowAllAmenities(!showAllAmenities)}
            className="mt-4 w-full py-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            {showAllAmenities ? "Show less" : "Show more"}
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterSidebar;