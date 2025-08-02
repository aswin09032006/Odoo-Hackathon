/**
 * @file components/Dashboard/FilterBar.jsx
 * @description Component for filtering and sorting tickets on the dashboard.
 */

import React, { useState, useEffect } from 'react';
import Input from '../Common/Input';
import Button from '../Common/Button';
import Toggle from '../Common/Toggle'; // Import the new Toggle component
import api from '../../api'; // For fetching categories
import { useAuth } from '../../hooks/useAuth'; // To determine user role
import clsx from 'clsx'; // Import clsx

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
    <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
      {/* Changed md:items-end to md:items-start for consistent top alignment of labels */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        {/* Search Input */}
        <div className="w-full md:w-1/3"> {/* Search input takes roughly 1/3 of the space */}
          <label htmlFor="search" className="block text-gray-700 text-sm font-medium mb-2">Search:</label>
          <Input
            id="search"
            type="text"
            placeholder="Subject or description..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:border-[#504ee2] focus:ring-1 focus:ring-[#504ee2]"
          />
        </div>

        {/* Toggle Filters Button for smaller screens */}
        <div className="md:hidden w-full">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full bg-[#504ee2] hover:bg-[#433ed1] text-white py-2 px-4 rounded-md text-sm"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>

        {/* Filter and Sort Options (conditionally rendered for smaller screens) */}
        {/* md:flex-grow takes the remaining 2/3 space. Items inside use md:flex-1 to distribute evenly. */}
        <div className={clsx(`w-full md:flex md:flex-row md:flex-grow gap-4`, showFilters ? 'block' : 'hidden md:flex')}>
          {/* Status Filter */}
          <div className="w-full md:flex-1"> {/* Changed md:w-1/4 to md:flex-1 */}
            <label htmlFor="status" className="block text-gray-700 text-sm font-medium mb-2">Status:</label>
            <select
              id="status"
              name="status"
              value={filters.status || ''}
              onChange={handleFilterChange}
              className="border border-gray-300 rounded-md w-full py-2 px-3 text-gray-700 focus:outline-none focus:border-[#504ee2] focus:ring-1 focus:ring-[#504ee2]"
            >
              <option value="">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="w-full md:flex-1"> {/* Changed md:w-1/4 to md:flex-1 */}
            <label htmlFor="category" className="block text-gray-700 text-sm font-medium mb-2">Category:</label>
            <select
              id="category"
              name="category"
              value={filters.category || ''}
              onChange={handleFilterChange}
              className="border border-gray-300 rounded-md w-full py-2 px-3 text-gray-700 focus:outline-none focus:border-[#504ee2] focus:ring-1 focus:ring-[#504ee2]"
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
          <div className="w-full md:flex-1"> {/* Changed md:w-1/4 to md:flex-1 */}
            <label htmlFor="sort" className="block text-gray-700 text-sm font-medium mb-2">Sort By:</label>
            <select
              id="sort"
              name="sort"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="border border-gray-300 rounded-md w-full py-2 px-3 text-gray-700 focus:outline-none focus:border-[#504ee2] focus:ring-1 focus:ring-[#504ee2]"
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
            <div className="w-full md:flex-1 flex items-end justify-center md:justify-start pt-6 md:pt-0"> {/* Changed md:w-auto to md:flex-1 */}
              <Toggle
                id="my_tickets"
                label="My Assigned Tickets"
                checked={filters.my_tickets === 'true'}
                onChange={(e) => onFiltersChange({ ...filters, my_tickets: e.target.checked ? 'true' : undefined })}
              />
            </div>
          )}
        </div>
      </div>
      {/* Clear Filters Button */}
      <div className="mt-6 text-right">
        <Button
          onClick={handleClearFilters}
          className="border border-gray-300 text-gray-700 hover:bg-gray-100 py-2 px-4 rounded-md text-sm"
        >
          Clear Filters
        </Button>
      </div>
    </div>
  );
};

export default FilterBar;