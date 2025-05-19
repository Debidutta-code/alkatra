// LoadingSkeleton.tsx
import React from 'react';

interface LoadingSkeletonProps {
  type?: 'hotel' | 'room';
  count?: number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  type = 'hotel', 
  count = 4 
}) => {
  if (type === 'room') {
    return (
      <div className="space-y-4">
        {[...Array(count)].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse"
          >
            <div className="flex h-[220px]">
              {/* Left side - Image skeleton */}
              <div className="w-1/3 bg-gray-200 relative">
                {/* Discount badge skeleton */}
                <div className="absolute top-3 left-3 h-5 w-20 bg-gray-300 rounded-full" />
              </div>

              {/* Right side - Content skeleton */}
              <div className="w-2/3 p-6 flex flex-col">
                {/* Header section */}
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-3 flex-1">
                    {/* Title */}
                    <div className="h-6 bg-gray-200 rounded w-3/4" />
                    {/* Tags */}
                    <div className="flex gap-2">
                      <div className="h-5 w-24 bg-gray-200 rounded-full" />
                      <div className="h-5 w-28 bg-gray-200 rounded-full" />
                    </div>
                  </div>
                  {/* Star rating */}
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-4 h-4 bg-gray-200 rounded-sm" />
                    ))}
                  </div>
                </div>

                {/* Room details */}
                <div className="flex gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-200 rounded-full" />
                    <div className="h-4 w-20 bg-gray-200 rounded" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-200 rounded-full" />
                    <div className="h-4 w-16 bg-gray-200 rounded" />
                  </div>
                </div>

                {/* Amenities */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-200 rounded-full" />
                      <div className="h-4 flex-1 bg-gray-200 rounded" />
                    </div>
                  ))}
                </div>

                {/* Bottom section */}
                <div className="mt-auto flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-16 bg-gray-200 rounded line-through" />
                      <div className="h-5 w-16 bg-gray-200 rounded-full" />
                    </div>
                    <div className="h-7 w-28 bg-gray-200 rounded" />
                  </div>
                  <div className="flex gap-3">
                    <div className="h-9 w-32 bg-gray-200 rounded-full" />
                    <div className="h-9 w-28 bg-gray-200 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Original hotel listing skeleton
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="sm:w-1/3 h-48 bg-gray-200 rounded-md"></div>
            <div className="sm:w-2/3 space-y-3">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="flex justify-between mt-4">
                <div className="h-8 bg-gray-200 rounded w-24"></div>
                <div className="h-10 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;