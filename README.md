# Shifokor

Find a good doctor, know the price before you go, and ask a specialist online. Built first for people living in villages, in Uzbek, Russian and English.

State polyclinic queues, medical records and prescriptions belong to DMED and my.gov.uz; Shifokor points people there instead of competing with it. It focuses on what DMED doesn't do: choosing the right specialist (state or private), checked credentials, prices up front, and online consultation in Uzbek.

**Status:** prototype. Accounts, consultations and visit requests use the server when a database is configured, otherwise a demo saved in the browser. The clinic directory uses real open data.

## What's inside

- **Doctors:** profiles with specialty, experience, licence, languages, workplaces, services with prices, and online consultation prices (text, audio, video), typical reply time and online hours. Search by specialty, region, language, name or service; "online only"; sort by checked first, cheapest consultation or experience.
- **Reviews:** only a patient whose consultation with the doctor is finished, or whose confirmed visit day at the clinic has come, can rate them (1–5 stars, optional comment, name shown as "Ali V." or hidden), once per consultation or visit. Ratings show on profiles and cards and count in "checked first" and "highest rated" sorting (a few reviews are pulled towards 4 stars, so one 5-star review doesn't beat many 4.8s). Doctors and clinics can reply; admins can hide reviews.
- **Photos in consultations:** the patient can add up to 3 photos to the application (a rash, a wound, a lab result) and either side can send photos in the chat, up to 20 per consultation. The browser shrinks each photo to a JPEG of at most 1600 px, which also removes the phone's location data. Photos are stored in the database (`app_files`), and only that consultation's patient and doctor can open them. While an application is still open, a doctor who could accept it can open them too. The server checks each file's first bytes and accepts only JPEG, PNG or WebP up to 1.5 MB. In demo mode, smaller copies stay in the browser.
- **Prices (`#/prices`):** every service and consultation price that doctors and clinics entered, searchable by service (with common synonyms, e.g. UZI / узи / ultratovush), region, maximum price and "available online", each with the date it was updated.
- **Online consultation:** patients fill in an application first (with an emergency safety check), see the chosen doctor's price for that kind of consultation, then the doctor replies by text or calls. Audio and video calls are still a placeholder screen.
- **Checks:** admins confirm doctors and clinics before they show "Checked" or take visit requests.
- **Notices:** Telegram, and SMS through Eskiz.uz, plus unread counts.
- **Hospitals (secondary):** 1,554 health facilities in all 14 regions and 199 districts with a map and "near me", for "where to go after the consultation". Hospitals that join Shifokor can take visit requests; state polyclinic queues point to DMED / my.gov.uz.
- The older booking demo, sample clinic workspace and village helper (sample clinics with made-up prices) are no longer linked from the menu.

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

Optional variables (add them, then redeploy):

| Name | What it turns on |
|---|---|
| `ADMIN_EMAILS` / `ADMIN_PHONES` | Comma-separated emails or `998…` phone numbers of the people who check clinics and doctors. Signed in, they see **Menyu → Tekshiruv** (`#/admin`). |
| `TELEGRAM_BOT_TOKEN` | Telegram notices. Create a bot with [@BotFather](https://t.me/BotFather) and paste its token. Production deploys point the bot at `/api/app?tg=hook` by themselves; an admin can also press "Telegram botni shu saytga ulash" on the Tekshiruv page. |
| `ESKIZ_EMAIL`, `ESKIZ_PASSWORD`, `ESKIZ_FROM` | SMS through [Eskiz.uz](https://eskiz.uz) for patients without Telegram (visit confirmed or declined). Eskiz must approve the message texts first; `ESKIZ_FROM` defaults to `4546`. |

Then redeploy. On the first request the server creates its tables (`app_users`, `app_sessions`, `app_consults`, `app_messages`, `app_appts`, `app_reviews`, `app_files`) by itself, including new ones added later. Without `DATABASE_URL` the site runs in demo mode.

## How the backend works

- The connection string lives only on the server (`api/app.js`); the browser gets nothing but a sign-in token.
- Accounts: patients, doctors and clinics sign up with an email or a +998 phone number and a password (stored as a scrypt hash). Sign-in works with either. Sessions last 30 days.
- Applications and messages: patients see only their own; doctors see open applications for them and the ones they accepted; only the patient and the accepted doctor can write in a consultation.
- Checks: a clinic takes visit requests only after an admin confirms it (for the hospital it claimed; claiming another hospital or changing the name or licence needs a new check). Doctors show "Checked" once confirmed. Verify with an official source, such as the hospital's official phone number or the licence register.
- Notices: people link Telegram from their account ("Telegramni ulash" opens the bot; pressing Start links the chat). Patients hear when a visit is confirmed or declined and when a doctor accepts or replies; clinics hear about new and cancelled requests; doctors about applications sent to them. Without Telegram, visit answers go by SMS when Eskiz is set up. The site also shows unread counts on "Qabullarim" and on a clinic's account button.
- Visit requests: only the patient who sent one and the clinic it went to can see it. A patient can have at most 5 open requests and one per clinic per day; days must be within the next 30 days (Tashkent time).
- Chat and requests refresh every few seconds while the page is open.
- Row-level security is on with no policies, so Supabase's public Data API can't read these tables even if its keys leak.
- Not yet: rate limiting on sign-in, password reset, email or phone verification of accounts.

Use test data only on servers outside Uzbekistan. Real patient data must be stored on servers in Uzbekistan.

## Data and licences

- Clinics: [Healthsites.io](https://healthsites.io) / © OpenStreetMap contributors, under the [Open Database License (ODbL)](https://opendatacommons.org/licenses/odbl/). `site/clinics.js` is a derived database and stays under ODbL.
- Regions and districts: OCHA COD-AB administrative boundaries for Uzbekistan (2018), CC BY-IGO.
- `data-build/build.py` rebuilds `site/clinics.js`; see `site/README.md` for details.

Shifokor is a directory and scheduling tool, not a medical provider. In an emergency, call 103.
