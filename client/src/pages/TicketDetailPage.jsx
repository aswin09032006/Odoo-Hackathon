/**
 * @file pages/TicketDetailPage.jsx
 * @description Displays the full details of a single support ticket.
 *              Includes ticket info, threaded conversations, status updates, and voting.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import Button from '../components/Common/Button';
import CommentSection from '../components/TicketDetail/CommentSection';
import { useAuth } from '../hooks/useAuth';
import moment from 'moment';
import { ArrowBigUp, ArrowBigDown } from 'lucide-react';
import clsx from 'clsx';

const TicketDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [assignedAgent, setAssignedAgent] = useState('');
  const [availableAgents, setAvailableAgents] = useState([]);

  const isCreator = ticket?.createdBy?._id === user?._id;
  const isAssignedAgent = ticket?.assignedTo?._id === user?._id;
  const isAdmin = user?.role === 'admin';
  const isAgentOrAdmin = user?.role === 'support-agent' || user?.role === 'admin';

  const canAddComment = isCreator || isAssignedAgent || isAdmin;
  const canVote = user && ticket && ticket.createdBy?._id !== user?._id;

  const fetchTicket = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/tickets/${id}`);
      setTicket(res.data.data);
      setNewStatus(res.data.data.status);
      setAssignedAgent(res.data.data.assignedTo?._id || '');
    } catch (err) {
      console.error('Error fetching ticket:', err);
      setError(err.response?.data?.message || 'Failed to load ticket details.');
      toast.error(err.response?.data?.message || 'Failed to load ticket');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const fetchAgents = async () => {
      if (isAgentOrAdmin) {
        try {
          const res = await api.get('/users', { params: { role: 'support-agent' } });
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

  const handleAddComment = async (commentText) => {
    setCommentLoading(true);
    try {
      const res = await api.post(`/tickets/${id}/comment`, { text: commentText });
      setTicket(prevTicket => ({ ...prevTicket, comments: res.data.data }));
      toast.success('Comment added successfully!');
    } catch (err) {
      console.error('Error adding comment:', err);
      toast.error(err.response?.data?.message || 'Failed to add comment.');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleUpdateTicket = async () => {
    setUpdateLoading(true);
    try {
      const updateData = {};
      if (newStatus !== ticket.status) {
        updateData.status = newStatus;
      }
      if (assignedAgent !== (ticket.assignedTo?._id || '')) {
        updateData.assignedTo = assignedAgent === '' ? null : assignedAgent;
      }

      if (Object.keys(updateData).length === 0) {
        toast.info('No changes to save.');
        setUpdateLoading(false);
        return;
      }

      const res = await api.put(`/tickets/${id}`, updateData);
      setTicket(res.data.data);
      toast.success('Ticket updated successfully!');
    } catch (err) {
      console.error('Error updating ticket:', err);
      toast.error(err.response?.data?.message || 'Failed to update ticket.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleVote = async (type) => {
    if (!canVote) {
      toast.info('You cannot vote on your own ticket or you are not authorized.');
      return;
    }
    try {
      const res = await api.put(`/tickets/${id}/${type}`);
      setTicket(prevTicket => ({
        ...prevTicket,
        upvotes: res.data.data.upvotes,
        downvotes: res.data.data.downvotes
      }));
      toast.success(`Ticket ${type}d!`);
    } catch (err) {
      console.error(`Error ${type}ing ticket:`, err);
      toast.error(err.response?.data?.message || `Failed to ${type} ticket.`);
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center flex-1 py-12 min-h-[400px]">
        <LoadingSpinner size="lg" />
        <p className="ml-3 text-lg text-gray-700">Loading ticket...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 text-lg py-12 mt-8">{error}</div>;
  }

  if (!ticket) {
    return <div className="text-center text-gray-600 text-lg py-12 mt-8">Ticket not found.</div>;
  }

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
    // Outer container for spacing between white blocks, without its own background/border
    <div className="container mx-auto px-6 py-8 space-y-6">

      {/* Block 1: Ticket Information & Description */}
      <div className="bg-white p-8 rounded-lg border border-gray-200">
        {/* Ticket Subject & Status Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-gray-200 pb-4 mb-6">
          {/* Main Ticket Title: Small text, uppercase, blue themed */}
          <h1 className="text-xl font-semibold uppercase tracking-wide text-[#504ee2] mb-3 sm:mb-0">
            {ticket.subject}
          </h1>
          {/* Status Badge: Consistent styling */}
          <span className={clsx(`px-3 py-1 text-sm font-medium rounded-md`, getStatusColor(ticket.status))}>
            {ticket.status}
          </span>
        </div>

        {/* Ticket Details Grid */}
        <h2 className="text-xl font-medium text-gray-700 mb-6 border-b border-gray-200 pb-2">Ticket Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-gray-700 text-base">
          <p><span className="font-medium">Ticket ID:</span> <span className="font-mono text-sm text-gray-600">#{ticket._id.toString().slice(-6)}</span></p>
          <p><span className="font-medium">Category:</span> {ticket.category?.name || 'N/A'}</p>
          <p><span className="font-medium">Created By:</span> {ticket.createdBy?.username || 'N/A'}</p>
          <p><span className="font-medium">Created At:</span> {moment(ticket.createdAt).format('LLL')}</p>
          <p><span className="font-medium">Assigned To:</span> {ticket.assignedTo?.username || 'Unassigned'}</p>
          <p><span className="font-medium">Last Updated:</span> {moment(ticket.updatedAt).format('LLL')}</p>
        </div>
        {/* Description Header and Content */}
        <p className="col-span-full text-lg font-medium text-gray-700 mt-6 border-b border-gray-200 pb-2">Description:</p>
        <p className="col-span-full whitespace-pre-wrap leading-relaxed text-gray-700 mt-4">{ticket.description}</p>
      </div>

      {/* Block 2: Attachments Section */}
      {ticket.attachments && ticket.attachments.length > 0 && (
        <div className="bg-white p-8 rounded-lg border border-gray-200">
          <h2 className="text-xl font-medium text-gray-700 mb-6 border-b border-gray-200 pb-2">Attachments</h2>
          <div className="flex flex-wrap gap-3">
            {ticket.attachments.map((fileUrl, index) => (
              <a
                key={index}
                href={`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${fileUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-gray-50 text-gray-700 px-3 py-1 rounded-md text-sm border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <span className="mr-1">📄</span> Attachment {index + 1}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Block 3: Actions Section (Admin/Agent) */}
      {(isAgentOrAdmin) && (
        <div className="bg-white p-8 rounded-lg border border-gray-200">
          <h2 className="text-xl font-medium text-gray-700 mb-6 border-b border-gray-200 pb-2">Ticket Actions</h2>
          <div className="flex flex-wrap gap-4 items-end">
            {/* Status Update */}
            <div>
              <label htmlFor="newStatus" className="block text-gray-700 text-sm font-medium mb-2">Change Status:</label>
              <select
                id="newStatus"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#504ee2] focus:border-[#504ee2]"
                disabled={updateLoading}
              >
                {['Open', 'In Progress', 'Resolved', 'Closed'].map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Assign Agent */}
            <div>
              <label htmlFor="assignedAgent" className="block text-gray-700 text-sm font-medium mb-2">Assign Agent:</label>
              <select
                id="assignedAgent"
                value={assignedAgent}
                onChange={(e) => setAssignedAgent(e.target.value)}
                className="border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#504ee2] focus:border-[#504ee2]"
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
              className="bg-[#504ee2] hover:bg-[#433ed1] text-white font-medium py-2 px-4 rounded-md flex items-center justify-center"
            >
              {updateLoading ? (
                <>
                  <LoadingSpinner size="sm" color="white" />
                  <span className="ml-2">Saving...</span>
                </>
              ) : 'Save Changes'}
            </Button>
          </div>
        </div>
      )}

      {/* Block 4: Upvote/Downvote Section */}
      <div className="bg-white p-8 rounded-lg border border-gray-200">
        <h2 className="text-xl font-medium text-gray-700 mb-6 border-b border-gray-200 pb-2">Vote</h2> {/* Title for votes */}
        <div className="flex items-center justify-end space-x-3">
          <p className="text-base font-medium text-gray-700 mr-2">Votes:</p>
          <Button
            onClick={() => handleVote('upvote')}
            disabled={loading || !canVote}
            className={clsx(
              "text-green-600 hover:text-green-800 flex items-center px-3 py-1 rounded-md bg-green-50 border border-green-200 hover:bg-green-100 transition-colors",
              user && ticket.upvotes?.includes(user._id) && "bg-green-100 text-green-800 border-green-300"
            )}
            title="Upvote"
          >
            <ArrowBigUp size={20} className="mr-1" />
            <span className="font-medium">{ticket.upvotes.length}</span>
          </Button>
          <Button
            onClick={() => handleVote('downvote')}
            disabled={loading || !canVote}
            className={clsx(
              "text-red-600 hover:text-red-800 flex items-center px-3 py-1 rounded-md bg-red-50 border border-red-200 hover:bg-red-100 transition-colors",
              user && ticket.downvotes?.includes(user._id) && "bg-red-100 text-red-800 border-red-300"
            )}
            title="Downvote"
          >
            <ArrowBigDown size={20} className="mr-1" />
            <span className="font-medium">{ticket.downvotes.length}</span>
          </Button>
        </div>
      </div>

      {/* Block 5: Comment Section (already a component with desired styling) */}
      <CommentSection
        ticketId={id}
        comments={ticket.comments}
        onAddComment={handleAddComment}
        commentLoading={commentLoading}
        canAddComment={canAddComment}
        currentUser={user}
        fetchTicket={fetchTicket}
      />
    </div>
  );
};

export default TicketDetailPage;