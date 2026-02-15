const { google } = require("googleapis");

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
    "Missing Google credentials. Set GOOGLE_CREDENTIALS_B64 (recommended) or GOOGLE_CREDENTIALS_JSON."
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

// Add headers if missing
async function ensureHeader(sheets, tabName, headerRow) {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${tabName}!A1:F1`,
    });

    const existing = res.data.values?.[0] || [];
    if (existing.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${tabName}!A1`,
        valueInputOption: "USER_ENTERED",
        resource: { values: [headerRow] },
      });
      console.log(`📝 Added headers to ${tabName}`);
    }
  } catch (e) {
    console.warn(
      `⚠️ Could not ensure headers for ${tabName}. Make sure tab exists + sheet is shared with the service account.`
    );
  }
}

function safeText(v, fallback) {
  if (v === null || v === undefined) return fallback;
  const s = String(v).trim();
  return s.length ? s : fallback;
}

function pickEmpCode(att) {
  return safeText(
    att?.empCode ??
      att?.employeeCode ??
      att?.employee?.empCode ??
      att?.employee?.employeeCode ??
      att?.employee?.code,
    "N/A"
  );
}

function pickEmpName(att) {
  // common cases
  const direct =
    att?.employeeName ??
    att?.name ??
    att?.employee?.name ??
    att?.employee?.fullName;

  if (direct) return safeText(direct, "Unknown");

  // first/last
  const first = att?.employee?.firstName ?? att?.firstName;
  const last = att?.employee?.lastName ?? att?.lastName;
  const joined = [first, last].filter(Boolean).join(" ");

  return safeText(joined, "Unknown");
}

function formatDateOnly(d) {
  try {
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "";
    // yyyy-mm-dd
    return dt.toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

// 1) Sync Attendance
exports.syncAttendance = async (attendanceRecord) => {
  try {
    const sheets = await getSheetClient();

    const headers = ["Date", "Emp Code", "Name", "Status", "Night Duty", "Timestamp"];
    await ensureHeader(sheets, "Attendance", headers);

    const empCode = pickEmpCode(attendanceRecord);
    const empName = pickEmpName(attendanceRecord);

    const row = [
      formatDateOnly(attendanceRecord?.date),
      empCode,
      empName,
      safeText(attendanceRecord?.status, "Unknown"),
      attendanceRecord?.isNightDuty ? "Yes" : "No",
      new Date().toISOString(), // stable + consistent
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Attendance!A:F",
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      resource: { values: [row] },
    });

    console.log(`✅ Attendance synced: ${empName} (${empCode})`);
  } catch (error) {
    console.error("❌ Google Sheet Sync Failed:", error?.message || error);
  }
};

// 2) Sync Payroll / Salary
exports.syncPayroll = async (payrollList) => {
  try {
    const sheets = await getSheetClient();

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

    const rows = (payrollList || []).map((p) => {
      const empCode = safeText(
        p?.empCode ?? p?.employeeCode ?? p?.employee?.empCode ?? p?.employee?.employeeCode,
        "N/A"
      );
      const empName = safeText(
        p?.employeeName ??
          p?.name ??
          p?.employee?.name ??
          [p?.employee?.firstName, p?.employee?.lastName].filter(Boolean).join(" "),
        "Unknown"
      );

      return [
        safeText(p?.month, ""),
        empCode,
        empName,
        p?.totalPresentDays ?? 0,
        p?.nightDutyCount ?? 0,
        p?.incentives ?? 0,
        p?.netPay ?? 0,
        safeText(p?.status, ""),
        new Date().toISOString(),
      ];
    });

    if (!rows.length) return;

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Salary!A:I",
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      resource: { values: rows },
    });

    console.log(`✅ Salary synced: ${rows.length} records`);
  } catch (error) {
    console.error("❌ Salary Backup Failed:", error?.message || error);
  }
};

// 3) Sync Salary Increments
exports.syncIncrement = async (incrementLog, employee) => {
  try {
    const sheets = await getSheetClient();

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

    const empCode = safeText(employee?.employeeCode ?? employee?.empCode, "N/A");
    const empName = safeText(
      employee?.name ?? [employee?.firstName, employee?.lastName].filter(Boolean).join(" "),
      "Unknown"
    );

    const row = [
      formatDateOnly(incrementLog?.date),
      empCode,
      empName,
      safeText(incrementLog?.type, ""),
      incrementLog?.amount ?? 0,
      incrementLog?.previousSalary ?? 0,
      incrementLog?.newSalary ?? 0,
      safeText(incrementLog?.reason, ""),
      new Date().toISOString(),
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Increments!A:I",
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      resource: { values: [row] },
    });

    console.log(`✅ Increment synced: ${empName} (${empCode})`);
  } catch (error) {
    console.error("❌ Increment Backup Failed:", error?.message || error);
  }
};
