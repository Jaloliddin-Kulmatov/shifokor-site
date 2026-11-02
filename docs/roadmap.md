# Shifokor: what we learned from other platforms, and the plan

Last updated 3 November 2026.

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
| Prices up front | Doctor Anywhere, Practo | Done |
| Health records the patient keeps (past visits, documents) | Doctolib, Doctor Anywhere | **Next** |
| Consultation summary / sick note as a PDF | Doctor Anywhere, Kry/Livi | **Next** |
| Waiting list: "tell me if an earlier time frees up" | Doctolib | **Next** |
| Review details (attention, explanation, waiting) | Zocdoc, Jameda | **Next** |
| Family profiles (book for a child or parent from one account) | Doctolib | **Next** |
| Telegram Mini App / installable phone app | Doctor Anywhere, Kry/Livi | **Next** |
| Insurance and employer plans | Zocdoc, Doctor Anywhere, Teladoc | Later |
| Lab tests and health check packages | Doctor Anywhere, Halodoc | Later |

## The plan

### Now (before real patients)
1. Host patient data in Uzbekistan (personal-data law) and keep the Vercel site as the front end.
2. Replace sample doctors with real, checked doctors in Fergana: women gynaecologists, paediatricians, family doctors.
3. Set `TELEGRAM_BOT_TOKEN`, `CRON_SECRET`, Payme and Click keys, and a TURN relay for calls on mobile data.
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
1. Clinic accounts with several doctors and one shared calendar.
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
