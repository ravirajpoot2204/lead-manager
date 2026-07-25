const router = require('express').Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const User = require('../models/user');

// GET /api/users/members – only for admin
router.get('/members', auth, role('admin'), async (req, res) => {
  try {
    const members = await User.find({ role: 'member' }).select('_id name email');
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;