const express = require('express');
const router = express.Router();

const {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateWizardStep,
  getMyEmployeeProfile,
  getEmployeeProgress,
  addSalaryIncrement,
  terminateEmployee,         
  getTerminatedEmployees     
} = require('../controllers/employeeController');

const { protect, restrictTo } = require('../middlewares/authMiddleware');
const upload = require('../config/multer');

router.use(protect);

router.post('/', restrictTo('ADMIN', 'HR'), createEmployee);
router.get('/', restrictTo('ADMIN', 'HR'), getEmployees);

router.get('/terminated/history', restrictTo('ADMIN', 'HR'), getTerminatedEmployees);
router.post('/:id/terminate', restrictTo('ADMIN', 'HR'), terminateEmployee);

router.get('/me', restrictTo('EMPLOYEE'), getMyEmployeeProfile);

router.get('/:id/progress', restrictTo('ADMIN', 'HR'), getEmployeeProgress);
router.post('/:id/increment', restrictTo('ADMIN', 'HR'), addSalaryIncrement);

router.get('/:id', getEmployeeById);

const uploadFields = upload.fields([
  { name: 'aadhar', maxCount: 1 },
  { name: 'pan', maxCount: 1 },
  { name: 'photo', maxCount: 1 },
  { name: 'dl', maxCount: 1 },
  { name: 'appHindi', maxCount: 1 },
  { name: 'appEnglish', maxCount: 1 },
  { name: 'bankProof', maxCount: 1 },
  { name: 'certificates', maxCount: 20 }, 
  { name: 'otherKyc', maxCount: 20 },     
]);

router.patch('/:id/wizard', restrictTo('ADMIN', 'HR'), uploadFields, updateWizardStep);

module.exports = router;