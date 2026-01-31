const express = require('express');
const router = express.Router();
const {
  addComment,
  getCommentsByTask,
} = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addComment);
router.get('/:taskId', protect, getCommentsByTask);

module.exports = router;
