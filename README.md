# Shifokor

Find the nearest state clinic in Uzbekistan, ask a doctor online or by text message, and book visits. Built first for people living in villages, in Uzbek, Russian and English.

**Status:** prototype. The clinic directory uses real open data. Accounts and consultations use the server when a database is configured, otherwise a demo saved in the browser. Bookings and the clinic workspace use sample clinics.

## What's inside

- **State clinic directory:** 1,554 health facilities (693 state) in all 14 regions and 199 districts, with "hospitals near me", filters for state or private, type, region and district, and a map.
- **Online consultation:** patients fill in an application first (with an emergency safety check), then a doctor replies by text or calls by audio or video.
- **Accounts:** patients, doctors (background, workplaces, services) and clinics (services, prices, doctors).
- **Village assist:** a nurse or volunteer books a visit for someone without a smartphone.
- **Booking demo and clinic workspace** with sample clinics.

## Run it

No build step. From the `site` folder:

```bash
python3 -m http.server 8765
```

Then open http://127.0.0.1:8765. Without Supabase settings the site runs in demo mode (everything saved in the browser).

## Deploy on Vercel

Import the repository with the **root directory left as the repository root**. `vercel.json` sets the build (`node scripts/write-config.mjs`), serves the `site` folder, and `api/app.js` runs as a server function.

Add **one** environment variable (Project → Settings → Environment Variables):

| Name | Value |
|---|---|
| `DATABASE_URL` | your Postgres connection string (`POSTGRES_URL` or `SUPABASE_DB_URL` also work) |

For Supabase, copy it from **Connect → Connection string → Method: Transaction pooler** (host `…pooler.supabase.com`, port `6543`) and replace `[YOUR-PASSWORD]` with the database password. The "Direct connection" string (`db.<project>.supabase.co`) works over IPv6 only, which Vercel functions can't reach. If the password has special characters, percent-encode them.

Then redeploy. On the first request the server creates its tables (`app_users`, `app_sessions`, `app_consults`, `app_messages`) by itself. Without `DATABASE_URL` the site runs in demo mode.

## How the backend works

- The connection string lives only on the server (`api/app.js`); the browser gets nothing but a sign-in token.
- Accounts: patients, doctors and clinics sign up with an email or a +998 phone number and a password (stored as a scrypt hash). Sign-in works with either. Sessions last 30 days.
- Applications and messages: patients see only their own; doctors see open applications for them and the ones they accepted; only the patient and the accepted doctor can write in a consultation.
- Chat refreshes every few seconds (no live push).
- Row-level security is on with no policies, so Supabase's public Data API can't read these tables even if its keys leak.
- Not yet: rate limiting on sign-in, password reset, email or SMS verification.

Use test data only on servers outside Uzbekistan. Real patient data must be stored on servers in Uzbekistan.

## Data and licences

- Clinics: [Healthsites.io](https://healthsites.io) / © OpenStreetMap contributors, under the [Open Database License (ODbL)](https://opendatacommons.org/licenses/odbl/). `site/clinics.js` is a derived database and stays under ODbL.
- Regions and districts: OCHA COD-AB administrative boundaries for Uzbekistan (2018), CC BY-IGO.
- `data-build/build.py` rebuilds `site/clinics.js`; see `site/README.md` for details.

Shifokor is a directory and scheduling tool, not a medical provider. In an emergency, call 103.
