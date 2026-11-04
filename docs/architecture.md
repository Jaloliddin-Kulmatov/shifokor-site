# Shifokor back end: architecture

Reorganised in November 2026 after SuperFlow (Mijozim)'s layout: layers with one job each, dependencies pointing inward,
one module per area, a job worker, and a REST API next to the site's own calls. It still runs as one Vercel function
in Node.js; folders starting with `_` are code, not separate functions.

## Layers

```
api/
  app.js            WebApi: the entry point. Routes requests, nothing else.
  daily.js          The daily cron (10:00 Tashkent): follow-ups, the day-before reminders, mothers' check-ins, due jobs.
  _webapi/
    routes.js       REST API v1: resource URLs mapped onto the use cases.
  _core/            Shared foundation; knows nothing about consultations or clinics.
    db.js           PostgreSQL pool and the schema migration (under an advisory lock).
    schema.js       Every table, index and migration step (idempotent).
    errors.js       Fail(status, code), bad(code), connection-error reasons.
    validate.js     ids, text, phone, email, Telegram name, profile, dates (Tashkent, UTC+5).
    auth.js         Passwords (scrypt), sessions (hashed tokens, 30 days), admin check.
    roles.js        Role enum and policies: requireRole, requireAdmin, can.*  (like SuperFlow's roles.ts)
    site.js         This deployment's address; Telegram notice to a user.
    http.js         JSON responses, RFC 7807 problem details, request bodies.
  _modules/         Application: one module per area. Each exports its actions (use cases) and helpers.
    users.js        sign-up (with the doctor's or clinic's first details), email codes, invites, sign-in, profile, online now, doctor photo, Telegram linking
    consults.js     apply (with a booked time), cancel, move, chat, accept, finish, in-person, pay link
    consult-repo.js reading a consultation, system notes in its chat
    slots.js        doctors' weekly hours, free times, day-before reminder
    files.js        photos and voice messages (checked by first bytes)
    calls.js        who may call, relay servers, call set-up messages
    followups.js    "Qalaysiz?" after a consultation
    appts.js        clinic visit requests
    reviews.js      reviews and replies
    payouts.js      doctors' earnings and transfers
    admin.js        checks, importing doctors, Telegram bot set-up
    sync.js         everything a page needs in one call
    telegram.js     the bot's webhook and buttons
    pay.js          Payme and Click
    ona.js          "Onalar uchun"
    meds.js         medicine lists and delivery requests
    clinics.js      clinic branches, doctors invited by phone, the clinic's weekly calendar
    notify.js       Telegram and SMS sending
    services.js     builds pay, ona and meds with what they need
  _worker/          Background work (like SuperFlow's Hangfire jobs).
    jobs.js         queue in app_jobs: schedule, cancel, tick (leased, retried up to 5 times)
    reminders.js    "slot_soon": one hour before a booked consultation, Telegram to patient and doctor
```

**The rule:** `_core` depends on nothing else; `_modules` depend on `_core` (and on each other only one way);
`_worker` and `_webapi` depend on `_modules`; `app.js` depends on all of them and holds no rules of its own.

## Two ways in, one set of rules

| Site's calls (unchanged) | REST API v1 |
|---|---|
| `POST /api/app { "action": "accept", "id": … }` | `POST /api/v1/consultations/{id}/accept` |
| `{ "action": "create_consult", "c": {…} }` | `POST /api/v1/consultations` (body: the application) → 201 |
| `{ "action": "slots", "doc": … }` | `GET /api/v1/doctors/{id}/slots` |
| `{ "action": "sync" }` | `GET /api/v1/me`, `/doctors`, `/clinics`, `/consultations`, `/appointments`, `/reviews` |

Also: `POST /api/v1/auth/signup|login|logout`, `/consultations/{id}/finish|refer|cancel|reschedule|messages|call|followup|pay-link|medicines|medicine-orders`,
`/appointments`, `/appointments/{id}/confirm|decline|cancel`, `/reviews`, `/reviews/{id}/reply`, `PUT /me/profile`, `POST /me/online`,
`/branches`, `/branches/{id}`, `/staff`, `/staff/{id}/answer|branch`, `GET /clinic/calendar`,
`/admin/users`, `/admin/users/{id}/verify`, `/admin/payouts`, `/admin/medicine-orders`, and `POST /api/v1/jobs/tick`.
Both run the same action, so the same checks apply. REST errors are problem details: `{ "type": "about:blank", "title": "<code>", "status": 409 }`.
Sign in with `POST /api/v1/auth/login { "id": "<phone or email>", "password": "…" }` and send `Authorization: Bearer <token>`.

## Roles

| Role | Can |
|---|---|
| patient | apply, book times, cancel/move own bookings, chat, call, pay, review, ask for medicine delivery, book clinic visits |
| doctor | accept, chat, call, write medicine lists, finish, send to an in-person visit, set hours and prices, reply to reviews, accept or decline a clinic's invitation, leave a clinic |
| clinic | confirm or decline visit requests, reply to reviews, keep branches, invite and remove doctors, see its doctors' booked times (no patient details) |
| admin (any account listed in `ADMIN_EMAILS` / `ADMIN_PHONES`) | check doctors and clinics, import doctors, payouts, medicine delivery, hide reviews |

## Jobs

`app_jobs` holds jobs with a kind, a time and a payload. `tick` runs the due ones: from the daily cron, from
`/api/v1/jobs/tick`, and on API requests at most once a minute per server instance. Vercel's free plan runs a cron only
once a day, so for reminders exactly an hour before even when nobody is using the site, point any scheduler
(cron-job.org, UptimeRobot) at `https://www.shifokor.com/api/v1/jobs/tick` every 5–10 minutes, with
`Authorization: Bearer <CRON_SECRET>` once `CRON_SECRET` is set.

## Not yet (next steps, as in SuperFlow)

- Clinics with branches and staff accounts (doctors who work for a clinic), and a clinic's shared calendar.
- Rate limiting on sign-in; password reset; phone verification.
- Automated tests that run in CI against a real PostgreSQL.
