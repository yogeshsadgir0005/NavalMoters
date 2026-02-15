const Attendance = require('../models/Attendance');
const sheetService = require('../services/googleSheetService');

exports.markAttendance = async (req, res) => {
  const { employeeId, date, status, isNightDuty } = req.body; // <--- Extract isNightDuty
  try {
    // 1. Save to MongoDB
    let att = await Attendance.findOneAndUpdate(
      { employee: employeeId, date: new Date(date) },
      { 
        status,
        isNightDuty: isNightDuty || false // <--- Save it
      },
      { upsert: true, new: true }
    ).populate('employee', 'firstName lastName employeeCode');

    // 2. Sync to Google Sheet (Backup)
    sheetService.syncAttendance(att); 

    res.json(att);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAttendanceLogs = async (req, res) => {
  const { month } = req.query; // Format: YYYY-MM
  try {
    const start = new Date(`${month}-01`);
    // End date calculation to get full month range
    const end = new Date(new Date(start).setMonth(start.getMonth() + 1));

    const logs = await Attendance.find({
      date: { $gte: start, $lt: end }
    }).populate('employee', 'firstName lastName employeeCode');

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};