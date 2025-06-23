import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalResults: number;
  resultsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  showResultsInfo?: boolean;
  compact?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalResults,
  resultsPerPage,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
  isLoading = false,
  showResultsInfo = true,
  compact = false
}) => {
  // Calculate the range of items being displayed
  const startItem = (currentPage - 1) * resultsPerPage + 1;
  const endItem = Math.min(currentPage * resultsPerPage, totalResults);

  // Generate page numbers to display with smart truncation
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const delta = compact ? 1 : 2;
    const range = [];
    const left = Math.max(1, currentPage - delta);
    const right = Math.min(totalPages, currentPage + delta);

    // Always show first page
    if (left > 1) {
      range.push(1);
      if (left > 2) {
        range.push('...');
      }
    }

    // Add current range
    for (let i = left; i <= right; i++) {
      range.push(i);
    }

    // Always show last page
    if (right < totalPages) {
      if (right < totalPages - 1) {
        range.push('...');
      }
      range.push(totalPages);
    }

    return range;
  };

  const pageNumbers = getPageNumbers();

  // Loading skeleton for page numbers
  const LoadingSkeleton = () => (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"
        />
      ))}
    </div>
  );

  // Navigation button component
  const NavButton: React.FC<{
    onClick: () => void;
    disabled: boolean;
    icon: React.ReactNode;
    label: string;
    position?: 'first' | 'last' | 'prev' | 'next';
  }> = ({ onClick, disabled, icon, label, position }) => (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        group relative p-2.5 rounded-lg border transition-all duration-200 ease-in-out
        ${disabled || isLoading
          ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50'
          : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-800 hover:bg-gray-50 active:bg-gray-100'
        }
        ${position === 'first' || position === 'last' ? 'hidden sm:flex' : ''}
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
      `}
      aria-label={label}
      title={label}
    >
      <span className={`transition-transform duration-200 ${!disabled && !isLoading ? 'group-hover:scale-110' : ''}`}>
        {icon}
      </span>
    </button>
  );

  // Page number button component
  const PageButton: React.FC<{
    pageNumber: number | string;
    isActive: boolean;
    onClick: () => void;
  }> = ({ pageNumber, isActive, onClick }) => {
    if (pageNumber === '...') {
      return (
        <div className="flex items-center justify-center w-10 h-10 text-gray-400">
          <MoreHorizontal size={16} />
        </div>
      );
    }

    return (
      <button
        onClick={onClick}
        disabled={isLoading}
        className={`
          relative w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${isActive
            ? 'bg-blue-600 text-white shadow-md border border-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5'
            : 'text-gray-700 border border-gray-300 hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100'
          }
          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {pageNumber}
        {isActive && (
          <div className="absolute inset-0 rounded-lg bg-blue-600 opacity-20 animate-pulse" />
        )}
      </button>
    );
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={`
      flex ${compact ? 'flex-row' : 'flex-col sm:flex-row'} 
      items-center justify-between gap-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm
      ${isLoading ? 'animate-pulse' : ''}
    `}>
      {/* Results info */}
      {showResultsInfo && !compact && (
        <div className="text-sm text-gray-600 font-medium">
          {isLoading ? (
            <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
          ) : (
            <span>
              Showing <span className="text-gray-900 font-semibold">{startItem.toLocaleString()}</span> to{' '}
              <span className="text-gray-900 font-semibold">{endItem.toLocaleString()}</span> of{' '}
              <span className="text-gray-900 font-semibold">{totalResults.toLocaleString()}</span> results
            </span>
          )}
        </div>
      )}

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        {/* First page button */}
        <NavButton
          onClick={() => onPageChange(1)}
          disabled={!hasPreviousPage}
          icon={<ChevronsLeft size={16} />}
          label="Go to first page"
          position="first"
        />

        {/* Previous page button */}
        <NavButton
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPreviousPage}
          icon={<ChevronLeft size={16} />}
          label="Go to previous page"
          position="prev"
        />

        {/* Page numbers */}
        <div className="flex items-center gap-1 mx-2">
          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            pageNumbers.map((pageNum, index) => (
              <PageButton
                key={`${pageNum}-${index}`}
                pageNumber={pageNum}
                isActive={pageNum === currentPage}
                onClick={() => typeof pageNum === 'number' && onPageChange(pageNum)}
              />
            ))
          )}
        </div>

        {/* Next page button */}
        <NavButton
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
          icon={<ChevronRight size={16} />}
          label="Go to next page"
          position="next"
        />

        {/* Last page button */}
        <NavButton
          onClick={() => onPageChange(totalPages)}
          disabled={!hasNextPage}
          icon={<ChevronsRight size={16} />}
          label="Go to last page"
          position="last"
        />
      </div>

      {/* Mobile-friendly page info */}
      {compact && (
        <div className="text-xs text-gray-500 sm:hidden">
          Page {currentPage} of {totalPages}
        </div>
      )}
    </div>
  );
};

export default Pagination;