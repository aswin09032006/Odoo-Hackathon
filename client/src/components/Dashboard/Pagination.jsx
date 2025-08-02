/**
 * @file components/Dashboard/Pagination.jsx
 * @description Component for handling pagination controls.
 */

import React from 'react';
import Button from '../Common/Button';
import clsx from 'clsx'; // Import clsx

/**
 * Pagination component displays navigation buttons for pages.
 * @param {Object} props - Component props.
 * @param {number} props.currentPage - The current active page number.
 * @param {number} props.totalPages - The total number of pages available.
 * @param {Function} props.onPageChange - Callback function when page changes.
 */
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  // Logic to show a limited number of page numbers around the current page
  const maxPagesToShow = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  // Ensure totalPages is at least 1, even if no tickets
  const safeTotalPages = Math.max(1, totalPages);

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex justify-center items-center space-x-2 mt-10 text-sm"> {/* Increased margin, reduced font size */}
      {/* Previous button */}
      <Button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        // Styled as an outline button, with subtle disabled state
        className="border border-gray-300 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
      >
        Prev
      </Button>

      {/* Page numbers */}
      {startPage > 1 && (
        <>
          <Button onClick={() => onPageChange(1)} className="border border-gray-300 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-100">1</Button>
          {startPage > 2 && <span className="text-gray-600 px-1">...</span>} {/* Added horizontal padding */}
        </>
      )}

      {pages.map((page) => (
        <Button
          key={page}
          onClick={() => onPageChange(page)}
          className={clsx(
            "px-3 py-1 rounded-md transition-colors duration-200", // Added transition
            // Active page: blue background, white text
            currentPage === page ? 'bg-[#504ee2] text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
          )}
        >
          {page}
        </Button>
      ))}

      {endPage < safeTotalPages && (
        <>
          {endPage < safeTotalPages - 1 && <span className="text-gray-600 px-1">...</span>} {/* Added horizontal padding */}
          <Button onClick={() => onPageChange(safeTotalPages)} className="border border-gray-300 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-100">{safeTotalPages}</Button>
        </>
      )}

      {/* Next button */}
      <Button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === safeTotalPages || safeTotalPages === 0}
        // Styled as an outline button, with subtle disabled state
        className="border border-gray-300 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
      >
        Next
      </Button>
    </div>
  );
};

export default Pagination;