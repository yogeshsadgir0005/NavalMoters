const Employee = require('../models/Employee');
const User = require('../models/User');
const sheetService = require('../services/googleSheetService'); // <--- 1. Import Service
/**
 * Profile completion gate (Hard Lock)
 * Minimum:
 * 1) Aadhar OR Aadhar file uploaded (documents.aadhar)
 * 2) Bank account + IFSC
 * 3) department + jobProfile
 */
function computeProfileGate(emp) {
  const missing = [];

  const hasAadhar =
    !!emp.documents?.aadhar || !!emp.documents?.aadharNo || !!emp.documents?.aadharNumber;

  const hasBank =
    !!emp.bankDetails?.accountNo &&
    String(emp.bankDetails.accountNo).trim().length >= 6 &&
    !!emp.bankDetails?.ifsc &&
    String(emp.bankDetails.ifsc).trim().length >= 6;

  const hasDept = !!emp.department;
  const hasJob = !!emp.jobProfile;

  if (!hasAadhar) missing.push('Aadhar (upload)');
  if (!hasBank) missing.push('Bank Details (Account No + IFSC)');
  if (!hasDept) missing.push('Department');
  if (!hasJob) missing.push('Job Profile');

  const isComplete = missing.length === 0;
  return { isComplete, missing };
}

function safeJsonParse(val, fallback) {
  try {
    if (val === undefined || val === null) return fallback;
    if (Array.isArray(val)) val = val[val.length - 1];
    if (typeof val !== 'string') return val;
    const trimmed = val.trim();
    if (!trimmed) return fallback;
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) return JSON.parse(trimmed);
    return val;
  } catch {
    return fallback;
  }
}

function stripEmpty(updates) {
  Object.keys(updates).forEach((k) => {
    const v = updates[k];
    if (v === '' || v === 'null' || v === 'undefined') delete updates[k];
  });
  return updates;
}

// Create Initial Employee (Admin/HR Only)
exports.createEmployee = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, employeeCode } = req.body;

    if (!email) return res.status(400).json({ message: 'Email is required' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    const code = employeeCode && employeeCode.trim()
      ? employeeCode.trim()
      : 'EMP' + Date.now().toString().slice(-6);

    const employee = await Employee.create({
      firstName: firstName || '',
      lastName: lastName || '',
      email,
      phone: phone || '',
      employeeCode: code,
      isProfileComplete: false
    });

    const user = await User.create({
      email,
      role: 'EMPLOYEE',
      employeeProfile: employee._id
    });

    employee.userId = user._id;
    await employee.save();

    res.status(201).json(employee);
  } catch (error) {
    console.error('createEmployee error:', error);
    res.status(500).json({ message: error.message });
  }
};

// List employees (Admin/HR)
exports.getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate('department', 'name')
      .populate('jobProfile', 'name')
      .sort({ createdAt: -1 });

    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get employee by id (Admin/HR OR Employee self)
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('department')
      .populate('jobProfile');

    if (!employee) return res.status(404).json({ message: 'Not found' });

    // Employee can only view self
    if (req.user.role === 'EMPLOYEE') {
      const myId = String(req.user.employeeProfile || '');
      if (String(employee._id) !== myId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    }

    const gate = computeProfileGate(employee);
    res.json({ ...employee.toObject(), missingFields: gate.missing });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Employee self endpoint
exports.getMyEmployeeProfile = async (req, res) => {
  try {
    if (req.user.role !== 'EMPLOYEE') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const empId = req.user.employeeProfile;
    const employee = await Employee.findById(empId)
      .populate('department')
      .populate('jobProfile');

    if (!employee) return res.status(404).json({ message: 'Not found' });

    const gate = computeProfileGate(employee);
    res.json({ ...employee.toObject(), missingFields: gate.missing });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Wizard Save (Step-based)
exports.updateWizardStep = async (req, res) => {
  const { id } = req.params;
  const step = Number(req.query.step || 1);

  let updates = { ...req.body };
  stripEmpty(updates);

  // Parse nested JSON
  if (updates.bankDetails) updates.bankDetails = safeJsonParse(updates.bankDetails, {});
  if (updates.family) updates.family = safeJsonParse(updates.family, {});
  if (updates.lastJob) updates.lastJob = safeJsonParse(updates.lastJob, {});
  if (updates.documentsMeta) updates.documentsMeta = safeJsonParse(updates.documentsMeta, {});

  // Parse arrays if sent as JSON strings
  if (updates.siblings) updates.siblings = safeJsonParse(updates.siblings, []);
  if (updates.kids) updates.kids = safeJsonParse(updates.kids, []);

  // Put siblings/kids into family
  if (updates.siblings || updates.kids) {
    updates.family = updates.family || {};
    if (updates.siblings) updates.family.siblings = updates.siblings;
    if (updates.kids) updates.family.kids = updates.kids;
    delete updates.siblings;
    delete updates.kids;
  }

  // Handle files
  let employee = await Employee.findById(id);
  if (!employee) return res.status(404).json({ message: 'Employee not found' });

  if (req.files) {
    const mergedDocs = employee.documents ? employee.documents.toObject() : {};
    Object.keys(req.files).forEach((field) => {
      const arr = req.files[field] || [];
      if (!arr.length) return;

      // multi-file fields
      if (field === 'certificates' || field === 'otherKyc') {
        mergedDocs[field] = [...(mergedDocs[field] || []), ...arr.map((f) => f.filename)];
      } else {
        mergedDocs[field] = arr[0].filename;
      }
    });
    updates.documents = mergedDocs;
  }

  // Apply update
  employee = await Employee.findByIdAndUpdate(id, updates, { new: true })
    .populate('department')
    .populate('jobProfile');

  // Gate recalculation every save
  const gate = computeProfileGate(employee);
  employee.isProfileComplete = gate.isComplete;
  await employee.save();

  res.json({ ...employee.toObject(), missingFields: gate.missing, stepSaved: step });
};

// Progress endpoint for personnel list
exports.getEmployeeProgress = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('department', 'name')
      .populate('jobProfile', 'name');

    if (!employee) return res.status(404).json({ message: 'Not found' });

    const gate = computeProfileGate(employee);

    // Simple step completion heuristic
    const step1 = !!(employee.firstName || employee.lastName || employee.documents?.aadhar || employee.bankDetails?.accountNo);
    const step2 = !!(employee.family?.motherName || employee.family?.fatherName || (employee.family?.siblings || []).length || (employee.family?.kids || []).length);
    const step3 = !!(employee.department && employee.jobProfile && employee.baseSalary);
    const step4 = !!(employee.lastJob?.company || employee.lastJob?.role || employee.lastJob?.duration);

    const completedSteps = [step1, step2, step3, step4].filter(Boolean).length;

    res.json({
      isProfileComplete: employee.isProfileComplete,
      missingFields: gate.missing,
      completedSteps,
      totalSteps: 4
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.addSalaryIncrement = async (req, res) => {
  const { id } = req.params;
  const { amount, type, reason } = req.body; 

  try {
    const employee = await Employee.findById(id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const previousSalary = employee.baseSalary || 0;
    const value = Number(amount);
    
    let newSalary = previousSalary;
    if (type === 'Increment') {
      newSalary = previousSalary + value;
    } else if (type === 'Decrement') {
      newSalary = Math.max(0, previousSalary - value); 
    }

    // Update DB
    employee.baseSalary = newSalary;
    
    // Create Log Object
    const logEntry = {
      amount: value,
      type,
      reason,
      previousSalary,
      newSalary,
      date: new Date()
    };

    // Add to History
    employee.increments.push(logEntry);

    await employee.save();

    // 👇 2. Sync to Google Sheet (Fire and Forget)
    sheetService.syncIncrement(logEntry, employee);

    res.json({ 
      message: 'Salary updated successfully', 
      baseSalary: newSalary, 
      increments: employee.increments 
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};