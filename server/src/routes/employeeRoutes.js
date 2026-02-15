const express = require('express');
const router = express.Router();

const {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateWizardStep,
  getMyEmployeeProfile,
  getEmployeeProgress,
addSalaryIncrement
} = require('../controllers/employeeController');

const { protect, restrictTo } = require('../middlewares/authMiddleware');
const upload = require('../config/multer');

router.use(protect);

// Admin/HR
router.post('/', restrictTo('ADMIN', 'HR'), createEmployee);
router.get('/', restrictTo('ADMIN', 'HR'), getEmployees);

// Employee self
router.get('/me', restrictTo('EMPLOYEE'), getMyEmployeeProfile);

// Progress (Admin/HR)
router.get('/:id/progress', restrictTo('ADMIN', 'HR'), getEmployeeProgress);
router.post('/:id/increment', restrictTo('ADMIN', 'HR'), addSalaryIncrement);
// View employee (Admin/HR or Employee self – controller enforces self check)
router.get('/:id', getEmployeeById);

// Upload fields
const uploadFields = upload.fields([
  { name: 'aadhar', maxCount: 1 },
  { name: 'pan', maxCount: 1 },
  { name: 'photo', maxCount: 1 },
  { name: 'dl', maxCount: 1 },
  { name: 'appHindi', maxCount: 1 },
  { name: 'appEnglish', maxCount: 1 },
  { name: 'bankProof', maxCount: 1 },
  { name: 'certificates', maxCount: 10 },
  { name: 'otherKyc', maxCount: 10 },
]);

router.patch('/:id/wizard', restrictTo('ADMIN', 'HR'), uploadFields, updateWizardStep);

module.exports = router;
