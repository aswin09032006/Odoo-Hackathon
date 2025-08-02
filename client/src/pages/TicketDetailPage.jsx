/**
 * @file pages/TicketDetailPage.jsx
 * @description Displays the full details of a single support ticket.
 *              Includes ticket info, threaded conversations, status updates, and voting.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import Button from '../components/Common/Button';
import CommentSection from '../components/TicketDetail/CommentSection';
import { useAuth } from '../hooks/useAuth';
import moment from 'moment';

const TicketDetailPage = () => {
  const { id } = useParams(); // Get ticket ID from URL
  const navigate = useNavigate();
  const { user } = useAuth(); // Get current user for authorization logic

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newStatus, setNewStatus] = useState(''); // State for status dropdown
  const [assignedAgent, setAssignedAgent] = useState(''); // State for assignee dropdown
  const [availableAgents, setAvailableAgents] = useState([]); // List of support agents/admins

  const isCreator = ticket?.createdBy?._id === user?._id;
  const isAssignedAgent = ticket?.assignedTo?._id === user?._id;
  const isAdmin = user?.role === 'admin';
  const isAgentOrAdmin = user?.role === 'support-agent' || user?.role === 'admin';

  // Determine if current user can add comments
  const canAddComment = isCreator || isAssignedAgent || isAdmin;
  // Determine if current user can vote
  const canVote = user && ticket && ticket.createdBy?._id !== user?._id; // Cannot vote on own ticket

  // Fetch ticket details
  const fetchTicket = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/tickets/${id}`);
      setTicket(res.data.data);
      setNewStatus(res.data.data.status); // Set initial status for dropdown
      setAssignedAgent(res.data.data.assignedTo?._id || ''); // Set initial assignee
    } catch (err) {
      console.error('Error fetching ticket:', err);
      setError(err.response?.data?.message || 'Failed to load ticket details.');
      toast.error(err.response?.data?.message || 'Failed to load ticket');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Fetch available agents (for admin/agent assignment)
  useEffect(() => {
    const fetchAgents = async () => {
      if (isAgentOrAdmin) {
        try {
          const res = await api.get('/users', { params: { role: 'support-agent' } }); // Fetch all users, filter on client or backend
          // Filter for 'support-agent' and 'admin' roles if backend doesn't filter
          setAvailableAgents(res.data.data.filter(u => u.role === 'support-agent' || u.role === 'admin'));
        } catch (err) {
          console.error('Error fetching agents:', err);
          toast.error('Failed to load available agents.');
        }
      }
    };
    fetchAgents();
  }, [isAgentOrAdmin]);


  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  // Handle adding a new comment
  const handleAddComment = async (commentText) => {
    setCommentLoading(true);
    try {
      const res = await api.post(`/tickets/${id}/comment`, { text: commentText });
      // Update ticket state with the new comments list
      setTicket(prevTicket => ({ ...prevTicket, comments: res.data.data }));
      toast.success('Comment added successfully!');
    } catch (err) {
      console.error('Error adding comment:', err);
      toast.error(err.response?.data?.message || 'Failed to add comment.');
    } finally {
      setCommentLoading(false);
    }
  };

  // Handle ticket status/assignment update
  const handleUpdateTicket = async () => {
    setUpdateLoading(true);
    try {
      const updateData = {};
      if (newStatus !== ticket.status) {
        updateData.status = newStatus;
      }
      // Only send assignedTo if it's changed and is valid
      if (assignedAgent !== (ticket.assignedTo?._id || '')) {
        updateData.assignedTo = assignedAgent === '' ? null : assignedAgent; // Send null if unassigned
      }

      if (Object.keys(updateData).length === 0) {
        toast.info('No changes to save.');
        setUpdateLoading(false);
        return;
      }

      const res = await api.put(`/tickets/${id}`, updateData);
      setTicket(res.data.data); // Update local state with fresh data
      toast.success('Ticket updated successfully!');
    } catch (err) {
      console.error('Error updating ticket:', err);
      toast.error(err.response?.data?.message || 'Failed to update ticket.');
    } finally {
      setUpdateLoading(false);
    }
  };

  // Handle upvoting/downvoting
  const handleVote = async (type) => {
    if (!canVote) {
      toast.info('You cannot vote on your own ticket or you are not authorized.');
      return;
    }
    try {
      const res = await api.put(`/tickets/${id}/${type}`);
      // Update the upvotes/downvotes array lengths in the local state
      setTicket(prevTicket => ({
        ...prevTicket,
        upvotes: Array(res.data.data.upvotes).fill(null), // Just need length
        downvotes: Array(res.data.data.downvotes).fill(null)
      }));
      toast.success(`Ticket ${type}d!`);
    } catch (err) {
      console.error(`Error ${type}ing ticket:`, err);
      toast.error(err.response?.data?.message || `Failed to ${type} ticket.`);
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-80px)]">
        <LoadingSpinner size="lg" />
        <p className="ml-3 text-lg text-gray-700">Loading ticket...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 text-lg mt-8">{error}</div>;
  }

  if (!ticket) {
    return <div className="text-center text-gray-600 text-lg mt-8">Ticket not found.</div>;
  }

  // Helper to get status color
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
    <div className="container mx-auto p-6 my-8">
      <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
        {/* Ticket Header */}
        <div className="flex justify-between items-start mb-6 border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-800">{ticket.subject}</h1>
          <span className={`px-4 py-2 text-md font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
            {ticket.status}
          </span>
        </div>

        {/* Ticket Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 mb-6 text-gray-700">
          <p><strong>Ticket ID:</strong> #{ticket._id.toString().slice(-6)}</p>
          <p><strong>Category:</strong> {ticket.category?.name || 'N/A'}</p>
          <p><strong>Created By:</strong> {ticket.createdBy?.username || 'N/A'}</p>
          <p><strong>Created At:</strong> {moment(ticket.createdAt).format('LLL')}</p>
          <p><strong>Assigned To:</strong> {ticket.assignedTo?.username || 'Unassigned'}</p>
          <p><strong>Last Updated:</strong> {moment(ticket.updatedAt).format('LLL')}</p>
          <p className="col-span-full text-gray-800 font-semibold mt-4">Description:</p>
          <p className="col-span-full whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
        </div>

        {/* Attachments */}
        {ticket.attachments && ticket.attachments.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Attachments:</h4>
            <div className="flex flex-wrap gap-2">
              {ticket.attachments.map((fileUrl, index) => (
                <a
                  key={index}
                  href={`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${fileUrl}`} // Adjust URL to serve static files
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm hover:bg-blue-200 transition-colors"
                >
                  Attachment {index + 1} ({fileUrl.split('/').pop()})
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Actions Section (Admin/Agent) */}
        {(isAgentOrAdmin) && (
          <div className="mt-8 border-t pt-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Ticket Actions</h3>
            <div className="flex flex-wrap gap-4 items-end">
              {/* Status Update */}
              <div>
                <label htmlFor="newStatus" className="block text-gray-700 text-sm font-bold mb-2">Change Status:</label>
                <select
                  id="newStatus"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="shadow border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  disabled={updateLoading}
                >
                  {['Open', 'In Progress', 'Resolved', 'Closed'].map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              {/* Assign Agent */}
              <div>
                <label htmlFor="assignedAgent" className="block text-gray-700 text-sm font-bold mb-2">Assign Agent:</label>
                <select
                  id="assignedAgent"
                  value={assignedAgent}
                  onChange={(e) => setAssignedAgent(e.target.value)}
                  className="shadow border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  disabled={updateLoading || availableAgents.length === 0}
                >
                  <option value="">Unassigned</option>
                  {availableAgents.map(agent => (
                    <option key={agent._id} value={agent._id}>{agent.username} ({agent.role})</option>
                  ))}
                </select>
              </div>

              {/* Update Button */}
              <Button
                onClick={handleUpdateTicket}
                disabled={updateLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center justify-center"
              >
                {updateLoading ? <LoadingSpinner size="sm" color="white" /> : 'Save Changes'}
              </Button>
            </div>
          </div>
        )}

        {/* Upvote/Downvote Section */}
        <div className="mt-8 border-t pt-6 flex items-center justify-end space-x-4">
          <p className="text-lg font-semibold text-gray-800">Votes:</p>
          <span className="flex items-center text-green-600 text-xl font-bold">
            <button
              onClick={() => handleVote('upvote')}
              disabled={loading || !canVote}
              className={`hover:text-green-800 mr-1 ${ticket.upvotes.includes(user?._id) ? 'text-green-800' : ''}`}
              title="Upvote"
            >
              ↑
            </button>
            {ticket.upvotes.length}
          </span>
          <span className="flex items-center text-red-600 text-xl font-bold">
            <button
              onClick={() => handleVote('downvote')}
              disabled={loading || !canVote}
              className={`hover:text-red-800 mr-1 ${ticket.downvotes.includes(user?._id) ? 'text-red-800' : ''}`}
              title="Downvote"
            >
              ↓
            </button>
            {ticket.downvotes.length}
          </span>
        </div>
      </div>

      {/* Comment Section Component */}
      <CommentSection
        comments={ticket.comments}
        onAddComment={handleAddComment}
        loadingComments={commentLoading}
        canAddComment={canAddComment}
      />
    </div>
  );
};

export default TicketDetailPage;