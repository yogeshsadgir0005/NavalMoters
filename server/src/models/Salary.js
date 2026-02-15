const mongoose = require('mongoose');

// Sub-schema for individual history logs
const adjustmentSchema = new mongoose.Schema({
  type: { type: String, enum: ['Incentive', 'Penalty'], required: true },
  amount: { type: Number, required: true },
  reason: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const salarySchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  month: { type: String, required: true }, // Format: "YYYY-MM"
  
  // Calculations
  baseSalary: Number,
  presentDays: Number,
  totalDays: Number,
  nightDutyCount: { type: Number, default: 0 },
  
  // Financials
  earnedAmount: Number,
  incentives: { type: Number, default: 0 },
  
  // NEW: Adjustment History
  adjustments: [adjustmentSchema], // <--- This is required for the history dropdown

  bonus: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 },
  advancesRecovered: { type: Number, default: 0 },
  
  netPay: Number,
  
  status: { type: String, enum: ['Pending', 'In Progress', 'Paid', 'Hold'], default: 'Pending' },
  transactionId: String,
  paidDate: Date
}, { timestamps: true });

// Prevent duplicate salary generation for the same month
salarySchema.index({ employee: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Salary', salarySchema);