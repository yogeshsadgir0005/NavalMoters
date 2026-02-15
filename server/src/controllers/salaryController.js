const Salary = require('../models/Salary');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const sheetService = require('../services/googleSheetService'); 

const checkProfileCompletion = (emp) => {
  const missing = [];
  if (!emp.bankDetails || !emp.bankDetails.accountNo) missing.push('Bank Account');
  if (!emp.documents || !emp.documents.aadhar) missing.push('Aadhaar');
  return { isComplete: missing.length === 0, missing };
};

exports.generateSalary = async (req, res) => {
  const { month, employeeIds } = req.body; 
  
  try {
    const start = new Date(`${month}-01`);
    const end = new Date(new Date(start).setMonth(start.getMonth() + 1));

    const query = {};
    if (employeeIds && Array.isArray(employeeIds) && employeeIds.length > 0) {
      query._id = { $in: employeeIds };
    }

    const employees = await Employee.find(query);
    const report = [];
    const validSalariesForSheet = []; 

    for (const emp of employees) {
      const gate = checkProfileCompletion(emp);
      
      if (!gate.isComplete) {
        report.push({ employee: emp.email, status: 'Blocked', reason: gate.missing.join(', ') });
        continue;
      }

      // 1. Calculate Attendance
      const attendanceCount = await Attendance.countDocuments({
        employee: emp._id,
        date: { $gte: start, $lt: end },
        status: 'Present'
      });

      // 2. Calculate Night Duties
      const nightDutyCount = await Attendance.countDocuments({
        employee: emp._id,
        date: { $gte: start, $lt: end },
        isNightDuty: true
      });

      // 3. Calculate Base Salary
      let earnedSalary = 0;
      if (emp.wageType === 'Daily') {
        earnedSalary = (emp.baseSalary || 0) * attendanceCount;
      } else {
        earnedSalary = emp.baseSalary || 0; 
      }

      // Initial net pay (Incentives default to 0)
      const netPay = earnedSalary;

      // 4. Save/Update Salary
      const salaryDoc = await Salary.findOneAndUpdate(
        { employee: emp._id, month },
        { 
          baseSalary: emp.baseSalary,
          presentDays: attendanceCount,
          nightDutyCount, 
          incentives: 0,
          adjustments: [], // Start with empty history
          netPay,
          status: 'Pending'
        },
        { upsert: true, new: true }
      ).populate('employee', 'firstName lastName employeeCode');

      validSalariesForSheet.push(salaryDoc);
      report.push({ employee: emp.email, status: 'Generated', netPay });
    }

    if (validSalariesForSheet.length > 0) {
       const sheetData = validSalariesForSheet.map(doc => ({
          month: doc.month,
          employee: doc.employee,
          totalPresentDays: doc.presentDays,
          nightDutyCount: doc.nightDutyCount,
          incentives: doc.incentives,
          netPay: doc.netPay,
          status: doc.status
       }));
       sheetService.syncPayroll(sheetData).catch(err => console.error("Sheet Backup Error:", err));
    }

    res.json(report);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateSalary = async (req, res) => {
  const { id } = req.params;
  const { netPay, status, adjustments } = req.body;

  try {
    // ✅ Normalize: allow adjustments to be either an array OR a single object
    const adjustmentsArr = Array.isArray(adjustments)
      ? adjustments
      : adjustments && typeof adjustments === 'object'
        ? [adjustments]
        : [];

    // ✅ Sanitize for mongoose sub-schema
    const cleanedAdjustments = adjustmentsArr
      .filter(a => a && typeof a === 'object')
      .map(a => ({
        // keep _id if provided (helps preserve existing subdoc identity)
        ...(a._id ? { _id: a._id } : {}),
        type: a.type,
        amount: Number(a.amount),
        reason: String(a.reason || ''),
        date: a.date ? new Date(a.date) : new Date()
      }))
      // avoid saving broken rows
      .filter(a =>
        (a.type === 'Incentive' || a.type === 'Penalty') &&
        Number.isFinite(a.amount) &&
        a.amount > 0 &&
        a.reason.trim().length > 0
      );

    // 1) Calculate incentives (reporting)
    const totalIncentives = cleanedAdjustments.reduce((acc, curr) => {
      return curr.type === 'Incentive'
        ? acc + curr.amount
        : acc - curr.amount;
    }, 0);

    // 2) Update with full history (array)
    const updatedSalary = await Salary.findByIdAndUpdate(
      id,
      {
        netPay,
        status,
        adjustments: cleanedAdjustments,
        incentives: totalIncentives
      },
      { new: true, runValidators: true } // ✅ enforce schema validation
    ).populate('employee', 'firstName lastName employeeCode');

    if (!updatedSalary) {
      return res.status(404).json({ message: "Salary record not found" });
    }

    try {
      const sheetData = [{
        month: updatedSalary.month,
        employee: updatedSalary.employee,
        totalPresentDays: updatedSalary.presentDays,
        nightDutyCount: updatedSalary.nightDutyCount,
        incentives: updatedSalary.incentives,
        netPay: updatedSalary.netPay,
        status: updatedSalary.status
      }];
      sheetService.syncPayroll(sheetData);
    } catch (e) {
      console.error("Sheet sync warning:", e.message);
    }

    res.json(updatedSalary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getSalaryReports = async (req, res) => {
  try {
    const salaries = await Salary.find()
      .populate('employee', 'firstName lastName employeeCode')
      .sort({ month: -1, updatedAt: -1 });
    res.json(salaries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};