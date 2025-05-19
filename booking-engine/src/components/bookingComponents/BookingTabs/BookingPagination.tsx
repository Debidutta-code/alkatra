import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface BookingPaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalBookings: number;
  onPageChange: (pageNumber: number) => void;
  onItemsPerPageChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const BookingPagination: React.FC<BookingPaginationProps> = ({
  currentPage,
  totalPages,
  itemsPerPage,
  totalBookings,
  onPageChange,
  onItemsPerPageChange
}) => {
  const maxPageButtons = 5;
  
  // Calculate indexes for display text
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage + 1;
  const indexOfLastItem = Math.min(currentPage * itemsPerPage, totalBookings);
  
  // Generate page numbers for pagination
  const pageNumbers = [];
  let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

  // Adjust if we're near the end
  if (endPage - startPage + 1 < maxPageButtons) {
    startPage = Math.max(1, endPage - maxPageButtons + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="mt-8 flex flex-col sm:flex-row justify-between items-center bg-white rounded-lg shadow-sm p-4">
      <div className="mb-4 sm:mb-0 flex items-center">
        <span className="text-sm text-gray-500 mr-3">Show:</span>
        <select
          className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-tripswift-blue/20 focus:border-tripswift-blue"
          value={itemsPerPage}
          onChange={onItemsPerPageChange}
        >
          <option value={6}>6 per page</option>
          <option value={9}>9 per page</option>
          <option value={12}>12 per page</option>
        </select>
      </div>

      <div className="flex items-center">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-2 rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white border border-tripswift-blue/30 text-tripswift-blue hover:bg-tripswift-blue/5'}`}
        >
          <FaChevronLeft size={14} />
        </button>

        {totalPages > maxPageButtons && currentPage > 2 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="w-9 h-9 mx-1 rounded-md bg-white border border-gray-200 text-gray-700 hover:border-tripswift-blue/30 hover:bg-tripswift-blue/5"
            >
              1
            </button>
            {currentPage > 3 && (
              <span className="px-2 text-gray-500">...</span>
            )}
          </>
        )}

        {pageNumbers.map(number => (
          <button
            key={number}
            onClick={() => onPageChange(number)}
            className={`w-9 h-9 mx-1 rounded-md ${currentPage === number 
              ? 'bg-tripswift-blue text-tripswift-off-white' 
              : 'bg-white border border-gray-200 text-gray-700 hover:border-tripswift-blue/30 hover:bg-tripswift-blue/5'}`}
          >
            {number}
          </button>
        ))}

        {totalPages > maxPageButtons && currentPage < totalPages - 1 && (
          <>
            {currentPage < totalPages - 2 && (
              <span className="px-2 text-gray-500">...</span>
            )}
            <button
              onClick={() => onPageChange(totalPages)}
              className="w-9 h-9 mx-1 rounded-md bg-white border border-gray-200 text-gray-700 hover:border-tripswift-blue/30 hover:bg-tripswift-blue/5"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-md ${currentPage === totalPages 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-white border border-tripswift-blue/30 text-tripswift-blue hover:bg-tripswift-blue/5'}`}
        >
          <FaChevronRight size={14} />
        </button>
      </div>

      <div className="mt-4 sm:mt-0 text-sm text-gray-600 hidden sm:block">
        {totalBookings > 0
          ? `Showing ${indexOfFirstItem}-${indexOfLastItem} of ${totalBookings} bookings`
          : 'No bookings to show'}
      </div>
    </div>
  );
};

export default BookingPagination;