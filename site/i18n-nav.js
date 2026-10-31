/* Copy for the Doctor Anywhere-style menus, the online clinic page and the about, specialists, family health and wellness pages. */
(function (T) {
  var add = function (lang, o) { Object.keys(o).forEach(function (k) { T[lang][k] = o[k]; }); };

  add("uz", {
    hc_h: "Siz uchun tibbiy yordam", hc_names: { gp: "Oila shifokori", spec: "Mutaxassis", psych: "Ruhiy salomatlik", pediatrics: "Pediatriya" }, hc_from: function (p) { return p + "dan / maslahat"; }, hc_price_none: "Narx shifokorga qarab",
    nv_see: "Shifokorga murojaat", nv_well: "Salomatlik", nv_about: "Biz haqimizda",
    nv_clinic: "Onlayn klinika", nv_panel: "Shifokorlarimiz", nv_spec: "Mutaxassislar", nv_family: "Oila salomatligi",
    nv_mental: "Ruhiy salomatlik", nv_tips: "Foydali maslahatlar", nv_mission: "Missiyamiz", nv_network: "Tarmog‘imiz", nv_faq: "Savol-javoblar",
    cs_h_short: "Onlayn maslahat uchun ariza", ap_x: "Yopish",
    ap_to: function (n) { return n + " uchun ariza"; }, ap_spec: function (s) { return s + ": birinchi bo‘sh shifokor"; },
    ap_spec_note: "Arizangiz shu mutaxassislikdagi, hozir onlayn bo‘lgan shifokorga yuboriladi. Ma’lum shifokorni tanlamoqchi bo‘lsangiz, ro‘yxatdan tanlang.",
    ap_smp: "Siz namuna profilni tanladingiz. Arizangiz shu mutaxassislikdagi, hozir onlayn bo‘lgan haqiqiy shifokorga yuboriladi.",
    oc_page_h: "Shifokorni tanlang va shu yerning o‘zida ariza yuboring",
    oc_page_p: "Ro‘yxatdan shifokorni tanlang yoki hozir bo‘sh shifokorga yozing. Javob chat, SMS, audio yoki video orqali keladi.",
    oc_page_steps: ["Shifokorni tanlang", "Ariza yuboring", "Maslahat oling"],
    ab_h: "Har bir oilaga yaqin shifokor", ab_p: "Shifokor: O‘zbekistonning istalgan joyidan yaxshi shifokorni topish va undan uydan turib maslahat olish uchun.",
    ab_check_h: "Biz nimaga kafolat beramiz", ab_st: ["tibbiyot muassasasi xaritada", "viloyat", "tuman", "mutaxassislik"],
    ab_net_p: "Shifokorlar va xususiy klinikalar Shifokorga qo‘shilmoqda. Kerak bo‘lsa, yaqin shifoxona va poliklinikani xaritadan topasiz.",
    ab_clinic_join: "Klinikani qo‘shish",
    sp_h: "Mutaxassislar", sp_p: "Kerakli mutaxassisni tanlang: shu yerning o‘zida ariza yuborasiz yoki barcha shifokorlarni ko‘rasiz.",
    sp_desc: { gp: "Butun oila uchun birinchi maslahat", therapist: "Bosim, oshqozon, tahlillar", pediatrics: "Chaqaloq va bolalar salomatligi", gyn: "Ayollar salomatligi va homiladorlik", cardio: "Yurak va qon bosimi", neuro: "Bosh og‘rig‘i, bel, asab", surgery: "Operatsiyadan oldin va keyin", dental: "Tish va milk", ent: "Quloq, tomoq, burun", eye: "Ko‘z va ko‘rish", derm: "Teri, toshma, soch", uro: "Buyrak va siydik yo‘llari", endo: "Qandli diabet, qalqonsimon bez", psych: "Stress, xavotir, uyqu" },
    fam_h: "Oila salomatligi", fam_p: "Bolalar, keksalar, homilador ayollar va ruhiy salomatlik: har biri uchun mos shifokor.", fam_all: "Barcha shifokorlar",
    wl_h: "Foydali maslahatlar", wl_p: "Kundalik salomatlik uchun qisqa maslahatlar va qachon shifokorga murojaat qilish kerakligi.", wl_when: "Qachon shifokorga:",
    wl_note: "Bu maslahatlar umumiy ma’lumot, tashxis emas. Shoshilinch holatda 103 ga qo‘ng‘iroq qiling.",
    wl: [
      ["Qon bosimi", ["40 yoshdan oshgan bo‘lsangiz, bosimni muntazam o‘lchang", "Tuzni kamaytiring va har kuni kamida 30 daqiqa yuring", "Bosim dorisini o‘zingiz to‘xtatmang"], "bosim tez-tez 140/90 dan yuqori bo‘lsa yoki bosh og‘rig‘i va bosh aylanishi bo‘lsa.", "#/doctors?s=cardio", "Kardiologlar"],
      ["Qandli diabet", ["Ko‘p chanqash, tez-tez siyish va sababsiz ozish: qand tahlilini topshiring", "Diabet bo‘lsa, qandni muntazam o‘lchang", "Dorini va ovqatni bir vaqtda iching"], "qand tez-tez baland yoki past bo‘lsa, oyoqda yara bitmasa.", "#/doctors?s=endo", "Endokrinologlar"],
      ["Bolada isitma", ["Ko‘proq suyuqlik bering, yengil kiyintiring", "Isitma tushiruvchi dorini faqat yoshiga mos dozada bering", "Chaqaloqning harorati va ahvolini kuzating"], "3 oylikdan kichik chaqaloqda har qanday isitma bo‘lsa, isitma 3 kundan oshsa. Tutqanoq, nafas qisishi yoki bosganda yo‘qolmaydigan toshma bo‘lsa — darhol 103.", "#/doctors?s=pediatrics", "Pediatrlar"],
      ["Homiladorlik", ["Homiladorlikda kamida 8 marta ko‘rikdan o‘ting", "Temir va foliy kislotasini shifokor aytganidek iching", "Har kuni bola harakatini kuzating"], "qon ketishi, kuchli bosh og‘rig‘i, yuz yoki qo‘l shishi, bola harakati kamaysa yoki suv ketsa — darhol tug‘ruqxonaga.", "#/ona", "Onalar uchun"],
      ["Ruhiy salomatlik", ["Har kuni bir vaqtda uxlang va turing", "Har kuni ozgina bo‘lsa ham harakat qiling", "Yaqinlaringiz bilan dilingizni ochib gaplashing"], "tushkunlik yoki xavotir 2 haftadan oshsa. O‘zingizga zarar yetkazish fikri bo‘lsa — darhol 103.", "#/doctors?s=psych", "Psixologlar"],
      ["Sog‘lom turmush", ["Har kuni sabzavot va meva iste’mol qiling", "Chekmang, nos chekmang", "40 yoshdan keyin yiliga bir marta bosim, qand va xolesterinni tekshiring"], "yiliga bir marta oila shifokori ko‘rigiga boring.", "#/doctors?s=gp", "Oila shifokorlari"]
    ]
  });

  add("ru", {
    hc_h: "Медицинская помощь для вас", hc_names: { gp: "Семейный врач", spec: "Специалист", psych: "Психическое здоровье", pediatrics: "Педиатрия" }, hc_from: function (p) { return "от " + p + " / консультация"; }, hc_price_none: "Цена зависит от врача",
    nv_see: "К врачу", nv_well: "Здоровье", nv_about: "О нас",
    nv_clinic: "Онлайн-клиника", nv_panel: "Наши врачи", nv_spec: "Специалисты", nv_family: "Здоровье семьи",
    nv_mental: "Психическое здоровье", nv_tips: "Полезные советы", nv_mission: "Наша миссия", nv_network: "Наша сеть", nv_faq: "Вопросы и ответы",
    cs_h_short: "Заявка на онлайн-консультацию", ap_x: "Закрыть",
    ap_to: function (n) { return "Заявка: " + n; }, ap_spec: function (s) { return s + ": первый свободный врач"; },
    ap_spec_note: "Заявка уйдёт врачу этой специальности, который сейчас онлайн. Чтобы выбрать конкретного врача, выберите его в списке.",
    ap_smp: "Вы выбрали пример профиля. Заявка уйдёт настоящему врачу этой специальности, который сейчас онлайн.",
    oc_page_h: "Выберите врача и отправьте заявку прямо здесь",
    oc_page_p: "Выберите врача из списка или напишите свободному врачу прямо сейчас. Ответ придёт в чате, по SMS, аудио или видео.",
    oc_page_steps: ["Выберите врача", "Отправьте заявку", "Получите совет"],
    ab_h: "Врач рядом с каждой семьёй", ab_p: "Shifokor помогает найти хорошего врача из любой точки Узбекистана и получить его совет, не выходя из дома.",
    ab_check_h: "Что мы гарантируем", ab_st: ["медучреждений на карте", "областей", "районов", "специальностей"],
    ab_net_p: "К Shifokor присоединяются врачи и частные клиники. Если нужно, ближайшую больницу и поликлинику вы найдёте на карте.",
    ab_clinic_join: "Добавить клинику",
    sp_h: "Специалисты", sp_p: "Выберите нужного специалиста: отправьте заявку прямо здесь или посмотрите всех врачей.",
    sp_desc: { gp: "Первый совет для всей семьи", therapist: "Давление, желудок, анализы", pediatrics: "Здоровье малышей и детей", gyn: "Женское здоровье и беременность", cardio: "Сердце и давление", neuro: "Головная боль, спина, нервы", surgery: "До и после операции", dental: "Зубы и дёсны", ent: "Ухо, горло, нос", eye: "Глаза и зрение", derm: "Кожа, сыпь, волосы", uro: "Почки и мочевые пути", endo: "Диабет, щитовидная железа", psych: "Стресс, тревога, сон" },
    fam_h: "Здоровье семьи", fam_p: "Дети, пожилые, беременные и психическое здоровье: подходящий врач для каждого.", fam_all: "Все врачи",
    wl_h: "Полезные советы", wl_p: "Короткие советы для здоровья на каждый день и когда пора к врачу.", wl_when: "Когда к врачу:",
    wl_note: "Эти советы — общая информация, а не диагноз. В срочном случае звоните 103.",
    wl: [
      ["Давление", ["После 40 лет регулярно измеряйте давление", "Меньше соли и не менее 30 минут ходьбы в день", "Не отменяйте лекарство от давления сами"], "если давление часто выше 140/90 или есть головная боль и головокружение.", "#/doctors?s=cardio", "Кардиологи"],
      ["Диабет", ["Сильная жажда, частое мочеиспускание и похудение без причины: сдайте анализ на сахар", "При диабете регулярно измеряйте сахар", "Принимайте лекарство и пищу в одно и то же время"], "если сахар часто высокий или низкий, если рана на ноге не заживает.", "#/doctors?s=endo", "Эндокринологи"],
      ["Температура у ребёнка", ["Давайте больше пить, одевайте легко", "Жаропонижающее — только в дозе по возрасту", "Следите за температурой и самочувствием"], "любая температура у малыша до 3 месяцев, температура дольше 3 дней. Судороги, одышка или сыпь, которая не бледнеет при нажатии, — сразу 103.", "#/doctors?s=pediatrics", "Педиатры"],
      ["Беременность", ["Пройдите не меньше 8 осмотров за беременность", "Принимайте железо и фолиевую кислоту, как сказал врач", "Каждый день следите за шевелениями малыша"], "кровотечение, сильная головная боль, отёк лица или рук, ребёнок шевелится меньше или отошли воды — сразу в роддом.", "#/ona", "Для мам"],
      ["Психическое здоровье", ["Ложитесь и вставайте в одно время", "Каждый день хоть немного двигайтесь", "Делитесь переживаниями с близкими"], "если подавленность или тревога дольше 2 недель. Мысли о причинении себе вреда — сразу 103.", "#/doctors?s=psych", "Психологи"],
      ["Здоровый образ жизни", ["Каждый день ешьте овощи и фрукты", "Не курите и не употребляйте насвай", "После 40 лет раз в год проверяйте давление, сахар и холестерин"], "раз в год проходите осмотр у семейного врача.", "#/doctors?s=gp", "Семейные врачи"]
    ]
  });

  add("en", {
    hc_h: "Healthcare for you", hc_names: { gp: "Family doctor", spec: "Specialist", psych: "Mental health", pediatrics: "Paediatrics" }, hc_from: function (p) { return "from " + p + " / consultation"; }, hc_price_none: "Price depends on the doctor",
    nv_see: "See a doctor", nv_well: "Wellness", nv_about: "About",
    nv_clinic: "Online clinic", nv_panel: "Our doctors", nv_spec: "Specialists", nv_family: "Family health",
    nv_mental: "Mental health", nv_tips: "Health tips", nv_mission: "Our mission", nv_network: "Our network", nv_faq: "FAQ",
    cs_h_short: "Online consultation request", ap_x: "Close",
    ap_to: function (n) { return "Request to " + n; }, ap_spec: function (s) { return s + ": first available doctor"; },
    ap_spec_note: "Your request goes to a doctor in this specialty who is online now. To pick a particular doctor, choose them from the list.",
    ap_smp: "You picked a sample profile. Your request goes to a real doctor in this specialty who is online now.",
    oc_page_h: "Choose a doctor and apply right here",
    oc_page_p: "Pick a doctor from the list, or write to a doctor who is free now. The reply comes by chat, SMS, audio or video.",
    oc_page_steps: ["Choose a doctor", "Send a request", "Get advice"],
    ab_h: "A doctor close to every family", ab_p: "Shifokor helps you find a good doctor from anywhere in Uzbekistan and get their advice from home.",
    ab_check_h: "What we promise", ab_st: ["health facilities on the map", "regions", "districts", "specialties"],
    ab_net_p: "Doctors and private clinics are joining Shifokor. If you need one, find the nearest hospital or polyclinic on the map.",
    ab_clinic_join: "Add a clinic",
    sp_h: "Specialists", sp_p: "Pick the specialist you need: apply right here or see all their doctors.",
    sp_desc: { gp: "First advice for the whole family", therapist: "Blood pressure, stomach, tests", pediatrics: "Babies’ and children’s health", gyn: "Women’s health and pregnancy", cardio: "Heart and blood pressure", neuro: "Headache, back, nerves", surgery: "Before and after surgery", dental: "Teeth and gums", ent: "Ear, throat, nose", eye: "Eyes and sight", derm: "Skin, rashes, hair", uro: "Kidneys and urinary tract", endo: "Diabetes, thyroid", psych: "Stress, anxiety, sleep" },
    fam_h: "Family health", fam_p: "Children, older people, pregnant women and mental health: the right doctor for each.", fam_all: "All doctors",
    wl_h: "Health tips", wl_p: "Short everyday health tips, and when it’s time to see a doctor.", wl_when: "See a doctor:",
    wl_note: "These tips are general information, not a diagnosis. In an emergency, call 103.",
    wl: [
      ["Blood pressure", ["Over 40, check your blood pressure regularly", "Eat less salt and walk at least 30 minutes a day", "Don’t stop blood pressure medicine on your own"], "if it is often above 140/90, or with headaches and dizziness.", "#/doctors?s=cardio", "Cardiologists"],
      ["Diabetes", ["Great thirst, passing urine often and losing weight for no reason: get a sugar test", "With diabetes, check your sugar regularly", "Take medicine and meals at the same times"], "if your sugar is often high or low, or a wound on the foot won’t heal.", "#/doctors?s=endo", "Endocrinologists"],
      ["Fever in a child", ["Give plenty of fluids and dress them lightly", "Give fever medicine only in the dose for their age", "Watch the temperature and how they are"], "any fever in a baby under 3 months, or fever lasting over 3 days. Fits, trouble breathing or a rash that doesn’t fade when pressed: call 103 now.", "#/doctors?s=pediatrics", "Paediatricians"],
      ["Pregnancy", ["Have at least 8 check-ups in pregnancy", "Take iron and folic acid as your doctor says", "Notice your baby’s movements every day"], "bleeding, a bad headache, a swollen face or hands, fewer movements or waters breaking: go to the maternity hospital now.", "#/ona", "For mothers"],
      ["Mental health", ["Go to bed and get up at the same times", "Move a little every day", "Talk to people close to you about how you feel"], "if low mood or worry lasts over 2 weeks. Thoughts of harming yourself: call 103 now.", "#/doctors?s=psych", "Psychologists"],
      ["Healthy living", ["Eat vegetables and fruit every day", "Don’t smoke or use nasvay", "Over 40, check blood pressure, sugar and cholesterol once a year"], "see a family doctor for a check-up once a year.", "#/doctors?s=gp", "Family doctors"]
    ]
  });
})(window.SHIFOKOR_T);
