const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const KEY_PATH = path.join(__dirname, 'service-account.json');

const getSheetsClient = () => {
  if (!fs.existsSync(KEY_PATH)) {
    console.warn('⚠️ Google Service Account file missing. Sync disabled.');
    return null;
  }
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
};

module.exports = getSheetsClient;