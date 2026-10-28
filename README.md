# Shifokor

Find the nearest state clinic in Uzbekistan, ask a doctor online or by text message, and book visits. Built first for people living in villages, in Uzbek, Russian and English.

**Status:** prototype. The clinic directory uses real open data; accounts, bookings and consultations are a demo saved in each browser (no server yet).

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

Then open http://127.0.0.1:8765. To deploy (Vercel, Netlify, GitHub Pages), serve the `site` folder as a static site.

## Data and licences

- Clinics: [Healthsites.io](https://healthsites.io) / © OpenStreetMap contributors, under the [Open Database License (ODbL)](https://opendatacommons.org/licenses/odbl/). `site/clinics.js` is a derived database and stays under ODbL.
- Regions and districts: OCHA COD-AB administrative boundaries for Uzbekistan (2018), CC BY-IGO.
- `data-build/build.py` rebuilds `site/clinics.js`; see `site/README.md` for details.

Shifokor is a directory and scheduling tool, not a medical provider. In an emergency, call 103.
