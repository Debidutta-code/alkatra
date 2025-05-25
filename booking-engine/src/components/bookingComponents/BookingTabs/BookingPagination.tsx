import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const maxPageButtons = 5;

  const indexOfFirstItem = (currentPage - 1) * itemsPerPage + 1;
  const indexOfLastItem = Math.min(currentPage * itemsPerPage, totalBookings);

  // Corrected page number generation logic
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
    <div className="mt-8 flex flex-col sm:flex-row justify-between items-center bg-white rounded-lg shadow-md p-4">
      <div className="mb-2 sm:mb-0 flex items-center space-x-2">
        <span className="text-sm text-gray-700">{t('BookingTabs.BookingPagination.show')}</span>
        <div className="relative">
          <select
            className="block appearance-none w-full text-sm bg-white border border-gray-300 hover:border-tripswift-blue rounded-md py-2 px-4 pr-6 leading-tight focus:outline-none focus:ring-2 focus:ring-tripswift-blue/20 focus:border-tripswift-blue text-gray-700"
            value={itemsPerPage}
            onChange={onItemsPerPageChange}
          >
            <option value={6}>{`${6} ${t('BookingTabs.BookingPagination.perPage')}`}</option>
            <option value={9}>{`${9} ${t('BookingTabs.BookingPagination.perPage')}`}</option>
            <option value={12}>{`${12} ${t('BookingTabs.BookingPagination.perPage')}`}</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
          </div>
        </div>
      </div>

      <div className="flex text-sm items-center space-x-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous Page"
          className={`px-3 py-2 rounded-md ${currentPage === 1
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white border border-gray-300 text-tripswift-blue hover:bg-tripswift-blue/10 focus:outline-none focus:ring-2 focus:ring-tripswift-blue/20'}`}
        >
          <FaChevronLeft size={14} />
        </button>

        {totalPages > maxPageButtons && currentPage > Math.ceil(maxPageButtons / 2) && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="w-9 h-9 rounded-md bg-white border border-gray-300 text-gray-700 hover:border-tripswift-blue/30 hover:bg-tripswift-blue/5 focus:outline-none focus:ring-2 focus:ring-tripswift-blue/20"
            >
              1
            </button>
            {currentPage > Math.ceil(maxPageButtons / 2) + 1 && (
              <span className="px-2 text-gray-500">...</span>
            )}
          </>
        )}

        {pageNumbers.map(number => (
          <button
            key={number}
            onClick={() => onPageChange(number)}
            className={`w-9 h-9 rounded-md ${currentPage === number
              ? 'bg-tripswift-blue text-white focus:outline-none focus:ring-2 focus:ring-tripswift-blue/50'
              : 'bg-white border border-gray-300 text-gray-700 hover:border-tripswift-blue/30 hover:bg-tripswift-blue/5 focus:outline-none focus:ring-2 focus:ring-tripswift-blue/20'}`}
          >
            {number}
          </button>
        ))}

        {totalPages > maxPageButtons && currentPage <= totalPages - Math.ceil(maxPageButtons / 2) && (
          <>
            {currentPage < totalPages - Math.ceil(maxPageButtons / 2) && (
              <span className="px-2 text-gray-500">...</span>
            )}
            <button
              onClick={() => onPageChange(totalPages)}
              className="w-9 h-9 rounded-md bg-white border border-gray-300 text-gray-700 hover:border-tripswift-blue/30 hover:bg-tripswift-blue/5 focus:outline-none focus:ring-2 focus:ring-tripswift-blue/20"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next Page"
          className={`px-3 py-2 rounded-md ${currentPage === totalPages
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white border border-gray-300 text-tripswift-blue hover:bg-tripswift-blue/10 focus:outline-none focus:ring-2 focus:ring-tripswift-blue/20'}`}
        >
          <FaChevronRight size={14} />
        </button>
      </div>

      <div className="mt-4 sm:mt-0 text-sm text-gray-600">
        {totalBookings > 0
          ? `${t('BookingTabs.BookingPagination.showing')} ${indexOfFirstItem}-${indexOfLastItem} ${t('BookingTabs.BookingPagination.of')} ${totalBookings} ${t('BookingTabs.BookingPagination.bookings')}`
          : t('BookingTabs.BookingPagination.noBookingsToShow')}
      </div>
    </div>
  );
};

export default BookingPagination;