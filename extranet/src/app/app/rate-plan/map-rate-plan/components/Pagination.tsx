import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal
} from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalResults: number;
  resultsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (page: number) => void;
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
  showResultsInfo = true,
  compact = false
}) => {
  const startItem = (currentPage - 1) * resultsPerPage + 1;
  const endItem = Math.min(currentPage * resultsPerPage, totalResults);

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getPageNumbers = () => {
    const numbers: (number | string)[] = [];

    if (windowWidth < 800) {
      numbers.push(currentPage);
      return numbers;
    }

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) numbers.push(i);
      return numbers;
    }

    if (currentPage <= 2) {
      numbers.push(1, currentPage === 2 ? 2 : '...', '...', totalPages);
    } else if (currentPage >= totalPages - 1) {
      numbers.push(1, '...', currentPage === totalPages - 1 ? totalPages - 1 : '...', totalPages);
    } else {
      numbers.push(1, '...', currentPage, '...', totalPages);
    }

    return numbers;
  };

  const pageNumbers = getPageNumbers();

  const NavButton: React.FC<{
    onClick: () => void;
    disabled: boolean;
    icon: React.ReactNode;
    label: string;
    position?: 'first' | 'last' | 'prev' | 'next';
  }> = ({ onClick, disabled, icon, label, position }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        group relative p-2.5 rounded-lg border transition-all duration-200 ease-in-out
        ${disabled
          ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50'
          : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-800 hover:bg-gray-50 active:bg-gray-100'}
        ${position === 'first' || position === 'last' ? 'flex' : ''}
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
      `}
      aria-label={label}
      title={label}
    >
      <span className="transition-transform duration-200 group-hover:scale-110">
        {icon}
      </span>
    </button>
  );

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
        type="button"
        onClick={onClick}
        className={`
          relative w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${isActive
            ? 'bg-blue-600 text-white shadow-md border border-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5'
            : 'text-gray-700 border border-gray-300 hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100'}
        `}
      >
        {pageNumber}
      </button>
    );
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div
      className={`
        flex ${compact ? 'flex-row' : 'flex-col sm:flex-row'} 
        items-center justify-between gap-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm
      `}
    >
      {showResultsInfo && !compact && (
        <div className="text-sm text-gray-600 font-medium">
          <span>
            Showing <span className="text-gray-900 font-semibold">{startItem.toLocaleString()}</span> to{' '}
            <span className="text-gray-900 font-semibold">{endItem.toLocaleString()}</span> of{' '}
            <span className="text-gray-900 font-semibold">{totalResults.toLocaleString()}</span> results
          </span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <NavButton
          onClick={() => onPageChange(1)}
          disabled={!hasPreviousPage}
          icon={<ChevronsLeft size={16} />}
          label="Go to first page"
          position="first"
        />
        <NavButton
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPreviousPage}
          icon={<ChevronLeft size={16} />}
          label="Go to previous page"
          position="prev"
        />
        <div className="flex items-center gap-1.5">
          {pageNumbers.map((pageNum, index) => (
            <PageButton
              key={`${pageNum}-${index}`}
              pageNumber={pageNum}
              isActive={pageNum === currentPage}
              onClick={() => typeof pageNum === 'number' && onPageChange(pageNum)}
            />
          ))}
        </div>
        <NavButton
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
          icon={<ChevronRight size={16} />}
          label="Go to next page"
          position="next"
        />
        <NavButton
          onClick={() => onPageChange(totalPages)}
          disabled={!hasNextPage}
          icon={<ChevronsRight size={16} />}
          label="Go to last page"
          position="last"
        />
      </div>

      {compact && (
        <div className="text-xs text-gray-500 sm:hidden">
          Page {currentPage} of {totalPages}
        </div>
      )}
    </div>
  );
};

export default Pagination;
