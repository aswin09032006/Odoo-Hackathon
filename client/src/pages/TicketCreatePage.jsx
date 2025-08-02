/**
 * @file pages/TicketCreatePage.jsx
 * @description Page for creating a new support ticket.
 *              Includes fields for subject, description, category, and attachments.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast'; // Added react-hot-toast
import Input from '../components/Common/Input';
import Button from '../components/Common/Button';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import clsx from 'clsx'; // Import clsx

const TicketCreatePage = () => {
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [errors, setErrors] = useState({}); // For form validation

  // Fetch categories on component mount for the dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data.data);
        if (res.data.data.length > 0) {
          setCategory(res.data.data[0]._id); // Set first category as default
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        toast.error('Failed to load categories. Please try again.'); // Used react-hot-toast
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!subject.trim()) newErrors.subject = 'Subject is required.';
    if (!description.trim()) newErrors.description = 'Description is required.';
    if (!category) newErrors.category = 'Category is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors in the form.'); // Used react-hot-toast
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('subject', subject);
      formData.append('description', description);
      formData.append('category', category);
      attachments.forEach((file) => {
        formData.append('attachments', file);
      });

      const res = await api.post('/tickets', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Important for file uploads
        },
      });

      toast.success('Ticket created successfully!'); // Used react-hot-toast
      navigate(`/tickets/${res.data.data._id}`); // Redirect to the newly created ticket's detail page
    } catch (err) {
      console.error('Error creating ticket:', err);
      toast.error(err.response?.data?.message || 'Failed to create ticket. Please try again.'); // Used react-hot-toast
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setAttachments(Array.from(e.target.files));
  };

  return (
    // Main container: Removed shadow-xl, added border, adjusted padding for consistency
    <div className="container mx-auto p-8 bg-white rounded-lg border border-gray-200">
      <form onSubmit={handleSubmit}>
        {/* Input component (assuming it has been updated to match the new styles) */}
        <Input
          label="Subject"
          type="text"
          id="subject"
          value={subject}
          onChange={(e) => { setSubject(e.target.value); setErrors(prev => ({ ...prev, subject: '' })); }}
          placeholder="Enter ticket subject"
          required
          error={errors.subject}
          // Assuming Input component handles its own styling internally
          // If not, you'd add:
          // className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:border-[#504ee2] focus:ring-1 focus:ring-[#504ee2]"
        />

        <div className="mb-4">
          {/* Label: Changed font-semibold */}
          <label htmlFor="description" className="block text-gray-700 text-sm font-medium mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => { setDescription(e.target.value); setErrors(prev => ({ ...prev, description: '' })); }}
            placeholder="Provide a detailed description of your issue..."
            rows="6"
            className={clsx(
              "block w-full py-2 px-3 border border-gray-300 rounded-md", // Removed shadow-sm
              "text-gray-900 placeholder-gray-500",
              "focus:ring-1 focus:ring-[#504ee2] focus:border-[#504ee2] focus:outline-none", // Updated focus styles
              "transition-colors duration-200 ease-in-out",
              errors.description ? 'border-red-500' : ''
            )}
            required
          ></textarea>
          {errors.description && <p className="text-red-500 text-xs italic mt-1">{errors.description}</p>}
        </div>

        <div className="mb-4">
          {/* Label: Changed font-semibold */}
          <label htmlFor="category" className="block text-gray-700 text-sm font-medium mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => { setCategory(e.target.value); setErrors(prev => ({ ...prev, category: '' })); }}
            className={clsx(
              "border border-gray-300 rounded-md w-full py-2 px-3", // Removed shadow
              "text-gray-700 leading-tight focus:outline-none focus:ring-1 focus:ring-[#504ee2] focus:border-[#504ee2]", // Updated focus styles
              errors.category ? 'border-red-500' : ''
            )}
            required
            disabled={categoriesLoading}
          >
            {categoriesLoading ? (
              <option value="">Loading categories...</option>
            ) : categories.length === 0 ? (
              <option value="">No categories available</option>
            ) : (
              categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))
            )}
          </select>
          {errors.category && <p className="text-red-500 text-xs italic mt-1">{errors.category}</p>}
        </div>

        {/* File Input: Customized button styling to match blue theme */}
        <Input
          label="Attachments (Max 5 files, 5MB each. JPEG, PNG, GIF, PDF, DOC, DOCX)"
          type="file"
          id="attachments"
          multiple
          onChange={handleFileChange}
          accept=".jpeg,.jpg,.png,.gif,.pdf,.doc,.docx"
          className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#504ee2] file:text-white hover:file:bg-[#433ed1] file:cursor-pointer" // Blue themed file input button
        />

        {/* Submit Button: Blue themed, font-medium */}
        <Button
          type="submit"
          disabled={loading || categoriesLoading}
          className="w-full bg-[#504ee2] hover:bg-[#433ed1] text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 mt-6 flex items-center justify-center"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" color="white" />
              <span className="ml-2">Creating Ticket...</span>
            </>
          ) : (
            'Submit Ticket'
          )}
        </Button>
      </form>
    </div>
  );
};

export default TicketCreatePage;