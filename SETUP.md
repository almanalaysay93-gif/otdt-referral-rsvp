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
7. Reload the page and submit a test RSVP — a row should appear in the "RSVP" tab of your Sheet.

## Publishing the page

Same pattern as your other GitHub Pages sites: push this folder to a repo, enable Pages on `main` (or push to `gh-pages`), and the live URL will serve `index.html` directly.

## If you edit the form fields later

Update three places together: the `<input name="...">` in `index.html`, the `FormData` keys read in `script.js` (automatic — it reads all named fields), and the column order in `apps-script.gs`.
