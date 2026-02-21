const mongoose = require('mongoose');

const incrementSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  type: { type: String, enum: ['Increment', 'Decrement'], required: true },
  reason: { type: String, required: true },
  date: { type: Date, default: Date.now },
  previousSalary: Number,
  newSalary: Number,
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } 
});

const employeeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: String,
  employeeCode: { type: String, unique: true },
  
  isProfileComplete: { type: Boolean, default: false },
  
  status: { type: String, enum: ['Active', 'Terminated'], default: 'Active' }, 
  terminationDetails: {
    date: Date,
    terminatedBy: String
  },
  
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  jobProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'JobProfile' },
  doj: Date,
  wageType: { type: String, enum: ['Monthly', 'Daily'], default: 'Monthly' },
  baseSalary: { type: Number, default: 0 },

  increments: [incrementSchema],

  dob: Date,
  address: String,
  bankDetails: {
    accountNo: String,
    ifsc: String,
    bankName: String
  },
  family: {
    motherName: String,
    motherWork: String,
    fatherName: String,
    fatherWork: String,
    maritalStatus: String,
    spouseName: String,
    anniversary: Date,
    siblings: [{ name: String, occupation: String }],
    kids: [{ name: String, gender: String, dob: Date }]
  },
  
  documents: {
    aadhar: String,
    pan: String,
    photo: String,
    dl: String,
    appHindi: String,
    appEnglish: String,
    bankProof: String, 
    certificates: [String],
    otherKyc: [String]
  },
  
  lastJob: {
    company: String,
    duration: String,
    role: String,
    reason: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);