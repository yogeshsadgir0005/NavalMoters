const express = require('express');
const router = express.Router();
const { generateSalary, getSalaryReports, updateSalary } = require('../controllers/salaryController');

// Generate Payroll
router.post('/generate', generateSalary);

// Get History
router.get('/history', getSalaryReports);

// NEW: Update specific salary record
router.patch('/:id', updateSalary);

module.exports = router;