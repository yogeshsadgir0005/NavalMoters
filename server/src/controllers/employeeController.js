const Employee = require('../models/Employee');
const User = require('../models/User');
const sheetService = require('../services/googleSheetService');

function computeProfileGate(emp) {
  const missing = [];
  if (!emp.firstName || !emp.lastName || !emp.phone || !emp.email) missing.push('Basic Identity');
  if (!emp.bankDetails?.accountNo) missing.push('Bank Account');
  if (!emp.department || !emp.jobProfile) missing.push('Department & Role');

  const d = emp.documents || {};
  if (!d.photo) missing.push('Profile Photo');
  if (!d.aadhar) missing.push('Aadhar Card');
  if (!d.pan) missing.push('PAN Card');
  if (!d.bankProof) missing.push('Bank Proof');

  const isComplete = missing.length === 0;
  return { isComplete, missing };
}

function safeJsonParse(val, fallback) {
  try {
    if (val === undefined || val === null || val === 'undefined') return fallback;
    return typeof val === 'string' ? JSON.parse(val) : val;
  } catch (e) {
    return fallback;
  }
}

function safeSheetCall(fn, ...args) {
  try {
    if (typeof fn === 'function') {
      Promise.resolve(fn(...args)).catch(console.error);
    }
  } catch (e) {
    console.error(e);
  }
}

exports.createEmployee = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, department, jobProfile, role } = req.body;

    const existingEmp = await Employee.findOne({ email });
    if (existingEmp) return res.status(400).json({ message: 'Employee with this email already exists.' });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User with this email already exists.' });

    const count = await Employee.countDocuments();
    const employeeCode = `EMP${1000 + count + 1}`;

    const employee = new Employee({
      firstName,
      lastName,
      email,
      phone,
      employeeCode,
      department,
      jobProfile,
      status: 'Active',
    });

    const userRole = role || 'EMPLOYEE';

    const user = new User({
      email,
      role: userRole,
      employeeProfile: employee._id,
    });

    await user.save();
    employee.userId = user._id;
    await employee.save();

    safeSheetCall(sheetService?.syncEmployee, employee);

    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({ status: 'Active' })
      .populate('department', 'name')
      .populate('jobProfile', 'name')
      .sort({ createdAt: -1 });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTerminatedEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({ status: 'Terminated' })
      .populate('department', 'name')
      .populate('jobProfile', 'name')
      .sort({ 'terminationDetails.date': -1 });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('department', 'name')
      .populate('jobProfile', 'name');
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyEmployeeProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'employeeProfile',
      populate: [
        { path: 'department', select: 'name' },
        { path: 'jobProfile', select: 'name' },
      ],
    });

    if (!user || !user.employeeProfile) {
      const empByUserId = await Employee.findOne({ userId: req.user.id })
        .populate('department', 'name')
        .populate('jobProfile', 'name');
      if (empByUserId) return res.json(empByUserId);
      return res.status(404).json({ message: 'Employee profile not found for this user.' });
    }

    res.json(user.employeeProfile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateWizardStep = async (req, res) => {
  try {
    const { step } = req.query;
    let employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    if (step === '1') {
      if (req.body.firstName !== undefined) employee.firstName = req.body.firstName;
      if (req.body.lastName !== undefined) employee.lastName = req.body.lastName;
      if (req.body.phone !== undefined) employee.phone = req.body.phone;
      if (req.body.address !== undefined) employee.address = req.body.address;

      if (req.body.dob !== undefined) employee.dob = req.body.dob ? req.body.dob : null;

      if (req.body.email && req.body.email !== employee.email) {
        const emailExists = await Employee.findOne({ email: req.body.email, _id: { $ne: employee._id } });
        if (emailExists) return res.status(400).json({ message: 'Email already in use by another employee.' });

        const userEmailExists = await User.findOne({ email: req.body.email });
        if (userEmailExists && String(userEmailExists.employeeProfile) !== String(employee._id)) {
          return res.status(400).json({ message: 'Email already in use by a system user.' });
        }

        employee.email = req.body.email;

        if (employee.userId) {
          await User.findByIdAndUpdate(employee.userId, { email: req.body.email });
        } else {
          await User.findOneAndUpdate({ employeeProfile: employee._id }, { email: req.body.email });
        }
      }

      if (req.body.bankDetails) {
        employee.bankDetails = safeJsonParse(req.body.bankDetails, employee.bankDetails);
      }

      employee.documents = employee.documents || {};
      if (req.files) {
        ['aadhar', 'pan', 'photo', 'bankProof', 'dl', 'appHindi', 'appEnglish'].forEach((field) => {
          if (req.files[field]) {
            employee.documents[field] = req.files[field][0].filename;
          }
        });

        if (req.files.certificates) {
          const certs = req.files.certificates.map((f) => f.filename);
          employee.documents.certificates = [...(employee.documents.certificates || []), ...certs];
        }

        if (req.files.otherKyc) {
          const others = req.files.otherKyc.map((f) => f.filename);
          employee.documents.otherKyc = [...(employee.documents.otherKyc || []), ...others];
        }
      }
    }

    if (step === '2') {
      if (req.body.family) {
        employee.family = { ...employee.family, ...safeJsonParse(req.body.family, {}) };
      }
      if (req.body.siblings) employee.family.siblings = safeJsonParse(req.body.siblings, []);
      if (req.body.kids) employee.family.kids = safeJsonParse(req.body.kids, []);
    }

    if (step === '3') {
      if (req.body.department) employee.department = req.body.department;
      if (req.body.jobProfile) employee.jobProfile = req.body.jobProfile;
      if (req.body.wageType) employee.wageType = req.body.wageType;
      if (req.body.baseSalary !== undefined) employee.baseSalary = req.body.baseSalary;
    }

    if (step === '4') {
      if (req.body.lastJob) {
        employee.lastJob = safeJsonParse(req.body.lastJob, employee.lastJob);
      }
    }

    const { isComplete } = computeProfileGate(employee);
    employee.isProfileComplete = isComplete;

    await employee.save();

    safeSheetCall(sheetService?.syncEmployee, employee);

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEmployeeProgress = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    const progress = computeProfileGate(employee);
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addSalaryIncrement = async (req, res) => {
  try {
    const { amount, reason, type } = req.body;
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const prevSalary = employee.baseSalary;
    let newSalary = prevSalary;

    const adjAmount = Number(amount);

    if (type === 'Increment') {
      newSalary += adjAmount;
    } else if (type === 'Decrement') {
      newSalary -= adjAmount;
      if (newSalary < 0) newSalary = 0;
    }

    const incrementRecord = {
      amount: adjAmount,
      type,
      reason,
      date: new Date(),
      previousSalary: prevSalary,
      newSalary,
      updatedBy: req.user.id,
    };

    employee.increments.push(incrementRecord);
    employee.baseSalary = newSalary;
    await employee.save();

    safeSheetCall(sheetService?.syncIncrement, incrementRecord, employee);
    safeSheetCall(sheetService?.syncEmployee, employee);

    res.json({
      message: 'Salary updated successfully',
      baseSalary: newSalary,
      increments: employee.increments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.terminateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const actionUser = await User.findById(req.user.id);
    let terminatedBy = 'Admin';
    if (actionUser && actionUser.role === 'HR') {
      terminatedBy = `HR (${actionUser.email})`;
    }

    employee.status = 'Terminated';
    employee.terminationDetails = {
      date: new Date(),
      terminatedBy,
    };
    await employee.save();

    if (employee.userId) {
      await User.findByIdAndDelete(employee.userId);
    } else {
      await User.findOneAndDelete({ employeeProfile: employee._id });
    }

    safeSheetCall(sheetService?.syncEmployee, employee);

    res.json({ message: 'Employee terminated successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};