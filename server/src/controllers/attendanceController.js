const Attendance = require('../models/Attendance');
const sheetService = require('../services/googleSheetService');

exports.markAttendance = async (req, res) => {
  const { employeeIds, employeeId, date, status, isNightDuty } = req.body; 
  
  const targets = employeeIds && Array.isArray(employeeIds) ? employeeIds : [employeeId];

  try {
    const results = [];
    
    for (const id of targets) {
      if(!id) continue;
      
      let att = await Attendance.findOneAndUpdate(
        { employee: id, date: new Date(date) },
        { 
          status,
          isNightDuty: isNightDuty || false 
        },
        { upsert: true, new: true }
      ).populate('employee', 'firstName lastName employeeCode');
      
     
      results.push(att);
    }


    if (results.length > 0) {
        sheetService.syncAttendance(results).catch(err => {
        console.error("Bulk Sheet Sync Error:", err);
      });
    }

    res.json({ message: `Attendance updated for ${results.length} employees`, data: results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAttendanceLogs = async (req, res) => {
  const { month, date } = req.query; 
  try {
    let query = {};

    if (date) {
        const queryDate = new Date(date);
      query.date = queryDate;
    } else if (month) {
     
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
