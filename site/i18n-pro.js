/* Copy for the doctor's panel. */
(function (T) {
  var add = function (lang, o) { Object.keys(o).forEach(function (k) { T[lang][k] = o[k]; }); };

  add("uz", {
    pro_panel: "Shifokor paneli",
    pro_t: { home: "Bosh sahifa", requests: "Arizalar", schedule: "Jadval", patients: "Bemorlarim", earnings: "Daromad", reviews: "Sharhlar", profile: "Profil va sozlamalar" },
    pro_hello: function (n) { return "Xayrli kun, " + n; },
    pro_st_new: "yangi ariza", pro_st_today: "bugungi qabul", pro_st_active: "faol maslahat", pro_st_rating: function (n) { return n ? n + " ta sharh" : "hali sharh yo‘q"; },
    pro_todo_h: "Profilingizni to‘ldiring", pro_todo_go: "To‘ldirish", pro_do_photo: "Rasm qo‘shing — bemorlar yuzni ko‘rib ishonadi", pro_do_lic: "Litsenziya raqamini yozing — «Tekshirilgan» belgisi uchun", pro_do_bio: "O‘zingiz haqingizda qisqa yozing",
    pro_do_price: "Maslahat narxlarini belgilang", pro_do_hours: "Qabul vaqtlarini belgilang — bemorlar vaqt band qiladi", pro_do_tg: "Telegramni ulang — yangi arizalar darhol keladi",
    pro_today_h: "Bugungi jadval", pro_today_none: "Bugun band qilingan vaqt yo‘q.", pro_new_h: "Yangi arizalar", pro_new_none: "Hozircha yangi ariza yo‘q.", pro_all: "Barchasi",
    pro_f: { "new": "Yangi", active: "Faol", done: "Yakunlangan" }, pro_none: { "new": "Yangi ariza yo‘q. Onlayn bo‘lsangiz, bemorlar sizni tezroq topadi.", active: "Faol maslahat yo‘q.", done: "Hali yakunlangan maslahat yo‘q." },
    pro_req_p: "Arizani o‘qing: qabul qilsangiz, bemor bilan chat va qo‘ng‘iroq ochiladi. Yuzma-yuz ko‘rik kerak bo‘lsa, arizani ochib «Yuzma-yuz ko‘rik kerak»ni tanlang — bemordan pul olinmaydi.",
    pro_open: "Ochish", pro_open_chat: "Chat va qo‘ng‘iroq", pro_age: function (a) { return a + " yosh"; },
    pro_ago_m: function (m) { return m + " daqiqa oldin"; }, pro_ago_h: function (h) { return h + " soat oldin"; }, pro_ago_d: function (d) { return d + " kun oldin"; },
    pro_sch_none: "Siz hali qabul vaqtlarini belgilamagansiz. Belgilasangiz, bemorlar o‘zlariga qulay vaqtni band qiladi.", pro_sch_set: "Vaqtlarni belgilash",
    pro_sch_p: function (len) { return "Keyingi 7 kun. Har bir qabul " + len + ". Toshkent vaqti."; }, pro_sch_edit: "Vaqtlarni o‘zgartirish", pro_free: "bo‘sh", pro_closed: "Dam olish kuni",
    pro_pat_p: "Siz maslahat bergan bemorlar. Bemorni bosing — oxirgi arizasi ochiladi.", pro_pat_none: "Hali bemorlar yo‘q.", pro_visits: function (n) { return n + " ta murojaat"; },
    pro_earn_demo: "Yakunlangan maslahatlar (demo)", pro_earn_note: "To‘lovlar Payme yoki Click orqali ulanganda, bu yerda haqiqiy daromad va o‘tkazmalar ko‘rinadi."
  });

  add("ru", {
    pro_panel: "Кабинет врача",
    pro_t: { home: "Главная", requests: "Заявки", schedule: "Расписание", patients: "Мои пациенты", earnings: "Доход", reviews: "Отзывы", profile: "Профиль и настройки" },
    pro_hello: function (n) { return "Добрый день, " + n; },
    pro_st_new: "новых заявок", pro_st_today: "приёмов сегодня", pro_st_active: "активных консультаций", pro_st_rating: function (n) { return n ? "отзывов: " + n : "отзывов пока нет"; },
    pro_todo_h: "Заполните профиль", pro_todo_go: "Заполнить", pro_do_photo: "Добавьте фото — пациенты больше доверяют", pro_do_lic: "Укажите номер лицензии — для отметки «Проверено»", pro_do_bio: "Коротко расскажите о себе",
    pro_do_price: "Укажите цены консультаций", pro_do_hours: "Укажите часы приёма — пациенты будут бронировать время", pro_do_tg: "Подключите Telegram — новые заявки придут сразу",
    pro_today_h: "Расписание на сегодня", pro_today_none: "На сегодня записей нет.", pro_new_h: "Новые заявки", pro_new_none: "Новых заявок пока нет.", pro_all: "Все",
    pro_f: { "new": "Новые", active: "Активные", done: "Завершённые" }, pro_none: { "new": "Новых заявок нет. Когда вы онлайн, пациенты находят вас быстрее.", active: "Активных консультаций нет.", done: "Завершённых консультаций пока нет." },
    pro_req_p: "Прочитайте заявку: после принятия откроются чат и звонок. Если нужен очный осмотр, откройте заявку и выберите «Нужен очный осмотр» — пациент не платит.",
    pro_open: "Открыть", pro_open_chat: "Чат и звонок", pro_age: function (a) { return a + " лет"; },
    pro_ago_m: function (m) { return m + " мин назад"; }, pro_ago_h: function (h) { return h + " ч назад"; }, pro_ago_d: function (d) { return d + " дн. назад"; },
    pro_sch_none: "Вы ещё не указали часы приёма. Укажите — и пациенты будут бронировать удобное время.", pro_sch_set: "Указать часы",
    pro_sch_p: function (len) { return "Следующие 7 дней. Каждый приём — " + len + ". Время Ташкента."; }, pro_sch_edit: "Изменить часы", pro_free: "свободно", pro_closed: "Выходной",
    pro_pat_p: "Пациенты, которых вы консультировали. Нажмите — откроется последняя заявка.", pro_pat_none: "Пациентов пока нет.", pro_visits: function (n) { return "обращений: " + n; },
    pro_earn_demo: "Завершённые консультации (демо)", pro_earn_note: "Когда подключите Payme или Click, здесь будут настоящий доход и переводы."
  });

  add("en", {
    pro_panel: "Doctor panel",
    pro_t: { home: "Overview", requests: "Requests", schedule: "Schedule", patients: "My patients", earnings: "Earnings", reviews: "Reviews", profile: "Profile and settings" },
    pro_hello: function (n) { return "Good day, " + n; },
    pro_st_new: "new requests", pro_st_today: "appointments today", pro_st_active: "active consultations", pro_st_rating: function (n) { return n ? n + (n === 1 ? " review" : " reviews") : "no reviews yet"; },
    pro_todo_h: "Complete your profile", pro_todo_go: "Complete it", pro_do_photo: "Add a photo — patients trust a face", pro_do_lic: "Add your licence number — for the “Checked” badge", pro_do_bio: "Write a few lines about yourself",
    pro_do_price: "Set your consultation prices", pro_do_hours: "Set your hours — patients book a time", pro_do_tg: "Connect Telegram — new requests reach you at once",
    pro_today_h: "Today’s schedule", pro_today_none: "No bookings today.", pro_new_h: "New requests", pro_new_none: "No new requests yet.", pro_all: "All",
    pro_f: { "new": "New", active: "Active", done: "Finished" }, pro_none: { "new": "No new requests. Patients find you faster while you’re online.", active: "No active consultations.", done: "No finished consultations yet." },
    pro_req_p: "Read the request: once you accept, chat and calls open. If an in-person visit is needed, open it and choose “in-person visit needed” — the patient pays nothing.",
    pro_open: "Open", pro_open_chat: "Chat and call", pro_age: function (a) { return a + " y"; },
    pro_ago_m: function (m) { return m + " min ago"; }, pro_ago_h: function (h) { return h + " h ago"; }, pro_ago_d: function (d) { return d + " d ago"; },
    pro_sch_none: "You haven’t set your hours yet. Set them and patients book a time that suits them.", pro_sch_set: "Set hours",
    pro_sch_p: function (len) { return "The next 7 days. Each consultation is " + len + ". Tashkent time."; }, pro_sch_edit: "Change hours", pro_free: "free", pro_closed: "Day off",
    pro_pat_p: "Patients you have advised. Tap one to open their latest request.", pro_pat_none: "No patients yet.", pro_visits: function (n) { return n + (n === 1 ? " request" : " requests"); },
    pro_earn_demo: "Finished consultations (demo)", pro_earn_note: "Once Payme or Click is connected, real earnings and transfers show here."
  });
})(window.SHIFOKOR_T);
