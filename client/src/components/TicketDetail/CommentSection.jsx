/**
 * @file components/TicketDetail/CommentSection.jsx
 * @description Component for displaying and adding comments to a ticket.
 */

import moment from 'moment';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth'; // To show current user's role
import Button from '../Common/Button';
import LoadingSpinner from '../Common/LoadingSpinner';
import clsx from 'clsx'; // Import clsx

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
    // Main container: Removed shadow-md, added border, adjusted padding for consistency
    <div className="mt-8 bg-white p-8 rounded-lg border border-gray-200">
      {/* Section Title: Reduced font size, font-medium, border-bottom */}
      <h3 className="text-xl font-medium text-gray-700 mb-6 border-b border-gray-200 pb-2">Conversation</h3>

      {/* Display Existing Comments */}
      {comments && comments.length > 0 ? (
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2"> {/* Added max-h-96 and pr-2 for scrollable comments */}
          {comments.map((comment, index) => (
            // Comment item: Border-bottom using gray-200
            <div key={comment._id || index} className="pb-3 border-b border-gray-200 last:border-b-0"> {/* Adjusted padding */}
              <div className="flex justify-between items-center mb-1"> {/* Adjusted margin */}
                <p className="font-medium text-gray-800 text-sm"> {/* Font-medium, text-sm */}
                  {comment.commentedBy?.username}
                  {user && comment.commentedBy?._id === user._id && (
                    <span className="ml-2 text-xs text-[#504ee2] bg-blue-50 px-2 py-0.5 rounded"> {/* Softened "You" badge */}
                      (You)
                    </span>
                  )}
                  <span className="ml-2 text-xs text-gray-600 font-normal">({comment.commentedBy?.role})</span> {/* Text-gray-600 */}
                </p>
                <span className="text-xs text-gray-600">{moment(comment.createdAt).format('MMM D, YYYY h:mm A')}</span> {/* Text-xs, text-gray-600 */}
              </div>
              <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">{comment.text}</p> {/* Text-sm */}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 italic text-center py-4">No comments yet. Be the first to add one!</p>
      )}

      {/* Add New Comment Form */}
      {canAddComment && (
        <div className="mt-6 border-t border-gray-200 pt-6"> {/* Consistent border-t */}
          {/* Sub-section Title: Reduced font size, font-medium */}
          <h4 className="text-lg font-medium text-gray-700 mb-4">Add a Comment</h4>
          <form onSubmit={handleSubmitComment}>
            <textarea
              value={newCommentText}
              onChange={(e) => { setNewCommentText(e.target.value); setCommentError(''); }}
              placeholder="Type your comment here..."
              rows="4"
              className={clsx(
                "block w-full py-2 px-3 border border-gray-300 rounded-md", // Removed shadow-sm
                "text-gray-900 placeholder-gray-500",
                "focus:ring-1 focus:ring-[#504ee2] focus:border-[#504ee2] focus:outline-none", // Updated focus styles
                "transition-colors duration-200 ease-in-out",
                commentError ? 'border-red-500' : ''
              )}
              disabled={loadingComments}
            ></textarea>
            {commentError && <p className="text-red-500 text-xs italic mt-1">{commentError}</p>}
            {/* Submit Button: Blue themed, font-medium */}
            <Button
              type="submit"
              disabled={loadingComments}
              className="mt-4 bg-[#504ee2] hover:bg-[#433ed1] text-white font-medium py-2 px-4 rounded-md flex items-center justify-center"
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
        <p className="mt-6 text-gray-500 italic text-center py-4">You are not authorized to add comments to this ticket.</p>
      )}
    </div>
  );
};

export default CommentSection;