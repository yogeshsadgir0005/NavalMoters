const Attendance = require('../models/Attendance');
const sheetService = require('../services/googleSheetService');

exports.markAttendance = async (req, res) => {
  // NOW ACCEPTS 'employeeIds' ARRAY
  const { employeeIds, employeeId, date, status, isNightDuty } = req.body; 
  
  // Handle both bulk (array) and legacy single (string) requests
  const targets = employeeIds && Array.isArray(employeeIds) ? employeeIds : [employeeId];

  try {
    const results = [];
    
    // Process all selected employees
    for (const id of targets) {
      if(!id) continue;
      
      // 1. Upsert MongoDB (Update if exists, Create if not)
      let att = await Attendance.findOneAndUpdate(
        { employee: id, date: new Date(date) },
        { 
          status,
          isNightDuty: isNightDuty || false 
        },
        { upsert: true, new: true }
      ).populate('employee', 'firstName lastName employeeCode');

      // 2. Sync to Google Sheet
      sheetService.syncAttendance(att); 
      
      results.push(att);
    }

    res.json({ message: `Attendance updated for ${results.length} employees`, data: results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAttendanceLogs = async (req, res) => {
  const { month, date } = req.query; // Added 'date' support
  try {
    let query = {};

    if (date) {
      // Fetch specific day logs (for Modal Status check)
      const queryDate = new Date(date);
      query.date = queryDate;
    } else if (month) {
      // Fetch monthly logs (for Register View)
      const start = new Date(`${month}-01`);
      const end = new Date(new Date(start).setMonth(start.getMonth() + 1));
      query.date = { $gte: start, $lt: end };
    }

    const logs = await Attendance.find(query)
      .populate('employee', 'firstName lastName employeeCode')
      .sort({ date: -1 }); 

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};