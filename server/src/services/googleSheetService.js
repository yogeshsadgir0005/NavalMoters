const { google } = require("googleapis");
const Employee = require('../models/Employee'); // Added to fetch salary if missing

const SPREADSHEET_ID =
  process.env.GOOGLE_SHEET_ID ||
  "1WVoCKLuUaihjSM46_1saFq1nA90dQH3xDHA4urR5uVQ";

function loadCredentials() {
  if (process.env.GOOGLE_CREDENTIALS_B64) {
    const jsonStr = Buffer.from(
      process.env.GOOGLE_CREDENTIALS_B64,
      "base64"
    ).toString("utf8");
    return JSON.parse(jsonStr);
  }
  if (process.env.GOOGLE_CREDENTIALS_JSON) {
    return JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
  }
  throw new Error(
    "Missing Google credentials. Set GOOGLE_CREDENTIALS_B64 or GOOGLE_CREDENTIALS_JSON."
  );
}

function buildAuth() {
  const credentials = loadCredentials();
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

async function getSheetClient() {
  const auth = buildAuth();
  const client = await auth.getClient();
  return google.sheets({ version: "v4", auth: client });
}

async function ensureHeader(sheets, tabName, headerRow) {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${tabName}!A1:Z1`,
    });
    const rows = res.data.values;
    if (!rows || rows.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${tabName}!A1`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [headerRow] },
      });
    }
  } catch (e) {
    console.error(`Header check failed for ${tabName}:`, e.message);
  }
}

// Helper: Returns 1-based row index if found, else null
async function findRowIndex(sheets, tabName, criteria) {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${tabName}!A:B`, // Checking Date/Month (Col A) & EmpCode (Col B)
      valueRenderOption: "FORMATTED_VALUE",
    });

    const rows = res.data.values;
    if (!rows || rows.length < 2) return null;

    const targetDate = String(criteria.dateOrMonth).trim();
    const targetEmp = String(criteria.empCode).trim();

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      // Compare Col A and Col B
      if (
        String(row[0]).trim() === targetDate && 
        String(row[1]).trim() === targetEmp
      ) {
        return i + 1; // 1-based index
      }
    }
    return null;
  } catch (e) {
    return null;
  }
}

function formatDateOnly(date) {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
}

function safeText(val, fallback = "") {
  if (val === undefined || val === null) return fallback;
  return String(val);
}

// ------------------------------------------------------------------
// 1) SYNC ATTENDANCE (Single Record Upsert)
// ------------------------------------------------------------------
exports.syncAttendance = async (attendanceDoc) => {
  try {
    const sheets = await getSheetClient();
    const tabName = "Attendance";
    
    const headers = ["Date", "Emp Code", "Name", "Status", "Shift", "Marked By", "Last Updated"];
    await ensureHeader(sheets, tabName, headers);

    const emp = attendanceDoc.employee;
    const empCode = safeText(emp?.employeeCode, "N/A");
    const dateStr = formatDateOnly(attendanceDoc.date);
    const empName = safeText(emp?.firstName + " " + (emp?.lastName || ""), "Unknown");
    
    const rowData = [
      "'" + dateStr, // Force text format
      empCode,
      empName,
      attendanceDoc.status,
      attendanceDoc.isNightDuty ? "Night" : "Day",
      safeText(attendanceDoc.markedBy, "System"),
      formatDateOnly(new Date()),
    ];

    const rowIndex = await findRowIndex(sheets, tabName, { dateOrMonth: dateStr, empCode });

    if (rowIndex) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${tabName}!A${rowIndex}`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [rowData] },
      });
    } else {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${tabName}!A:G`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [rowData] },
      });
    }
  } catch (error) {
    console.error("Attendance Sync Error:", error.message);
  }
};

// ------------------------------------------------------------------
// 2) SYNC PAYROLL (Bulk List Upsert)
// ------------------------------------------------------------------
exports.syncPayroll = async (payrollList) => {
  try {
    const sheets = await getSheetClient();
    const tabName = "Salary";

    const headers = [
      "Month", "Emp Code", "Name", "Department", "Role", 
      "Days Present", "Incentives", "Deductions", "Base Salary", 
      "Net Pay", "Status", "Generated On"
    ];
    await ensureHeader(sheets, tabName, headers);

    // Process list one by one to check duplicates
    for (const p of (payrollList || [])) {
        const emp = p.employee || p; // Handle populated or flat structure
        
        const empCode = safeText(
            emp?.employeeCode ?? emp?.empCode, 
            "N/A"
        );
        const empName = safeText(
            emp?.firstName ? `${emp.firstName} ${emp.lastName}` : (emp?.name || "Unknown"),
            "Unknown"
        );
        const monthStr = safeText(p.month, "");

        // --- NEW: Robust Salary Fetch Logic ---
        // 1. Try payload salary
        // 2. Try populated employee salary
        // 3. If 0, fetch fresh from DB to be 100% sure
        let finalBaseSalary = p.baseSalary || emp?.baseSalary || 0;

        if (finalBaseSalary === 0 && (p.employee || emp._id)) {
            try {
                // If it's an object use _id, else assume it's an ID string
                const eId = p.employee?._id || p.employee || emp._id; 
                const dbEmp = await Employee.findById(eId).select('baseSalary');
                if (dbEmp && dbEmp.baseSalary) {
                    finalBaseSalary = dbEmp.baseSalary;
                }
            } catch (err) {
                console.error("Failed to fetch fallback salary:", err.message);
            }
        }

        const rowData = [
            "'" + monthStr, // Force text format
            empCode,
            empName,
            safeText(emp?.department?.name || emp?.department, "-"),
            safeText(emp?.jobProfile?.name || emp?.jobProfile, "-"),
            p.presentDays ?? 0,
            p.incentives ?? 0,
            p.deductions ?? 0,
            "'" + finalBaseSalary, // FIX: Force text format to prevent "Date" conversion in Sheet
            p.netPay ?? 0,
            p.status,
            formatDateOnly(new Date()),
        ];

        const rowIndex = await findRowIndex(sheets, tabName, { dateOrMonth: monthStr, empCode });

        if (rowIndex) {
            await sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: `${tabName}!A${rowIndex}`,
                valueInputOption: "USER_ENTERED",
                requestBody: { values: [rowData] },
            });
        } else {
            await sheets.spreadsheets.values.append({
                spreadsheetId: SPREADSHEET_ID,
                range: `${tabName}!A:L`,
                valueInputOption: "USER_ENTERED",
                requestBody: { values: [rowData] },
            });
        }
    }
    console.log(`✅ Salary synced: ${payrollList.length} records processed`);

  } catch (error) {
    console.error("Salary Sync Error:", error.message);
  }
};

// ------------------------------------------------------------------
// 3) SYNC INCREMENTS (Upsert)
// ------------------------------------------------------------------
exports.syncIncrement = async (incrementLog, employee) => {
  try {
    const sheets = await getSheetClient();
    const tabName = "Increments";

    const headers = [
      "Date", "Emp Code", "Name", "Type", 
      "Amount", "Previous Salary", "New Salary", "Reason", "Logged On"
    ];
    await ensureHeader(sheets, tabName, headers);

    const empCode = safeText(employee?.employeeCode, "N/A");
    const dateStr = formatDateOnly(incrementLog?.date);
    const empName = safeText(employee?.firstName + " " + (employee?.lastName || ""), "Unknown");

    const rowData = [
      "'" + dateStr, // Force text format
      empCode,
      empName,
      safeText(incrementLog?.type, ""),
      incrementLog?.amount ?? 0,
      incrementLog?.previousSalary ?? 0,
      incrementLog?.newSalary ?? 0,
      safeText(incrementLog?.reason, ""),
      formatDateOnly(new Date()),
    ];

    const rowIndex = await findRowIndex(sheets, tabName, { dateOrMonth: dateStr, empCode });

    if (rowIndex) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${tabName}!A${rowIndex}`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [rowData] },
      });
    } else {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${tabName}!A:I`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [rowData] },
      });
    }
  } catch (error) {
    console.error("Increment Sync Error:", error.message);
  }
};