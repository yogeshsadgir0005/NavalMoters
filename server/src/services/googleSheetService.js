const { google } = require("googleapis");
const Employee = require('../models/Employee'); 

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

// Ensure header exists (Checks A1, updates if empty)
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

function formatDateOnly(date) {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
}

function safeText(val, fallback = "") {
  if (val === undefined || val === null) return fallback;
  return String(val);
}

// ------------------------------------------------------------------
// 1) BATCH SYNC ATTENDANCE (Instantly handles 1 or 100 records)
// ------------------------------------------------------------------
exports.syncAttendance = async (attendanceData) => {
  try {
    // 1. Normalize input to always be an array
    const docs = Array.isArray(attendanceData) ? attendanceData : [attendanceData];
    if (docs.length === 0) return;

    const sheets = await getSheetClient();
    const tabName = "Attendance";
    const headers = ["Date", "Emp Code", "Name", "Status", "Shift", "Marked By", "Last Updated"];
    await ensureHeader(sheets, tabName, headers);

    // 2. Fetch existing data ONCE (Massive performance boost)
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${tabName}!A:B`, // Only get Date and EmpCode for matching
    });
    const rows = res.data.values || [];

    // 3. Build a fast lookup map in memory
    const rowMap = new Map();
    for (let i = 1; i < rows.length; i++) {
      const rDate = String(rows[i][0] || "").trim();
      const rCode = String(rows[i][1] || "").trim();
      rowMap.set(`${rDate}_${rCode}`, i + 1); // i + 1 gives actual Google Sheet row number
    }

    const updateData = [];
    const appendData = [];

    // 4. Sort incoming data into "Updates" or "Appends"
    for (const doc of docs) {
      const emp = doc.employee || doc;
      const empCode = safeText(emp?.employeeCode, "N/A");
      const dateStr = formatDateOnly(doc.date);
      const empName = safeText(emp?.firstName ? `${emp.firstName} ${emp.lastName}` : (emp?.name || "Unknown"), "Unknown");
      
      const rowData = [
        "'" + dateStr, // Force text format
        empCode,
        empName,
        doc.status,
        doc.isNightDuty ? "Night" : "Day",
        safeText(doc.markedBy, "System"),
        formatDateOnly(new Date()),
      ];

      const key = `${dateStr}_${empCode}`;
      if (rowMap.has(key)) {
        // Exists: Overwrite the specific row
        const rowIndex = rowMap.get(key);
        updateData.push({
          range: `${tabName}!A${rowIndex}:G${rowIndex}`,
          values: [rowData],
        });
      } else {
        // New: Append to bottom
        appendData.push(rowData);
        rowMap.set(key, rows.length + appendData.length); // Prevent duplicates within same batch
      }
    }

    // 5. Fire exactly TWO optimized API calls
    if (updateData.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: { valueInputOption: "USER_ENTERED", data: updateData },
      });
    }

    if (appendData.length > 0) {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${tabName}!A:G`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: appendData },
      });
    }
    
    console.log(`✅ Attendance synced: ${docs.length} records pushed in bulk.`);
  } catch (error) {
    console.error("Attendance Sync Error:", error.message);
  }
};

// ------------------------------------------------------------------
// 2) BATCH SYNC PAYROLL 
// ------------------------------------------------------------------
exports.syncPayroll = async (payrollList) => {
  try {
    if (!payrollList || payrollList.length === 0) return;
    const sheets = await getSheetClient();
    const tabName = "Salary";

    const headers = [
      "Month", "Emp Code", "Name", "Department", "Role", 
      "Days Present", "Incentives", "Deductions", "Base Salary", 
      "Net Pay", "Status", "Generated On"
    ];
    await ensureHeader(sheets, tabName, headers);

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${tabName}!A:B`, 
    });
    const rows = res.data.values || [];

    const rowMap = new Map();
    for (let i = 1; i < rows.length; i++) {
      const rMonth = String(rows[i][0] || "").trim();
      const rCode = String(rows[i][1] || "").trim();
      rowMap.set(`${rMonth}_${rCode}`, i + 1);
    }

    const updateData = [];
    const appendData = [];

    for (const p of payrollList) {
        const emp = p.employee || p; 
        const empCode = safeText(emp?.employeeCode ?? emp?.empCode, "N/A");
        const empName = safeText(emp?.firstName ? `${emp.firstName} ${emp.lastName}` : (emp?.name || "Unknown"), "Unknown");
        const monthStr = safeText(p.month, "");

        let finalBaseSalary = p.baseSalary || emp?.baseSalary || 0;

        if (finalBaseSalary === 0 && (p.employee || emp._id)) {
            try {
                const eId = p.employee?._id || p.employee || emp._id; 
                const dbEmp = await Employee.findById(eId).select('baseSalary');
                if (dbEmp && dbEmp.baseSalary) finalBaseSalary = dbEmp.baseSalary;
            } catch (err) {}
        }

        const rowData = [
            "'" + monthStr, 
            empCode,
            empName,
            safeText(emp?.department?.name || emp?.department, "-"),
            safeText(emp?.jobProfile?.name || emp?.jobProfile, "-"),
            p.presentDays ?? 0,
            p.incentives ?? 0,
            p.deductions ?? 0,
            "'" + finalBaseSalary, 
            p.netPay ?? 0,
            p.status,
            formatDateOnly(new Date()),
        ];

        const key = `${monthStr}_${empCode}`;
        if (rowMap.has(key)) {
            const rowIndex = rowMap.get(key);
            updateData.push({
              range: `${tabName}!A${rowIndex}:L${rowIndex}`,
              values: [rowData],
            });
        } else {
            appendData.push(rowData);
            rowMap.set(key, rows.length + appendData.length);
        }
    }

    if (updateData.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: { valueInputOption: "USER_ENTERED", data: updateData },
      });
    }

    if (appendData.length > 0) {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${tabName}!A:L`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: appendData },
      });
    }
    console.log(`✅ Salary synced: ${payrollList.length} records processed in bulk`);

  } catch (error) {
    console.error("Salary Sync Error:", error.message);
  }
};

// ------------------------------------------------------------------
// 3) BATCH SYNC INCREMENTS
// ------------------------------------------------------------------
exports.syncIncrement = async (incrementData, employee) => {
  try {
    const logs = Array.isArray(incrementData) ? incrementData : [incrementData];
    if (logs.length === 0) return;

    const sheets = await getSheetClient();
    const tabName = "Increments";

    const headers = [
      "Date", "Emp Code", "Name", "Type", 
      "Amount", "Previous Salary", "New Salary", "Reason", "Logged On"
    ];
    await ensureHeader(sheets, tabName, headers);

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${tabName}!A:B`,
    });
    const rows = res.data.values || [];

    const rowMap = new Map();
    for (let i = 1; i < rows.length; i++) {
      const rDate = String(rows[i][0] || "").trim();
      const rCode = String(rows[i][1] || "").trim();
      rowMap.set(`${rDate}_${rCode}`, i + 1);
    }

    const updateData = [];
    const appendData = [];

    for (const incrementLog of logs) {
      const empCode = safeText(employee?.employeeCode, "N/A");
      const dateStr = formatDateOnly(incrementLog?.date);
      const empName = safeText(employee?.firstName ? `${employee.firstName} ${employee.lastName || ""}` : "Unknown");

      const rowData = [
        "'" + dateStr, 
        empCode,
        empName,
        safeText(incrementLog?.type, ""),
        incrementLog?.amount ?? 0,
        incrementLog?.previousSalary ?? 0,
        incrementLog?.newSalary ?? 0,
        safeText(incrementLog?.reason, ""),
        formatDateOnly(new Date()),
      ];

      const key = `${dateStr}_${empCode}`;
      if (rowMap.has(key)) {
        const rowIndex = rowMap.get(key);
        updateData.push({
          range: `${tabName}!A${rowIndex}:I${rowIndex}`,
          values: [rowData],
        });
      } else {
        appendData.push(rowData);
        rowMap.set(key, rows.length + appendData.length);
      }
    }

    if (updateData.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: { valueInputOption: "USER_ENTERED", data: updateData },
      });
    }

    if (appendData.length > 0) {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${tabName}!A:I`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: appendData },
      });
    }
  } catch (error) {
    console.error("Increment Sync Error:", error.message);
  }
};