// LoadingSkeleton.tsx
import React from 'react';

interface LoadingSkeletonProps {
  type?: 'hotel' | 'room' | 'property';
  count?: number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  type = 'hotel',
  count = 4
}) => {
  if (type === 'property') {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
        {/* Header section */}
        <div className="bg-gray-50 p-4">
          <div className="flex justify-between items-center">
            <div className="flex-1 space-y-2">
              <div className="h-7 bg-gray-200 rounded w-2/3" />
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-200 rounded-full" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
            </div>
            <div className="w-5 h-5 bg-gray-200 rounded-full" />
          </div>
        </div>

        {/* Content section */}
        <div className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Image gallery section - 2 columns */}
            <div className="lg:col-span-2 space-y-3">
              {/* Main image skeleton */}
              <div className="relative bg-gray-200 rounded-xl overflow-hidden p-1.5">
                <div className="h-[280px] bg-gray-300 rounded-xl relative">
                  {/* Navigation buttons */}
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-gray-300 rounded-full" />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-gray-300 rounded-full" />
                  {/* Counter */}
                  <div className="absolute bottom-4 right-4 h-6 w-16 bg-gray-300 rounded-full" />
                  {/* View all photos button */}
                  <div className="absolute top-4 right-4 h-8 w-28 bg-gray-300 rounded-full" />
                </div>
              </div>

              {/* Thumbnail skeleton */}
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-xl flex-shrink-0" />
                ))}
              </div>

              {/* Property amenities skeleton */}
              <div className="space-y-3">
                <div className="h-6 bg-gray-200 rounded w-48" />
                <div className="flex flex-wrap gap-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded-md">
                      <div className="w-4 h-4 bg-gray-200 rounded-full" />
                      <div className="h-4 w-16 bg-gray-200 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar section - 1 column */}
            <div className="lg:col-span-1 space-y-4">
              {/* QR Code section */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="w-32 h-32 bg-gray-200 rounded-lg mx-auto" />
              </div>

              {/* Description section */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2">
                <div className="h-6 bg-gray-200 rounded w-40" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-16 mt-2" />
                </div>
              </div>

              {/* Contact information */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-36" />
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-gray-200 rounded-full flex-shrink-0" />
                      <div className="h-4 bg-gray-200 rounded flex-1" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'room') {
    return (
      <div className="space-y-3.5">
        {[...Array(count)].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-100/50 overflow-hidden group hover:shadow-md transition-all duration-300"
          >
            <div className="flex flex-col md:flex-row min-h-[280px] md:h-[240px]">
              {/* Left side - Image skeleton with enhanced animations */}
              <div className="w-full md:w-1/3 bg-gradient-to-br from-gray-200 to-gray-250 relative overflow-hidden">
                {/* Shimmer effect overlay */}
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                {/* Multiple image placeholders */}
                <div className="absolute inset-2 bg-gray-300 rounded-lg opacity-90"></div>
                <div className="absolute inset-3 bg-gray-250 rounded-lg opacity-70"></div>

                {/* Availability badge skeleton */}
                <div className="absolute top-3 left-3 h-6 w-24 bg-green-200 rounded-full animate-pulse"></div>

                {/* Image counter skeleton */}
                <div className="absolute bottom-3 right-3 h-5 w-12 bg-black/20 rounded-full backdrop-blur-sm"></div>

                {/* View images button skeleton */}
                <div className="absolute top-3 right-3 h-7 w-20 bg-white/80 rounded-full backdrop-blur-sm"></div>
              </div>

              {/* Right side - Enhanced content skeleton */}
              <div className="w-full md:w-2/3 p-4 md:p-6 flex flex-col space-y-4">
                {/* Header section with staggered animations */}
                <div className="flex justify-between items-start">
                  <div className="space-y-3 flex-1 pr-4">
                    {/* Room name - varied widths for realism */}
                    <div className="space-y-2">
                      <div className="h-7 bg-gradient-to-r from-gray-200 to-gray-250 rounded-lg w-5/6 animate-pulse"></div>
                      <div className="h-4 bg-gradient-to-r from-gray-150 to-gray-200 rounded w-2/3 animate-pulse delay-75"></div>
                    </div>

                    {/* Room type tags */}
                    <div className="flex gap-2 flex-wrap">
                      <div className="h-6 w-20 bg-blue-100 rounded-full animate-pulse delay-100"></div>
                      <div className="h-6 w-24 bg-purple-100 rounded-full animate-pulse delay-150"></div>
                      <div className="h-6 w-16 bg-green-100 rounded-full animate-pulse delay-200"></div>
                    </div>
                  </div>

                  {/* Room size and occupancy info */}
                  <div className="text-right space-y-2 flex-shrink-0">
                    <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-12 bg-gray-150 rounded animate-pulse delay-75"></div>
                  </div>
                </div>

                {/* Room features with icons */}
                <div className="flex flex-wrap gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-2 animate-pulse" style={{ animationDelay: `${i * 100}ms` }}>
                      <div className="w-4 h-4 bg-tripswift-blue/20 rounded-full"></div>
                      <div className="h-4 w-16 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>

                {/* Enhanced amenities grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center gap-2.5 p-2 bg-gray-50/50 rounded-lg animate-pulse" style={{ animationDelay: `${i * 75}ms` }}>
                      <div className="w-4 h-4 bg-tripswift-blue/30 rounded-full flex-shrink-0"></div>
                      <div className={`h-3.5 bg-gray-200 rounded ${i % 3 === 0 ? 'w-full' : i % 3 === 1 ? 'w-3/4' : 'w-2/3'}`}></div>
                    </div>
                  ))}
                </div>

                {/* Enhanced bottom section with better pricing layout */}
                <div className="mt-auto pt-4 border-t border-gray-100">
                  <div className="flex items-end justify-between">
                    {/* Pricing section */}
                    <div className="space-y-2">
                      {/* Original price with strikethrough */}
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-20 bg-gray-300 rounded relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                        </div>
                        <div className="h-5 w-12 bg-red-200 rounded-full animate-pulse"></div>
                      </div>

                      {/* Current price */}
                      <div className="flex items-baseline gap-2">
                        <div className="h-8 w-16 bg-gradient-to-r from-tripswift-blue/20 to-tripswift-blue/30 rounded-lg animate-pulse"></div>
                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse delay-100"></div>
                      </div>

                      {/* Per night text */}
                      <div className="h-3 w-16 bg-gray-150 rounded animate-pulse delay-150"></div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3">
                      <div className="h-10 w-28 bg-gray-200 rounded-lg animate-pulse delay-200"></div>
                      <div className="h-10 w-24 bg-gradient-to-r from-tripswift-blue/20 to-tripswift-blue/30 rounded-lg animate-pulse delay-300"></div>
                    </div>
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