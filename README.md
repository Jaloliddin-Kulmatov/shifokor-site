# Shifokor

Find the nearest state clinic in Uzbekistan, ask a doctor online or by text message, and book visits. Built first for people living in villages, in Uzbek, Russian and English.

**Status:** prototype. The clinic directory uses real open data. Accounts and consultations use Supabase when it is configured, otherwise a demo saved in the browser. Bookings and the clinic workspace use sample clinics.

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

Import the repository with the **root directory left as the repository root**. `vercel.json` already sets the build command (`node scripts/write-config.mjs`) and serves the `site` folder.

Environment variables (Project → Settings → Environment Variables):

| Name | Value |
|---|---|
| `SUPABASE_URL` | `https://<project>.supabase.co` |
| `SUPABASE_PUBLISHABLE_KEY` | the publishable key (`sb_publishable_...`), or use `SUPABASE_ANON_KEY` with the anon key |

The Vercel ↔ Supabase integration's variable names (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) also work. Only these public values reach the browser. **Never** add the database connection string (`postgres://…`), the `service_role` key or a `sb_secret_` key: the build stops if it sees one.

## Backend (Supabase)

`supabase/migrations/` holds the schema: profiles (patients, doctors, clinics), consultation applications and messages, with row-level security so patients see only their own applications and doctors see open applications for them. Live chat uses Supabase Realtime. For a quick test, turn off **Authentication → Providers → Email → Confirm email** in the Supabase dashboard, or new users must click the email link first.

Supabase cloud regions are outside Uzbekistan, so use test data only. Real patient data must be stored on servers in Uzbekistan.

## Data and licences

- Clinics: [Healthsites.io](https://healthsites.io) / © OpenStreetMap contributors, under the [Open Database License (ODbL)](https://opendatacommons.org/licenses/odbl/). `site/clinics.js` is a derived database and stays under ODbL.
- Regions and districts: OCHA COD-AB administrative boundaries for Uzbekistan (2018), CC BY-IGO.
- `data-build/build.py` rebuilds `site/clinics.js`; see `site/README.md` for details.

Shifokor is a directory and scheduling tool, not a medical provider. In an emergency, call 103.
