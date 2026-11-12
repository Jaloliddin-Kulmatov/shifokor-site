/* Copy for "Sinab ko'rish": a sandbox with a ready patient, doctor and clinic, kept only in the visitor's browser. */
(function (T) {
  var add = function (lang, o) { Object.keys(o).forEach(function (k) { T[lang][k] = o[k]; }); };

  add("uz", {
    dm_nav: "Sinab ko‘rish", dm_eyebrow: "Hakamlar va mehmonlar uchun", dm_h: "Shifokor’ni 3 daqiqada sinab ko‘ring",
    dm_p: "Ro‘yxatdan o‘tish shart emas. Tayyor bemor, shifokor va klinika hisoblari bor: birini tanlang, keyin pastdagi paneldan istalgan paytda boshqasiga o‘ting. Hammasi faqat shu brauzerda saqlanadi.",
    dm_roles: { patient: "Bemor", doctor: "Shifokor", clinic: "Klinika" },
    dm_role_p: {
      patient: "Malika: Shifo_AI ga yozadi, shifokorga ariza yuboradi, xulosani tibbiy kartada ko‘radi, klinikaga yoziladi.",
      doctor: "Dr. Dilnoza Karimova, pediatr: yangi arizani qabul qiladi, chat yoki video orqali gaplashadi, xulosa yozadi, qabulxonasiga yozilishlarni tasdiqlaydi.",
      clinic: "Farg‘ona Shifo klinikasi: qabul so‘rovini tasdiqlaydi va soat belgilaydi, umumiy jadval va shifokorlarini ko‘radi."
    },
    dm_enter: function (r) { return r + " sifatida kirish"; },
    dm_steps_h: "Tavsiya etilgan yo‘l (≈3 daqiqa)",
    dm_steps: [
      "<b>Bemor</b>: o‘ng pastdagi <b>Shifo_AI</b> ga yozing, masalan «4 yoshli bolamda 2 kundan beri isitma va yo‘tal bor». U bitta savol beradi va pediatrlarni ko‘rsatadi (bu qism haqiqiy AI).",
      "<b>Bemor</b>: «Kabinet → Arizalarim» da tugagan maslahatni oching: shifokor xulosasi va chat shu yerda. «Tibbiy kartam» da tarix saqlanadi.",
      "<b>Shifokor</b> ga o‘ting: «Yangi arizalar» dagi arizani qabul qiling, javob yozing, so‘ng «Maslahatni yakunlash» bilan xulosa qoldiring. Video qo‘ng‘iroqni ikki oynada sinash mumkin.",
      "<b>Bemor</b>: shifokor sahifasida «Qabulga yozilish» — kun va qulay soatni tanlang (shifokorning shaxsiy qabulxonasi yoki klinika).",
      "<b>Klinika</b> ga o‘ting: «Qabul so‘rovlari» da so‘rovni tasdiqlang va soat qo‘ying; «Umumiy jadval» da ko‘rinadi. Bemor esa «Klinikaga yozilishlar» da tasdiqni ko‘radi."
    ],
    dm_note_h: "Sinov rejimi haqida",
    dm_note_p: "Bu rejimda hisoblar va arizalar faqat sizning brauzeringizda saqlanadi, haqiqiy bemor va shifokorlarga hech narsa yuborilmaydi. Shifo_AI haqiqiy serverdan javob beradi. Haqiqiy rejimni sinash uchun sinovdan chiqib, oddiy ro‘yxatdan o‘ting.",
    dm_bar: "Sinov rejimi", dm_help: "Yo‘riqnoma", dm_exit: "Chiqish", dm_exit_long: "Sinov rejimidan chiqish", dm_as: function (r) { return "Hozir: " + r; }
  });

  add("ru", {
    dm_nav: "Попробовать", dm_eyebrow: "Для жюри и гостей", dm_h: "Попробуйте Shifokor за 3 минуты",
    dm_p: "Регистрация не нужна. Есть готовые аккаунты пациента, врача и клиники: выберите один и переключайтесь панелью внизу в любой момент. Всё хранится только в этом браузере.",
    dm_roles: { patient: "Пациент", doctor: "Врач", clinic: "Клиника" },
    dm_role_p: {
      patient: "Малика: пишет Shifo_AI, отправляет заявку врачу, видит заключение в медкарте, записывается в клинику.",
      doctor: "Д-р Дилноза Каримова, педиатр: принимает новую заявку, общается в чате или по видео, пишет заключение, подтверждает записи в свой кабинет.",
      clinic: "Клиника «Фергана Шифо»: подтверждает запрос на приём и ставит час, видит общее расписание и своих врачей."
    },
    dm_enter: function (r) { return "Войти как " + r.toLowerCase(); },
    dm_steps_h: "Рекомендуемый путь (≈3 минуты)",
    dm_steps: [
      "<b>Пациент</b>: напишите <b>Shifo_AI</b> (кнопка справа внизу), например «у ребёнка 4 лет 2 дня температура и кашель». Он задаст вопрос и покажет педиатров (это настоящий ИИ).",
      "<b>Пациент</b>: в «Кабинет → Мои заявки» откройте завершённую консультацию: заключение врача и чат. История хранится в «Медкарте».",
      "Переключитесь на <b>врача</b>: примите заявку в «Новые заявки», ответьте и завершите консультацию с заключением. Видеозвонок можно проверить в двух окнах.",
      "<b>Пациент</b>: на странице врача «Записаться» — выберите день и удобный час (частный кабинет врача или клиника).",
      "Переключитесь на <b>клинику</b>: в «Запросы на приём» подтвердите и поставьте час; запись видна в «Общем расписании». Пациент увидит подтверждение."
    ],
    dm_note_h: "О тестовом режиме",
    dm_note_p: "В этом режиме аккаунты и заявки хранятся только в вашем браузере, настоящим пациентам и врачам ничего не отправляется. Shifo_AI отвечает с настоящего сервера. Чтобы проверить настоящий режим, выйдите и зарегистрируйтесь обычным способом.",
    dm_bar: "Тестовый режим", dm_help: "Инструкция", dm_exit: "Выйти", dm_exit_long: "Выйти из тестового режима", dm_as: function (r) { return "Сейчас: " + r; }
  });

  add("en", {
    dm_nav: "Try it", dm_eyebrow: "For judges and visitors", dm_h: "Try Shifokor in 3 minutes",
    dm_p: "No sign-up needed. A patient, a doctor and a clinic account are ready: pick one, then switch any time from the bar at the bottom. Everything stays in this browser only.",
    dm_roles: { patient: "Patient", doctor: "Doctor", clinic: "Clinic" },
    dm_role_p: {
      patient: "Malika: asks Shifo_AI, sends a request to a doctor, reads the doctor’s conclusion in her record, books a clinic visit.",
      doctor: "Dr Dilnoza Karimova, paediatrician: accepts a new request, talks by chat or video, writes a conclusion, confirms visits at her office.",
      clinic: "Fergana Shifo clinic: confirms a visit request and sets the hour, sees the shared calendar and its doctors."
    },
    dm_enter: function (r) { return "Enter as " + r.toLowerCase(); },
    dm_steps_h: "Suggested path (≈3 minutes)",
    dm_steps: [
      "<b>Patient</b>: write to <b>Shifo_AI</b> (bottom right), e.g. “my 4-year-old has had a fever and cough for 2 days”. It asks one question and shows paediatricians (this part is the real AI).",
      "<b>Patient</b>: in “Account → My requests” open the finished consultation: the doctor’s conclusion and the chat. The history stays in “My record”.",
      "Switch to the <b>doctor</b>: accept the request under “New requests”, reply, then finish it with a conclusion. A video call can be tried in two windows.",
      "<b>Patient</b>: on the doctor’s page press “Book a visit” and pick a day and a preferred hour (the doctor’s own office or a clinic).",
      "Switch to the <b>clinic</b>: confirm the request in “Visit requests” and set the hour; it shows in the shared calendar. The patient sees the confirmation."
    ],
    dm_note_h: "About the sandbox",
    dm_note_p: "Here accounts and requests are kept only in your browser; nothing is sent to real patients or doctors. Shifo_AI answers from the real server. To try the real site, leave the sandbox and register as usual.",
    dm_bar: "Sandbox", dm_help: "Guide", dm_exit: "Leave", dm_exit_long: "Leave the sandbox", dm_as: function (r) { return "Now: " + r; }
  });
})(window.SHIFOKOR_T);
