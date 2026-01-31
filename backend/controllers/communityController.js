const Community = require('../models/Community');
const User = require('../models/User');

// @desc    Create a new community
// @route   POST /api/communities
// @access  Private
const createCommunity = async (req, res) => {
  const { name, description } = req.body;

  try {
    const community = await Community.create({
      name,
      description,
      owner: req.user._id,
      members: [req.user._id],
    });

    if (community) {
      // Add community to user's communities
      await User.findByIdAndUpdate(req.user._id, {
        $push: { communities: community._id },
      });

      res.status(201).json(community);
    } else {
      res.status(400).json({ message: 'Invalid community data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all communities
// @route   GET /api/communities
// @access  Private
const getCommunities = async (req, res) => {
  try {
    const communities = await Community.find({}).populate('owner', 'name email');
    res.json(communities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get community by ID
// @route   GET /api/communities/:id
// @access  Private
const getCommunityById = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    if (community) {
      res.json(community);
    } else {
      res.status(404).json({ message: 'Community not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Join a community
// @route   POST /api/communities/:id/join
// @access  Private
const joinCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);

    if (community) {
      if (community.members.includes(req.user._id)) {
        return res.status(400).json({ message: 'Already a member' });
      }

      community.members.push(req.user._id);
      await community.save();

      await User.findByIdAndUpdate(req.user._id, {
        $push: { communities: community._id },
      });

      res.json({ message: 'Joined community successfully' });
    } else {
      res.status(404).json({ message: 'Community not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCommunity,
  getCommunities,
  getCommunityById,
  joinCommunity,
};
