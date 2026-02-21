const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
router.post('/', attendanceController.markAttendance);
router.get('/', attendanceController.getAttendanceLogs);

module.exports = router;