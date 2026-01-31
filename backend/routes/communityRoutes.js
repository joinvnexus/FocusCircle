const express = require('express');
const router = express.Router();
const {
  createCommunity,
  getCommunities,
  getCommunityById,
  joinCommunity,
} = require('../controllers/communityController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createCommunity)
  .get(protect, getCommunities);

router.route('/:id').get(protect, getCommunityById);
router.post('/:id/join', protect, joinCommunity);

module.exports = router;
