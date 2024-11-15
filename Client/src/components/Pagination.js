import React from 'react';

function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="mt-4">
      <ul className="flex space-x-2">
        {pages.map(page => (
          <li key={page}>
            <button
              onClick={() => onPageChange(page)}
              className={`px-4 py-2 rounded-lg ${page === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
            >
              {page}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Pagination;
