import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalResults: number;
  resultsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  showResultsInfo?: boolean;
  pageSizeOptions?: number[];
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalResults,
  resultsPerPage,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
  onPageSizeChange,
  showResultsInfo = true,
  pageSizeOptions = [5, 10, 20]
}) => {
  const startItem = (currentPage - 1) * resultsPerPage + 1;
  const endItem = Math.min(currentPage * resultsPerPage, totalResults);

  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 7;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    // Always show first page
    pages.push(1);

    if (currentPage > 3) {
      pages.push('...');
    }

    // Show pages around current page
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i);
      }
    }

    if (currentPage < totalPages - 2) {
      pages.push('...');
    }

    // Always show last page (if more than 1 page)
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  const PageButton: React.FC<{
    page: number | string;
    isActive?: boolean;
    onClick?: () => void;
  }> = ({ page, isActive = false, onClick }) => {
    if (page === '...') {
      return (
        <span className="px-3 py-2 text-gray-400 text-sm">
          ...
        </span>
      );
    }

    return (
      <button
        onClick={onClick}
        className={`
          px-3 py-2 text-sm font-medium rounded transition-colors duration-200 min-w-[32px] h-8 flex items-center justify-center
          ${isActive
            ? 'bg-tripswift-blue text-white'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
          }
        `}
      >
        {page}
      </button>
    );
  };

  // Don't show pagination if there's only one page or no results
  if (totalPages <= 1) {
    return showResultsInfo && totalResults > 0 ? (
      <div className="flex items-center justify-between py-4 px-4">
        {onPageSizeChange && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">Show</span>
            <select
              value={resultsPerPage}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-tripswift-blue focus:border-tripswift-blue"
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>
                  {size} per page
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="text-sm text-gray-700">
          Showing {startItem}-{endItem} of {totalResults} results
        </div>
      </div>
    ) : null;
  }

  return (
    <div className="flex items-center justify-between py-4 px-5">
      {/* Page size selector - Left side */}
      {onPageSizeChange && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">Show</span>
          <select
            value={resultsPerPage}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>
                {size} per page
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Pagination controls - Center */}
      <div className="flex items-center space-x-1">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPreviousPage}
          className={`
            p-2 rounded transition-colors duration-200 flex items-center justify-center
            ${!hasPreviousPage
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-100'
            }
          `}
          title="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Page numbers */}
        <div className="flex items-center space-x-1">
          {visiblePages.map((page, index) => (
            <PageButton
              key={`${page}-${index}`}
              page={page}
              isActive={page === currentPage}
              onClick={typeof page === 'number' ? () => onPageChange(page) : undefined}
            />
          ))}
        </div>

        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
          className={`
            p-2 rounded transition-colors duration-200 flex items-center justify-center
            ${!hasNextPage
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-100'
            }
          `}
          title="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Results info - Right side */}
      {showResultsInfo && (
        <div className="text-sm text-gray-700">
          Showing {startItem}-{endItem} of {totalResults} results
        </div>
      )}
    </div>
  );
};

export default Pagination;