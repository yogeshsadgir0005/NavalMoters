const express = require('express');
const cors = require('cors');
const path = require('path');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

const allowedOrigins = [
  "https://nawal-motors.vercel.app",
  "http://localhost:5173"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS: " + origin));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options("*", cors());

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.get('/', (req, res) => {
  res.send('API is running...');
});
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/employees', require('./routes/employeeRoutes'));
app.use('/api/salary', require('./routes/salaryRoutes'));
app.use('/api/masters', require('./routes/masterRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/files', require('./routes/fileRoutes'));

app.use(errorHandler);

module.exports = app;
