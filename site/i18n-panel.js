/* Copy for the panel app (/panel/): navigation and the patient and clinic pages. The doctor pages use i18n-pro.js. */
(function (T) {
  var add = function (lang, o) { Object.keys(o).forEach(function (k) { T[lang][k] = o[k]; }); };

  add("uz", {
    ph_pat_q: "Bugun nima yordam kerak?", ph_ai_h: "Shifo_AI dan so‘rash", ph_ai_p: "Muammoni o‘z so‘zingiz bilan yozing: qaysi shifokor kerakligini aytadi.",
    ph_now_p: "Hozir onlayn shifokorlardan biri javob beradi.", ph_find_p: "Mutaxassislik, narx va til bo‘yicha tanlang.",
    ph_doc_new: function (n) { return "Javob kutayotgan arizalar · " + n; }, ph_doc_wait: function (n) { return n + " ta bemor javob kutmoqda"; }, ph_doc_clear: "yangi ariza yo‘q",
    ph_cli_wait: function (n) { return n + " ta qabul so‘roviga javob bering: kunni tasdiqlang va soatni belgilang."; }, ph_cli_clear: "Barcha so‘rovlarga javob berilgan.",
    ph_cli_today: function (n) { return "Bugungi qabullar · " + n; }, ph_cli_today_none: "Bugun tasdiqlangan qabul yo‘q.", pro_active_h: "Faol maslahatlar",
    pn_t: { home: "Bosh sahifa", consults: "Arizalarim", visits: "Klinikaga yozilishlar", meds: "Dorilarim", ona: "Onalar uchun", settings: "Profil va sozlamalar", requests: "Arizalar", schedule: "Jadval", patients: "Bemorlarim", earnings: "Daromad", reviews: "Sharhlar", crequests: "Qabul so‘rovlari", cdoctors: "Shifokorlarimiz", a_chk: "Tekshiruv", a_pay: "Shifokorlarga to‘lov", a_import: "Shifokorlarni qo‘shish", a_meds: "Dori yetkazish" },
    pn_role: { patient: "Bemor kabineti", doctor: "Shifokor paneli", clinic: "Klinika paneli" }, pn_admin: "Administrator", pn_site: "Saytga qaytish",
    pn_pat_p: "Arizalaringiz, qabul vaqtlari va dorilaringiz bir joyda.", pn_st_open: "faol ariza", pn_st_next: "keyingi qabul", pn_st_meds: "dori buyurtmasi", pn_st_visits: "klinikaga yozilish",
    pn_open_h: "Faol arizalar", pn_open_none: "Hozircha faol ariza yo‘q", pn_open_none_p: "Shifokorni tanlang yoki hozir bo‘sh shifokorga yozing.",
    pn_consults_p: "Barcha onlayn maslahatlaringiz: yozishmalar, qo‘ng‘iroqlar va shifokor maslahati.", pn_meds_p: "Shifokor yozgan dorilar va ularni uyga yetkazib berish so‘rovlari.",
    pn_meds_none: "Hali dorilar ro‘yxati yo‘q", pn_meds_none_p: "Maslahatdan keyin shifokor dori yozsa, shu yerda ko‘rinadi.",
    pn_cli_p: "Qabul so‘rovlari, shifokorlar va sharhlar.", pn_st_cnew: "yangi so‘rov", pn_st_ctoday: "bugun tasdiqlangan", pn_st_cdocs: "shifokor",
    pn_cdocs_p: "Profilida sizning klinikangizni ko‘rsatgan shifokorlar.", pn_cdocs_none: "Shifokorlar profilida ish joyi sifatida klinikangizni tanlasa, shu yerda chiqadi.",
    pn_set_p: "Ma’lumotlaringiz, narxlar, qabul vaqtlari va bildirishnomalar."
  });

  add("ru", {
    ph_pat_q: "Чем помочь сегодня?", ph_ai_h: "Спросить Shifo_AI", ph_ai_p: "Опишите проблему своими словами: подскажет, какой врач нужен.",
    ph_now_p: "Ответит один из врачей, которые сейчас онлайн.", ph_find_p: "Выберите по специальности, цене и языку.",
    ph_doc_new: function (n) { return "Заявки ждут ответа · " + n; }, ph_doc_wait: function (n) { return "ответа ждут пациентов: " + n; }, ph_doc_clear: "новых заявок нет",
    ph_cli_wait: function (n) { return "Ответьте на запросы на приём (" + n + "): подтвердите день и назначьте время."; }, ph_cli_clear: "На все запросы есть ответ.",
    ph_cli_today: function (n) { return "Приёмы сегодня · " + n; }, ph_cli_today_none: "На сегодня подтверждённых приёмов нет.", pro_active_h: "Активные консультации",
    pn_t: { home: "Главная", consults: "Мои заявки", visits: "Записи в клинику", meds: "Мои лекарства", ona: "Для мам", settings: "Профиль и настройки", requests: "Заявки", schedule: "Расписание", patients: "Мои пациенты", earnings: "Доход", reviews: "Отзывы", crequests: "Запросы на приём", cdoctors: "Наши врачи", a_chk: "Проверка", a_pay: "Выплаты врачам", a_import: "Добавить врачей", a_meds: "Доставка лекарств" },
    pn_role: { patient: "Кабинет пациента", doctor: "Кабинет врача", clinic: "Кабинет клиники" }, pn_admin: "Администратор", pn_site: "На сайт",
    pn_pat_p: "Заявки, время приёма и лекарства в одном месте.", pn_st_open: "активных заявок", pn_st_next: "следующий приём", pn_st_meds: "заказов лекарств", pn_st_visits: "записей в клинику",
    pn_open_h: "Активные заявки", pn_open_none: "Активных заявок пока нет", pn_open_none_p: "Выберите врача или напишите свободному врачу сейчас.",
    pn_consults_p: "Все онлайн-консультации: переписка, звонки и советы врача.", pn_meds_p: "Лекарства от врача и заявки на доставку домой.",
    pn_meds_none: "Списка лекарств пока нет", pn_meds_none_p: "Если врач выпишет лекарства после консультации, они появятся здесь.",
    pn_cli_p: "Запросы на приём, врачи и отзывы.", pn_st_cnew: "новых запросов", pn_st_ctoday: "подтверждено на сегодня", pn_st_cdocs: "врачей",
    pn_cdocs_p: "Врачи, которые указали вашу клинику в профиле.", pn_cdocs_none: "Когда врачи укажут вашу клинику местом работы, они появятся здесь.",
    pn_set_p: "Ваши данные, цены, часы приёма и уведомления."
  });

  add("en", {
    ph_pat_q: "What do you need help with today?", ph_ai_h: "Ask Shifo_AI", ph_ai_p: "Describe the problem in your own words: it tells you which doctor you need.",
    ph_now_p: "One of the doctors online right now will answer.", ph_find_p: "Choose by specialty, price and language.",
    ph_doc_new: function (n) { return "Requests waiting for you · " + n; }, ph_doc_wait: function (n) { return n + " patient" + (n === 1 ? " is" : "s are") + " waiting"; }, ph_doc_clear: "no new requests",
    ph_cli_wait: function (n) { return "Answer " + n + " visit request" + (n === 1 ? "" : "s") + ": confirm the day and set the hour."; }, ph_cli_clear: "Every request has an answer.",
    ph_cli_today: function (n) { return "Today’s visits · " + n; }, ph_cli_today_none: "No confirmed visits today.", pro_active_h: "Active consultations",
    pn_t: { home: "Overview", consults: "My requests", visits: "Clinic visits", meds: "My medicines", ona: "For mothers", settings: "Profile and settings", requests: "Requests", schedule: "Schedule", patients: "My patients", earnings: "Earnings", reviews: "Reviews", crequests: "Visit requests", cdoctors: "Our doctors", a_chk: "Checks", a_pay: "Doctor payouts", a_import: "Add doctors", a_meds: "Medicine delivery" },
    pn_role: { patient: "Patient account", doctor: "Doctor panel", clinic: "Clinic panel" }, pn_admin: "Admin", pn_site: "Back to site",
    pn_pat_p: "Your requests, appointment times and medicines in one place.", pn_st_open: "active requests", pn_st_next: "next appointment", pn_st_meds: "medicine orders", pn_st_visits: "clinic visits",
    pn_open_h: "Active requests", pn_open_none: "No active requests yet", pn_open_none_p: "Choose a doctor, or write to a doctor who is free now.",
    pn_consults_p: "All your online consultations: messages, calls and the doctor’s advice.", pn_meds_p: "Medicines your doctor wrote and your delivery requests.",
    pn_meds_none: "No medicine list yet", pn_meds_none_p: "If a doctor writes medicines after a consultation, they show here.",
    pn_cli_p: "Visit requests, doctors and reviews.", pn_st_cnew: "new requests", pn_st_ctoday: "confirmed today", pn_st_cdocs: "doctors",
    pn_cdocs_p: "Doctors who list your clinic on their profile.", pn_cdocs_none: "Doctors appear here once they choose your clinic as their workplace.",
    pn_set_p: "Your details, prices, hours and notifications."
  });
})(window.SHIFOKOR_T);
