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
  // Determine status color with softer backgrounds and borders
  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-red-50 text-red-700 border border-red-200';
      case 'In Progress': return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      case 'Resolved': return 'bg-green-50 text-green-700 border border-green-200';
      case 'Closed': return 'bg-gray-100 text-gray-600 border border-gray-200';
      default: return 'bg-gray-50 text-gray-600 border border-gray-200';
    }
  };

  return (
    // Card container: removed shadow, added border, hover effect is subtle border change
    <div className="bg-white rounded-lg p-6 border border-gray-200 hover:border-[#504ee2] transition-colors duration-200 flex flex-col"> {/* Added flex-col for consistent height */}
      <div className="flex justify-between items-start mb-3"> {/* Adjusted margin */}
        {/* Ticket Subject: reduced font size, blue themed, normal hover underline */}
        <Link to={`/tickets/${ticket._id}`} className="text-lg font-medium text-[#504ee2] hover:underline">
          {ticket.subject}
        </Link>
        {/* Ticket Status: font-medium, rounded-md for less "pill-like" look */}
        <span className={`px-2 py-0.5 text-xs font-medium rounded-md ${getStatusColor(ticket.status)}`}> {/* Reduced padding and font size */}
          {ticket.status}
        </span>
      </div>

      {/* Ticket Creator and Category */}
      <div className="text-gray-600 text-sm mb-3 space-y-1"> {/* Adjusted margin, added space-y for spacing */}
        <p>Created by: <span className="font-normal">{ticket.createdBy?.username || 'N/A'}</span></p> {/* Font-normal */}
        <p>Category: <span className="font-normal">{ticket.category?.name || 'N/A'}</span></p> {/* Font-normal */}
      </div>

      {/* Short Description Snippet: kept line-clamp-2 */}
      <p className="text-gray-700 text-sm mb-4 line-clamp-2 leading-relaxed"> {/* Reduced font size, adjusted leading */}
        {ticket.description}
      </p>

      {/* Metadata: Created At, Last Updated, Comments, Votes */}
      <div className="flex flex-wrap justify-between items-center text-gray-500 text-xs mt-auto pt-4 border-t border-gray-100 gap-2"> {/* Added gap, adjusted padding */}
        <p>Created: {moment(ticket.createdAt).fromNow()}</p>
        <p>Updated: {moment(ticket.updatedAt).fromNow()}</p> {/* Changed 'Last Updated' to 'Updated' */}
        <p>Comments: {ticket.comments.length}</p>
        <p>Votes: ↑{ticket.upvotes.length} ↓{ticket.downvotes.length}</p>
      </div>
    </div>
  );
};

export default TicketCard;