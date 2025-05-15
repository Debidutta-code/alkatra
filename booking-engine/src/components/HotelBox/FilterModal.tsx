import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Card } from "@/components/ui/card";

export interface FilterState {
  amenities: { [key: string]: boolean };
  sortOrder: string;
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
  { key: "room_service", label: "Room service" },
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
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedAmenities(initialFilters.amenities);
    setSortOrder(initialFilters.sortOrder);
  }, [initialFilters]);

  const handleSave = () => {
    onSave({
      amenities: selectedAmenities,
      sortOrder,
    });
    onClose();
  };

  const toggleAmenity = (amenityKey: string) => {
    setSelectedAmenities((prev) => ({
      ...prev,
      [amenityKey]: !prev[amenityKey],
    }));
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
    } else {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <Card ref={modalRef} className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Filters</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Amenities Section */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Amenities</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {AMENITIES.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => toggleAmenity(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedAmenities[key]
                    ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
          <h3 className="text-lg font-medium mb-4">Sort By</h3>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            aria-label="Sort order"
          >
            <option value="">Recommended</option>
            <option value="rating_desc">Rating: High to Low</option>
            <option value="rating_asc">Rating: Low to High</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </Card>
    </div>
  );
};

export default FilterModal;