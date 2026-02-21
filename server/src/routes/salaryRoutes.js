const express = require('express');
const router = express.Router();
const { generateSalary, getSalaryReports, updateSalary } = require('../controllers/salaryController');

router.post('/generate', generateSalary);

router.get('/history', getSalaryReports);

router.patch('/:id', updateSalary);

module.exports = router;