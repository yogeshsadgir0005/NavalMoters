const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['Present', 'Absent', 'Half Day', 'Leave'], required: true },
  isNightDuty: { type: Boolean, default: false }, // <--- New Field
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Prevent duplicate attendance for the same employee on the same day
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);