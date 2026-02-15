const express = require('express');
const cors = require('cors');
const path = require('path');
const errorHandler = require('./middlewares/errorHandler');
const fileRoutes = require("./routes/fileRoutes");
const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/employees', require('./routes/employeeRoutes'));
app.use('/api/salary', require('./routes/salaryRoutes'));
app.use('/api/masters', require('./routes/masterRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/files', require('./routes/fileRoutes'));
app.use(errorHandler);

module.exports = app;