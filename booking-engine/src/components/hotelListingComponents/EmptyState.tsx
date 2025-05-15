import React from 'react';
import { MapPin } from 'lucide-react';

interface EmptyStateProps {
  resetFilters: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ resetFilters }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
      <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-700 mb-2">No hotels found</h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        We couldn't find any hotels matching your criteria. Try adjusting your filters or search terms.
      </p>
      <button
        onClick={resetFilters}
        className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        Clear all filters
      </button>
    </div>
  );
};

export default EmptyState;