# Deploy the RSVP backend (5 min)

1. Go to [sheets.google.com](https://sheets.google.com) → create a new blank spreadsheet. Name it e.g. "OTDT Referral RSVP".
2. In the Sheet: **Extensions → Apps Script**.
3. Delete the placeholder code, paste in the contents of `apps-script.gs` from this folder.
4. Click **Deploy → New deployment**.
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Click **Deploy**, authorize when prompted, then copy the **Web app URL**.
6. Open `script.js` in this folder, replace `PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE` with that URL.
7. Reload the page and submit a test RSVP — a row should appear in the "RSVP" tab of your Sheet, and you should get a confirmation email at the address you submitted.

## Turning on the automated emails

Registrants now get two emails automatically:
- **Instantly on RSVP** — a thank-you/confirmation (or an acknowledgement if they said they can't attend). This happens automatically from `doPost`, no extra setup needed.
- **1 day before the event** — a reminder, sent only to people who confirmed "I will attend in person". This needs a one-time trigger install:

1. In the Apps Script editor (same project as above), pick **installReminderTrigger** from the function dropdown at the top.
2. Click **Run**. The first time, Google will prompt you to authorize the script to send email as you — approve it.
3. That's it — a daily check now runs automatically and fires the reminder emails the day before `EVENT_DATE` (set at the top of `apps-script.gs`).

If the event date ever changes, update `EVENT_DATE`, `EVENT_DATE_LABEL`, and `EVENT_VENUE` at the top of `apps-script.gs` (keep `EVENT_DATE` in sync with the countdown timestamp in `index.html`), redeploy (**Deploy → Manage deployments → Edit → New version**), no need to re-run the trigger installer.

## Publishing the page

Same pattern as your other GitHub Pages sites: push this folder to a repo, enable Pages on `main` (or push to `gh-pages`), and the live URL will serve `index.html` directly.

## If you edit the form fields later

Update three places together: the `<input name="...">` in `index.html`, the `FormData` keys read in `script.js` (automatic — it reads all named fields), and the column order in `apps-script.gs`.
