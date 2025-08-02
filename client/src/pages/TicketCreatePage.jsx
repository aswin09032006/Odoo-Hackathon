/**
 * @file pages/TicketCreatePage.jsx
 * @description Page for creating a new support ticket.
 *              Includes fields for subject, description, category, and attachments.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';
import Input from '../components/Common/Input';
import Button from '../components/Common/Button';
import LoadingSpinner from '../components/Common/LoadingSpinner';

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
        toast.error('Failed to load categories. Please try again.');
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
      toast.error('Please fix the errors in the form.');
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

      toast.success('Ticket created successfully!');
      navigate(`/tickets/${res.data.data._id}`); // Redirect to the newly created ticket's detail page
    } catch (err) {
      console.error('Error creating ticket:', err);
      toast.error(err.response?.data?.message || 'Failed to create ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setAttachments(Array.from(e.target.files));
  };

  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-xl my-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Create New Ticket</h1>

      <form onSubmit={handleSubmit}>
        <Input
          label="Subject"
          type="text"
          id="subject"
          value={subject}
          onChange={(e) => { setSubject(e.target.value); setErrors(prev => ({ ...prev, subject: '' })); }}
          placeholder="Enter ticket subject"
          required
          error={errors.subject}
        />

        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => { setDescription(e.target.value); setErrors(prev => ({ ...prev, description: '' })); }}
            placeholder="Provide a detailed description of your issue..."
            rows="6"
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.description ? 'border-red-500' : ''}`}
            required
          ></textarea>
          {errors.description && <p className="text-red-500 text-xs italic mt-1">{errors.description}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="category" className="block text-gray-700 text-sm font-bold mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => { setCategory(e.target.value); setErrors(prev => ({ ...prev, category: '' })); }}
            className={`shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.category ? 'border-red-500' : ''}`}
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

        <Input
          label="Attachments (Max 5 files, 5MB each. JPEG, PNG, GIF, PDF, DOC, DOCX)"
          type="file"
          id="attachments"
          multiple
          onChange={handleFileChange}
          accept=".jpeg,.jpg,.png,.gif,.pdf,.doc,.docx"
        />

        <Button
          type="submit"
          disabled={loading || categoriesLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200 mt-6 flex items-center justify-center"
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