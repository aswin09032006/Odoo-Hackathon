/**
 * @file components/Dashboard/Pagination.jsx
 * @description Component for handling pagination controls.
 */

import React from 'react';
import Button from '../Common/Button';

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

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex justify-center items-center space-x-2 mt-8">
      {/* Previous button */}
      <Button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1 rounded"
      >
        Prev
      </Button>

      {/* Page numbers */}
      {startPage > 1 && (
        <>
          <Button onClick={() => onPageChange(1)} className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1 rounded">1</Button>
          {startPage > 2 && <span className="text-gray-600">...</span>}
        </>
      )}

      {pages.map((page) => (
        <Button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1 rounded ${currentPage === page ? 'bg-blue-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'}`}
        >
          {page}
        </Button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="text-gray-600">...</span>}
          <Button onClick={() => onPageChange(totalPages)} className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1 rounded">{totalPages}</Button>
        </>
      )}

      {/* Next button */}
      <Button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || totalPages === 0}
        className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1 rounded"
      >
        Next
      </Button>
    </div>
  );
};

export default Pagination;