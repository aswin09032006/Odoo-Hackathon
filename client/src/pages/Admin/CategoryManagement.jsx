/**
 * @file pages/Admin/CategoryManagement.jsx
 * @description Admin page for managing ticket categories (CRUD operations).
 */

import React, { useState, useEffect } from 'react';
import api from '../../api';
import toast from 'react-hot-toast'; // Added react-hot-toast
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import Button from '../../components/Common/Button';
import Input from '../../components/Common/Input';
import Modal from '../../components/Common/Modal'; // Assuming a generic modal component
import clsx from 'clsx'; // Import clsx

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null); // Category being edited
  const [formErrors, setFormErrors] = useState({});

  // Form data for new category or editing existing
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  // Fetch all categories
  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err.response?.data?.message || 'Failed to fetch categories.');
      toast.error(err.response?.data?.message || 'Failed to load categories'); // Used react-hot-toast
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle form field changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormErrors(prev => ({ ...prev, [e.target.name]: '' })); // Clear error on change
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Category name is required.';
    if (formData.name.trim().length > 50) newErrors.name = 'Name cannot exceed 50 characters.';
    if (formData.description.trim().length > 200) newErrors.description = 'Description cannot exceed 200 characters.';

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Open modal for creating a new category
  const handleCreateClick = () => {
    setIsEditing(false);
    setCurrentCategory(null);
    setFormData({ name: '', description: '' });
    setFormErrors({});
    setShowModal(true);
  };

  // Open modal for editing an existing category
  const handleEditClick = (category) => {
    setIsEditing(true);
    setCurrentCategory(category);
    setFormData({
      name: category.name,
      description: category.description || ''
    });
    setFormErrors({});
    setShowModal(true);
  };

  // Handle form submission (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please correct the form errors.'); // Used react-hot-toast
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        await api.put(`/categories/${currentCategory._id}`, formData);
        toast.success('Category updated successfully!'); // Used react-hot-toast
      } else {
        await api.post('/categories', formData);
        toast.success('Category created successfully!'); // Used react-hot-toast
      }
      setShowModal(false);
      await fetchCategories(); // Re-fetch categories to update the list
    } catch (err) {
      console.error('Error saving category:', err);
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Failed to save category. Is the name already taken?'); // Used react-hot-toast
    } finally {
      setLoading(false);
    }
  };

  // Handle category deletion
  const handleDelete = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category? Tickets associated with this category will not be affected but may lose their category reference if not handled on backend.')) {
      setLoading(true);
      try {
        await api.delete(`/categories/${categoryId}`);
        toast.success('Category deleted successfully!'); // Used react-hot-toast
        await fetchCategories(); // Re-fetch categories
      } catch (err) {
        console.error('Error deleting category:', err);
        toast.error(err.response?.data?.error || 'Failed to delete category.'); // Used react-hot-toast
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && categories.length === 0) {
    return (
      <div className="flex justify-center items-center flex-1 py-12 min-h-[400px]">
        <LoadingSpinner size="lg" />
        <p className="ml-3 text-lg text-gray-700">Loading categories...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 text-lg py-12 mt-8">{error}</div>;
  }

  return (
    // Main container: Consistent styling
    <div className="container mx-auto p-8 bg-white rounded-lg border border-gray-200">
      <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
        {/* Page Title: Consistent styling */}
        <h1 className="text-xl font-semibold uppercase tracking-wide text-[#504ee2]">Category Management</h1>
        {/* Add New Category Button: Consistent blue theme, font-medium */}
        <Button onClick={handleCreateClick} className="bg-[#504ee2] hover:bg-[#433ed1] text-white font-medium px-5 py-2 rounded-md">
          Add New Category
        </Button>
      </div>

      {categories.length === 0 ? (
        <p className="text-center text-gray-600 text-lg py-10">No categories found.</p>
      ) : (
        <div className="overflow-x-auto">
          {/* Table: Removed shadow, added border and rounded-lg for consistency */}
          <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-50 text-left text-sm text-gray-600 uppercase tracking-wider">
                <th className="py-3 px-4 border-b border-gray-200 font-medium">Name</th>
                <th className="py-3 px-4 border-b border-gray-200 font-medium">Description</th>
                <th className="py-3 px-4 border-b border-gray-200 text-center font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category._id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 text-gray-700">
                  <td className="py-3 px-4">{category.name}</td>
                  <td className="py-3 px-4">{category.description || 'N/A'}</td>
                  <td className="py-3 px-4 text-center">
                    {/* Edit Button: Softer yellow, font-medium, rounded-md */}
                    <Button onClick={() => handleEditClick(category)} className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200 px-3 py-1 rounded-md text-sm mr-2 font-medium">
                      Edit
                    </Button>
                    {/* Delete Button: Softer red, font-medium, rounded-md */}
                    <Button onClick={() => handleDelete(category._id)} className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 px-3 py-1 rounded-md text-sm font-medium">
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Loading overlay for table */}
          {loading && categories.length > 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
              <LoadingSpinner size="md" />
            </div>
          )}
        </div>
      )}

      {/* Category Create/Edit Modal */}
      <Modal show={showModal} onClose={() => setShowModal(false)} title={isEditing ? 'Edit Category' : 'Add New Category'}>
        <form onSubmit={handleSubmit}>
          <Input
            label="Category Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            error={formErrors.name}
          />
          <div className="mb-4">
            <label htmlFor="description" className="block text-gray-700 text-sm font-medium mb-2">Description (Optional):</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Short description for the category"
              rows="3"
              className={clsx(
                "block w-full py-2 px-3 border border-gray-300 rounded-md", // Removed shadow-sm
                "text-gray-900 placeholder-gray-500",
                "focus:ring-1 focus:ring-[#504ee2] focus:border-[#504ee2] focus:outline-none",
                "transition-colors duration-200 ease-in-out",
                formErrors.description ? 'border-red-500' : ''
              )}
            ></textarea>
            {formErrors.description && <p className="text-red-500 text-xs italic mt-1">{formErrors.description}</p>}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            {/* Cancel Button: Outline style, font-medium */}
            <Button type="button" onClick={() => setShowModal(false)} className="border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-md font-medium">
              Cancel
            </Button>
            {/* Submit Button: Blue themed, font-medium */}
            <Button type="submit" disabled={loading} className="bg-[#504ee2] hover:bg-[#433ed1] text-white rounded-md font-medium">
              {loading ? <LoadingSpinner size="sm" color="white" /> : (isEditing ? 'Save Changes' : 'Create Category')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CategoryManagement;