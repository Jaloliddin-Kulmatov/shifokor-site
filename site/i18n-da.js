/* Copy for the phone pictures, the Doctor Anywhere-style home sections and the doctor search. */
(function (T) {
  var add = function (lang, o) { Object.keys(o).forEach(function (k) { T[lang][k] = o[k]; }); };

  add("uz", {
    ph_steps: [["1-qadam", "Shifokorni tanlang"], ["2-qadam", "Muammoni yozing"], ["3-qadam", "Video orqali gaplashing"]],
    ph_search: "Shifokor yoki mutaxassislik", ph_online: "onlayn", ph_type: "Xabar yozing…",
    ph_pt: "Bolamning isitmasi 38,5. Toshma ham chiqdi, rasmini yubordim.",
    ph_doc: "Rasmni ko‘rdim. Ko‘proq suyuqlik bering. Isitma 3 kundan oshsa, yuzma-yuz ko‘rikka keling.",
    ph_hello: "Assalomu alaykum!", ph_tiles: ["Hozir shifokor", "Shifokorlar", "Narxlar", "Onalar uchun"], ph_spec: "Mutaxassis",
    vc_h: "O‘zbekiston bo‘ylab onlayn shifokor maslahati",
    vc_p: "Shifokor bilan matnli xabar, audio yoki video orqali gaplashing: rasm yuboring, tahlillaringizni ko‘rsating va kerak bo‘lsa qayerga borishni bilib oling. Barcha viloyatlardan:",
    vc_go: "Maslahat so‘rash",
    tc: [["Litsenziyasi tekshirilgan shifokorlar", "«Tekshirilgan» belgisi shifokorning litsenziyasi va telefoni Shifokor jamoasi tomonidan tekshirilganini bildiradi."], ["Yuzma-yuz ko‘rik kerak bo‘lsa, to‘lov yo‘q", "Holatingiz onlayn maslahatga mos kelmasa, shifokor pul olmaydi va qayerga borishni aytadi."], ["Ma’lumotlaringiz begonalarga ko‘rinmaydi", "Shikoyatingiz va rasmlaringizni faqat siz va shifokorlar ko‘radi. Qo‘ng‘iroqlar yozib olinmaydi."]],
    how_use_h: "Qanday foydalaniladi",
    sl_h: "Onlayn maslahat qachon yordam beradi?", sl_prev: "Oldingi", sl_next: "Keyingi",
    sl_em: "Shoshilinch holatda (ko‘krakda og‘riq, nafas qisishi, hushdan ketish, o‘ziga zarar yetkazish fikri) maslahatni kutmang, darhol 103 ga qo‘ng‘iroq qiling.",
    sl: [
      ["Bolalar uchun", "Bolangiz kasalmi? Pediatr bilan uydan gaplashing", "Kasal bolani shaharga olib borish shart emas: avval pediatrga yozing, rasm yuboring yoki video orqali ko‘rsating.", ["Isitma, yo‘tal, tumov", "Toshma va allergiya", "Ovqatlanish va o‘sish", "Emlash bo‘yicha savollar"], "Pediatrlar", "Shifokor chaqaloqni ko‘rmoqda, yonida onasi"],
      ["Keksalar uchun", "Ota-onangiz uydan chiqmasdan maslahat olsin", "Keksa odamga uzoq yo‘l va navbat og‘ir. Farzandlari ham qo‘ng‘iroqqa qo‘shilib, shifokorni birga tinglashi mumkin.", ["Qon bosimi va qand nazorati", "Dorilarni to‘g‘ri ichish", "Tahlil natijalarini tushuntirish", "Bo‘g‘im va bel og‘rig‘i"], "Terapevtlar", "Shifokor ayol keksa bemor bilan uyda gaplashmoqda"],
      ["Homilador ayollar uchun", "Homiladorlik va tug‘ruqdan keyingi davr", "Ayol shifokorni o‘zingiz tanlaysiz. Har hafta holatingizni so‘raymiz, xavfli belgi bo‘lsa shifokoringiz va oilangiz darhol biladi.", ["Ko‘riklar jadvali va eslatmalar", "Tahlil va UZI natijalari", "Ko‘ngil aynishi, shish, bosim", "Emizish va chaqaloq parvarishi"], "Onalar uchun", "Shifokor homilador ayol bilan gaplashmoqda"],
      ["Ruhiy salomatlik", "Psixolog bilan maxfiy suhbat", "Stress va xavotir haqida gapirish oson emas. Uydan, xohlasangiz faqat ovozli qo‘ng‘iroq orqali, hech kim bilmasdan gaplashing.", ["Stress va xavotir", "Tushkunlik va charchash", "Uyqu buzilishi", "Oila va ishdagi qiyinchiliklar"], "Psixologlar", "Psixolog ayol mijoz bilan suhbatlashmoqda"]
    ],
    df_go: "Qidirish", df_clear: "Filtrlarni tozalash", df_none: "Bu filtrlar bo‘yicha shifokor topilmadi.", df_near: "Sizga yaqin variantlar", df_found: function (n) { return n + " ta shifokor topildi"; }
  });

  add("ru", {
    ph_steps: [["Шаг 1", "Выберите врача"], ["Шаг 2", "Опишите проблему"], ["Шаг 3", "Поговорите по видео"]],
    ph_search: "Врач или специальность", ph_online: "в сети", ph_type: "Напишите сообщение…",
    ph_pt: "У ребёнка температура 38,5 и сыпь, отправила фото.",
    ph_doc: "Фото посмотрела. Давайте больше пить. Если температура дольше 3 дней, приходите на очный осмотр.",
    ph_hello: "Здравствуйте!", ph_tiles: ["Врач сейчас", "Врачи", "Цены", "Для мам"], ph_spec: "Специалист",
    vc_h: "Онлайн-консультация врача по всему Узбекистану",
    vc_p: "Общайтесь с врачом в чате, по аудио или видео: отправьте фото, покажите анализы и узнайте, куда идти, если это нужно. Из любой области:",
    vc_go: "Запросить консультацию",
    tc: [["Врачи с проверенной лицензией", "Отметка «Проверено» значит, что команда Shifokor проверила лицензию и телефон врача."], ["Нужен очный осмотр — без оплаты", "Если ваш случай не подходит для онлайн-консультации, врач не берёт деньги и говорит, куда обратиться."], ["Ваши данные не видят посторонние", "Жалобу и фото видите только вы и врачи. Звонки не записываются."]],
    how_use_h: "Как пользоваться",
    sl_h: "Когда помогает онлайн-консультация?", sl_prev: "Назад", sl_next: "Вперёд",
    sl_em: "В срочных случаях (боль в груди, одышка, потеря сознания, мысли о причинении себе вреда) не ждите консультации, сразу звоните 103.",
    sl: [
      ["Для детей", "Ребёнок заболел? Поговорите с педиатром из дома", "Не нужно везти больного ребёнка в город: сначала напишите педиатру, отправьте фото или покажите по видео.", ["Температура, кашель, насморк", "Сыпь и аллергия", "Питание и рост", "Вопросы о прививках"], "Педиатры", "Врач осматривает малыша, рядом мама"],
      ["Для пожилых", "Пусть родители получат совет, не выходя из дома", "Пожилым тяжело ехать далеко и стоять в очередях. Дети могут подключиться к звонку и слушать врача вместе.", ["Давление и сахар", "Как правильно пить лекарства", "Разбор анализов", "Боли в суставах и спине"], "Терапевты", "Врач разговаривает с пожилым пациентом дома"],
      ["Для беременных", "Беременность и время после родов", "Врача-женщину вы выбираете сами. Каждую неделю мы спрашиваем о самочувствии, а при опасном признаке врач и семья сразу узнают.", ["График осмотров и напоминания", "Анализы и УЗИ", "Тошнота, отёки, давление", "Грудное вскармливание и уход за малышом"], "Для мам", "Врач беседует с беременной женщиной"],
      ["Психическое здоровье", "Конфиденциальный разговор с психологом", "О стрессе и тревоге говорить нелегко. Поговорите из дома, если хотите — только голосом, без лишних глаз.", ["Стресс и тревога", "Подавленность и усталость", "Проблемы со сном", "Трудности в семье и на работе"], "Психологи", "Психолог беседует с клиенткой"]
    ],
    df_go: "Найти", df_clear: "Сбросить фильтры", df_none: "По этим фильтрам врачей не нашлось.", df_near: "Похожие варианты", df_found: function (n) { return "Найдено врачей: " + n; }
  });

  add("en", {
    ph_steps: [["Step 1", "Choose a doctor"], ["Step 2", "Describe the problem"], ["Step 3", "Talk by video"]],
    ph_search: "Doctor or specialty", ph_online: "online", ph_type: "Type a message…",
    ph_pt: "My child has a 38.5 fever and a rash, I sent a photo.",
    ph_doc: "I’ve seen the photo. Give plenty of fluids. If the fever lasts over 3 days, come in for a visit.",
    ph_hello: "Hello!", ph_tiles: ["Doctor now", "Doctors", "Prices", "For mothers"], ph_spec: "Specialist",
    vc_h: "See a doctor online, anywhere in Uzbekistan",
    vc_p: "Talk to a doctor by chat, audio or video: send a photo, show your test results and find out where to go if you need to. From every region:",
    vc_go: "Ask for a consultation",
    tc: [["Doctors with checked licences", "“Checked” means the Shifokor team has checked the doctor’s licence and phone number."], ["Need an in-person visit? No charge", "If your problem doesn’t suit an online consultation, the doctor takes no money and tells you where to go."], ["Strangers don’t see your data", "Only you and doctors see your complaint and photos. Calls aren’t recorded."]],
    how_use_h: "How to use it",
    sl_h: "When does an online consultation help?", sl_prev: "Previous", sl_next: "Next",
    sl_em: "In an emergency (chest pain, trouble breathing, fainting, thoughts of self-harm) don’t wait for a consultation, call 103 now.",
    sl: [
      ["For children", "Is your child ill? Talk to a paediatrician from home", "No need to take a sick child to the city: write to a paediatrician first, send a photo or show them on video.", ["Fever, cough, runny nose", "Rash and allergies", "Feeding and growth", "Questions about vaccines"], "Paediatricians", "A doctor examining a baby with the mother beside them"],
      ["For older people", "Let your parents get advice without leaving home", "Long trips and queues are hard for older people. Their children can join the call and listen to the doctor together.", ["Blood pressure and sugar", "Taking medicines correctly", "Explaining test results", "Joint and back pain"], "Therapists", "A doctor talking with an older patient at home"],
      ["For pregnant women", "Pregnancy and the weeks after birth", "You choose a woman doctor yourself. We ask how you are every week, and with a danger sign your doctor and family know at once.", ["Check-up schedule and reminders", "Tests and ultrasound results", "Nausea, swelling, blood pressure", "Breastfeeding and baby care"], "For mothers", "A doctor talking with a pregnant woman"],
      ["Mental health", "A private talk with a psychologist", "Talking about stress and worry isn’t easy. Talk from home, by voice only if you prefer, without anyone knowing.", ["Stress and anxiety", "Low mood and tiredness", "Sleep problems", "Trouble at home or at work"], "Psychologists", "A psychologist talking with a client"]
    ],
    df_go: "Search", df_clear: "Clear filters", df_none: "No doctors match these filters.", df_near: "Closest matches", df_found: function (n) { return n + (n === 1 ? " doctor found" : " doctors found"); }
  });
  T.uz.docsp.psych = "Psixolog"; T.ru.docsp.psych = "Психолог"; T.en.docsp.psych = "Psychologist";
})(window.SHIFOKOR_T);
