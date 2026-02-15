const express = require('express');
const router = express.Router();
// IMPORT THE CONTROLLER HERE
const attendanceController = require('../controllers/attendanceController');

// Route to mark attendance
router.post('/', attendanceController.markAttendance);

// Route to get attendance logs (The new line you added)
router.get('/', attendanceController.getAttendanceLogs);

module.exports = router;