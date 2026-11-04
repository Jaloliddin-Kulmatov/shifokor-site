/* Copy for the doctor's and clinic's details at sign-up, and for confirming the email with a 6-digit code. */
(function (T) {
  var add = function (lang, o) { Object.keys(o).forEach(function (k) { T[lang][k] = o[k]; }); };
  ["uz", "ru", "en"].forEach(function (l) { T[l].pn_t.verify = { uz: "Emailni tasdiqlash", ru: "Подтверждение email", en: "Confirm your email" }[l]; });

  add("uz", {
    rg_d_spec_h: "Mutaxassisligingiz", rg_d_spec_p: "Bemorlar sizni shu bo‘yicha qidiradi.",
    rg_d_bg_p: "Qayerda o‘qigansiz, ordinatura, oldingi ish joylari, sertifikatlar.",
    rg_d_work_p: "Hozir qayerda qabul qilasiz. Klinika ro‘yxatdan tanlang yoki nomini yozing.",
    rg_d_bio_p: "Bemorlar profilingizda birinchi o‘qiydigan bir necha jumla (ixtiyoriy).",
    rg_c_p: "Klinika turi, litsenziya va qisqacha tavsif.", rg_c_about_ph: "Yo‘nalishlar, uskunalar, nimasi bilan ajralib turadi",
    rg_c_loc_p: "Bemorlar sizni xaritada va viloyat bo‘yicha topadi.",
    rg_c_who_h: "Mas’ul shaxs", rg_c_who_p: "Tekshiruv jamoasi bog‘lanadigan odam. Saytda ko‘rsatilmaydi.",
    rg_c_who: "Ism va familiya", rg_c_role: "Lavozimi", rg_c_role_ph: "masalan: bosh shifokor, administrator",
    rg_note: "Litsenziya va ma’lumotlaringizni jamoamiz tekshiradi. Tekshiruvdan so‘ng profilingizda “Tekshirilgan” belgisi paydo bo‘ladi. Hammasini keyin profilda o‘zgartirish mumkin.",
    rg_e_spec: "Mutaxassislikni tanlang.", rg_e_years: "Tajriba yillarini kiriting (0–70).", rg_e_region: "Viloyatni tanlang.", rg_e_addr: "Klinika manzilini yozing.",
    ev_h: "Emailni tasdiqlash", ev_p: "Bu hisobingiz sizniki ekanini va xabarlar to‘g‘ri manzilga borishini tasdiqlaydi.",
    ev_sent: function (e) { return "<b>" + e + "</b> manziliga 6 xonali kod yubordik. Kodni shu yerga kiriting."; },
    ev_code: "Tasdiqlash kodi", ev_btn: "Tasdiqlash", ev_resend: "Kodni qayta yuborish", ev_resend_in: function (n) { return "Qayta yuborish (" + n + ")"; },
    ev_spam: "Xat kelmadimi? “Spam” papkasini tekshiring yoki emailni o‘zgartiring:", ev_change: "profil sozlamalari", ev_later: "Keyinroq tasdiqlayman",
    ev_demo: function (c) { return "Demo rejim: haqiqiy xat yuborilmaydi. Kod: <b class=\"nums\">" + c + "</b>"; },
    ev_off: "Email yuborish hali yoqilmagan. Tez orada shu yerda tasdiqlash mumkin bo‘ladi.",
    ev_e_len: "6 xonali kodni kiriting.", ev_e_code: "Kod noto‘g‘ri. Qayta tekshiring.", ev_e_exp: "Kod eskirgan. Yangi kod so‘rang.", ev_e_tries: "Urinishlar ko‘p bo‘ldi. Yangi kod so‘rang.",
    ev_e_mail: "Xatni yuborib bo‘lmadi. Emailni tekshirib, qayta urinib ko‘ring.",
    ev_ok: "Email tasdiqlandi.", ev_done: "Email tasdiqlangan", ev_done_p: function (e) { return e + " tasdiqlangan."; }, ev_go: "Bosh sahifaga",
    ev_noemail: "Hisobingizda email yo‘q", ev_noemail_p: "Email qo‘shsangiz, uni shu yerda tasdiqlaysiz.",
    ev_ban_h: "Emailingizni tasdiqlang", ev_ban_p: function (e) { return e + " manziliga kod yuboramiz. Bu bir daqiqa oladi."; }, ev_ban_btn: "Tasdiqlash",
    adm_email_ok: "Email tasdiqlangan", adm_email_no: "Email tasdiqlanmagan", adm_cperson: "Mas’ul shaxs"
  });

  add("ru", {
    rg_d_spec_h: "Ваша специальность", rg_d_spec_p: "По ней пациенты будут вас искать.",
    rg_d_bg_p: "Где учились, ординатура, прошлые места работы, сертификаты.",
    rg_d_work_p: "Где вы сейчас принимаете. Выберите клинику из списка или впишите название.",
    rg_d_bio_p: "Несколько фраз, которые пациенты прочитают первыми (необязательно).",
    rg_c_p: "Тип клиники, лицензия и краткое описание.", rg_c_about_ph: "Направления, оборудование, чем вы отличаетесь",
    rg_c_loc_p: "Пациенты найдут вас на карте и по области.",
    rg_c_who_h: "Контактное лицо", rg_c_who_p: "С кем свяжется команда проверки. На сайте не показывается.",
    rg_c_who: "Имя и фамилия", rg_c_role: "Должность", rg_c_role_ph: "например: главный врач, администратор",
    rg_note: "Наша команда проверит лицензию и данные. После проверки в профиле появится отметка «Проверено». Всё можно изменить позже в профиле.",
    rg_e_spec: "Выберите специальность.", rg_e_years: "Укажите стаж (0–70 лет).", rg_e_region: "Выберите область.", rg_e_addr: "Укажите адрес клиники.",
    ev_h: "Подтверждение email", ev_p: "Так мы знаем, что аккаунт ваш и сообщения идут по верному адресу.",
    ev_sent: function (e) { return "Мы отправили 6-значный код на <b>" + e + "</b>. Введите его здесь."; },
    ev_code: "Код подтверждения", ev_btn: "Подтвердить", ev_resend: "Отправить код ещё раз", ev_resend_in: function (n) { return "Повторить (" + n + ")"; },
    ev_spam: "Письмо не пришло? Проверьте «Спам» или измените email в", ev_change: "настройках профиля", ev_later: "Подтвержу позже",
    ev_demo: function (c) { return "Демо-режим: письмо не отправляется. Код: <b class=\"nums\">" + c + "</b>"; },
    ev_off: "Отправка писем ещё не включена. Скоро подтвердить email можно будет здесь.",
    ev_e_len: "Введите 6-значный код.", ev_e_code: "Неверный код. Проверьте ещё раз.", ev_e_exp: "Код устарел. Запросите новый.", ev_e_tries: "Слишком много попыток. Запросите новый код.",
    ev_e_mail: "Не удалось отправить письмо. Проверьте email и попробуйте снова.",
    ev_ok: "Email подтверждён.", ev_done: "Email подтверждён", ev_done_p: function (e) { return e + " подтверждён."; }, ev_go: "На главную",
    ev_noemail: "В аккаунте нет email", ev_noemail_p: "Добавьте email, и здесь его можно будет подтвердить.",
    ev_ban_h: "Подтвердите email", ev_ban_p: function (e) { return "Отправим код на " + e + ". Это займёт минуту."; }, ev_ban_btn: "Подтвердить",
    adm_email_ok: "Email подтверждён", adm_email_no: "Email не подтверждён", adm_cperson: "Контактное лицо"
  });

  add("en", {
    rg_d_spec_h: "Your specialty", rg_d_spec_p: "Patients search for you by it.",
    rg_d_bg_p: "Where you studied, residency, past jobs, certificates.",
    rg_d_work_p: "Where you see patients now. Pick a clinic from the list or type its name.",
    rg_d_bio_p: "A few lines patients read first on your profile (optional).",
    rg_c_p: "Clinic type, licence and a short description.", rg_c_about_ph: "Specialties, equipment, what makes you different",
    rg_c_loc_p: "Patients find you on the map and by region.",
    rg_c_who_h: "Contact person", rg_c_who_p: "Who our checking team should talk to. Not shown on the site.",
    rg_c_who: "Full name", rg_c_role: "Position", rg_c_role_ph: "e.g. chief doctor, administrator",
    rg_note: "Our team checks your licence and details. Once checked, your profile shows a “Verified” mark. You can change everything later in your profile.",
    rg_e_spec: "Choose your specialty.", rg_e_years: "Enter your years of experience (0–70).", rg_e_region: "Choose the region.", rg_e_addr: "Enter the clinic's address.",
    ev_h: "Confirm your email", ev_p: "This shows the account is yours and that messages reach the right address.",
    ev_sent: function (e) { return "We sent a 6-digit code to <b>" + e + "</b>. Enter it here."; },
    ev_code: "Confirmation code", ev_btn: "Confirm", ev_resend: "Send the code again", ev_resend_in: function (n) { return "Resend (" + n + ")"; },
    ev_spam: "No email? Check your spam folder, or change your email in", ev_change: "profile settings", ev_later: "I'll confirm later",
    ev_demo: function (c) { return "Demo mode: no real email is sent. Code: <b class=\"nums\">" + c + "</b>"; },
    ev_off: "Email sending isn't switched on yet. You'll be able to confirm here soon.",
    ev_e_len: "Enter the 6-digit code.", ev_e_code: "That code is wrong. Check it and try again.", ev_e_exp: "The code has expired. Ask for a new one.", ev_e_tries: "Too many tries. Ask for a new code.",
    ev_e_mail: "Couldn't send the email. Check the address and try again.",
    ev_ok: "Email confirmed.", ev_done: "Email confirmed", ev_done_p: function (e) { return e + " is confirmed."; }, ev_go: "Go to overview",
    ev_noemail: "Your account has no email", ev_noemail_p: "Add an email and you can confirm it here.",
    ev_ban_h: "Confirm your email", ev_ban_p: function (e) { return "We'll send a code to " + e + ". It takes a minute."; }, ev_ban_btn: "Confirm",
    adm_email_ok: "Email confirmed", adm_email_no: "Email not confirmed", adm_cperson: "Contact person"
  });
})(window.SHIFOKOR_T);
