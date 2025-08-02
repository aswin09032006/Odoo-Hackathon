/**
 * @file components/Common/Toggle.jsx
 * @description A reusable toggle switch component.
 */

import React from 'react';
import clsx from 'clsx';

const Toggle = ({ id, checked, onChange, label, disabled = false }) => {
  return (
    <div className="flex items-center space-x-2">
      <label htmlFor={id} className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          id={id}
          className="sr-only peer" // Hide checkbox but keep it accessible
          checked={checked}
          onChange={onChange}
          disabled={disabled}
        />
        {/* The visual toggle switch */}
        <div
          className={clsx(
            "w-11 h-6 bg-gray-200 rounded-full peer",
            "peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500", // Focus ring
            "peer-checked:after:translate-x-full peer-checked:after:border-white",
            "after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5",
            "after:transition-all duration-200 ease-in-out", // Smooth transition for the thumb
            {
              'peer-checked:bg-blue-600': !disabled, // Blue background when checked and not disabled
              'cursor-not-allowed opacity-70': disabled, // Dim and disallow cursor when disabled
            }
          )}
        ></div>
        {label && <span className="ml-3 text-sm font-semibold text-gray-700">{label}</span>}
      </label>
    </div>
  );
};

export default Toggle;
