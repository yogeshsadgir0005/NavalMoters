// src/routes/fileRoutes.js
const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const { viewEmployeeFile } = require("../controllers/fileController");

const router = express.Router();

// Must be logged in (Admin/HR/Employee)
// Permissions are enforced inside the controller
router.get("/employee/:employeeId/:filename", protect, viewEmployeeFile);

module.exports = router;
