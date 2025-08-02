/**
 * @file pages/Admin/CategoryManagement.jsx
 * @description Admin page for managing ticket categories (CRUD operations).
 */

import React, { useState, useEffect } from 'react';
import api from '../../api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import Button from '../../components/Common/Button';
import Input from '../../components/Common/Input';
import Modal from '../../components/Common/Modal'; // Assuming a generic modal component

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
      toast.error(err.response?.data?.message || 'Failed to load categories');
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
      toast.error('Please correct the form errors.');
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        await api.put(`/categories/${currentCategory._id}`, formData);
        toast.success('Category updated successfully!');
      } else {
        await api.post('/categories', formData);
        toast.success('Category created successfully!');
      }
      setShowModal(false);
      await fetchCategories(); // Re-fetch categories to update the list
    } catch (err) {
      console.error('Error saving category:', err);
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Failed to save category. Is the name already taken?');
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
        toast.success('Category deleted successfully!');
        await fetchCategories(); // Re-fetch categories
      } catch (err) {
        console.error('Error deleting category:', err);
        toast.error(err.response?.data?.error || 'Failed to delete category.');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && categories.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-80px)]">
        <LoadingSpinner size="lg" />
        <p className="ml-3 text-lg text-gray-700">Loading categories...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 text-lg mt-8">{error}</div>;
  }

  return (
    <div className="container mx-auto p-6 my-8 bg-white rounded-lg shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Category Management</h1>
        <Button onClick={handleCreateClick} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md">
          Add New Category
        </Button>
      </div>

      {categories.length === 0 ? (
        <p className="text-center text-gray-600 text-xl py-10">No categories found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-100 text-left text-sm text-gray-600 uppercase tracking-wider">
                <th className="py-3 px-4 border-b">Name</th>
                <th className="py-3 px-4 border-b">Description</th>
                <th className="py-3 px-4 border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category._id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4">{category.name}</td>
                  <td className="py-3 px-4">{category.description || 'N/A'}</td>
                  <td className="py-3 px-4 text-center">
                    <Button onClick={() => handleEditClick(category)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md text-sm mr-2">
                      Edit
                    </Button>
                    <Button onClick={() => handleDelete(category._id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm">
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
            <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Description (Optional):</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Short description for the category"
              rows="3"
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${formErrors.description ? 'border-red-500' : ''}`}
            ></textarea>
            {formErrors.description && <p className="text-red-500 text-xs italic mt-1">{formErrors.description}</p>}
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" onClick={() => setShowModal(false)} className="bg-gray-300 hover:bg-gray-400 text-gray-800">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? <LoadingSpinner size="sm" color="white" /> : (isEditing ? 'Save Changes' : 'Create Category')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CategoryManagement;