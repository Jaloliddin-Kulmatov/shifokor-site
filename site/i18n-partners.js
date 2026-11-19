/* Words for the partnerships page (#/partners), the admin's list of partnership requests, and the Shifo_AI demo in the hero. */
(function (T) {
  var add = function (lang, o) { Object.keys(o).forEach(function (k) { T[lang][k] = o[k]; }); };

  add("uz", {
    pt_nav: "Hamkorlik", pt_eyebrow: "Hamkorlik", pt_h: "Shifokor bilan birga ishlang",
    pt_p: "Klinikalar, shifokorlar, dorixonalar, laboratoriyalar va tashkilotlar uchun: bemorlarga yaqinroq bo‘ling, texnik qismini biz olamiz.",
    pt_soon: "tez orada",
    pt_cards: [
      ["clinic", "hosp", "Klinikalar", "Onlayn yozilish, umumiy kalendar, shifokorlaringiz profillari va filiallar. Qabul so‘rovlari bitta panelda, bemorga Telegram’da xabar boradi.", ""],
      ["doctor", "user", "Shifokorlar", "Bo‘sh vaqtingizda onlayn maslahat: narxni o‘zingiz belgilaysiz, ish soatlaringizni kiritasiz, daromad va o‘tkazmalar panelda.", ""],
      ["pharmacy", "flask", "Dorixonalar", "Shifokor yozgan dori ro‘yxati bo‘yicha uyga yetkazib berish so‘rovlari to‘g‘ridan-to‘g‘ri sizga keladi.", ""],
      ["lab", "file", "Laboratoriyalar", "Shifokor tahlilga yo‘llaydi, bemor sizni tanlaydi, natija uning tibbiy kartasiga tushadi.", "soon"],
      ["insurance", "shield", "Sug‘urta va ish beruvchilar", "Xodimlar va sug‘urtalanganlar uchun onlayn maslahat paketlari va hisobot.", "soon"],
      ["gov", "heart", "Davlat tashkilotlari va NNT", "Perinatal markazlar bilan «Onalar uchun» pilot: qishloqdagi homilador ayollarni haftama-hafta kuzatish.", ""]
    ],
    pt_how_h: "Qanday boshlanadi", pt_how: [["So‘rov yuborasiz", "Pastdagi shaklni to‘ldiring — 1 daqiqa."], ["Bog‘lanamiz", "1–2 ish kuni ichida qo‘ng‘iroq qilamiz yoki yozamiz."], ["Sozlaymiz", "Hujjatlarni tekshiramiz, profil va narxlarni birga kiritamiz."], ["Ishga tushadi", "Bemorlar sizni saytda va Telegram botda topadi."]],
    pt_nums: [["davlat shifoxonasi xaritada", 1554], ["viloyat", 14], ["til: o‘zbek, rus, ingliz", 3], ["mutaxassislik", 14]],
    pt_form_h: "Hamkorlik so‘rovi", pt_form_p: "Ma’lumotlaringiz faqat siz bilan bog‘lanish uchun ishlatiladi.",
    pt_kind: "Siz kimsiz?", pt_kinds: { clinic: "Klinika", doctor: "Shifokor", pharmacy: "Dorixona", lab: "Laboratoriya", insurance: "Sug‘urta kompaniyasi", employer: "Ish beruvchi", gov: "Davlat tashkiloti / NNT", other: "Boshqa" },
    pt_name: "Ismingiz", pt_org: "Tashkilot nomi", pt_phone: "Telefon", pt_email: "Email", pt_city: "Shahar yoki tuman", pt_note: "Qisqacha: nimani birga qilmoqchisiz?", pt_opt: "ixtiyoriy",
    pt_send: "So‘rov yuborish", pt_need: "Ism va telefon yoki emailni yozing.", pt_err_email: "Email noto‘g‘ri yozilgan.", pt_wait: "Juda ko‘p so‘rov. Birozdan keyin urinib ko‘ring.",
    pt_ok_h: "So‘rovingiz yuborildi", pt_ok_p: "1–2 ish kuni ichida siz bilan bog‘lanamiz. Rahmat!", pt_again: "Yana bitta so‘rov",
    pt_demo: "Sinab ko‘rish rejimi: so‘rov jamoaga yuborilmadi.",
    st_leads: "Hamkorlik so‘rovlari", st_leads_none: "Hali so‘rov yo‘q.",
    aid: [["2 kundan beri boshim og‘riyapti", "Nevrolog yoki terapevt kerak. Bo‘sh shifokorlar:", "Nevrolog"], ["Bolamning isitmasi bor, 38.5", "Pediatrga murojaat qiling. Hozir onlayn:", "Pediatr"], ["Tishim og‘riyapti, yuzim shishdi", "Stomatologga boring. Yaqin klinikalar:", "Stomatolog"]],
    aid_typing: "Shifo_AI yozmoqda",
    tm_nav: "Jamoa", tm_h: "Jamoa", tm_p: "Shifokor’ni UM_Wolves jamoasi qilmoqda — UzHack 2026, «Smart Healthcare» yo‘nalishi.",
    tm: [["Jaloliddin Qulmatov", "Asoschi · web dasturchi va AI muhandis", "icom.ai.kr va Storyling asoschisi"], ["Jamshid Rabbimov", "DevOps va backend muhandis", "UNINETWORKS.uz jamoa rahbari"], ["Sardor Talatov", "Loyiha menejeri va backend dasturchi", ""]],
    tm_join: "Biz bilan ishlashni xohlaysizmi?"
  });

  add("ru", {
    pt_nav: "Партнёрство", pt_eyebrow: "Партнёрство", pt_h: "Работайте вместе с Shifokor",
    pt_p: "Для клиник, врачей, аптек, лабораторий и организаций: будьте ближе к пациентам, техническую часть мы берём на себя.",
    pt_soon: "скоро",
    pt_cards: [
      ["clinic", "hosp", "Клиники", "Онлайн-запись, общий календарь, профили ваших врачей и филиалы. Запросы на приём в одной панели, пациент получает уведомление в Telegram.", ""],
      ["doctor", "user", "Врачи", "Онлайн-консультации в свободное время: цену назначаете сами, указываете часы работы, доход и выплаты — в панели.", ""],
      ["pharmacy", "flask", "Аптеки", "Запросы на доставку лекарств по списку врача приходят прямо к вам.", ""],
      ["lab", "file", "Лаборатории", "Врач направляет на анализы, пациент выбирает вас, результат попадает в его медкарту.", "soon"],
      ["insurance", "shield", "Страховые и работодатели", "Пакеты онлайн-консультаций и отчёты для сотрудников и застрахованных.", "soon"],
      ["gov", "heart", "Госорганизации и НКО", "Пилот «Для мам» с перинатальными центрами: еженедельное наблюдение беременных в сёлах.", ""]
    ],
    pt_how_h: "Как начать", pt_how: [["Отправляете заявку", "Заполните форму ниже — 1 минута."], ["Связываемся", "Позвоним или напишем в течение 1–2 рабочих дней."], ["Настраиваем", "Проверяем документы, вместе заполняем профиль и цены."], ["Запуск", "Пациенты находят вас на сайте и в Telegram-боте."]],
    pt_nums: [["госучреждений на карте", 1554], ["областей", 14], ["языка: узбекский, русский, английский", 3], ["специальностей", 14]],
    pt_form_h: "Заявка на партнёрство", pt_form_p: "Ваши данные используются только чтобы связаться с вами.",
    pt_kind: "Кто вы?", pt_kinds: { clinic: "Клиника", doctor: "Врач", pharmacy: "Аптека", lab: "Лаборатория", insurance: "Страховая компания", employer: "Работодатель", gov: "Госорганизация / НКО", other: "Другое" },
    pt_name: "Ваше имя", pt_org: "Название организации", pt_phone: "Телефон", pt_email: "Email", pt_city: "Город или район", pt_note: "Коротко: что хотите делать вместе?", pt_opt: "необязательно",
    pt_send: "Отправить заявку", pt_need: "Укажите имя и телефон или email.", pt_err_email: "Email указан неверно.", pt_wait: "Слишком много заявок. Попробуйте чуть позже.",
    pt_ok_h: "Заявка отправлена", pt_ok_p: "Свяжемся с вами в течение 1–2 рабочих дней. Спасибо!", pt_again: "Ещё одна заявка",
    pt_demo: "Режим «Попробовать»: заявка не отправлена команде.",
    st_leads: "Заявки на партнёрство", st_leads_none: "Заявок пока нет.",
    aid: [["Второй день болит голова", "Нужен невролог или терапевт. Свободные врачи:", "Невролог"], ["У ребёнка температура 38.5", "Обратитесь к педиатру. Сейчас онлайн:", "Педиатр"], ["Болит зуб, опухла щека", "Вам к стоматологу. Ближайшие клиники:", "Стоматолог"]],
    aid_typing: "Shifo_AI печатает",
    tm_nav: "Команда", tm_h: "Команда", tm_p: "Shifokor делает команда UM_Wolves — UzHack 2026, направление «Smart Healthcare».",
    tm: [["Жалолиддин Кулматов", "Основатель · веб-разработчик и AI-инженер", "основатель icom.ai.kr и Storyling"], ["Жамшид Раббимов", "DevOps и backend-инженер", "тимлид UNINETWORKS.uz"], ["Сардор Талатов", "Менеджер проекта и backend-разработчик", ""]],
    tm_join: "Хотите работать с нами?"
  });

  add("en", {
    pt_nav: "Partnerships", pt_eyebrow: "Partnerships", pt_h: "Work with Shifokor",
    pt_p: "For clinics, doctors, pharmacies, laboratories and organisations: get closer to patients, and we handle the technical side.",
    pt_soon: "soon",
    pt_cards: [
      ["clinic", "hosp", "Clinics", "Online booking, a shared calendar, your doctors' profiles and branches. Visit requests in one panel; patients are notified on Telegram.", ""],
      ["doctor", "user", "Doctors", "Online consultations in your free time: you set the price and your hours; earnings and payouts are in your panel.", ""],
      ["pharmacy", "flask", "Pharmacies", "Delivery requests for the medicines a doctor listed come straight to you.", ""],
      ["lab", "file", "Laboratories", "The doctor orders tests, the patient picks you, and the result lands in their health record.", "soon"],
      ["insurance", "shield", "Insurers and employers", "Online consultation packages and reports for employees and policyholders.", "soon"],
      ["gov", "heart", "Government and NGOs", "The “For mothers” pilot with perinatal centres: weekly follow-up of pregnant women in villages.", ""]
    ],
    pt_how_h: "How it starts", pt_how: [["You send a request", "Fill in the form below — 1 minute."], ["We get in touch", "We call or write within 1–2 working days."], ["We set it up", "We check documents and fill in your profile and prices together."], ["You go live", "Patients find you on the website and in the Telegram bot."]],
    pt_nums: [["state facilities on the map", 1554], ["regions", 14], ["languages: Uzbek, Russian, English", 3], ["specialties", 14]],
    pt_form_h: "Partnership request", pt_form_p: "Your details are used only to get in touch with you.",
    pt_kind: "Who are you?", pt_kinds: { clinic: "Clinic", doctor: "Doctor", pharmacy: "Pharmacy", lab: "Laboratory", insurance: "Insurance company", employer: "Employer", gov: "Government body / NGO", other: "Other" },
    pt_name: "Your name", pt_org: "Organisation", pt_phone: "Phone", pt_email: "Email", pt_city: "City or district", pt_note: "In short: what would you like to do together?", pt_opt: "optional",
    pt_send: "Send request", pt_need: "Please give your name and a phone number or email.", pt_err_email: "The email doesn't look right.", pt_wait: "Too many requests. Please try again a little later.",
    pt_ok_h: "Request sent", pt_ok_p: "We'll get in touch within 1–2 working days. Thank you!", pt_again: "Send another",
    pt_demo: "Sandbox mode: the request wasn't sent to the team.",
    st_leads: "Partnership requests", st_leads_none: "No requests yet.",
    aid: [["My head has hurt for 2 days", "A neurologist or internist can help. Free doctors:", "Neurologist"], ["My child has a fever, 38.5", "See a pediatrician. Online now:", "Pediatrician"], ["Toothache and a swollen cheek", "You need a dentist. Nearby clinics:", "Dentist"]],
    aid_typing: "Shifo_AI is typing",
    tm_nav: "Team", tm_h: "Team", tm_p: "Shifokor is built by the UM_Wolves team — UzHack 2026, Smart Healthcare track.",
    tm: [["Jaloliddin Kulmatov", "Founder · web developer and AI engineer", "founder of icom.ai.kr and Storyling"], ["Jamshid Rabbimov", "DevOps and backend engineer", "Team lead at UNINETWORKS.uz"], ["Sardor Talatov", "Project manager and backend developer", ""]],
    tm_join: "Want to work with us?"
  });
})(window.SHIFOKOR_T);
