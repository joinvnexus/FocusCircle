import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Send } from 'lucide-react';

const CommentSection = ({ taskId }) => {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');

  const fetchComments = async () => {
    try {
      const { data } = await api.get(`/comments/${taskId}`);
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments', error);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [taskId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await api.post('/comments', { text, taskId });
      setText('');
      fetchComments();
    } catch (error) {
      console.error('Error adding comment', error);
    }
  };

  return (
    <div className="mt-4 border-t pt-4">
      <h4 className="text-sm font-bold text-gray-700 mb-2">Comments</h4>
      <div className="space-y-3 mb-4 max-h-40 overflow-y-auto">
        {comments.length === 0 && <p className="text-xs text-gray-500 italic">No comments yet.</p>}
        {comments.map((comment) => (
          <div key={comment._id} className="text-sm">
            <span className="font-bold mr-2">{comment.user.name}:</span>
            <span className="text-gray-600">{comment.text}</span>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          className="flex-grow p-1 text-sm border rounded-l"
          placeholder="Write a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" className="bg-blue-600 text-white p-1 rounded-r">
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};

export default CommentSection;
