# Shifokor: what we learned from other platforms, and the plan

Last updated 5 November 2026.

## What the best platforms do, and where Shifokor stands

| Idea | Who does it | Shifokor |
|---|---|---|
| Search by specialty, place, language | Zocdoc, Doctolib, Practo | Done |
| Search by **symptom or complaint** ("isitma", "tish og‘rig‘i") | Zocdoc | Done (Nov 2026) |
| **Next free times on the doctor's card**, book in one tap | Zocdoc, Doctolib | Done (Nov 2026) |
| Book an exact time from the doctor's real calendar | Zocdoc, Doctolib | Done |
| **Cancel or move a booking yourself** | Doctolib, Zocdoc | Done (Nov 2026) |
| Reminders before the appointment | Doctolib, Zocdoc | Done (Telegram, the day before) |
| See the next available doctor now | Doctor Anywhere, Kry/Livi | Done ("Birinchi bo‘sh shifokor") |
| Video and audio calls, chat with photos and voice | Doctor Anywhere, Kry/Livi | Done |
| No charge if an in-person visit is needed | Doctor Anywhere | Done |
| Follow-up a few days later | Doctor Anywhere | Done ("Qalaysiz?") |
| Medicine delivery after the consultation | Doctor Anywhere, Halodoc | Trial (needs a partner pharmacy) |
| Reviews only from real patients | Zocdoc | Done (only after a consultation or visit) |
| A separate workspace for doctors | Practo Ray, Doctolib Pro | Done (Shifokor paneli) |
| Clinic accounts with branches, staff doctors and a shared calendar | Doctolib Pro, Practo Ray | Done (Nov 2026) |
| Password reset (code by Telegram, email or SMS; admin link) | everyone | Done (Nov 2026) |
| Pages Google can index (/shifokor/<id>, sitemap, schema.org) | Zocdoc, Doctolib | Done (Nov 2026) |
| Licence and diploma upload for the check | Doctolib Pro, Practo | Done (Nov 2026) |
| Prices up front | Doctor Anywhere, Practo | Done |
| Health records the patient keeps (past visits, documents) | Doctolib, Doctor Anywhere | Done (Nov 2026, "Tibbiy kartam") |
| Consultation summary / sick note as a PDF | Doctor Anywhere, Kry/Livi | Done (printable summary, save as PDF) |
| Waiting list: "tell me if an earlier time frees up" | Doctolib | **Next** |
| Review details (attention, explanation, waiting) | Zocdoc, Jameda | Done (Nov 2026) |
| Family profiles (book for a child or parent from one account) | Doctolib | **Next** |
| Telegram Mini App / installable phone app | Doctor Anywhere, Kry/Livi | Installable app done; Telegram Mini App **next** (needs the bot) |
| Insurance and employer plans | Zocdoc, Doctor Anywhere, Teladoc | Later |
| Lab tests and health check packages | Doctor Anywhere, Halodoc | Later |

## Core functions (November 2026)

What the leading platforms put first, and what Shifokor keeps up front:

| Platform | What it leads with |
|---|---|
| Zocdoc, Doctolib | One search box (complaint, doctor or clinic + place), then booking a free time |
| Doctor Anywhere, Kry/Livi | See a doctor online now: chat and video, then medicines |
| Practo, Halodoc | Find doctors, video consult, then pharmacy and lab tests as extra tabs |
| OVI (Tashkent, 2025) | Picks the doctor for you from reviews, ratings and location; 24/7 chat and video |
| DMED (state) | Polyclinic queue, e-prescriptions, records — not choice of a private doctor |

**Kept up front:** find a doctor (search, filters, top-rated by real reviews), online consultation (chat, voice,
photos, audio and video calls), booking a time, clinics and visit booking, the patient/doctor/clinic panels.
**One click away under "More" and in the footer:** specialists, family health, prices, "Onalar uchun", mental health,
health tips, about, questions, settings. Nothing was removed; the header went from 3 menus with 16 links to
Find a doctor · Clinics · More · Online consultation.

**Home page order:** search with a real photo → healthcare for you (prices) → who needs help (4 photo cards) →
top-rated doctors (only doctors with reviews) → promises → how to use → reviews → specialties → when online fits →
for doctors and clinics → questions. Removed from the home page (still on their own pages): the region lists, the
mission comparison, the second call-to-action band and the DMED box (it's in the questions).

## November 2026 additions

- **Services grid** on the home page and `#/services`: the site's promise, "the best doctors and the best services for an ordinary person", as eight photo cards with prices. The home page is shorter: hero, services, top doctors, how it works, promises, for doctors and clinics, FAQ.
- **Cabinet link** in the header for every signed-in role; the application form asks for the complaint first and folds the optional details away; a doctor who accepts lands in the chat with the reply box focused.
- **Email confirmation** is on; the admin check page shows experience, education, bio, address and hours.
- **LiveKit calls** (optional, `LIVEKIT_*` settings): the call goes through a media server when configured, otherwise straight between browsers as before. Webhooks and the React `meet` template weren't used: the site has its own call screen (`site/call.js`), so only the browser library and a server-signed token were needed.

## The plan

### Now (before real patients)
1. Host patient data in Uzbekistan (personal-data law) and keep the Vercel site as the front end.
2. Replace sample doctors with real, checked doctors in Fergana: women gynaecologists, paediatricians, family doctors.
3. Set `TELEGRAM_BOT_TOKEN`, `CRON_SECRET`, `RESEND_API_KEY` and `MAIL_FROM` (email codes), Payme and Click keys, and a TURN relay for calls on mobile data.
4. Test every flow on two real phones: register, apply, accept, chat, voice, call, cancel, move, review.
5. Have a lawyer confirm the telemedicine rules and medicine delivery.

### Next 1–3 months
1. **My health record:** one page per patient with past consultations, the doctor's advice, medicines and files.
2. **Consultation summary PDF** the doctor signs off: complaint, advice, medicines, follow-up date.
3. **Family profiles:** a mother books for her child or her parents from her own account.
4. **Waiting list:** "earlier time wanted"; when someone cancels, Telegram offers that time.
5. **Review details:** stars for attention, explanation and punctuality, shown on the doctor's profile.
6. **Telegram Mini App:** the same site inside Telegram, so villages don't need to install anything.

### 3–12 months
1. ~~Clinic accounts with several doctors and one shared calendar.~~ Done in November 2026: branches, doctors invited by phone, a weekly calendar.
2. Lab test booking with partner labs, results in the health record.
3. Employer plans (B2B) and the first insurance partner.
4. Karakalpak and Tajik languages; voice-first help for people who don't read well.
5. Analytics for doctors: busiest hours, repeat patients, ratings over time.

### Later
1. Link with DMED through an official route, so records follow the patient.
2. An assistant for doctors that summarises the application before the call (never diagnoses).
3. Other Central Asian countries.

## Quality checks we run before each release
- Every page in Uzbek, Russian and English: no "undefined", no untranslated text, no sideways scrolling on a 375 px phone.
- Every internal link opens a real page.
- Server rules tested with a stand-in database: who may see, accept, call, cancel and move.
- Dark mode and keyboard use (focus visible, Escape closes menus and panels).

## Design system (November 2026)
- **One search box first** (Zocdoc): complaint or doctor's name, region, Search. Specialty, language, woman doctor and "online now" fold under "Ko‘proq filtrlar". Example complaints sit under the box.
- **Home page order:** see "Core functions" above. Nothing is said twice.
- **Cards:** 20 px corners, a soft shadow; cards you can tap lift slightly on hover (not with reduced motion).
- **Headings:** one size per level on every page.
- **Top bar:** one filled button (register); "Onlayn maslahat" is tinted so the two don't compete.
- **Doctor tiles:** face, name, specialty and years, rating, region, next free time, price and one button.
- **Chat:** camera, microphone, text and send in one row, like a messenger.
- **Footer:** brand with a consultation button, then patients, wellness, about, doctors and clinics.
- Every change is checked in Uzbek, Russian and English, light and dark, at 375 px and 1280 px.
