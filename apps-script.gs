// Apps Script backend for the RSVP landing page.
// Deploy this bound to a Google Sheet (Extensions > Apps Script), as a
// web app with access "Anyone". Paste the resulting URL into script.js.
//
// After deploying, run installReminderTrigger() ONCE from the Apps Script
// editor (select it in the function dropdown, click Run) to authorize Gmail
// sending and schedule the daily reminder check. See SETUP.md.

const SHEET_NAME = 'RSVP';
const HEADERS = [
  'Timestamp', 'Full Name', 'License Number', 'Institutional Affiliation',
  'Department/Specialty', 'Email', 'Contact Number', 'Dietary Restrictions',
  'Attendance', 'Reminder Sent'
];

// ---- Event config — keep in sync with index.html's countdown ----
const EVENT_NAME = 'SHARE OTSU — Standardizing Referral Pathways & Strengthening OTDT Networks';
const EVENT_DATE_LABEL = 'Thursday, August 27, 2026';
const EVENT_VENUE = 'Apo View Hotel, Davao City';
const EVENT_DATE = new Date('2026-08-27T08:00:00+08:00');
const ORGANIZER_NAME = 'SHARE Organ Transplant Services Unit';
const REPLY_TO_EMAIL = 'almanalaysay93@gmail.com';
const REMINDER_SEND_HOUR = 8; // local script timezone hour to run the daily check

function doPost(e) {
  const sheet = getOrCreateSheet();
  const p = e.parameter;
  const attending = p.attendance || '';
  const name = p.name || '';
  const email = p.email || '';

  sheet.appendRow([
    new Date(),
    name,
    p.license || '',
    p.affiliation || '',
    p.department || '',
    email,
    p.contact || '',
    p.dietary || '',
    attending,
    ''
  ]);

  if (email) {
    sendConfirmationEmail(email, name, attending);
  }

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
  } else if (sheet.getLastColumn() < HEADERS.length) {
    // Backfill the "Reminder Sent" column for sheets created before this feature.
    sheet.getRange(1, sheet.getLastColumn() + 1, 1, HEADERS.length - sheet.getLastColumn())
      .setValues([HEADERS.slice(sheet.getLastColumn())]);
  }
  return sheet;
}

// ---- Confirmation email, sent immediately on RSVP ----
function sendConfirmationEmail(email, name, attendance) {
  const firstName = (name || '').trim().split(' ')[0] || 'there';
  const attending = attendance === 'I will attend in person';

  const subject = attending
    ? `You're registered — ${EVENT_NAME}`
    : `RSVP received — ${EVENT_NAME}`;

  const body = attending
    ? `Hi ${firstName},\n\n`
      + `Thank you for registering — you're confirmed for:\n\n`
      + `${EVENT_NAME}\n`
      + `${EVENT_DATE_LABEL}\n`
      + `${EVENT_VENUE}\n\n`
      + `We'll send you a reminder email the day before the event with any final details. `
      + `If anything changes on your end, just reply to this email.\n\n`
      + `See you there,\n${ORGANIZER_NAME}`
    : `Hi ${firstName},\n\n`
      + `Thanks for letting us know you won't be able to attend ${EVENT_NAME} `
      + `(${EVENT_DATE_LABEL}, ${EVENT_VENUE}). We've recorded your response.\n\n`
      + `If your plans change, feel free to reply to this email or resubmit the form.\n\n`
      + `${ORGANIZER_NAME}`;

  MailApp.sendEmail({
    to: email,
    subject: subject,
    body: body,
    replyTo: REPLY_TO_EMAIL,
    name: ORGANIZER_NAME
  });
}

// ---- Reminder email, sent to confirmed attendees the day before the event ----
// Run daily by the trigger installed via installReminderTrigger().
function sendEventReminders() {
  const today = new Date();
  const dayBefore = new Date(EVENT_DATE.getTime() - 24 * 60 * 60 * 1000);
  const isReminderDay = today.getFullYear() === dayBefore.getFullYear()
    && today.getMonth() === dayBefore.getMonth()
    && today.getDate() === dayBefore.getDate();

  if (!isReminderDay) return;

  const sheet = getOrCreateSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

  const range = sheet.getRange(2, 1, lastRow - 1, HEADERS.length);
  const values = range.getValues();
  const nameCol = HEADERS.indexOf('Full Name');
  const emailCol = HEADERS.indexOf('Email');
  const attendCol = HEADERS.indexOf('Attendance');
  const sentCol = HEADERS.indexOf('Reminder Sent');

  values.forEach((row, i) => {
    const email = row[emailCol];
    const attending = row[attendCol] === 'I will attend in person';
    const alreadySent = row[sentCol] === 'Yes';
    if (!email || !attending || alreadySent) return;

    sendReminderEmail(email, row[nameCol]);
    sheet.getRange(i + 2, sentCol + 1).setValue('Yes');
  });
}

function sendReminderEmail(email, name) {
  const firstName = (name || '').trim().split(' ')[0] || 'there';
  const subject = `Reminder: ${EVENT_NAME} is tomorrow`;
  const body = `Hi ${firstName},\n\n`
    + `Quick reminder — ${EVENT_NAME} is tomorrow:\n\n`
    + `${EVENT_DATE_LABEL}\n`
    + `${EVENT_VENUE}\n\n`
    + `We're looking forward to seeing you there. Reply to this email if you have any questions.\n\n`
    + `${ORGANIZER_NAME}`;

  MailApp.sendEmail({
    to: email,
    subject: subject,
    body: body,
    replyTo: REPLY_TO_EMAIL,
    name: ORGANIZER_NAME
  });
}

// ---- One-time setup: run this manually once from the Apps Script editor ----
// Authorizes Gmail sending and installs the daily trigger that checks
// whether today is the day before the event.
function installReminderTrigger() {
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'sendEventReminders')
    .forEach(t => ScriptApp.deleteTrigger(t));

  ScriptApp.newTrigger('sendEventReminders')
    .timeBased()
    .everyDays(1)
    .atHour(REMINDER_SEND_HOUR)
    .create();
}
