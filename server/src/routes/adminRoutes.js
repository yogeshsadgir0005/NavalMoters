const express = require('express');
const router = express.Router();

const {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateWizardStep
} = require('../controllers/employeeController');

const { getDashboardStats, getHRUsers, grantHRAccess, removeHRAccess } = require('../controllers/adminController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const upload = require('../config/multer');

router.use(protect);

router.post('/', restrictTo('ADMIN', 'HR'), createEmployee);
router.get('/', restrictTo('ADMIN', 'HR'), getEmployees);
router.get('/hr-users', restrictTo('ADMIN'), getHRUsers);
router.get("/dashboard", restrictTo("ADMIN", "HR"), getDashboardStats);

router.put('/hr-users/:id/grant', grantHRAccess);
router.put('/hr-users/:id/revoke', removeHRAccess);
router.get('/:id', getEmployeeById);
const uploadFields = upload.fields([
  { name: 'aadhar', maxCount: 1 },
  { name: 'pan', maxCount: 1 },
  { name: 'photo', maxCount: 1 },
  { name: 'appHindi', maxCount: 1 },
  { name: 'appEnglish', maxCount: 1 },
  { name: 'dl', maxCount: 1 },
  { name: 'certificates', maxCount: 20 },
  { name: 'otherKyc', maxCount: 20 },
  { name: 'bankProof', maxCount: 1 }
]);

router.patch('/:id/wizard', uploadFields, updateWizardStep);

module.exports = router;