import React from 'react';
import { MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface EmptyStateProps {
  resetFilters: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ resetFilters }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-tripswift-off-white rounded-lg shadow-sm p-8 text-center">
      <MapPin className="h-12 w-12 text-tripswift-blue/30 mx-auto mb-4" />
      <h3 className="text-xl font-tripswift-bold text-tripswift-black mb-2">
        {t("HotelListing.EmptyState.noHotelsFound", {
          defaultValue: "No hotels found"
        })}
      </h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto font-tripswift-regular">
        {t("HotelListing.EmptyState.noHotelsDescription", {
          defaultValue: "We couldn't find any hotels matching your criteria. Try adjusting your filters or search terms."
        })}
      </p>
      <button
        onClick={resetFilters}
        className="btn-tripswift-primary px-6 py-2 rounded-md transition-all duration-300 hover:shadow-md"
      >
        {t("HotelListing.EmptyState.clearAllFilters", {
          defaultValue: "Clear all filters"
        })}
      </button>
    </div>
  );
};

export default EmptyState;