import React from 'react';
import { MapPin } from 'lucide-react';

interface EmptyStateProps {
  resetFilters: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ resetFilters }) => {
  return (
    <div className="bg-tripswift-off-white rounded-lg shadow-sm p-8 text-center">
      <MapPin className="h-12 w-12 text-tripswift-blue/30 mx-auto mb-4" />
      <h3 className="text-xl font-tripswift-bold text-tripswift-black mb-2">No hotels found</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto font-tripswift-regular">
        We couldn't find any hotels matching your criteria. Try adjusting your filters or search terms.
      </p>
      <button
        onClick={resetFilters}
        className="btn-tripswift-primary px-6 py-2 rounded-md"
      >
        Clear all filters
      </button>
    </div>
  );
};

export default EmptyState;