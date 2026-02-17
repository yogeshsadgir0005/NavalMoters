const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Salary = require('../models/Salary');
const User = require('../models/User'); // <--- CRITICAL IMPORT ADDED

exports.getDashboardStats = async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const presentToday = await Attendance.countDocuments({
      date: { $gte: today, $lt: tomorrow },
      status: 'Present'
    });

    const absentToday = await Attendance.countDocuments({
      date: { $gte: today, $lt: tomorrow },
      status: 'Absent'
    });

    const pendingProfiles = await Employee.countDocuments({ isProfileComplete: false });
    
    // Salary Pending (Current Month)
    const currentMonth = new Date().toISOString().slice(0, 7); 
    const salaryPending = await Salary.countDocuments({
      month: currentMonth,
      status: 'Pending'
    });
    
    res.json({
      totalEmployees,
      presentToday,
      absentToday,
      pendingProfiles,
      salaryPending
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- NEW FUNCTION TO LIST HR USERS ---
exports.getHRUsers = async (req, res) => {
  try {
    // Find all users with role 'HR' and exclude the password field
    const users = await User.find({ role: 'HR' }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error("Get HR Users Error:", error);
    res.status(500).json({ message: error.message });
  }
};