const router = require('express').Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const {
  createPublic,
  list,
  getOne,
  update,
  addNote
} = require('../controllers/leadController');

// Public endpoint (no auth)
router.post('/public', createPublic);

// Protected endpoints
router.get('/', auth, list);
router.get('/:id', auth, getOne);
router.patch('/:id', auth, update);
router.post('/:id/notes', auth, addNote);

module.exports = router; 