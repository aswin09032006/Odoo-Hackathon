/**
 * @file components/Common/Button.jsx
 * @description Reusable Button component with consistent styling.
 */

import React from 'react';

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
      className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}` // Merge default and custom classes
      }
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;