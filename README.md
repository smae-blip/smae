# SMEA — Google Sheets Migration & Setup

This repository contains the SMEA frontend and Node.js backend. The project has been updated to use Google Sheets as the data store for three data types:

- Student Applications
- Memberships
- Contact Messages

This README explains how to set up Google Cloud, enable the Google Sheets API, create the spreadsheet and tabs, configure a service account, and run the backend locally. It also includes test steps and deployment guidance. Do NOT add real credentials to source control.

**Important:** The existing SQLite database and SQL code remain in the project for safety. Do not delete them until you have successfully migrated and verified the data.

**Files of interest**
- Server: [server.js](server.js)
- Google Sheets wrapper: [lib/googleSheets.js](lib/googleSheets.js)
- Migration script (SQLite → Sheets): [scripts/migrate-sqlite-to-sheets.js](scripts/migrate-sqlite-to-sheets.js)
- Validation + admin middleware: [lib/middleware.js](lib/middleware.js)
- Example env: [.env.example](.env.example)

--

**Table of contents**

1. Create a Google Cloud project
2. Enable the Google Sheets API
3. Create a service account
4. Create the SMEA Google Spreadsheet and tabs
5. Share the spreadsheet with the service account
6. Find the Spreadsheet ID
7. Create a local `.env` file
8. Required environment variables
9. Install dependencies and start the backend
10. Test all three forms
11. Run the migration script (when ready)
12. Deployment notes & security

--

**1) Create a Google Cloud project**

- Open the Google Cloud Console: https://console.cloud.google.com/
- Click the project selector and create a new project (e.g., `smae-backend`).
- Note the project name — you will use this when creating a service account.

**2) Enable the Google Sheets API**

- In the Cloud Console, go to `APIs & Services` → `Library`.
- Search for "Google Sheets API" and click it.
- Click `Enable`.

**3) Create a service account**

1. In the Cloud Console, go to `IAM & Admin` → `Service accounts`.
2. Click `Create Service Account`.
3. Give it a name like `smae-sheets-sa` and an optional description.
4. For roles, you do not need broad roles; for development choose `Editor` on the project for ease, or grant only `Sheets Editor` via IAM if you prefer least privilege. The service account only needs edit access to the specific spreadsheet.
5. Finish creating the account.
6. Create a JSON key for the service account: in the Service Accounts list click the account → `Keys` → `Add Key` → `Create new key` → JSON. Download the JSON file. Keep it secure and do NOT commit it.

Note: You do NOT need to keep the JSON file in your repository. We will extract the required fields into environment variables.

**4) Create the SMEA Google Spreadsheet and the three tabs**

1. Open Google Sheets: https://sheets.google.com and create a new spreadsheet named `SMEA Database` (or a name of your choice).
2. Create three separate sheets (tabs) and name them exactly:
   - Student Applications
   - Memberships
   - Contact Messages

3. Set the first row (header) of each tab to the exact column names below (these are case-sensitive in the current code mapping):

- Student Applications headers (row 1):

  id, applicant_name, email, phone, designation, institute_name, institute_address, city, state, pincode, application_status, created_at, updated_at

- Memberships headers (row 1):

  id, name, email, phone, membership_type, membership_status, joined_at, created_at, updated_at

- Contact Messages headers (row 1):

  id, name, email, phone, subject, message, status, created_at, updated_at

Leave the rows below the header empty for now.

**5) Share the spreadsheet with the service account**

- Open the spreadsheet, click `Share` (top-right).
- In the "Add people and groups" field, paste the service account email (from the JSON file, the `client_email` field). Grant `Editor` permissions so the service account can append and update rows.

**6) Where to find the Spreadsheet ID**

- The spreadsheet ID is in the URL when you open the spreadsheet, for example:

  https://docs.google.com/spreadsheets/d/1AbCdeFGhIJkLmNoPQrstUVWxyz12345/edit#gid=0

- The bolded part between `/d/` and `/edit` is the Spreadsheet ID. Copy it.

**7) Create the local `.env` file**

1. Copy `.env.example` to `.env` in the project root (do NOT commit `.env`).

2. Fill in the following values from your Google Cloud service account JSON and spreadsheet details:

- `GOOGLE_SHEET_ID` — the spreadsheet ID from step 6.
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` — the `client_email` field from the downloaded JSON key.
- `GOOGLE_PRIVATE_KEY` — the `private_key` field from the JSON. Replace literal newlines with `\\n` when placing the key in `.env` (the code will convert them back). Example:

  GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANB ... \\n+-----END PRIVATE KEY-----\\n

- `ADMIN_API_KEY` — choose a strong random string for admin API access (used to protect list/delete admin endpoints).
- `RECAPTCHA_SECRET_KEY` — optional: if you use Google reCAPTCHA for contact form verification.
- `PORT` — optional (default 5000).

Example local `.env` (DO NOT commit):

```
GOOGLE_SHEET_ID=1AbCdeFGhIJkLmNoPQrstUVWxyz12345
GOOGLE_SERVICE_ACCOUNT_EMAIL=smae-sheets-sa@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\nADMIN_API_KEY=replace-with-a-strong-key
RECAPTCHA_SECRET_KEY=YOUR_RECAPTCHA_SECRET_KEY
PORT=5000
```

**8) Required environment variables (summary)**

- `GOOGLE_SHEET_ID` — spreadsheet ID
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` — service account email (client_email)
- `GOOGLE_PRIVATE_KEY` — private key from service account JSON (newlines escaped as `\\n`)
- `ADMIN_API_KEY` — admin key to protect admin endpoints
- `RECAPTCHA_SECRET_KEY` — optional (for contact form verification)
- `DB_PATH` — optional, existing SQLite DB (left in repo for safe migration)
- `PORT` — optional

**9) Install dependencies and start the backend (local testing)**

1. Install Node dependencies:

```bash
npm install
```

2. Start the server (development):

```bash
npm run dev
```

3. Confirm server is running at `http://localhost:5000`.

**10) How to test the three forms (end-to-end)**

Open the frontend in your browser (open the local HTML files directly or serve them with a static server). The frontend uses `http://localhost:5000` as the backend URL by default.

- Contact form
  - Fill and submit the contact form on [contact.html](contact.html).
  - The backend route `POST /api/contact` will validate, optionally verify reCAPTCHA, and append a row to the `Contact Messages` tab.
  - Admin listing: GET `/api/contacts` requires the `x-admin-key` header with the value of `ADMIN_API_KEY` (or use `?admin_key=` query param). Example using curl:

    ```bash
    curl -H "x-admin-key: YOUR_ADMIN_KEY" http://localhost:5000/api/contacts
    ```

- Student applications
  - Fill the form on [student-corner.html](student-corner.html) and submit.
  - The backend route `POST /api/student-corner` will validate and append to the `Student Applications` tab.
  - Admin listing: GET `/api/contacts` is for contact messages; student listing endpoint is `GET /api/student-applications` if you add it. The current server exposes `student` entries via the Google Sheets wrapper; you can add admin endpoints or use the migration script to inspect rows.

- Memberships
  - The membership form in [membership.html](membership.html) is wired to POST `/api/memberships` (see `script.js`).
  - On submit, the server validates and appends to the `Memberships` tab. Duplicate emails are blocked (409 conflict).
  - Admin listing: GET `/api/memberships` requires the `x-admin-key` header.

Test entries to try (example values):

- Student application
  - Name: John Doe
  - Email: john@example.com
  - Phone: +91 9876543210
  - Designation: Student
  - Institute: XYZ Institute of Technology
  - Address: City, State, Pincode

- Membership
  - Name: Test Member
  - Email: member@example.com
  - Phone: +91 9876543210
  - Membership type: student

- Contact
  - Name: Test User
  - Email: test@example.com
  - Phone: +91 9876543210
  - Subject: Test Message
  - Message: This is a test enquiry.

After submitting each form, open the spreadsheet in Google Sheets and confirm a new row appears under the corresponding tab.

**11) Migration from SQLite to Google Sheets (when ready)**

The repository includes a migration script `scripts/migrate-sqlite-to-sheets.js` that reads from the existing SQLite DB (`DB_PATH`) and appends rows to the Sheets tabs.

Steps to run migration (only after you have the spreadsheet and the `.env` configured):

1. Ensure `.env` contains `GOOGLE_PRIVATE_KEY`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SHEET_ID`, and `ADMIN_API_KEY`.
2. Start the server (optional) or just run the script:

```bash
node scripts/migrate-sqlite-to-sheets.js
```

3. The script prints counts and any errors. Verify row counts in Google Sheets. Keep the SQLite DB until you confirm migration success.

**12) Deployment notes & security**

- Never commit `.env` or service account JSON to source control.
- For production, store secrets in your host's secure secret manager (e.g., Vercel/Netlify secrets, AWS Secrets Manager, Google Secret Manager). Do NOT paste private keys into public places.
- Use the `ADMIN_API_KEY` to protect admin endpoints. For better security, add authentication (e.g., Supabase Auth, OAuth2, or Google Identity) and use RLS policies if you later store data elsewhere.
- Limit the service account's permissions where possible. For production, grant the service account minimal permissions and share the spreadsheet only with that account.
- If deploying the backend on a platform (Heroku, Render, Vercel, DigitalOcean), add environment variables via the platform's UI and set the `GOOGLE_PRIVATE_KEY` with `\\n` newline escapes if necessary.

--

If you want, I can now:

- (A) Generate a step-by-step checklist you can follow interactively.
- (B) Add a short `README` section with curl examples for admin endpoints.
- (C) Wait while you create the spreadsheet and set env, then run the migration script together.

Tell me which of A/B/C you prefer (or ask for a specific next step).

---

**Interactive Checklist (follow these steps)**

1. [ ] Create Google Cloud project (see section 1). Verify you can open the project dashboard.
2. [ ] Enable Google Sheets API (see section 2). Verify API is enabled in `APIs & Services` → `Dashboard`.
3. [ ] Create service account and download JSON key (see section 3). Store JSON securely.
4. [ ] Create spreadsheet and add three tabs with headers (see section 4). Verify headers exactly match the README list.
5. [ ] Share spreadsheet with the service account email (see section 5). Confirm the service account appears in the sheet's `Share` list.
6. [ ] Copy Spreadsheet ID and add it plus service account values to a local `.env` (see section 7). Confirm `.env` contains `GOOGLE_SHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, and `ADMIN_API_KEY`.
7. [ ] Install dependencies locally:

  ```bash
  npm install
  ```

8. [ ] Run the server locally:

  ```bash
  npm run dev
  ```

   - Verify `http://localhost:5000` responds.

9. [ ] Submit test contact/student/membership forms from the frontend. Then open the spreadsheet and confirm rows appear under the correct tabs.
10. [ ] Run the migration script (optional — only once you verify steps above):

  ```bash
  node scripts/migrate-sqlite-to-sheets.js
  ```

  - Verify the logged counts match the rows added to the spreadsheet.

11. [ ] When verified, remove or archive the old SQLite DB after taking a backup.

Tips:
- Use the `x-admin-key` header for admin GET endpoints. Example:

  ```bash
  curl -H "x-admin-key: YOUR_ADMIN_KEY" http://localhost:5000/api/contacts
  ```

- If `GOOGLE_PRIVATE_KEY` has newline issues, ensure newlines are escaped as `\\n` in `.env`.

When you finish a step, tell me which step you completed and I will mark it and suggest the next one.
