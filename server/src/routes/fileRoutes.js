const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const { viewEmployeeFile } = require("../controllers/fileController");

const router = express.Router();
router.get("/employee/:employeeId/:filename", protect, viewEmployeeFile);

module.exports = router;
