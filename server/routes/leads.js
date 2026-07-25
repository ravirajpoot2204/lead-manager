const router = require('express').Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const {
  createPublic,
  list,
  getOne,
  update,
  addNote,
  editDetails,
  deleteLead
} = require('../controllers/leadController');
// Public endpoint (no auth)
router.post('/public', createPublic);

// Protected endpoints
router.get('/', auth, list);
router.get('/:id', auth, getOne);
router.patch('/:id', auth, update);
router.post('/:id/notes', auth, addNote);
// Edit lead details (admin only)
router.put('/:id', auth, role('admin'), editDetails);

// Delete lead (admin only)
router.delete('/:id', auth, role('admin'), deleteLead);

module.exports = router; 