const User = require('../models/User');
const Otp = require('../models/Otp');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  family: 4, 
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASS,
  },
  tls: {
      rejectUnauthorized: false
  }
});

exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (user.role === 'ADMIN' || user.role === 'HR') && user.password && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      email: user.email,
      role: user.role,
      employeeId: user.employeeProfile || null,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid credentials or unauthorized access.' });
  }
};

exports.registerHR = async (req, res) => {
  const { email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({
      email,
      password, 
      role: 'HR'
    });

    res.status(201).json({ message: 'HR User Created Successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.requestOtp = async (req, res) => {
  const { email } = req.body;
  
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found in the system' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const salt = await bcrypt.genSalt(10);
  const otpHash = await bcrypt.hash(otp, salt);

  await Otp.create({ email, otpHash });
  
  try {
    await transporter.sendMail({
      from: `"Naval Motor Portal" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: 'Your Login Access Code',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-w: 500px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #0f172a; text-align: center;">Naval Motor Enterprise Portal</h2>
          <p style="color: #475569; text-align: center;">Your One-Time Password (OTP) for secure login is:</p>
          <div style="background-color: #f1f5f9; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
             <h1 style="color: #2563eb; letter-spacing: 5px; margin: 0; font-size: 32px;">${otp}</h1>
          </div>
          <p style="color: #64748b; font-size: 12px; text-align: center;">This code will expire in 5 minutes.</p>
          <p style="color: #64748b; font-size: 12px; text-align: center;">If you did not request this, please ignore this email.</p>
        </div>
      `
    });
    res.json({ message: 'Access code sent to your email' });
  } catch (error) {
    console.error("Email Error:", error);
    res.status(500).json({ message: 'Failed to send OTP email' });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const otpRecord = await Otp.findOne({ email }).sort({ createdAt: -1 });

  if (!otpRecord) return res.status(400).json({ message: 'Invalid or expired OTP' });

  const isMatch = await bcrypt.compare(otp, otpRecord.otpHash);
  if (!isMatch) return res.status(400).json({ message: 'Invalid OTP' });

  const user = await User.findOne({ email });
  await Otp.deleteMany({ email }); 

  res.json({
    _id: user._id,
    email: user.email,
    role: user.role, 
    employeeId: user.employeeProfile || null,
    token: generateToken(user._id)
  });
};
