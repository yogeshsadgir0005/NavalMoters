require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Department = require('./src/models/Department');
const JobProfile = require('./src/models/JobProfile');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  
  const adminExists = await User.findOne({ email: 'admin@naval.com' });
  if (!adminExists) {
    await User.create({
      email: 'nawalmotors@gmail.com',
      password: 'admin',
      role: 'ADMIN'
    });
    console.log('Admin created');
  }

  await Department.deleteMany();
  await Department.insertMany([
    { name: 'Mechanical' }, { name: 'Sales' }, { name: 'Bodyshop' }
  ]);

  await JobProfile.deleteMany();
  await JobProfile.insertMany([
    { name: 'Fitter' }, { name: 'Painter' }, { name: 'Manager' }
  ]);

  console.log('Data seeded');
  process.exit();
};

seed();