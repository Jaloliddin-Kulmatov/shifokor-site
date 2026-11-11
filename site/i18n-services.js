/* Copy for the home page's services grid and the "Xizmatlar" page (November 2026): the site's promise is that an
   ordinary person gets the best doctors and the best services. Each service links to real content on the site. */
(function (T) {
  var add = function (lang, o) { Object.keys(o).forEach(function (k) { T[lang][k] = o[k]; }); };

  add("uz", {
    nv_services: "Xizmatlar", nav_cab: "Kabinet", cs_more_h: "Qo‘shimcha ma’lumot (telefon, manzil, dorilar)",
    adm_exp: "Tajriba", adm_edu: "Ta’lim", adm_bio: "O‘zi haqida", adm_addr: "Manzil", adm_hours: "Ish vaqti", adm_about: "Klinika haqida",
    hf_h1: "Yaxshi shifokor — uydan chiqmasdan",
    hero_tag: "Narxi oldindan ma’lum",
    hf_sub: "Shifokorni tanlang va chat yoki video orqali maslahat oling.", hf_more: "Ko‘proq filtrlar", ds_name_ph: "masalan: isitma, tish og‘rig‘i",
    sv_h: "Tibbiy xizmatlar", sv_p: "Kerakli xizmatni tanlang. Narxi oldindan ko‘rinadi.",
    sv_all: "Barcha xizmatlar va narxlar", sv_more: "Yana xizmatlar", sv_from: function (p) { return p + " dan"; }, sv_ask: "Narxi so‘ralganda",
    sv_page_h: "Oddiy odamga eng zo‘r shifokor va eng zo‘r xizmatlar", sv_page_p: "Har bir xizmat uchun tekshirilgan shifokor, oldindan ma’lum narx va uydan turib maslahat. Yuzma-yuz ko‘rik kerak bo‘lsa, klinikaga yozilasiz.",
    sv_spec_h: "Mutaxassislik bo‘yicha shifokor kerakmi?", sv_how_h: "Qanday ishlaydi",
    img_how: "Shifokor telefon orqali bemorga javob yozmoqda",
    sv_items: {
      online: ["Onlayn maslahat", "Shifokor bilan chat yoki video orqali gaplashing. Rasm yuborish mumkin.", "Maslahat so‘rash", "Shifokor noutbuk orqali bemor bilan video qo‘ng‘iroqda"],
      results: ["Tahlil natijalarini tushuntirish", "Qon tahlili, UZI, EKG yoki MRT natijasini shifokor oddiy tilda tushuntiradi.", "Natijani ko‘rsatish", "Shifokor ish stolida hujjatlarni ko‘rib chiqmoqda"],
      pediatrics: ["Bolalar shifokori", "Isitma, yo‘tal, ovqatlanish va emlash bo‘yicha pediatr maslahati.", "Pediatrga yozilish", "Pediatr chaqaloqni onasi bilan ko‘rmoqda"],
      pregnancy: ["Homiladorlik kuzatuvi", "Ginekolog bilan oylik kuzatuv, UZI natijalari va savollaringiz.", "Boshlash", "Shifokor homilador ayol bilan suhbatlashmoqda"],
      chronic: ["Surunkali kasalliklar nazorati", "Qand, qon bosimi, yurak va qalqonsimon bez: dori va tahlillarni muntazam ko‘rib borish.", "Shifokor topish", "Shifokor keksa bemorni uyida ko‘rmoqda"],
      meds: ["Dorilarni ko‘rib chiqish", "Qaysi dorini qanday ichish, nima bilan birga bo‘lmaydi — shifokor tekshirib beradi.", "So‘rash", "Shifokor telefonda bemorga javob bermoqda"],
      mental: ["Ruhiy salomatlik", "Stress, xavotir, uyqu va kayfiyat bo‘yicha psixolog bilan maxfiy suhbat.", "Suhbatga yozilish", "Psixolog mijoz bilan suhbatlashmoqda"],
      clinic: ["Klinikaga yozilish", "Yuzma-yuz ko‘rik kerak bo‘lsa: viloyatingizdagi klinikalar, manzili va ish vaqti.", "Klinikalarni ko‘rish", "Ayol telefon orqali klinikaga yozilmoqda"]
    }
  });

  add("ru", {
    nv_services: "Услуги", nav_cab: "Кабинет", cs_more_h: "Дополнительно (телефон, адрес, лекарства)",
    adm_exp: "Стаж", adm_edu: "Образование", adm_bio: "О себе", adm_addr: "Адрес", adm_hours: "Часы работы", adm_about: "О клинике",
    hf_h1: "Хороший врач — не выходя из дома",
    hero_tag: "Цена известна заранее",
    hf_sub: "Выберите врача и получите консультацию в чате или по видео.", hf_more: "Ещё фильтры", ds_name_ph: "например: температура, зубная боль",
    sv_h: "Медицинские услуги", sv_p: "Выберите услугу. Цена видна заранее.",
    sv_all: "Все услуги и цены", sv_more: "Ещё услуги", sv_from: function (p) { return "от " + p; }, sv_ask: "Цена по запросу",
    sv_page_h: "Лучшие врачи и лучшие услуги — для обычного человека", sv_page_p: "Для каждой услуги — проверенный врач, цена заранее и консультация из дома. Если нужен очный приём, вы записываетесь в клинику.",
    sv_spec_h: "Нужен врач по специальности?", sv_how_h: "Как это работает",
    img_how: "Врач отвечает пациенту по телефону",
    sv_items: {
      online: ["Онлайн-консультация", "Чат или видео с врачом. Можно отправить фото.", "Получить консультацию", "Врач на видеозвонке с пациентом через ноутбук"],
      results: ["Расшифровка анализов", "Врач простым языком объяснит результат анализа крови, УЗИ, ЭКГ или МРТ.", "Показать результат", "Врач за столом просматривает документы"],
      pediatrics: ["Детский врач", "Педиатр: температура, кашель, питание и прививки.", "К педиатру", "Педиатр осматривает младенца вместе с мамой"],
      pregnancy: ["Ведение беременности", "Ежемесячное наблюдение у гинеколога, результаты УЗИ и ваши вопросы.", "Начать", "Врач беседует с беременной женщиной"],
      chronic: ["Контроль хронических болезней", "Сахар, давление, сердце, щитовидка: регулярный разбор лекарств и анализов.", "Найти врача", "Врач навещает пожилого пациента дома"],
      meds: ["Проверка лекарств", "Как принимать, что нельзя сочетать — врач проверит ваши назначения.", "Спросить", "Врач отвечает пациенту по телефону"],
      mental: ["Психическое здоровье", "Стресс, тревога, сон и настроение: конфиденциальный разговор с психологом.", "Записаться", "Психолог беседует с клиентом"],
      clinic: ["Запись в клинику", "Если нужен очный приём: клиники вашей области, адреса и часы работы.", "Смотреть клиники", "Женщина записывается в клинику по телефону"]
    }
  });

  add("en", {
    nv_services: "Services", nav_cab: "Account", cs_more_h: "More details (phone, address, medicines)",
    adm_exp: "Experience", adm_edu: "Education", adm_bio: "About", adm_addr: "Address", adm_hours: "Hours", adm_about: "About the clinic",
    hf_h1: "A good doctor, without leaving home",
    hero_tag: "Price known up front",
    hf_sub: "Choose a doctor and get advice by chat or video.", hf_more: "More filters", ds_name_ph: "e.g. fever, toothache",
    sv_h: "Health services", sv_p: "Pick a service. You see the price first.",
    sv_all: "All services and prices", sv_more: "More services", sv_from: function (p) { return "from " + p; }, sv_ask: "Price on request",
    sv_page_h: "The best doctors and the best services, for ordinary people", sv_page_p: "Every service comes with a checked doctor, a price up front and advice from home. If you need to be seen in person, you book a clinic.",
    sv_spec_h: "Need a doctor by specialty?", sv_how_h: "How it works",
    img_how: "A doctor answering a patient on the phone",
    sv_items: {
      online: ["Online consultation", "Talk to a doctor by chat or video. You can send photos.", "Ask a doctor", "A doctor on a video call with a patient on a laptop"],
      results: ["Explain my test results", "A doctor explains your blood test, ultrasound, ECG or MRI in plain words.", "Show a result", "A doctor at a desk looking through documents"],
      pediatrics: ["Children's doctor", "A paediatrician for fever, cough, feeding and vaccinations.", "See a paediatrician", "A paediatrician seeing a baby with its mother"],
      pregnancy: ["Pregnancy care", "Monthly check-ins with a gynaecologist, ultrasound results and your questions.", "Start", "A doctor talking with a pregnant woman"],
      chronic: ["Long-term condition care", "Diabetes, blood pressure, heart and thyroid: regular reviews of medicines and tests.", "Find a doctor", "A doctor visiting an older patient at home"],
      meds: ["Medicine review", "How to take each medicine and what not to combine, checked by a doctor.", "Ask", "A doctor answering a patient on the phone"],
      mental: ["Mental health", "Stress, anxiety, sleep and mood: a private talk with a psychologist.", "Book a talk", "A psychologist talking with a client"],
      clinic: ["Visit a clinic", "When you need to be seen in person: clinics in your region, addresses and hours.", "See clinics", "A woman booking a clinic by phone"]
    }
  });
})(window.SHIFOKOR_T);
