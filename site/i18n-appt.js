/* Copy for visit requests to state clinics: the patient asks for a day, the clinic confirms the hour. */
(function (T) {
  var add = function (lang, o) { Object.keys(o).forEach(function (k) { T[lang][k] = o[k]; }); };

  add("uz", {
    ap_h: "Qabulga yozilish", ap_p: "Kunni va kunning qaysi qismini tanlang. Shifoxona aniq soatni tasdiqlaydi.",
    ap_day: "Qaysi kuni?", ap_part: "Qaysi vaqtda?", ap_parts: { am: "Ertalab (8:00–12:00)", pm: "Tushdan keyin (13:00–17:00)" }, ap_parts_s: { am: "ertalab", pm: "tushdan keyin" },
    ap_who: "Kim uchun?", ap_whos: { self: "O‘zim uchun", other: "Boshqa odam uchun" },
    ap_name: "Bemorning ismi", ap_phone: "Telefon raqami", ap_spec: "Qaysi shifokor kerak?", ap_spec_any: "Bilmayman / oilaviy shifokor",
    ap_reason: "Sababi (qisqacha, ixtiyoriy)", ap_reason_ph: "Masalan: bosim, yo‘tal, tahlil topshirish",
    ap_send: "So‘rov yuborish", ap_note: "Bu so‘rov, hali qabul emas. Shifoxona soatni tasdiqlagach, «Qabullarim» sahifasida ko‘rasiz.",
    ap_err_fill: "Kunni, vaqtni, ismni va telefon raqamini kiriting.", ap_login: "Yozilish uchun hisobingizga kiring yoki ro‘yxatdan o‘ting.", ap_sent: "So‘rov yuborildi. Shifoxona javobini kuting.",
    ap_closed_h: "Bu shifoxonada onlayn yozilish hali ochilmagan", ap_closed_p: "Shifoxona hali Shifokorga ulanmagan. Hozircha navbatga joyida yoziling. Savolingiz bo‘lsa, shifokordan onlayn maslahat oling.",
    ap_join: "Shu shifoxonada ishlaysizmi? Ulaning va so‘rovlarni qabul qiling",
    ap_mine_h: "Shifoxonaga yozilishlarim", ap_visits_p: "Shifoxonaga yozilishlaringiz va onlayn maslahatlaringiz.", ap_find: "Shifoxona topish", ap_none: "Hali yozilish yo‘q. Shifoxonani toping va qabulga yoziling.",
    ap_st: { new: "Javob kutilmoqda", confirmed: "Tasdiqlandi", declined: "Rad etildi", cancelled: "Bekor qilindi" },
    ap_no: function (n) { return "So‘rov №" + n; }, ap_at: function (h) { return "soat " + h; }, ap_wait: "Shifoxona hali javob bermadi.", ap_for: function (n) { return n + " uchun"; },
    ap_cancel: "Bekor qilish", ap_cancel_q: "Yozilish bekor qilinsinmi?", ap_cancel_yes: "Ha, bekor qilish", ap_cancelled: "Yozilish bekor qilindi.",
    ap_inbox_h: "Qabulga so‘rovlar", ap_inbox_p: "Bemorlar kun tanlaydi. Siz soatni belgilab tasdiqlaysiz yoki rad etasiz.", ap_inbox_none: "Hali so‘rov yo‘q.",
    ap_inbox_hint: "Bemorlar shifoxona sahifasidan yozilishi uchun pastdagi «Klinikangiz xaritada» maydonida o‘z shifoxonangizni tanlang.",
    ap_new_n: function (n) { return n + " ta yangi"; },
    ap_ok: "Tasdiqlash", ap_decline: "Rad etish", ap_time: "Soat", ap_date2: "Kun", ap_cnote: "Bemorga izoh (ixtiyoriy)", ap_cnote_ph: "Masalan: 12-xona, pasportni olib keling", ap_dnote_ph: "Masalan: shifokor ta’tilda, boshqa kunga yoziling",
    ap_back: "Orqaga", ap_done_ok: "Qabul tasdiqlandi.", ap_done_no: "So‘rov rad etildi.", ap_call: "Qo‘ng‘iroq qilish", ap_clinic_note: "Shifoxona izohi",
    e_ap_date: "Bu kunni tanlab bo‘lmaydi. Bugundan boshlab 30 kun ichidagi kunni tanlang.", e_ap_limit: "Sizda 5 ta ochiq so‘rov bor. Yangisini yuborishdan oldin birini bekor qiling.", e_ap_dup: "Shu kunga shu shifoxonaga so‘rovingiz allaqachon bor.", e_ap_clinic: "Shifoxona topilmadi.", e_ap_time: "Soatni kiriting.", e_ap_closed: "Bu so‘rov allaqachon yopilgan."
  });

  add("ru", {
    ap_h: "Запись на приём", ap_p: "Выберите день и время суток. Больница подтвердит точный час.",
    ap_day: "Какой день?", ap_part: "Какое время?", ap_parts: { am: "Утром (8:00–12:00)", pm: "После обеда (13:00–17:00)" }, ap_parts_s: { am: "утром", pm: "после обеда" },
    ap_who: "Для кого?", ap_whos: { self: "Для себя", other: "Для другого человека" },
    ap_name: "Имя пациента", ap_phone: "Номер телефона", ap_spec: "Какой врач нужен?", ap_spec_any: "Не знаю / семейный врач",
    ap_reason: "Причина (коротко, по желанию)", ap_reason_ph: "Например: давление, кашель, сдать анализы",
    ap_send: "Отправить запрос", ap_note: "Это запрос, а не запись. Когда больница подтвердит час, вы увидите это в «Мои визиты».",
    ap_err_fill: "Укажите день, время, имя и номер телефона.", ap_login: "Чтобы записаться, войдите или зарегистрируйтесь.", ap_sent: "Запрос отправлен. Ждите ответа больницы.",
    ap_closed_h: "Онлайн-запись в эту больницу пока не открыта", ap_closed_p: "Больница ещё не подключена к Shifokor. Пока записывайтесь на месте. Если есть вопрос, получите онлайн-консультацию врача.",
    ap_join: "Работаете в этой больнице? Подключитесь и принимайте запросы",
    ap_mine_h: "Мои записи в больницы", ap_visits_p: "Ваши записи в больницы и онлайн-консультации.", ap_find: "Найти больницу", ap_none: "Записей пока нет. Найдите больницу и запишитесь.",
    ap_st: { new: "Ждёт ответа", confirmed: "Подтверждено", declined: "Отклонено", cancelled: "Отменено" },
    ap_no: function (n) { return "Запрос №" + n; }, ap_at: function (h) { return "в " + h; }, ap_wait: "Больница ещё не ответила.", ap_for: function (n) { return "для: " + n; },
    ap_cancel: "Отменить", ap_cancel_q: "Отменить запись?", ap_cancel_yes: "Да, отменить", ap_cancelled: "Запись отменена.",
    ap_inbox_h: "Запросы на приём", ap_inbox_p: "Пациенты выбирают день. Вы назначаете час и подтверждаете или отклоняете.", ap_inbox_none: "Запросов пока нет.",
    ap_inbox_hint: "Чтобы пациенты могли записываться со страницы больницы, выберите свою больницу ниже в поле «Ваша клиника на карте».",
    ap_new_n: function (n) { return "новых: " + n; },
    ap_ok: "Подтвердить", ap_decline: "Отклонить", ap_time: "Час", ap_date2: "День", ap_cnote: "Комментарий пациенту (по желанию)", ap_cnote_ph: "Например: кабинет 12, возьмите паспорт", ap_dnote_ph: "Например: врач в отпуске, запишитесь на другой день",
    ap_back: "Назад", ap_done_ok: "Приём подтверждён.", ap_done_no: "Запрос отклонён.", ap_call: "Позвонить", ap_clinic_note: "Комментарий больницы",
    e_ap_date: "Этот день выбрать нельзя. Выберите день в ближайшие 30 дней.", e_ap_limit: "У вас 5 открытых запросов. Отмените один, прежде чем отправить новый.", e_ap_dup: "У вас уже есть запрос в эту больницу на этот день.", e_ap_clinic: "Больница не найдена.", e_ap_time: "Укажите час.", e_ap_closed: "Этот запрос уже закрыт."
  });

  add("en", {
    ap_h: "Book a visit", ap_p: "Pick a day and a time of day. The hospital confirms the exact hour.",
    ap_day: "Which day?", ap_part: "What time?", ap_parts: { am: "Morning (8:00–12:00)", pm: "Afternoon (13:00–17:00)" }, ap_parts_s: { am: "morning", pm: "afternoon" },
    ap_who: "Who is it for?", ap_whos: { self: "For me", other: "For someone else" },
    ap_name: "Patient’s name", ap_phone: "Phone number", ap_spec: "Which doctor do you need?", ap_spec_any: "Not sure / family doctor",
    ap_reason: "Reason (short, optional)", ap_reason_ph: "For example: blood pressure, cough, blood test",
    ap_send: "Send request", ap_note: "This is a request, not a booking yet. When the hospital confirms the hour, you’ll see it in “My visits”.",
    ap_err_fill: "Enter the day, time, name and phone number.", ap_login: "Sign in or register to book a visit.", ap_sent: "Request sent. Wait for the hospital’s reply.",
    ap_closed_h: "Online booking isn’t open at this hospital yet", ap_closed_p: "This hospital hasn’t joined Shifokor yet. For now, queue on site. If you have a question, ask a doctor online.",
    ap_join: "Do you work here? Connect the hospital and accept requests",
    ap_mine_h: "My hospital visits", ap_visits_p: "Your hospital visits and online consultations.", ap_find: "Find a hospital", ap_none: "No visits yet. Find a hospital and book a visit.",
    ap_st: { new: "Waiting for reply", confirmed: "Confirmed", declined: "Declined", cancelled: "Cancelled" },
    ap_no: function (n) { return "Request #" + n; }, ap_at: function (h) { return "at " + h; }, ap_wait: "The hospital hasn’t replied yet.", ap_for: function (n) { return "for " + n; },
    ap_cancel: "Cancel", ap_cancel_q: "Cancel this visit?", ap_cancel_yes: "Yes, cancel", ap_cancelled: "Visit cancelled.",
    ap_inbox_h: "Visit requests", ap_inbox_p: "Patients pick a day. You set the hour and confirm, or decline.", ap_inbox_none: "No requests yet.",
    ap_inbox_hint: "So patients can book from your hospital’s page, choose your hospital below in “Your clinic on the map”.",
    ap_new_n: function (n) { return n + " new"; },
    ap_ok: "Confirm", ap_decline: "Decline", ap_time: "Hour", ap_date2: "Day", ap_cnote: "Note to the patient (optional)", ap_cnote_ph: "For example: room 12, bring your passport", ap_dnote_ph: "For example: the doctor is on leave, please pick another day",
    ap_back: "Back", ap_done_ok: "Visit confirmed.", ap_done_no: "Request declined.", ap_call: "Call", ap_clinic_note: "Hospital’s note",
    e_ap_date: "You can’t pick this day. Choose a day within the next 30 days.", e_ap_limit: "You have 5 open requests. Cancel one before sending a new one.", e_ap_dup: "You already have a request at this hospital for that day.", e_ap_clinic: "Hospital not found.", e_ap_time: "Enter the hour.", e_ap_closed: "This request is already closed."
  });
})(window.SHIFOKOR_T);
