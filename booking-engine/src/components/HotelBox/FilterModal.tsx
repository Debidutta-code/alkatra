"use client";
import React, { useEffect, useRef, useState } from "react";
import { X, Star } from "lucide-react";
import { Card } from "@/components/ui/card";

export interface FilterState {
  amenities: { [key: string]: boolean };
  sortOrder: string;
  rating: number | null;
}

export interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (filters: FilterState) => void;
  initialFilters: FilterState;
}

export const AMENITIES = [
  { key: "wifi", label: "Free Wifi" },
  { key: "swimming_pool", label: "Swimming Pool" },
  { key: "fitness_center", label: "Fitness Center" },
  { key: "spa_and_wellness", label: "Spa and Wellness" },
  { key: "restaurant", label: "Restaurant" },
  { key: "room_service", label: "Room Service" },
  { key: "bar_and_lounge", label: "Bar and Lounge" },
  { key: "parking", label: "Parking" },
  { key: "concierge_services", label: "Concierge Services" },
  { key: "pet_friendly", label: "Pet Friendly" },
  { key: "business_facilities", label: "Business Facilities" },
  { key: "laundry_services", label: "Laundry Services" },
  { key: "child_friendly_facilities", label: "Child Friendly Facilities" }
] as const;

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialFilters,
}) => {
  const [selectedAmenities, setSelectedAmenities] = useState<{ [key: string]: boolean }>(initialFilters.amenities);
  const [sortOrder, setSortOrder] = useState(initialFilters.sortOrder);
  const [ratingFilter, setRatingFilter] = useState<number | null>(initialFilters.rating); // Add rating state
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedAmenities(initialFilters.amenities);
    setSortOrder(initialFilters.sortOrder);
    setRatingFilter(initialFilters.rating); // Update from initialFilters
  }, [initialFilters]);

  const handleSave = () => {
    onSave({
      amenities: selectedAmenities,
      sortOrder,
      rating: ratingFilter, // Include rating in saved filters
    });
    onClose();
  };

  const toggleAmenity = (amenityKey: string) => {
    setSelectedAmenities((prev) => ({
      ...prev,
      [amenityKey]: !prev[amenityKey],
    }));
  };

  const handleRatingChange = (rating: number | null) => {
    setRatingFilter(prevRating => prevRating === rating ? null : rating);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      onClose();
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden"; // Prevent scrolling when modal is open
    } else {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = ""; // Re-enable scrolling when modal closes
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = ""; // Ensure scrolling is re-enabled when component unmounts
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-tripswift-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card 
        ref={modalRef} 
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-tripswift-off-white rounded-xl p-6 shadow-lg"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-sm font-tripswift-bold text-tripswift-black">Filters</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="h-6 w-6 text-tripswift-black" />
          </button>
        </div>

        {/* Property Rating Section */}
        <div className="mb-8">
          <h3 className="text-sm font-tripswift-medium mb-4 text-tripswift-black">Property Rating</h3>
          <div className="flex flex-wrap gap-3">
            {[5, 4, 3, 2, 1].map((rating) => (
              <button
                key={`rating-${rating}`}
                onClick={() => handleRatingChange(rating)}
                className={`px-4 py-2 rounded-lg text-sm font-tripswift-medium transition-colors flex items-center gap-1 ${
                  ratingFilter === rating
                    ? "bg-tripswift-blue bg-opacity-10 text-tripswift-blue border border-tripswift-blue hover:bg-opacity-20"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent"
                }`}
                aria-pressed={ratingFilter === rating}
              >
                <div className="flex">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                  {Array.from({ length: 5 - rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-gray-300" />
                  ))}
                </div>
                <span className="ml-1">& Up</span>
              </button>
            ))}
          </div>
        </div>

        {/* Amenities Section */}
        <div className="mb-8">
          <h3 className="text-sm font-tripswift-medium mb-4 text-tripswift-black">Amenities</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {AMENITIES.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => toggleAmenity(key)}
                className={`px-4 py-2 rounded-lg text-sm font-tripswift-medium transition-colors ${
                  selectedAmenities[key]
                    ? "bg-tripswift-blue bg-opacity-10 text-tripswift-blue border border-tripswift-blue hover:bg-opacity-20"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent"
                }`}
                aria-pressed={selectedAmenities[key]}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Order Section */}
        <div className="mb-8">
          <h3 className="text-sm font-tripswift-medium mb-4 text-tripswift-black">Sort By</h3>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-tripswift-blue focus:ring-1 focus:ring-tripswift-blue font-tripswift-regular text-tripswift-black"
            aria-label="Sort order"
          >
            <option value="">Recommended</option>
            <option value="rating_desc">Rating: High to Low</option>
            <option value="rating_asc">Rating: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="price_asc">Price: Low to High</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-tripswift-black font-tripswift-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn-tripswift-primary px-6 py-2.5 rounded-lg"
          >
            Apply Filters
          </button>
        </div>
      </Card>
    </div>
  );
};

export default FilterModal;