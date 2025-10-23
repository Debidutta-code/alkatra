// src/components/reviewSystem/ReviewPagination.tsx
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ReviewPaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalReviews: number;
  onPageChange: (pageNumber: number) => void;
  onItemsPerPageChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const ReviewPagination: React.FC<ReviewPaginationProps> = ({
  currentPage,
  totalPages,
  itemsPerPage,
  totalReviews,
  onPageChange,
  onItemsPerPageChange
}) => {
  const { t } = useTranslation();
  const maxPageButtons = 5;

  const indexOfFirstItem = (currentPage - 1) * itemsPerPage + 1;
  const indexOfLastItem = Math.min(currentPage * itemsPerPage, totalReviews);

  // Page number generation logic
  let startPage = 1;
  let endPage = totalPages;

  if (totalPages > maxPageButtons) {
    const middle = Math.ceil(maxPageButtons / 2);

    if (currentPage <= middle) {
      endPage = maxPageButtons;
    } else if (currentPage >= totalPages - middle + 1) {
      startPage = totalPages - maxPageButtons + 1;
    } else {
      startPage = currentPage - middle + 1;
      endPage = currentPage + middle - 1;
    }

    if (endPage > totalPages) {
      endPage = totalPages;
    }

    if (startPage < 1) {
      startPage = 1;
    }
  }

  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4 bg-tripswift-off-white rounded-lg border border-gray-200 p-2">
      {/* Items per page selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-700 whitespace-nowrap">
          {t('Reviews.show') || 'Show'}
        </span>
        <div className="relative">
          <select
            className="block appearance-none text-sm bg-tripswift-off-white border border-gray-300 hover:border-tripswift-blue rounded-md py-2 pl-3 pr-8 leading-tight focus:outline-none focus:ring-2 focus:ring-tripswift-blue/20 focus:border-tripswift-blue text-gray-700 cursor-pointer"
            value={itemsPerPage}
            onChange={onItemsPerPageChange}
          >
            <option value={5}>5 {t('Reviews.perPage') || 'per page'}</option>
            <option value={10}>10 {t('Reviews.perPage') || 'per page'}</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous Page"
          className={`p-2 rounded-md transition-all duration-200 ${
            currentPage === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-tripswift-off-white border border-gray-300 text-tripswift-blue hover:bg-blue-50 hover:border-tripswift-blue focus:outline-none focus:ring-2 focus:ring-tripswift-blue/20'
          }`}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* First page + ellipsis */}
        {totalPages > maxPageButtons && currentPage > Math.ceil(maxPageButtons / 2) && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="hidden sm:flex w-10 h-10 items-center justify-center rounded-md bg-tripswift-off-white border border-gray-300 text-gray-700 text-sm font-medium hover:border-tripswift-blue hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-tripswift-blue/20 transition-all duration-200"
            >
              1
            </button>
            {currentPage > Math.ceil(maxPageButtons / 2) + 1 && (
              <span className="hidden sm:inline-block px-2 text-gray-500">...</span>
            )}
          </>
        )}

        {/* Page numbers */}
        {pageNumbers.map(number => (
          <button
            key={number}
            onClick={() => onPageChange(number)}
            className={`w-10 h-10 rounded-md text-sm font-medium transition-all duration-200 ${
              currentPage === number
                ? 'bg-tripswift-blue text-tripswift-off-white shadow-md focus:outline-none focus:ring-2 focus:ring-tripswift-blue/50'
                : 'bg-tripswift-off-white border border-gray-300 text-gray-700 hover:border-tripswift-blue hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-tripswift-blue/20'
            } ${number === 5 ? 'hidden md:flex md:items-center md:justify-center' : 'flex items-center justify-center'} ${
              number === 4 ? 'hidden sm:flex sm:items-center sm:justify-center' : ''
            }`}
          >
            {number}
          </button>
        ))}

        {/* Last page + ellipsis */}
        {totalPages > maxPageButtons && currentPage <= totalPages - Math.ceil(maxPageButtons / 2) && (
          <>
            {currentPage < totalPages - Math.ceil(maxPageButtons / 2) && (
              <span className="hidden sm:inline-block px-2 text-gray-500">...</span>
            )}
            <button
              onClick={() => onPageChange(totalPages)}
              className="hidden sm:flex w-10 h-10 items-center justify-center rounded-md bg-tripswift-off-white border border-gray-300 text-gray-700 text-sm font-medium hover:border-tripswift-blue hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-tripswift-blue/20 transition-all duration-200"
            >
              {totalPages}
            </button>
          </>
        )}

        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next Page"
          className={`p-2 rounded-md transition-all duration-200 ${
            currentPage === totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-tripswift-off-white border border-gray-300 text-tripswift-blue hover:bg-blue-50 hover:border-tripswift-blue focus:outline-none focus:ring-2 focus:ring-tripswift-blue/20'
          }`}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Showing results text */}
      <div className="text-sm text-gray-600 whitespace-nowrap">
        {totalReviews > 0
          ? `${t('Reviews.showing') || 'Showing'} ${indexOfFirstItem}-${indexOfLastItem} ${t('Reviews.of') || 'of'} ${totalReviews} ${t('Reviews.reviews') || 'reviews'}`
          : t('Reviews.noReviewsToShow') || 'No reviews to show'}
      </div>
    </div>
  );
};

export default ReviewPagination;