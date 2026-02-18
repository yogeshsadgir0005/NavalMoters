const { google } = require("googleapis");

/**
 * ENV supported:
 * - GOOGLE_CREDENTIALS_B64   (base64 of the full service account json file)
 * - GOOGLE_CREDENTIALS_JSON  (raw JSON string, optional)
 * - GOOGLE_SHEET_ID
 */

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
        requestBody: { values: [headerRow] },
      });
      console.log(`📝 Added headers to ${tabName}`);
    }
  } catch (e) {
    console.warn(
      `⚠️ Could not ensure headers for ${tabName}. Make sure tab exists + sheet is shared with the service account.`
    );
  }
}

// --- NEW HELPER: Find Row Index to prevent duplicates ---
async function findRowIndex(sheets, tabName, criteria) {
  try {
    // Read columns A and B (Date/Month and EmpCode) to match rows
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${tabName}!A:B`, 
    });

    const rows = res.data.values;
    if (!rows || rows.length < 2) return null;

    // Loop rows (skip header)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      // Check if both Date/Month (Col 0) and EmpCode (Col 1) match
      if (
        String(row[0]).trim() === String(criteria.dateOrMonth).trim() && 
        String(row[1]).trim() === String(criteria.empCode).trim()
      ) {
        return i + 1; // 1-based index for API
      }
    }
    return null;
  } catch (e) {
    return null;
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

// 1) Sync Attendance (Update if exists, Append if new)
exports.syncAttendance = async (attendanceRecord) => {
  try {
    const sheets = await getSheetClient();
    const tabName = "Attendance";

    const headers = ["Date", "Emp Code", "Name", "Status", "Night Duty", "Last Updated"];
    await ensureHeader(sheets, tabName, headers);

    const empCode = pickEmpCode(attendanceRecord);
    const empName = pickEmpName(attendanceRecord);
    const dateStr = formatDateOnly(attendanceRecord?.date);

    const row = [
      dateStr,
      empCode,
      empName,
      safeText(attendanceRecord?.status, "Unknown"),
      attendanceRecord?.isNightDuty ? "Yes" : "No",
      new Date().toISOString().slice(0, 10), // Date Only
    ];

    // Check for existing row
    const rowIndex = await findRowIndex(sheets, tabName, { dateOrMonth: dateStr, empCode });

    if (rowIndex) {
        // UPDATE
        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `${tabName}!A${rowIndex}`,
            valueInputOption: "USER_ENTERED",
            resource: { values: [row] },
        });
        // console.log(`🔄 Updated Attendance: ${empName}`);
    } else {
        // APPEND
        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `${tabName}!A:F`,
            valueInputOption: "USER_ENTERED",
            insertDataOption: "INSERT_ROWS",
            resource: { values: [row] },
        });
        // console.log(`✅ Added Attendance: ${empName}`);
    }

  } catch (error) {
    console.error("❌ Google Sheet Sync Failed:", error?.message || error);
  }
};

// 2) Sync Payroll / Salary (Update if exists, Append if new)
exports.syncPayroll = async (payrollList) => {
  try {
    const sheets = await getSheetClient();
    const tabName = "Salary";

    const headers = [
      "Month",
      "Emp Code",
      "Name",
      "Present Days",
      "Night Duties",
      "Incentives",
      "Net Pay",
      "Status",
      "Generated On",
    ];
    await ensureHeader(sheets, tabName, headers);

    // Process one by one to check for duplicates
    // (A bit slower than bulk append, but cleaner data)
    for (const p of (payrollList || [])) {
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
        const monthStr = safeText(p?.month, "");

        const row = [
            monthStr,
            empCode,
            empName,
            p?.totalPresentDays ?? 0,
            p?.nightDutyCount ?? 0,
            p?.incentives ?? 0,
            p?.netPay ?? 0,
            safeText(p?.status, ""),
            new Date().toISOString().slice(0, 10), // Date Only
        ];

        const rowIndex = await findRowIndex(sheets, tabName, { dateOrMonth: monthStr, empCode });

        if (rowIndex) {
            await sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: `${tabName}!A${rowIndex}`,
                valueInputOption: "USER_ENTERED",
                resource: { values: [row] },
            });
        } else {
            await sheets.spreadsheets.values.append({
                spreadsheetId: SPREADSHEET_ID,
                range: `${tabName}!A:I`,
                valueInputOption: "USER_ENTERED",
                insertDataOption: "INSERT_ROWS",
                resource: { values: [row] },
            });
        }
    }
    console.log(`✅ Salary synced: ${payrollList.length} records processed`);

  } catch (error) {
    console.error("❌ Salary Backup Failed:", error?.message || error);
  }
};

// 3) Sync Salary Increments (Append mostly, update if same day)
exports.syncIncrement = async (incrementLog, employee) => {
  try {
    const sheets = await getSheetClient();
    const tabName = "Increments";

    const headers = [
      "Date",
      "Emp Code",
      "Name",
      "Type",
      "Amount",
      "Previous Salary",
      "New Salary",
      "Reason",
      "Logged On",
    ];
    await ensureHeader(sheets, tabName, headers);

    const empCode = safeText(employee?.employeeCode ?? employee?.empCode, "N/A");
    const empName = safeText(
      employee?.name ?? [employee?.firstName, employee?.lastName].filter(Boolean).join(" "),
      "Unknown"
    );
    const dateStr = formatDateOnly(incrementLog?.date);

    const row = [
      dateStr,
      empCode,
      empName,
      safeText(incrementLog?.type, ""),
      incrementLog?.amount ?? 0,
      incrementLog?.previousSalary ?? 0,
      incrementLog?.newSalary ?? 0,
      safeText(incrementLog?.reason, ""),
      new Date().toISOString().slice(0, 10), // Date Only
    ];

    // For increments, we check Date + EmpCode to avoid spamming the sheet if clicked multiple times same day
    const rowIndex = await findRowIndex(sheets, tabName, { dateOrMonth: dateStr, empCode });

    if (rowIndex) {
        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `${tabName}!A${rowIndex}`,
            valueInputOption: "USER_ENTERED",
            resource: { values: [row] },
        });
    } else {
        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `${tabName}!A:I`,
            valueInputOption: "USER_ENTERED",
            insertDataOption: "INSERT_ROWS",
            resource: { values: [row] },
        });
    }

    console.log(`✅ Increment synced: ${empName} (${empCode})`);
  } catch (error) {
    console.error("❌ Increment Backup Failed:", error?.message || error);
  }
};