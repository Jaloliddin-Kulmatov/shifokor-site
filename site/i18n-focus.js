/* Copy for the doctor-first focus: finding a good doctor, online consultation, prices and services.
   State polyclinic queues stay with DMED and my.gov.uz; Shifokor points people there. */
(function (T) {
  var add = function (lang, o) { Object.keys(o).forEach(function (k) { T[lang][k] = o[k]; }); };

  add("uz", {
    foot_tag: "Tekshirilgan shifokorlar, oldindan ma’lum narxlar va onlayn maslahat.",
    nav_prices: "Narxlar",
    hf_h1: "Yaxshi shifokorni toping va onlayn maslahat oling",
    hf_sub: "Tekshirilgan shifokorlar, oldindan ma’lum narxlar va uydan turib maslahat. Qishloq va chekka hududlarda yashovchilar uchun qulay.",
    hf_spec: "Qaysi shifokor kerak?", hf_go: "Shifokor topish", hf_consult: "Onlayn maslahat so‘rash", hf_prices: "Xizmat narxlarini solishtirish",
    hf_chip1: ["Tekshirilgan shifokorlar", "Litsenziya tekshiriladi"], hf_chip3: "Narx oldindan ma’lum",
    hf_acts: [["Shifokor topish", "Mutaxassislik, tajriba va tekshiruv bo‘yicha"], ["Onlayn maslahat", "Ariza to‘ldiring, shifokor yozib yoki qo‘ng‘iroq qilib javob beradi"], ["Narxlarni solishtirish", "Xizmat narxi va kim taklif qilishi"], ["Yaqin shifoxona", "Maslahatdan keyin qayerga borish kerak"]],
    why_h: "Nega Shifokor", why: [["Tekshirilgan", "Shifokor va klinikalar litsenziyasi va rasmiy telefoni orqali tekshiriladi."], ["Narx oldindan", "Maslahat va xizmat narxlari profilda yoziladi, qachon yangilangani ko‘rinadi."], ["Uydan turib", "Shaharga borishdan oldin mutaxassisdan matnli xabar yoki qo‘ng‘iroq orqali so‘rang."]],
    how_f: [["Toping", "Kerakli mutaxassisni tanlang: tajribasi, narxi va tekshiruvi ko‘rinadi."], ["So‘rang", "Qisqa ariza to‘ldiring: matnli xabar, audio yoki video."], ["Davom eting", "Shifokor maslahat beradi va kerak bo‘lsa qayerga borishni aytadi."]],
    new_docs_h: "Shifokorlar", new_docs_all: "Barcha shifokorlar", new_docs_none: "Shifokorlar hozir qo‘shilmoqda. Shifokormisiz? Birinchilardan bo‘ling.",
    regions_doc_h: "Viloyatingizdagi shifokorlar",
    dmed_h: "Davlat poliklinikasiga navbat kerakmi?", dmed_p: "Oilaviy shifokorga navbat DMED ilovasi, my.gov.uz yoki poliklinika registraturasi orqali olinadi. Shifokor sizga to‘g‘ri mutaxassisni topish va onlayn maslahat olishda yordam beradi.", dmed_go: "my.gov.uz",
    faq_f: [["Shifokor DMED o‘rnini bosadimi?", "Yo‘q. DMED davlat poliklinikasidagi navbat, tibbiy karta va retseptlar uchun. Shifokor kerakli mutaxassisni tanlash, narxini oldindan bilish va onlayn maslahat olish uchun."], ["Shifokorlar tekshiriladimi?", "Ha. Shifokor jamoasi litsenziya raqamini va ish joyini tekshiradi. Tekshirilganlar profilida «Tekshirilgan» belgisi turadi."], ["Onlayn maslahat qancha turadi?", "Har bir shifokor o‘z narxini profilida yozadi. Ba’zilari bepul maslahat beradi. Hozircha to‘lov shifokor bilan to‘g‘ridan-to‘g‘ri kelishiladi."], ["Shoshilinch holatda nima qilish kerak?", "103 ga qo‘ng‘iroq qiling. Onlayn maslahat shoshilinch yordam o‘rnini bosmaydi."]],
    // doctor profile: consultation prices
    sec_cprice: "Onlayn maslahat narxi", cp_hint: "So‘mda. Bepul bo‘lsa 0 yozing, bu turini taklif qilmasangiz bo‘sh qoldiring.", cp_types: { text: "Matnli xabar", audio: "Audio qo‘ng‘iroq", video: "Video qo‘ng‘iroq" },
    reply_l: "Odatda qancha vaqtda javob berasiz?", replies: { "": "—", "1": "1 soat ichida", "3": "3 soat ichida", "24": "1 kun ichida", "48": "2 kun ichida" },
    ohours_l: "Onlayn ish vaqti", ohours_ph: "Masalan: Du–Ju 18:00–21:00",
    cp_h: "Onlayn maslahat", cp_from: function (p) { return p + "dan"; }, free_c: "Bepul", reply_txt: function (h) { return h === "24" ? "Odatda 1 kun ichida javob beradi" : h === "48" ? "Odatda 2 kun ichida javob beradi" : "Odatda " + h + " soat ichida javob beradi"; },
    cp_none: "Onlayn maslahat narxi hali yozilmagan.", cp_pay: "To‘lov hozircha shifokor bilan to‘g‘ridan-to‘g‘ri kelishiladi.", cp_price_note: function (n, p) { return n + ": " + p; }, cp_not_offered: "Bu shifokor bu turdagi maslahatni taklif qilmaydi.",
    // doctor search
    df_online: "Faqat onlayn maslahat", df_lang: "Til", df_any_lang: "Har qanday", df_sort: "Tartib", df_sorts: { best: "Tekshirilganlar avval", cheap: "Arzon maslahat", exp: "Tajriba" },
    doctors_h2: "Kerakli shifokorni toping", doctors_p2: "Mutaxassislik, til va narx bo‘yicha tanlang. «Tekshirilgan» belgisi litsenziya tekshirilganini bildiradi.",
    // prices page
    pr_h: "Xizmatlar va narxlar", pr_p: "Shifokor va klinikalar o‘zi yozgan narxlar. Har birida qachon yangilangani ko‘rsatilgan. Borishdan oldin narxni aniqlashtiring.",
    pr_q: "Xizmat", pr_q_ph: "Masalan: UZI, qon tahlili, EKG", pr_max: "Eng ko‘pi", pr_any: "Har qanday narx", pr_on: "Onlayn mumkin", pr_sort: "Tartib", pr_sorts: { cheap: "Arzonroq avval", fresh: "Yangilangan avval" },
    pr_go: "Qidirish", pr_quick: ["UZI", "Qon tahlili", "EKG", "Pediatr", "Ginekolog", "Stomatolog"],
    pr_none: "Bu so‘rov bo‘yicha narx topilmadi.", pr_empty: "Hali narxlar kiritilmagan. Shifokor yoki klinikamisiz? Profilingizga xizmat va narxlarni qo‘shing.", pr_add: "Narxlarimni qo‘shish",
    pr_by: "Kim", pr_upd: function (d) { return "Yangilangan: " + d; }, pr_consult: "Maslahat so‘rash", pr_n: function (n) { return n + " ta narx"; },
    pr_cs: function (k) { return "Onlayn maslahat (" + k + ")"; }, pr_ask: "Narxni so‘rang"
  });

  add("ru", {
    foot_tag: "Проверенные врачи, цены заранее и онлайн-консультация.",
    nav_prices: "Цены",
    hf_h1: "Найдите хорошего врача и получите онлайн-консультацию",
    hf_sub: "Проверенные врачи, заранее известные цены и консультация из дома. Удобно для жителей сёл и отдалённых районов.",
    hf_spec: "Какой врач нужен?", hf_go: "Найти врача", hf_consult: "Онлайн-консультация", hf_prices: "Сравнить цены на услуги",
    hf_chip1: ["Проверенные врачи", "Лицензия проверяется"], hf_chip3: "Цена известна заранее",
    hf_acts: [["Найти врача", "По специальности, опыту и проверке"], ["Онлайн-консультация", "Заполните заявку, врач ответит письменно или позвонит"], ["Сравнить цены", "Цена услуги и кто её оказывает"], ["Ближайшая больница", "Куда идти после консультации"]],
    why_h: "Почему Shifokor", why: [["Проверено", "Врачей и клиники проверяем по лицензии и официальному телефону."], ["Цена заранее", "Цены консультаций и услуг указаны в профиле с датой обновления."], ["Из дома", "Спросите специалиста письменно или по звонку, прежде чем ехать в город."]],
    how_f: [["Найдите", "Выберите специалиста: видны опыт, цена и проверка."], ["Спросите", "Заполните короткую заявку: текст, аудио или видео."], ["Дальше", "Врач даст совет и подскажет, куда обратиться, если нужно."]],
    new_docs_h: "Врачи", new_docs_all: "Все врачи", new_docs_none: "Врачи сейчас подключаются. Вы врач? Станьте одним из первых.",
    regions_doc_h: "Врачи вашего региона",
    dmed_h: "Нужна очередь в госполиклинику?", dmed_p: "Запись к семейному врачу — через приложение DMED, my.gov.uz или регистратуру поликлиники. Shifokor помогает найти нужного специалиста и получить онлайн-консультацию.", dmed_go: "my.gov.uz",
    faq_f: [["Shifokor заменяет DMED?", "Нет. DMED — для очереди в госполиклинику, медкарты и рецептов. Shifokor — чтобы выбрать нужного специалиста, заранее узнать цену и получить онлайн-консультацию."], ["Врачей проверяют?", "Да. Команда Shifokor проверяет номер лицензии и место работы. У проверенных в профиле стоит отметка «Проверено»."], ["Сколько стоит онлайн-консультация?", "Каждый врач указывает цену в профиле. Некоторые консультируют бесплатно. Пока оплата договаривается с врачом напрямую."], ["Что делать в экстренном случае?", "Звоните 103. Онлайн-консультация не заменяет скорую помощь."]],
    sec_cprice: "Цена онлайн-консультации", cp_hint: "В сумах. Бесплатно — укажите 0; если не предлагаете этот вид, оставьте пустым.", cp_types: { text: "Текстом", audio: "Аудиозвонок", video: "Видеозвонок" },
    reply_l: "Как быстро вы обычно отвечаете?", replies: { "": "—", "1": "В течение часа", "3": "В течение 3 часов", "24": "В течение дня", "48": "В течение 2 дней" },
    ohours_l: "Часы онлайн-приёма", ohours_ph: "Например: Пн–Пт 18:00–21:00",
    cp_h: "Онлайн-консультация", cp_from: function (p) { return "от " + p; }, free_c: "Бесплатно", reply_txt: function (h) { return h === "24" ? "Обычно отвечает в течение дня" : h === "48" ? "Обычно отвечает в течение 2 дней" : "Обычно отвечает в течение " + h + " ч"; },
    cp_none: "Цена онлайн-консультации пока не указана.", cp_pay: "Пока оплата договаривается с врачом напрямую.", cp_price_note: function (n, p) { return n + ": " + p; }, cp_not_offered: "Этот врач не предлагает такой вид консультации.",
    df_online: "Только онлайн-консультация", df_lang: "Язык", df_any_lang: "Любой", df_sort: "Порядок", df_sorts: { best: "Сначала проверенные", cheap: "Дешевле консультация", exp: "Опыт" },
    doctors_h2: "Найдите нужного врача", doctors_p2: "Выбирайте по специальности, языку и цене. Отметка «Проверено» значит, что лицензия проверена.",
    pr_h: "Услуги и цены", pr_p: "Цены, которые указали сами врачи и клиники, с датой обновления. Уточните цену перед визитом.",
    pr_q: "Услуга", pr_q_ph: "Например: УЗИ, анализ крови, ЭКГ", pr_max: "Не дороже", pr_any: "Любая цена", pr_on: "Можно онлайн", pr_sort: "Порядок", pr_sorts: { cheap: "Сначала дешевле", fresh: "Сначала обновлённые" },
    pr_go: "Искать", pr_quick: ["УЗИ", "Анализ крови", "ЭКГ", "Педиатр", "Гинеколог", "Стоматолог"],
    pr_none: "По этому запросу цен не найдено.", pr_empty: "Цен пока нет. Вы врач или клиника? Добавьте услуги и цены в профиль.", pr_add: "Добавить мои цены",
    pr_by: "Кто", pr_upd: function (d) { return "Обновлено: " + d; }, pr_consult: "Запросить консультацию", pr_n: function (n) { return "цен: " + n; },
    pr_cs: function (k) { return "Онлайн-консультация (" + k + ")"; }, pr_ask: "Цену уточните"
  });

  add("en", {
    foot_tag: "Checked doctors, prices up front and online consultation.",
    nav_prices: "Prices",
    hf_h1: "Find a good doctor and get advice online",
    hf_sub: "Checked doctors, prices you know in advance, and advice from home. Made for people in villages and remote areas.",
    hf_spec: "Which doctor do you need?", hf_go: "Find a doctor", hf_consult: "Ask a doctor online", hf_prices: "Compare service prices",
    hf_chip1: ["Checked doctors", "Licences are checked"], hf_chip3: "Prices up front",
    hf_acts: [["Find a doctor", "By specialty, experience and checks"], ["Online consultation", "Fill in an application; a doctor writes back or calls"], ["Compare prices", "What a service costs and who offers it"], ["Nearest hospital", "Where to go after the consultation"]],
    why_h: "Why Shifokor", why: [["Checked", "Doctors and clinics are checked by licence and official phone number."], ["Prices up front", "Consultation and service prices are on the profile, with the date they were updated."], ["From home", "Ask a specialist by text or call before travelling to the city."]],
    how_f: [["Find", "Pick the specialist you need: experience, price and checks are shown."], ["Ask", "Fill in a short application: text, audio or video."], ["Next steps", "The doctor advises you and says where to go if you need to."]],
    new_docs_h: "Doctors", new_docs_all: "All doctors", new_docs_none: "Doctors are joining now. Are you a doctor? Be one of the first.",
    regions_doc_h: "Doctors in your region",
    dmed_h: "Need a queue at a state polyclinic?", dmed_p: "Family-doctor visits are booked through the DMED app, my.gov.uz or the polyclinic’s front desk. Shifokor helps you find the right specialist and get advice online.", dmed_go: "my.gov.uz",
    faq_f: [["Does Shifokor replace DMED?", "No. DMED is for state polyclinic queues, medical records and prescriptions. Shifokor is for choosing the right specialist, knowing the price in advance and getting advice online."], ["Are doctors checked?", "Yes. The Shifokor team checks the licence number and workplace. Checked doctors show a “Checked” badge."], ["How much does an online consultation cost?", "Each doctor sets a price on their profile. Some give advice for free. For now, payment is agreed with the doctor directly."], ["What about emergencies?", "Call 103. An online consultation doesn’t replace emergency care."]],
    sec_cprice: "Online consultation price", cp_hint: "In soums. Enter 0 if free; leave empty if you don’t offer that kind.", cp_types: { text: "Text message", audio: "Audio call", video: "Video call" },
    reply_l: "How fast do you usually reply?", replies: { "": "—", "1": "Within 1 hour", "3": "Within 3 hours", "24": "Within a day", "48": "Within 2 days" },
    ohours_l: "Online hours", ohours_ph: "For example: Mon–Fri 18:00–21:00",
    cp_h: "Online consultation", cp_from: function (p) { return "from " + p; }, free_c: "Free", reply_txt: function (h) { return h === "24" ? "Usually replies within a day" : h === "48" ? "Usually replies within 2 days" : "Usually replies within " + h + (h === "1" ? " hour" : " hours"); },
    cp_none: "No online consultation price yet.", cp_pay: "For now, payment is agreed with the doctor directly.", cp_price_note: function (n, p) { return n + ": " + p; }, cp_not_offered: "This doctor doesn’t offer this kind of consultation.",
    df_online: "Online consultation only", df_lang: "Language", df_any_lang: "Any", df_sort: "Sort", df_sorts: { best: "Checked first", cheap: "Cheapest consultation", exp: "Experience" },
    doctors_h2: "Find the doctor you need", doctors_p2: "Choose by specialty, language and price. “Checked” means the licence has been checked.",
    pr_h: "Services and prices", pr_p: "Prices doctors and clinics entered themselves, each with the date it was updated. Confirm the price before you go.",
    pr_q: "Service", pr_q_ph: "For example: ultrasound, blood test, ECG", pr_max: "Up to", pr_any: "Any price", pr_on: "Available online", pr_sort: "Sort", pr_sorts: { cheap: "Cheapest first", fresh: "Recently updated" },
    pr_go: "Search", pr_quick: ["Ultrasound", "Blood test", "ECG", "Paediatrician", "Gynaecologist", "Dentist"],
    pr_none: "No prices found for this search.", pr_empty: "No prices yet. Are you a doctor or a clinic? Add your services and prices to your profile.", pr_add: "Add my prices",
    pr_by: "Who", pr_upd: function (d) { return "Updated " + d; }, pr_consult: "Ask for a consultation", pr_n: function (n) { return n + (n === 1 ? " price" : " prices"); },
    pr_cs: function (k) { return "Online consultation (" + k + ")"; }, pr_ask: "Ask for the price"
  });
})(window.SHIFOKOR_T);
