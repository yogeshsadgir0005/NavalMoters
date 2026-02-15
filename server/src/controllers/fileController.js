const path = require("path");
const fs = require("fs");
const Employee = require("../models/Employee");

// ✅ always resolves to /server/server/uploads no matter where nodemon runs
const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads");

function safeName(name) {
  return path.basename(name || "");
}

function employeeHasFile(employee, filename) {
  const docs = employee.documents || {};
  const values = [];

  for (const key of Object.keys(docs)) {
    const v = docs[key];
    if (!v) continue;
    if (Array.isArray(v)) values.push(...v);
    else values.push(v);
  }

  return values.includes(filename);
}

exports.viewEmployeeFile = async (req, res) => {
  try {
    const employeeId = req.params.employeeId;
    const filename = safeName(req.params.filename);

    const employee = await Employee.findById(employeeId).lean();
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    // ✅ role check must match your DB roles (Admin/HR/Employee)
    const role = String(req.user?.role || "").toLowerCase();

    if (role === "employee") {
      // If your User model has employeeProfile link, keep this.
      // If not, tell me what field connects user->employee.
      const myEmpId = String(req.user.employeeProfile || "");
      if (String(employee._id) !== myEmpId) {
        return res.status(403).json({ message: "Forbidden" });
      }
    }

    if (!employeeHasFile(employee, filename)) {
      return res.status(404).json({ message: "File not linked to employee" });
    }

    const filePath = path.join(UPLOAD_DIR, filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File missing on server" });
    }

    res.setHeader("Content-Disposition", "inline");
    return res.sendFile(filePath);
  } catch (e) {
    console.error("viewEmployeeFile error:", e);
    res.status(500).json({ message: e.message });
  }
};
