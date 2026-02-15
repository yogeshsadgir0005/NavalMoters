const { google } = require("googleapis");

const SPREADSHEET_ID =
  process.env.GOOGLE_SHEET_ID || "1WVoCKLuUaihjSM46_1saFq1nA90dQH3xDHA4urR5uVQ";

// Build GoogleAuth using credentials JSON from ENV (NO file reads)
const getAuth = () => {
  const raw = process.env.GOOGLE_CREDENTIALS_JSON;

  if (!raw) {
    throw new Error(
      "Missing GOOGLE_CREDENTIALS_JSON env var. Add it in Render Environment Variables."
    );
  }

  let credentials;
  try {
    credentials = JSON.parse(raw);
  } catch (e) {
    throw new Error(
      "Invalid GOOGLE_CREDENTIALS_JSON (not valid JSON). Paste the full JSON exactly as downloaded."
    );
  }

  return new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
};

const getSheet = async () => {
  const auth = getAuth();
  const client = await auth.getClient();
  return google.sheets({ version: "v4", auth: client });
};

// --- 🛠️ Helper: Auto-Add Headers if Missing ---
const ensureHeader = async (sheets, tabName, headerRow) => {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${tabName}!A1`,
    });

    if (!res.data.values || res.data.values.length === 0) {
      console.log(`📝 Adding missing headers to ${tabName}...`);
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${tabName}!A1`,
        valueInputOption: "USER_ENTERED",
        resource: { values: [headerRow] },
      });
    }
  } catch (error) {
    console.warn(
      `⚠️ Could not check/add headers for ${tabName}. Make sure the tab exists and the service account has access.`
    );
  }
};

// --- 1. Sync Attendance ---
exports.syncAttendance = async (attendanceRecord) => {
  try {
    const sheets = await getSheet();

    const headers = ["Date", "Emp Code", "Name", "Status", "Night Duty", "Timestamp"];
    await ensureHeader(sheets, "Attendance", headers);

    const empCode = attendanceRecord.employee?.employeeCode || "N/A";
    const empName = attendanceRecord.employee
      ? `${attendanceRecord.employee.firstName} ${attendanceRecord.employee.lastName}`
      : "Unknown";

    const row = [
      new Date(attendanceRecord.date).toISOString().slice(0, 10),
      empCode,
      empName,
      attendanceRecord.status,
      attendanceRecord.isNightDuty ? "Yes" : "No",
      new Date().toLocaleString(),
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Attendance!A:F",
      valueInputOption: "USER_ENTERED",
      resource: { values: [row] },
    });

    console.log(`✅ Backup: Attendance synced for ${empName}`);
  } catch (error) {
    console.error("❌ Google Sheet Sync Failed:", error.message);
  }
};

// --- 2. Sync Payroll/Salary ---
exports.syncPayroll = async (payrollList) => {
  try {
    const sheets = await getSheet();

    const headers = [
      "Month",
      "Emp Code",
      "Name",
      "Present Days",
      "Night Duties",
      "Incentives",
      "Net Pay",
      "Status",
      "Timestamp",
    ];
    await ensureHeader(sheets, "Salary", headers);

    const rows = payrollList.map((p) => [
      p.month,
      p.employee?.employeeCode || "N/A",
      p.employee ? `${p.employee.firstName} ${p.employee.lastName}` : "Unknown",
      p.totalPresentDays,
      p.nightDutyCount || 0,
      p.incentives || 0,
      p.netPay,
      p.status,
      new Date().toLocaleString(),
    ]);

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Salary!A:I",
      valueInputOption: "USER_ENTERED",
      resource: { values: rows },
    });

    console.log(`✅ Backup: ${rows.length} salary records synced.`);
  } catch (error) {
    console.error("❌ Salary Backup Failed:", error.message);
  }
};

// --- 3. Sync Salary Increments ---
exports.syncIncrement = async (incrementLog, employee) => {
  try {
    const sheets = await getSheet();

    const headers = [
      "Date",
      "Emp Code",
      "Name",
      "Type",
      "Amount",
      "Previous Salary",
      "New Salary",
      "Reason",
      "Timestamp",
    ];
    await ensureHeader(sheets, "Increments", headers);

    const empName = `${employee.firstName} ${employee.lastName}`;

    const row = [
      new Date(incrementLog.date).toISOString().slice(0, 10),
      employee.employeeCode || "N/A",
      empName,
      incrementLog.type,
      incrementLog.amount,
      incrementLog.previousSalary,
      incrementLog.newSalary,
      incrementLog.reason,
      new Date().toLocaleString(),
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Increments!A:I",
      valueInputOption: "USER_ENTERED",
      resource: { values: [row] },
    });

    console.log(`✅ Backup: Salary ${incrementLog.type} synced for ${empName}`);
  } catch (error) {
    console.error("❌ Increment Backup Failed:", error.message);
  }
};
