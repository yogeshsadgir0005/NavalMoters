const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Salary = require('../models/Salary');
const User = require('../models/User');

exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Total Staff: Exclude Terminated
    const totalEmployees = await Employee.countDocuments({ status: { $ne: 'Terminated' } });
    
    // 2. Attendance Counts
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

    // 3. Pending Docs: Smart Calculation (Matches Personnel Page Logic)
    // We fetch all active employees and check their fields manually to be 100% accurate
    const allActiveEmployees = await Employee.find({ status: { $ne: 'Terminated' } })
      .select('firstName lastName email phone family bankDetails department jobProfile documents isProfileComplete');

    const pendingProfiles = allActiveEmployees.filter(emp => {
        // If DB flag is already true, it's complete
        if (emp.isProfileComplete) return false;

        // Otherwise, run the "Strict Check"
        const d = emp.documents || {};
        const hasMandatoryDocs = d.photo && d.aadhar && d.pan && d.bankProof;
        
        const hasBasicInfo = emp.firstName && emp.lastName && emp.email && emp.phone;
        const hasJobInfo = emp.department && emp.jobProfile;
        const hasBankInfo = emp.bankDetails?.accountNo;

        // If ALL criteria are met, it is NOT pending (return false)
        if (hasBasicInfo && hasJobInfo && hasBankInfo && hasMandatoryDocs) {
            return false; 
        }
        // Otherwise, it IS pending
        return true; 
    }).length;
    
    // 4. Salary Pending
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
    const users = await User.find({ role: 'HR' }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error("Get HR Users Error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.grantHRAccess = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    user.password = password; 
    user.assignedPassword = password; 
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
    
    user.password = undefined; 
    user.assignedPassword = undefined; 
    await user.save();
    
    res.json({ message: "Access removed", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};