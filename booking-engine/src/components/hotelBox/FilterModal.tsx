"use client";
import React, { useEffect, useRef, useState } from "react";
import { X, Star } from "lucide-react";
import { Card } from "../../components/ui/card";
import { useTranslation } from "react-i18next";

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
  { key: "wifi", labelKey: "wifi" },
  { key: "swimming_pool", labelKey: "swimming_pool" },
  { key: "fitness_center", labelKey: "fitness_center" },
  { key: "spa_and_wellness", labelKey: "spa_and_wellness" },
  { key: "restaurant", labelKey: "restaurant" },
  { key: "room_service", labelKey: "room_service" },
  { key: "bar_and_lounge", labelKey: "bar_and_lounge" },
  { key: "parking", labelKey: "parking" },
  { key: "concierge_services", labelKey: "concierge_services" },
  { key: "pet_friendly", labelKey: "pet_friendly" },
  { key: "business_facilities", labelKey: "business_facilities" },
  { key: "laundry_services", labelKey: "laundry_services" },
  { key: "child_friendly_facilities", labelKey: "child_friendly_facilities" },
  { key: "non_smoking_rooms", labelKey: "non_smoking_rooms" },
  { key: "facilities_for_disabled_guests", labelKey: "facilities_for_disabled_guests" },
  { key: "family_rooms", labelKey: "family_rooms" },
] as const;

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialFilters,
}) => {
  const [selectedAmenities, setSelectedAmenities] = useState<{ [key: string]: boolean }>(initialFilters.amenities);
  const [sortOrder, setSortOrder] = useState(initialFilters.sortOrder);
  const [ratingFilter, setRatingFilter] = useState<number | null>(initialFilters.rating);
  const modalRef = useRef<HTMLDivElement>(null);

  const { t, ready } = useTranslation();

  useEffect(() => {
    setSelectedAmenities(initialFilters.amenities);
    setSortOrder(initialFilters.sortOrder);
    setRatingFilter(initialFilters.rating);
  }, [initialFilters]);

  const handleSave = () => {
    onSave({
      amenities: selectedAmenities,
      sortOrder,
      rating: ratingFilter,
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
    setRatingFilter((prevRating) => (prevRating === rating ? null : rating));
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
      document.body.style.overflow = "hidden";
    } else {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!ready) {
    return <div>Loading translations...</div>;
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-tripswift-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card
        ref={modalRef}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-tripswift-off-white rounded-xl p-6 shadow-lg"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-sm font-tripswift-bold text-tripswift-black">
            {t("HotelBox.FilterModal.title", { defaultValue: "Filters" })}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label={t("HotelBox.FilterModal.ariaCloseModal", { defaultValue: "Close modal" })}
          >
            <X className="h-6 w-6 text-tripswift-black" />
          </button>
        </div>

        <div className="mb-8">
          <h3 className="text-sm font-tripswift-medium mb-4 text-tripswift-black">
            {t("HotelBox.FilterModal.propertyRating", { defaultValue: "Property Rating" })}
          </h3>
          <div className="flex flex-wrap gap-3">
            {[5, 4, 3, 2, 1].map((rating) => (
              <button
                key={`rating-${rating}`}
                onClick={() => handleRatingChange(rating)}
                className={`px-4 py-2 rounded-lg text-sm font-tripswift-medium transition-colors flex items-center gap-1 ${ratingFilter === rating
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
                <span className="ml-1">
                  {t("HotelBox.FilterModal.ratingUp", { defaultValue: "& Up" })}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-sm font-tripswift-medium mb-4 text-tripswift-black">
            {t("HotelBox.FilterModal.amenities", { defaultValue: "Amenities" })}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {AMENITIES.map(({ key, labelKey }) => (
              <button
                key={key}
                onClick={() => toggleAmenity(key)}
                className={`px-4 py-2 rounded-lg text-sm font-tripswift-medium transition-colors ${selectedAmenities[key]
                    ? "bg-tripswift-blue bg-opacity-10 text-tripswift-blue border border-tripswift-blue hover:bg-opacity-20"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent"
                  }`}
                aria-pressed={selectedAmenities[key]}
              >
                {t(`HotelBox.FilterModal.amenitiesList.${labelKey}`, { defaultValue: labelKey })}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-sm font-tripswift-medium mb-4 text-tripswift-black">
            {t("HotelBox.FilterModal.sortBy", { defaultValue: "Sort By" })}
          </h3>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-tripswift-blue focus:ring-1 focus:ring-tripswift-blue font-tripswift-regular text-tripswift-black"
            aria-label={t("HotelBox.FilterModal.ariaSortOrder", { defaultValue: "Sort order" })}
          >
            <option value="">
              {t("HotelBox.FilterModal.sortOptions.recommended", { defaultValue: "Recommended" })}
            </option>
            <option value="rating_desc">
              {t("HotelBox.FilterModal.sortOptions.rating_desc", { defaultValue: "Rating: High to Low" })}
            </option>
            <option value="rating_asc">
              {t("HotelBox.FilterModal.sortOptions.rating_asc", { defaultValue: "Rating: Low to High" })}
            </option>
            <option value="price_desc">
              {t("HotelBox.FilterModal.sortOptions.price_desc", { defaultValue: "Price: High to Low" })}
            </option>
            <option value="price_asc">
              {t("HotelBox.FilterModal.sortOptions.price_asc", { defaultValue: "Price: Low to High" })}
            </option>
          </select>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-tripswift-black font-tripswift-medium hover:bg-gray-50 transition-colors"
          >
            {t("HotelBox.FilterModal.cancel", { defaultValue: "Cancel" })}
          </button>
          <button
            onClick={handleSave}
            className="btn-tripswift-primary px-6 py-2.5 rounded-lg"
          >
            {t("HotelBox.FilterModal.applyFilters", { defaultValue: "Apply Filters" })}
          </button>
        </div>
      </Card>
    </div>
  );
};

export default FilterModal;