import React, { useState, useTransition } from 'react';
import { Star, Check } from 'lucide-react';
import { AMENITIES } from "@/components/HotelBox/FilterModal";
import i18next, { t, i18n } from 'i18next';
import { useTranslation } from 'react-i18next';
interface FilterSidebarProps {
  amenities: { [key: string]: boolean };
  sortOrder: string;
  ratingFilter: number | null;
  toggleAmenityFilter: (key: string) => void;
  handleSortChange: (sortOrder: string) => void;
  handleRatingChange: (rating: number | null) => void;
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
    const {i18n} = useTranslation();
  

  // Decide how many amenities to show
  // const initialAmenityCount = 6;
  // const amenitiesToShow = showAllAmenities 
  //   ? AMENITIES 
  //   : AMENITIES.slice(0, initialAmenityCount);

  return (
    <div className="bg-tripswift-off-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-4">
      {/* <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-tripswift-medium text-tripswift-black">Filters</h2>
        {activeFilterCount > 0 && (
          <button
            onClick={resetFilters}
            className="text-xs text-tripswift-blue font-tripswift-medium hover:underline"
          >
            Clear all
          </button>
        )}
      </div> */}

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
                sortOrder === option.id ? "bg-tripswift-blue/10 text-tripswift-blue" : "hover:bg-gray-50"
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
                className="h-4 w-4 mb-2 text-tripswift-blue rounded border-gray-300 focus:ring-tripswift-blue"
              />
              <label
                htmlFor={`star-${rating}`}
                className={`ml-2 text-xs text-gray-700 flex items-center cursor-pointer ${i18n.language==="ar"?"mr-2":"ml-2"}`}
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
                id={`amenity-${amenity.key}`}
                type="checkbox"
                checked={!!amenities[amenity.key]}
                onChange={() => toggleAmenityFilter(amenity.key)}
                className="h-4 w-4 mb-2 text-tripswift-blue rounded border-gray-300 focus:ring-tripswift-blue"
              />
              <label
                htmlFor={`amenity-${amenity.key}`}
                className={`ml-2 text-xs text-gray-700 normal-case cursor-pointer font-tripswift-regular ${i18n.language==="ar"?"mr-2":"ml-2"}`}
                onClick={() => toggleAmenityFilter(amenity.key)}
              >
                {t(`HotelBox.FilterModal.amenitiesList.${amenity.labelKey}`, { defaultValue: amenity.labelKey })}
              </label>
            </div>
          ))}
        </div>

        {/* Toggle button for showing all amenities */}
        {/* {AMENITIES.length > initialAmenityCount && (
          <button
            onClick={() => setShowAllAmenities(!showAllAmenities)}
            className="mt-4 w-full py-2 text-xs text-tripswift-blue hover:underline font-tripswift-medium"
          >
            {showAllAmenities ? "Show less" : "Show more"}
          </button>
        )} */}
      </div>
    </div>
  );
};

export default FilterSidebar;