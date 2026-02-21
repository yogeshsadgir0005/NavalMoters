const Department = require('../models/Department');
const JobProfile = require('../models/JobProfile');

exports.getAll = async (req, res) => {
  const depts = await Department.find();
  const jobs = await JobProfile.find();
  res.json({ departments: depts, jobProfiles: jobs });
};

exports.addDepartment = async (req, res) => {
  const item = await Department.create(req.body);
  res.json(item);
};

exports.addJobProfile = async (req, res) => {
  const item = await JobProfile.create(req.body);
  res.json(item);
};

exports.deleteDepartment = async (req, res) => {
  try {
    await Department.findByIdAndDelete(req.params.id);
    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteJobProfile = async (req, res) => {
  try {
    await JobProfile.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job Profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};