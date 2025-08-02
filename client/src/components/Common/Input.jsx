/**
 * @file components/Common/Input.jsx
 * @description Reusable Input component with consistent styling.
 */

import React from 'react';

/**
 * A reusable input field component.
 * @param {Object} props - Component props.
 * @param {string} props.type - The type of input (e.g., 'text', 'email', 'password', 'file').
 * @param {string} props.id - The ID for the input element.
 * @param {string} [props.className] - Additional CSS classes to apply.
 * @param {boolean} [props.required=false] - Whether the input is required.
 * @param {string} [props.placeholder] - Placeholder text for the input.
 * @param {any} [props.value] - The current value of the input (for controlled components).
 * @param {Function} [props.onChange] - Change handler function.
 * @param {string} [props.label] - Optional label for the input.
 * @param {string} [props.error] - Optional error message to display below the input.
 * @param {Object} [props.rest] - Any other HTML attributes to pass to the input element.
 */
const Input = ({ type = 'text', id, className = '', required = false, placeholder, value, onChange, label, error, ...rest }) => {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block text-gray-700 text-sm font-bold mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        id={id}
        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${error ? 'border-red-500' : ''} ${className}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        {...rest}
      />
      {error && <p className="text-red-500 text-xs italic mt-1">{error}</p>}
    </div>
  );
};

export default Input;