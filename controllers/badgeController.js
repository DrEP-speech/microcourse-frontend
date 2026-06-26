// controllers/badgeController.js
import Badge from '../models/Badge.js';
import User from '../models/User.js';

/**
 * Get all badges
 */
const getAllBadges = async (req, res) => {
  try {
    const badges = await Badge.find();
    res.status(200).json(badges);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving badges', error: err.message });
  }
};

/**
 * Award a badge to a user
 */
const awardBadge = async (req, res) => {
  try {
    const { userId, badgeId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.badges.includes(badgeId)) {
      user.badges.push(badgeId);
      await user.save();
    }

    res.status(200).json({ message: 'Badge awarded', badges: user.badges });
  } catch (err) {
    res.status(500).json({ message: 'Error awarding badge', error: err.message });
  }
};

/**
 * Sync badges with a given criteria
 */
const syncBadge = async (req, res) => {
  try {
    const { userId, badgeCriteria } = req.body;

    // Example: Check if user meets badge criteria
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const matchingBadges = await Badge.find(badgeCriteria);
    const badgeIds = matchingBadges.map(b => b._id);

    // Merge & remove duplicates
    user.badges = [...new Set([...user.badges, ...badgeIds])];
    await user.save();

    res.status(200).json({ message: 'Badges synced', badges: user.badges });
  } catch (err) {
    res.status(500).json({ message: 'Error syncing badges', error: err.message });
  }
};

/**
 * Remove a badge from a user
 */
const removeBadge = async (req, res) => {
  try {
    const { userId, badgeId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.badges = user.badges.filter(id => id.toString() !== badgeId);
    await user.save();

    res.status(200).json({ message: 'Badge removed', badges: user.badges });
  } catch (err) {
    res.status(500).json({ message: 'Error removing badge', error: err.message });
  }
};

// Export all in one place (future-proof)
export {
  getAllBadges,
  awardBadge,
  syncBadge,
  removeBadge
};
