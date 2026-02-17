const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Hashed Password
  assignedPassword: { type: String }, // NEW: Plaintext stored for the Admin dashboard display
  role: { type: String, enum: ['ADMIN', 'HR', 'EMPLOYEE'], default: 'EMPLOYEE' },
  employeeProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  hrPermissions: {
    canEditEmployees: { type: Boolean, default: false },
    canViewDocs: { type: Boolean, default: false }
  }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false; // Prevent crash if access is revoked
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);