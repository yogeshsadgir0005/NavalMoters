const express = require('express');
const router = express.Router();
const { getAll, addDepartment, addJobProfile } = require('../controllers/masterController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, getAll);
router.post('/department', protect, addDepartment);
router.post('/job-profile', protect, addJobProfile);

module.exports = router; 