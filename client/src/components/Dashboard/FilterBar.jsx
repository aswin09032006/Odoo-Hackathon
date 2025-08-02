/**
 * @file components/Dashboard/FilterBar.jsx
 * @description Component for filtering and sorting tickets on the dashboard.
 */

import React, { useState, useEffect } from 'react';
import Input from '../Common/Input';
import Button from '../Common/Button';
import api from '../../api'; // For fetching categories
import { useAuth } from '../../hooks/useAuth'; // To determine user role

/**
 * FilterBar component provides options to filter and sort tickets.
 * @param {Object} props - Component props.
 * @param {Object} props.filters - Current filter object (e.g., { status: 'Open', category: '...' }).
 * @param {Function} props.onFiltersChange - Callback function when filters change.
 * @param {string} props.searchQuery - Current search query string.
 * @param {Function} props.onSearchChange - Callback function when search query changes.
 * @param {string} props.sortBy - Current sort field (e.g., '-createdAt').
 * @param {Function} props.onSortChange - Callback function when sort field changes.
 * @param {boolean} [props.showMyTicketsToggle=false] - Whether to show the 'My Tickets' toggle.
 */
const FilterBar = ({ filters, onFiltersChange, searchQuery, onSearchChange, sortBy, onSortChange, showMyTicketsToggle = false }) => {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [showFilters, setShowFilters] = useState(false); // State for responsive filter toggle
  const { user } = useAuth(); // To potentially show "My Tickets" for agents

  // Fetch categories on component mount
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
    onFiltersChange({}); // Clear all filters
    onSearchChange(''); // Clear search query
    onSortChange('-createdAt'); // Reset sort to default
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Search Input */}
        <div className="w-full md:w-1/3">
          <Input
            type="text"
            placeholder="Search tickets by subject or description..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Toggle Filters Button for smaller screens */}
        <div className="md:hidden w-full">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full bg-gray-200 text-gray-800 hover:bg-gray-300"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>

        {/* Filter and Sort Options (conditionally rendered for smaller screens) */}
        <div className={`w-full md:flex md:flex-row md:flex-grow gap-4 ${showFilters ? 'block' : 'hidden md:flex'}`}>
          {/* Status Filter */}
          <div className="w-full md:w-1/4">
            <label htmlFor="status" className="block text-gray-700 text-sm font-bold mb-2">Status:</label>
            <select
              id="status"
              name="status"
              value={filters.status || ''}
              onChange={handleFilterChange}
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="w-full md:w-1/4">
            <label htmlFor="category" className="block text-gray-700 text-sm font-bold mb-2">Category:</label>
            <select
              id="category"
              name="category"
              value={filters.category || ''}
              onChange={handleFilterChange}
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              disabled={loadingCategories}
            >
              <option value="">All Categories</option>
              {loadingCategories ? (
                <option>Loading categories...</option>
              ) : (
                categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Sort By */}
          <div className="w-full md:w-1/4">
            <label htmlFor="sort" className="block text-gray-700 text-sm font-bold mb-2">Sort By:</label>
            <select
              id="sort"
              name="sort"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="-createdAt">Newest First</option>
              <option value="createdAt">Oldest First</option>
              <option value="-updatedAt">Recently Modified</option>
              <option value="-comments.length">Most Replied</option>
              <option value="-upvotes.length">Most Upvoted</option>
            </select>
          </div>

          {/* "My Tickets" Toggle for Support Agents */}
          {showMyTicketsToggle && (user?.role === 'support-agent' || user?.role === 'admin') && (
            <div className="w-full md:w-auto flex items-end">
              <label htmlFor="my_tickets" className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="my_tickets"
                  name="my_tickets"
                  checked={filters.my_tickets === 'true'}
                  onChange={(e) => onFiltersChange({ ...filters, my_tickets: e.target.checked ? 'true' : undefined })}
                  className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700 text-sm font-bold">My Assigned Tickets</span>
              </label>
            </div>
          )}
        </div>
      </div>
      {/* Clear Filters Button */}
      <div className="mt-4 text-right">
        <Button
          onClick={handleClearFilters}
          className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded text-sm"
        >
          Clear Filters
        </Button>
      </div>
    </div>
  );
};

export default FilterBar;