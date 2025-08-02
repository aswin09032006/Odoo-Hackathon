/**
 * @file components/Dashboard/FilterBar.jsx
 * @description Component for filtering and sorting tickets on the dashboard.
 */

import React, { useState, useEffect } from 'react';
import Input from '../Common/Input';
import Button from '../Common/Button';
import Toggle from '../Common/Toggle';
import api from '../../api';
import { useAuth } from '../../hooks/useAuth';
import clsx from 'clsx';
import { SlidersHorizontal } from 'lucide-react'; // A nice icon for the filter button

const FilterBar = ({ filters, onFiltersChange, searchQuery, onSearchChange, sortBy, onSortChange, showMyTicketsToggle = false }) => {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [showFilters, setShowFilters] = useState(false); // State for responsive filter toggle
  const { user } = useAuth();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const handleFilterChange = (e) => {
    onFiltersChange({ ...filters, [e.target.name]: e.target.value });
  };

  const handleClearFilters = () => {
    onFiltersChange({});
    onSearchChange('');
    onSortChange('-createdAt');
  };

  // The title "FILTERS & SEARCH" should be placed in the parent component (e.g., DashboardPage)
  // like this: <h2 className="text-sm font-bold uppercase text-[#504ee2] tracking-wider mb-4">Filters & Search</h2>
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
      {/* Container for all filters and the clear button */}
      <div>
        {/* Toggle Filters Button for smaller screens (visible below md) */}
        <div className="md:hidden mb-4">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-center text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-300 py-2 px-4 rounded-md text-sm"
          >
            <SlidersHorizontal size={16} className="mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters & Sort'}
          </Button>
        </div>

        {/* Grid container for all filter inputs. Responsive columns. */}
        <div className={clsx(
          'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-4',
          showFilters ? 'grid' : 'hidden md:grid' // Toggled on mobile, always a grid on md+
        )}>
          {/* Search Input (spans 2 columns on lg screens for more space) */}
          <div className="lg:col-span-2">
            <label htmlFor="search" className="block text-gray-700 text-sm font-medium mb-1">Search:</label>
            <Input
              id="search"
              type="text"
              placeholder="Subject or description..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="status" className="block text-gray-700 text-sm font-medium mb-1">Status:</label>
            <select
              id="status"
              name="status"
              value={filters.status || ''}
              onChange={handleFilterChange}
              className="border border-gray-300 rounded-md w-full py-2 px-3 text-gray-700 focus:outline-none focus:border-[#504ee2] focus:ring-1 focus:ring-[#504ee2] transition"
            >
              <option value="">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label htmlFor="category" className="block text-gray-700 text-sm font-medium mb-1">Category:</label>
            <select
              id="category"
              name="category"
              value={filters.category || ''}
              onChange={handleFilterChange}
              className="border border-gray-300 rounded-md w-full py-2 px-3 text-gray-700 focus:outline-none focus:border-[#504ee2] focus:ring-1 focus:ring-[#504ee2] transition"
              disabled={loadingCategories}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label htmlFor="sort" className="block text-gray-700 text-sm font-medium mb-1">Sort By:</label>
            <select
              id="sort"
              name="sort"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="border border-gray-300 rounded-md w-full py-2 px-3 text-gray-700 focus:outline-none focus:border-[#504ee2] focus:ring-1 focus:ring-[#504ee2] transition"
            >
              <option value="-createdAt">Newest First</option>
              <option value="createdAt">Oldest First</option>
              <option value="-updatedAt">Recently Modified</option>
            </select>
          </div>

          {/* "My Tickets" Toggle (conditionally rendered) */}
          {showMyTicketsToggle && (user?.role === 'support-agent' || user?.role === 'admin') && (
            // FIX: Use flex items-end to push the toggle to the bottom of the grid cell, aligning it with other inputs.
            // md:col-start-1 and lg:col-start-auto handle wrapping correctly.
            <div className="flex items-end h-full md:col-start-1 lg:col-start-auto">
              <Toggle
                id="my_tickets"
                label="My Assigned Tickets"
                checked={filters.my_tickets === 'true'}
                onChange={(e) => onFiltersChange({ ...filters, my_tickets: e.target.checked ? 'true' : undefined })}
              />
            </div>
          )}
        </div>

        {/* Clear Filters Button */}
        <div className="flex justify-end mt-6">
          <Button
            onClick={handleClearFilters}
            className="border border-gray-300 text-gray-700 hover:bg-gray-100 py-2 px-4 rounded-md text-sm"
          >
            Clear Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;