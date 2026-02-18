const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Salary = require('../models/Salary');
const User = require('../models/User');

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

exports.getHRUsers = async (req, res) => {
  try {
    // Excluding the hashed password but keeping assignedPassword for the dashboard
    const users = await User.find({ role: 'HR' }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error("Get HR Users Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// --- NEW ENDPOINTS FOR HR ACCESS CONTROL ---

exports.grantHRAccess = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    user.password = password; // Will automatically get hashed by pre-save hook
    user.assignedPassword = password; // Saved as plaintext strictly for admin viewing
    await user.save();
    
    res.json({ message: "Access granted", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeHRAccess = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    user.password = undefined; // Nullifying access
    user.assignedPassword = undefined; // Hiding from dashboard
    await user.save();
    
    res.json({ message: "Access removed", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};