/**
 * @file components/TicketDetail/CommentSection.jsx
 * @description Component for displaying and adding comments to a ticket.
 */

import React, { useState } from 'react';
import Input from '../Common/Input';
import Button from '../Common/Button';
import LoadingSpinner from '../Common/LoadingSpinner';
import moment from 'moment'; // For date formatting
import { useAuth } from '../../hooks/useAuth'; // To show current user's role

/**
 * CommentSection component handles displaying existing comments and allowing new ones to be added.
 * @param {Object} props - Component props.
 * @param {Array<Object>} props.comments - Array of comment objects.
 * @param {Function} props.onAddComment - Callback function to add a new comment.
 * @param {boolean} props.loadingComments - Loading state for adding comments.
 * @param {boolean} props.canAddComment - Boolean to determine if the current user can add comments.
 */
const CommentSection = ({ comments, onAddComment, loadingComments, canAddComment }) => {
  const [newCommentText, setNewCommentText] = useState('');
  const [commentError, setCommentError] = useState('');
  const { user } = useAuth(); // To display 'You' for current user's comments

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) {
      setCommentError('Comment cannot be empty.');
      return;
    }
    setCommentError('');
    await onAddComment(newCommentText);
    setNewCommentText(''); // Clear input after successful comment
  };

  return (
    <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Conversation</h3>

      {/* Display Existing Comments */}
      {comments && comments.length > 0 ? (
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {comments.map((comment, index) => (
            <div key={comment._id || index} className="border-b border-gray-100 pb-4 last:border-b-0">
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold text-gray-800">
                  {comment.commentedBy?.username}
                  {user && comment.commentedBy?._id === user._id && <span className="ml-2 text-xs text-blue-600">(You)</span>}
                  <span className="ml-2 text-sm text-gray-500 font-normal">({comment.commentedBy?.role})</span>
                </p>
                <span className="text-sm text-gray-500">{moment(comment.createdAt).format('MMM D, YYYY h:mm A')}</span>
              </div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{comment.text}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 italic">No comments yet. Be the first to add one!</p>
      )}

      {/* Add New Comment Form */}
      {canAddComment && (
        <div className="mt-6 border-t pt-6">
          <h4 className="text-xl font-semibold text-gray-800 mb-4">Add a Comment</h4>
          <form onSubmit={handleSubmitComment}>
            <textarea
              value={newCommentText}
              onChange={(e) => { setNewCommentText(e.target.value); setCommentError(''); }}
              placeholder="Type your comment here..."
              rows="4"
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${commentError ? 'border-red-500' : ''}`}
              disabled={loadingComments}
            ></textarea>
            {commentError && <p className="text-red-500 text-xs italic mt-1">{commentError}</p>}
            <Button
              type="submit"
              disabled={loadingComments}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center justify-center"
            >
              {loadingComments ? (
                <>
                  <LoadingSpinner size="sm" color="white" />
                  <span className="ml-2">Adding Comment...</span>
                </>
              ) : (
                'Add Comment'
              )}
            </Button>
          </form>
        </div>
      )}
      {!canAddComment && (
        <p className="mt-6 text-gray-500 italic text-center">You are not authorized to add comments to this ticket.</p>
      )}
    </div>
  );
};

export default CommentSection;