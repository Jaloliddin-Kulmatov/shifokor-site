# Shifokor site

Static site, no build step. Three files:

- `index.html` shell: header with the Browse menu, footer, metadata
- `styles.css` all styling (light and dark follow the visitor's system theme)
- `i18n.js`, `i18n-extra.js`, `i18n-dir.js`, `i18n-acc.js` and `i18n-consult.js` all copy in English, Uzbek (Latin) and Russian
- `clinics.js` the state clinic directory: every region, district and health facility (generated, see below)
- `app.js` everything else: sample directory, search, filters, slot calendars, map, profile, booking, My visits, Browse, clinic workspace, village assist and the join form

Pages use hash routes (`#/find`, `#/f/n123`, `#/search`, `#/p/p2`, `#/browse/areas`, `#/visits`, `#/clinics`, `#/dashboard`, `#/assist`), so any static host works with no rewrite rules.

## State clinic directory (real data)

The main search (`#/find`) lists real health facilities in all 14 regions and 199 districts and cities of Uzbekistan, with state clinics shown first and village clinics before city ones.

- **Clinics:** Healthsites.io export of OpenStreetMap, data of 29 Sep 2026. 1,554 facilities: 693 state, 377 private, 484 not sure.
- **Regions and districts:** OCHA COD-AB administrative boundaries for Uzbekistan (2018). Each clinic is placed in its district by its map position.
- **Ownership is estimated from the name** (for example oilaviy poliklinika, QVP/SVP, tuman, markaziy, shoshilinch for state; MChJ, klinika, medical center for private). Only 24 entries say it directly.
- **Removed:** pharmacies, traditional healers, forensic offices and morgues, duplicates, and names carrying insults or accusations.
- **Not included:** phone numbers (not in the data), prices and free times. Real clinics never show invented booking slots; the booking demo uses separate sample clinics.
- **Gaps:** OpenStreetMap is incomplete. 76 districts have no state clinic mapped; those districts show the nearest ones. Samarkand region is mapped far better than others. "Add a missing clinic" and "Report wrong info" let people send corrections.

Why not an official list: data.egov.uz could not be reached, DMED forbids automated access in its robots.txt and lists only about 50 mostly private clinics, and Golden Pages / Yellow Pages are private directories. If the Ministry of Health or a regional health department shares its facility list, replace the data with it.

**Licences.** The clinic data is under the Open Database License (ODbL): keep the credit "© OpenStreetMap contributors" on the site, and if you publish `clinics.js` or a changed version, it must stay under ODbL. Boundaries are CC BY-IGO (credit OCHA).

**Rebuild.** `../data-build/build.py` downloads nothing itself. Put the Healthsites CSV (`hs.csv`) and the unzipped OCHA adm1/adm2 shapefiles (`adm/`) next to it, then run:

```bash
python3 build.py ../site/clinics.js
```

## Accounts and online consultation (demo)

Saved only in the visitor's browser; there is no server yet, so an account made on one phone does not exist on another.

- **Accounts (`#/register`, `#/login`, `#/account`):** patient, doctor or clinic. Register with an email or a +998 phone number (or both), an optional Telegram username and a password. Passwords are stored only as a SHA-256 hash.
- **Doctor profile:** specialty, years of experience, education and background, languages, licence number, workplaces (picked from the real clinic list or a registered clinic, or typed), services with prices and online/in-person. Public page `#/doc/<id>` with a Telegram button and "Ask this doctor online".
- **Clinic profile:** type, state or private, region and district, address, hours, licence, a link to its place on the map, services with prices. Public page `#/c/<id>` lists the doctors who work there. A linked map entry shows "registered on Shifokor".
- **Doctors (`#/doctors`, home page panel):** search registered doctors by specialty, region or name. Real clinic pages list doctors who named that clinic as a workplace.
- **Online consultation (`#/consult`):** the patient first fills in an application: text (chat and SMS), audio or video; a safety check that sends emergencies to 103; who it is for, age, sex, phone, area; the problem, how long, illnesses, medicines, allergies; specialty or a specific doctor; consent. Doctors see matching applications in their account, accept, reply by message, start a call and finish with an outcome. Patients follow it under My visits.
- Licences are not checked yet; every doctor and clinic shows "Licence not checked yet".

Moving to real accounts needs a server with sign-in (email or SMS codes), a database, and hosting that meets the plan's rule that health data stays in Uzbekistan.

## What works in the demo

These follow the MVP and UzHack prototype scope in the business plan. Everything is saved in the visitor's browser only; there is no server yet.

- **Booking:** a red-flag safety screen first (emergency symptoms show "call 103"), then name, phone and consent, then a Telegram-style confirmation. A slot is re-checked before saving, so a time that was just taken cannot be booked twice, also across open tabs.
- **My visits:** move a visit to a new free time, cancel with confirmation, join an online visit room (chat in the demo; audio and video are placeholders).
- **Clinic workspace (`#/dashboard`):** pick a sample clinic; appointments by day with Confirm, Mark done, No-show and Undo; online visits end with an outcome and summary; bookings for the next 7 days, today and the no-show rate; price editor that saves and stamps "confirmed today"; weekly confirmation prompt; patient reports with Mark fixed; Reset demo data.
- **Ranking:** clinics confirmed in the last 7 days rank first, older than 14 days are hidden from search.
- **Report wrong info** on a profile lands in that clinic's workspace.
- **Village assist (`#/assist`):** a nurse or volunteer books for a patient without a smartphone; the patient gets an SMS-style confirmation.

## Replace the sample data

The 8 sample clinics and their prices are the `P` array near the top of `app.js`, and the service and specialty names are in the `T` dictionary. Replace them with real clinics once they sign. Browse pages, search and profiles all read from the same data.

## Map

The results page and clinic profiles use Leaflet (loaded from cdnjs) with OpenStreetMap tiles. Each clinic in the `P` array in `app.js` has `lat` and `lng`. The sample coordinates are approximate points around central Fergana, not real addresses. Replace them with each clinic's real location.

OpenStreetMap's public tile server is meant for light use. Before you launch with real traffic, switch the tile URL in `initMap` to a hosted provider (for example MapTiler, Stadia or Mapbox) and keep the attribution.

## Before you publish

0. **Use version control.** Put this folder in a git repository so every change can be undone.

1. **Telegram handle.** Open `app.js` and set `CONFIG.telegram` to your bot or account name without the `@`, for example `shifokor_bot`. The join forms then open a prefilled Telegram message. While it is empty, the form copies the visitor's details to their clipboard instead.
2. **Native-speaker check.** Have someone who speaks Uzbek and Russian read the translations in `app.js`.
3. **Confirm the emergency number.** The page says to call 103.
4. **Add a social preview image (optional).** Put a 1200x630 image in this folder and add `<meta property="og:image" content="https://YOUR-DOMAIN/preview.png">` to `index.html`.

## Preview locally

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080 from this folder.

## Host it

Any static host works. Drag this folder onto Netlify Drop (app.netlify.com/drop), or push it to a GitHub repo and turn on GitHub Pages, or upload it to Cloudflare Pages.

The sample booking card uses made-up clinics and prices and is labelled "Sample data". Replace it with real data once clinics are signed.
