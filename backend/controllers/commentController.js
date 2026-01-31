const Comment = require('../models/Comment');

// @desc    Add a comment to a task
// @route   POST /api/comments
// @access  Private
const addComment = async (req, res) => {
  const { text, taskId } = req.body;

  try {
    const comment = await Comment.create({
      text,
      user: req.user._id,
      task: taskId,
    });

    const populatedComment = await Comment.findById(comment._id).populate('user', 'name');
    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get comments for a task
// @route   GET /api/comments/:taskId
// @access  Private
const getCommentsByTask = async (req, res) => {
  try {
    const comments = await Comment.find({ task: req.params.taskId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addComment,
  getCommentsByTask,
};
