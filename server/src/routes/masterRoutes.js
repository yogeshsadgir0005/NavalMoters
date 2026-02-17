const express = require('express');
const router = express.Router();
const { 
  getAll, 
  addDepartment, 
  addJobProfile, 
  deleteDepartment, 
  deleteJobProfile 
} = require('../controllers/masterController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, getAll);
router.post('/department', protect, addDepartment);
router.post('/job-profile', protect, addJobProfile);

// NEW: Delete Routes
router.delete('/department/:id', protect, deleteDepartment);
router.delete('/job-profile/:id', protect, deleteJobProfile);

module.exports = router;