/**
 * @file components/Common/Button.jsx
 * @description Reusable Button component with consistent styling.
 */

import React from 'react';
import clsx from 'clsx'; // Import clsx

/**
 * A reusable button component.
 * @param {Object} props - Component props.
 * @param {string} [props.type='button'] - The type of button (e.g., 'submit', 'button').
 * @param {Function} [props.onClick] - Click handler function.
 * @param {boolean} [props.disabled=false] - Whether the button is disabled.
 * @param {string} [props.className] - Additional CSS classes to apply.
 * @param {React.ReactNode} props.children - The content to display inside the button.
 * @param {Object} [props.rest] - Any other HTML attributes to pass to the button element.
 */
const Button = ({ type = 'button', onClick, disabled = false, className = '', children, ...rest }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "font-semibold py-2 px-4 rounded-md shadow-sm transition-all duration-200 ease-in-out", // Base styles for all buttons
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500", // Focus styles
        {
          'bg-blue-600 hover:bg-blue-700 text-white': !className.includes('bg-') && !className.includes('text-'), // Default primary style if no background/text color is specified in className
          'opacity-50 cursor-not-allowed': disabled,
        },
        className // Merge custom classes last, allowing them to override defaults
      )}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;