/**
 * @file components/Common/LoadingSpinner.jsx
 * @description A simple loading spinner component.
 */

import React from 'react';
import clsx from 'clsx'; // Import clsx

/**
 * A simple animated loading spinner.
 * @param {Object} props - Component props.
 * @param {string} [props.size='md'] - Size of the spinner ('sm', 'md', 'lg').
 * @param {string} [props.color='blue'] - Color of the spinner ('blue', 'white', etc.).
 */
const LoadingSpinner = ({ size = 'md', color = 'blue' }) => {
  const spinnerSizeClass = {
    'sm': 'w-4 h-4',
    'md': 'w-6 h-6',
    'lg': 'w-8 h-8',
  }[size];

  const spinnerColorClass = {
    'blue': 'border-blue-500',
    'white': 'border-white',
    'gray': 'border-gray-500',
  }[color];

  return (
    <div className={clsx(
      "inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]",
      spinnerSizeClass,
      spinnerColorClass
    )} role="status">
      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;