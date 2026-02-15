const express = require('express');
const router = express.Router();

const {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateWizardStep
} = require('../controllers/employeeController');

const { getDashboardStats, getHRUsers } = require('../controllers/adminController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const upload = require('../config/multer');

router.use(protect);

// Admin / HR
router.post('/', restrictTo('ADMIN', 'HR'), createEmployee);
router.get('/', restrictTo('ADMIN', 'HR'), getEmployees);

// ✅ MUST BE BEFORE `/:id`
router.get('/hr-users', restrictTo('ADMIN'), getHRUsers);
router.get("/dashboard", restrictTo("ADMIN"), protect, getDashboardStats);

// Read-only employee view
router.get('/:id', getEmployeeById);

// Wizard updates
const uploadFields = upload.fields([
  { name: 'aadhar', maxCount: 1 },
  { name: 'pan', maxCount: 1 },
  { name: 'photo', maxCount: 1 },
  { name: 'appHindi', maxCount: 1 },
  { name: 'appEnglish', maxCount: 1 },
  { name: 'dl', maxCount: 1 },
  { name: 'certificates', maxCount: 5 },
  { name: 'otherKyc', maxCount: 5 }
]);

router.patch('/:id/wizard', uploadFields, updateWizardStep);

module.exports = router;
