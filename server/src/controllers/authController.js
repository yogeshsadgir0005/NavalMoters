const User = require("../models/User");
const Otp = require("../models/Otp");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });

const OTP_EXPIRY_MINUTES = 5;

exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (
      user &&
      (user.role === "ADMIN" || user.role === "HR") &&
      user.password &&
      (await user.matchPassword(password))
    ) {
      return res.json({
        _id: user._id,
        email: user.email,
        role: user.role,
        employeeId: user.employeeProfile || null,
        token: generateToken(user._id),
      });
    }

    return res
      .status(401)
      .json({ message: "Invalid credentials or unauthorized access." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.registerHR = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({
      email,
      password,
      role: "HR",
    });

    return res.status(201).json({ message: "HR User Created Successfully", user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.requestOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found in the system" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(otp, salt);

    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await Otp.create({
      email,
      otpHash,
      expiresAt,
    });

    const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY, 
      },
      body: JSON.stringify({
        sender: {
          name: "Naval Motor Portal",
          email: process.env.SMTP_EMAIL,  
        },
        to: [{ email: email }],
        subject: "Your Login Access Code",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #0f172a; text-align: center;">Naval Motor Enterprise Portal</h2>
            <p style="color: #475569; text-align: center;">Your One-Time Password (OTP) for secure login is:</p>
            <div style="background-color: #f1f5f9; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <h1 style="color: #2563eb; letter-spacing: 5px; margin: 0; font-size: 32px;">${otp}</h1>
            </div>
            <p style="color: #64748b; font-size: 12px; text-align: center;">This code will expire in ${OTP_EXPIRY_MINUTES} minutes.</p>
            <p style="color: #64748b; font-size: 12px; text-align: center;">If you did not request this, please ignore this email.</p>
          </div>
        `,
      }),
    });

    if (!brevoResponse.ok) {
      const errorData = await brevoResponse.json();
      console.error("Brevo API Error:", errorData);
      return res.status(500).json({ message: "Failed to send OTP email via API" });
    }

    return res.json({ message: "Access code sent to your email" });
  } catch (error) {
    console.error("Email Error:", error);
    return res.status(500).json({
      message: "Failed to send OTP email",
      error: error?.message || "Unknown error",
    });
  }
};


exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await Otp.findOne({ email }).sort({ createdAt: -1 });

    if (!otpRecord) return res.status(400).json({ message: "Invalid or expired OTP" });

    if (otpRecord.expiresAt && new Date() > new Date(otpRecord.expiresAt)) {
      await Otp.deleteMany({ email });
      return res.status(400).json({ message: "OTP expired. Please request a new one." });
    }

    const isMatch = await bcrypt.compare(otp, otpRecord.otpHash);
    if (!isMatch) return res.status(400).json({ message: "Invalid OTP" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

   
    await Otp.deleteMany({ email });

    return res.json({
      _id: user._id,
      email: user.email,
      role: user.role,
      employeeId: user.employeeProfile || null,
      token: generateToken(user._id),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
