const mongoose = require('mongoose');

const incrementSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  type: { type: String, enum: ['Increment', 'Decrement'], required: true },
  reason: { type: String, required: true },
  date: { type: Date, default: Date.now },
  previousSalary: Number,
  newSalary: Number,
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Optional audit trail
});

const employeeSchema = new mongoose.Schema({
  // Identity
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: String,
  employeeCode: { type: String, unique: true },
  
  // Profile Status
  isProfileComplete: { type: Boolean, default: false },
  
  // Job Details
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  jobProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'JobProfile' },
  doj: Date,
  wageType: { type: String, enum: ['Monthly', 'Daily'], default: 'Monthly' },
  baseSalary: { type: Number, default: 0 },

  // History Arrays
  increments: [incrementSchema], // <--- NEW: Stores history of salary changes

  // Personal & Family
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
  
  // Documents (Filenames)
  documents: {
    aadhar: String,
    pan: String,
    photo: String,
    dl: String,
    appHindi: String,
    appEnglish: String,
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