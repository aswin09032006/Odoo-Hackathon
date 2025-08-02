/**
 * @file pages/DashboardPage.jsx
 * @description Main dashboard page for displaying and managing tickets.
 *              Integrates filters, search, sort, pagination, and ticket cards.
 */

import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import toast from 'react-hot-toast'; // Added react-hot-toast
import LoadingSpinner from '../components/Common/LoadingSpinner';
import FilterBar from '../components/Dashboard/FilterBar';
import TicketCard from '../components/Dashboard/TicketCard';
import Pagination from '../components/Dashboard/Pagination';
import { useAuth } from '../hooks/useAuth';

const DashboardPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({}); // Stores status, category, my_tickets
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('-createdAt'); // Default sort: newest first
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTicketsCount, setTotalTicketsCount] = useState(0); // Total count for all tickets
  const { user } = useAuth();

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      // Add filters
      for (const key in filters) {
        if (filters[key]) { // Only add if filter has a value
          queryParams.append(key, filters[key]);
        }
      }
      // Add search query
      if (searchQuery) {
        queryParams.append('search', searchQuery);
      }
      // Add sort option
      if (sortBy) {
        queryParams.append('sort', sortBy);
      }
      // Add pagination
      queryParams.append('page', currentPage);
      queryParams.append('limit', 10); // 10 tickets per page

      const res = await api.get(`/tickets?${queryParams.toString()}`);
      setTickets(res.data.data);
      setTotalPages(Math.ceil(res.data.total / 10)); // Calculate total pages
      setTotalTicketsCount(res.data.total); // Set overall total count
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError(err.response?.data?.message || 'Failed to fetch tickets.');
      toast.error(err.response?.data?.message || 'Failed to load tickets'); // Used react-hot-toast
    } finally {
      setLoading(false);
    }
  }, [filters, searchQuery, sortBy, currentPage]); // Re-run if any of these change

  // Effect to fetch tickets whenever filter/search/sort/page changes
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]); // `fetchTickets` is wrapped in useCallback, so it's stable

  // Reset page to 1 when filters, search, or sort criteria change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchQuery, sortBy]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center flex-1 py-12 min-h-[400px]">
        <LoadingSpinner size="lg" />
        <p className="ml-3 text-lg text-gray-700">Loading tickets...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 text-lg py-12 mt-8">{error}</div>;
  }

  return (
    <div className="container mx-auto rounded-lg px-4">
      {/* Filter Bar Component */}
      <div className="mb-8">
        <h2 className="text-sm uppercase font-medium text-[#504ee2] mb-4 border-b border-gray-200 pb-2">Filters & Search</h2>
        <FilterBar
          filters={filters}
          onFiltersChange={setFilters}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          showMyTicketsToggle={user && (user.role === 'support-agent' || user.role === 'admin')}
        />
      </div>

      {totalTicketsCount === 0 ? (
        <div className="text-center text-gray-600 text-lg py-12">No tickets found matching your criteria.</div>
      ) : (
        <>
          {/* Tickets Grid */}
          <div className="mb-8">
            <h2 className="text-sm uppercase font-medium text-[#504ee2] mb-4 border-b border-gray-200 pb-2">Your Tickets ({totalTicketsCount})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tickets.map((ticket) => (
                <TicketCard key={ticket._id} ticket={ticket} />
              ))}
            </div>
          </div>

          {/* Pagination Component */}
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;