/**
 * @file components/Dashboard/TicketCard.jsx
 * @description Displays a single ticket summary card on the dashboard.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment'; // For date formatting

/**
 * TicketCard component displays a concise summary of a ticket.
 * @param {Object} props - Component props.
 * @param {Object} props.ticket - The ticket object to display.
 */
const TicketCard = ({ ticket }) => {
  // Determine status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-red-100 text-red-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-gray-200 text-gray-800';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        {/* Ticket Subject */}
        <Link to={`/tickets/${ticket._id}`} className="text-xl font-semibold text-blue-700 hover:underline">
          {ticket.subject}
        </Link>
        {/* Ticket Status */}
        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
          {ticket.status}
        </span>
      </div>

      {/* Ticket Creator and Category */}
      <div className="text-gray-600 text-sm mb-2">
        <p>Created by: <span className="font-medium">{ticket.createdBy?.username || 'N/A'}</span></p>
        <p>Category: <span className="font-medium">{ticket.category?.name || 'N/A'}</span></p>
      </div>

      {/* Short Description Snippet */}
      <p className="text-gray-700 text-base mb-4 line-clamp-2">
        {ticket.description}
      </p>

      {/* Metadata: Created At, Last Updated, Comments, Votes */}
      <div className="flex flex-wrap justify-between items-center text-gray-500 text-xs mt-auto pt-4 border-t border-gray-100">
        <p>Created: {moment(ticket.createdAt).fromNow()}</p>
        <p>Last Updated: {moment(ticket.updatedAt).fromNow()}</p>
        <p>Comments: {ticket.comments.length}</p>
        <p>Votes: ↑{ticket.upvotes.length} ↓{ticket.downvotes.length}</p>
      </div>
    </div>
  );
};

export default TicketCard;