/**
 * @file components/Common/Modal.jsx
 * @description A generic, reusable modal component.
 */

import React from 'react';
import { createPortal } from 'react-dom';
import Button from './Button';
import { X } from 'lucide-react'; // Import X icon from lucide-react

/**
 * A reusable Modal component.
 * Uses React Portals to render outside the normal DOM hierarchy.
 * @param {Object} props - Component props.
 * @param {boolean} props.show - Controls visibility of the modal.
 * @param {Function} props.onClose - Callback function when the modal is closed.
 * @param {string} props.title - Title to display in the modal header.
 * @param {React.ReactNode} props.children - Content to render inside the modal body.
 */
const Modal = ({ show, onClose, title, children }) => {
  if (!show) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 backdrop-blur-sm p-4">
      <div
        className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-lg mx-auto transform transition-all duration-300 ease-out scale-100 opacity-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h2 id="modal-title" className="text-xl font-bold text-gray-800">
            {title}
          </h2>
          <Button
            onClick={onClose}
            className="bg-transparent hover:bg-gray-100 text-gray-500 hover:text-gray-700 p-2 rounded-full" // Adjusted padding and hover state
            aria-label="Close modal"
          >
            <X size={20} /> {/* Use Lucide X icon */}
          </Button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>,
    document.body // Portal target: render directly into the body
  );
};

export default Modal;