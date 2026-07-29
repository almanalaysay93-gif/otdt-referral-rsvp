// Apps Script backend for the RSVP landing page.
// Deploy this bound to a Google Sheet (Extensions > Apps Script), as a
// web app with access "Anyone". Paste the resulting URL into script.js.

const SHEET_NAME = 'RSVP';
const HEADERS = [
  'Timestamp', 'Full Name', 'License Number', 'Institutional Affiliation',
  'Department/Specialty', 'Email', 'Contact Number', 'Dietary Restrictions',
  'Attendance'
];

function doPost(e) {
  const sheet = getOrCreateSheet();
  const p = e.parameter;
  sheet.appendRow([
    new Date(),
    p.name || '',
    p.license || '',
    p.affiliation || '',
    p.department || '',
    p.email || '',
    p.contact || '',
    p.dietary || '',
    p.attendance || ''
  ]);
  return ContentService
    .createTextOutput(JSON.stringify({ result: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}
