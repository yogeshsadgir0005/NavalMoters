const Employee = require('../models/Employee');
const User = require('../models/User');
const sheetService = require('../services/googleSheetService');

/**
 * Profile completion gate
 * Checks for essential fields to determine if the profile is "Complete"
 */
function computeProfileGate(emp) {
  const missing = [];

  // 1. Identity
  if (!emp.firstName || !emp.lastName || !emp.phone || !emp.email) {
    missing.push('Basic Identity');
  }

  // 2. Banking (Basic check)
  if (!emp.bankDetails?.accountNo) {
    missing.push('Bank Account');
  }

  // 3. Professional
  if (!emp.department || !emp.jobProfile) {
    missing.push('Department & Role');
  }

  // 4. Documents (Check if at least one major document is uploaded)
  const d = emp.documents || {};
  const hasDoc = d.photo || d.aadhar || d.pan || d.dl || d.bankProof;
  
  if (!hasDoc) {
    missing.push('At least one Document');
  }

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

exports.createEmployee = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, employeeCode, role, department, jobProfile } = req.body;

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
      department: department || null, 
      jobProfile: jobProfile || null,
      isProfileComplete: false
    });

    const user = await User.create({
      email,
      role: role === 'HR' ? 'HR' : 'EMPLOYEE',
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

// FIXED: Calculates progress dynamically so the bar shows 100% correctly
exports.getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({ status: { $ne: 'Terminated' } })
      .populate('department', 'name')
      .populate('jobProfile', 'name')
      .sort({ createdAt: -1 });

    const result = employees.map(doc => {
        const emp = doc.toObject();
        
        // Calculate Progress Score (5 Checkpoints = 20% each)
        let points = 0;
        
        // 1. Basics
        if (emp.firstName && emp.lastName && emp.email && emp.phone) points += 20;
        
        // 2. Family
        if (emp.family?.motherName || emp.family?.fatherName) points += 20;
        
        // 3. Banking
        if (emp.bankDetails?.accountNo) points += 20;
        
        // 4. Professional
        if (emp.department && emp.jobProfile) points += 20;
        
        // 5. Docs (Any valid doc)
        const d = emp.documents || {};
        if (d.photo || d.aadhar || d.pan || d.dl || d.bankProof) points += 20;

        const isCalculatedComplete = points === 100;

        return {
            ...emp,
            profileProgress: points,
            // If calculated as 100%, force completion status for UI, otherwise use DB flag
            isProfileComplete: isCalculatedComplete || emp.isProfileComplete 
        };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('department')
      .populate('jobProfile');

    if (!employee) return res.status(404).json({ message: 'Not found' });

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

exports.updateWizardStep = async (req, res) => {
  const { id } = req.params;
  const step = Number(req.query.step || 1);

  let updates = { ...req.body };
  stripEmpty(updates);

  if (updates.bankDetails) updates.bankDetails = safeJsonParse(updates.bankDetails, {});
  if (updates.family) updates.family = safeJsonParse(updates.family, {});
  if (updates.lastJob) updates.lastJob = safeJsonParse(updates.lastJob, {});
  if (updates.documentsMeta) updates.documentsMeta = safeJsonParse(updates.documentsMeta, {});

  if (updates.siblings) updates.siblings = safeJsonParse(updates.siblings, []);
  if (updates.kids) updates.kids = safeJsonParse(updates.kids, []);

  if (updates.siblings || updates.kids) {
    updates.family = updates.family || {};
    if (updates.siblings) updates.family.siblings = updates.siblings;
    if (updates.kids) updates.family.kids = updates.kids;
    delete updates.siblings;
    delete updates.kids;
  }

  let employee = await Employee.findById(id);
  if (!employee) return res.status(404).json({ message: 'Employee not found' });

  if (req.files) {
    const mergedDocs = employee.documents ? employee.documents.toObject() : {};
    Object.keys(req.files).forEach((field) => {
      const arr = req.files[field] || [];
      if (!arr.length) return;

      if (field === 'certificates' || field === 'otherKyc') {
        mergedDocs[field] = [...(mergedDocs[field] || []), ...arr.map((f) => f.filename)];
      } else {
        mergedDocs[field] = arr[0].filename;
      }
    });
    updates.documents = mergedDocs;
  }

  employee = await Employee.findByIdAndUpdate(id, updates, { new: true })
    .populate('department')
    .populate('jobProfile');

  const gate = computeProfileGate(employee);
  employee.isProfileComplete = gate.isComplete;
  await employee.save();

  res.json({ ...employee.toObject(), missingFields: gate.missing, stepSaved: step });
};

exports.getEmployeeProgress = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('department', 'name')
      .populate('jobProfile', 'name');

    if (!employee) return res.status(404).json({ message: 'Not found' });

    const gate = computeProfileGate(employee);

    // Reuse the same logic logic as getEmployees for consistency
    let points = 0;
    if (employee.firstName && employee.lastName && employee.email) points += 1;
    if (employee.family?.motherName) points += 1;
    if (employee.bankDetails?.accountNo) points += 1;
    if (employee.department && employee.jobProfile) points += 1;
    const d = employee.documents || {};
    if (d.photo || d.aadhar || d.pan || d.bankProof) points += 1;

    const completedSteps = points;

    res.json({
      isProfileComplete: employee.isProfileComplete,
      missingFields: gate.missing,
      completedSteps,
      totalSteps: 5
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

    employee.baseSalary = newSalary;
    
    const logEntry = {
      amount: value,
      type,
      reason,
      previousSalary,
      newSalary,
      date: new Date()
    };

    employee.increments.push(logEntry);
    await employee.save();
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
      terminatedBy
    };
    await employee.save();

    if (employee.userId) {
      await User.findByIdAndDelete(employee.userId);
    } else {
      await User.findOneAndDelete({ employeeProfile: employee._id });
    }

    res.json({ message: 'Employee terminated successfully.' });
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