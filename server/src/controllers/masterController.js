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