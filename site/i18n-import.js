/* Copy for importing doctors who agreed to be listed, and for an invited doctor claiming their profile. */
(function (T) {
  var add = function (lang, o) { Object.keys(o).forEach(function (k) { T[lang][k] = o[k]; }); };

  add("uz", {
    adm_tab_import: "Shifokorlarni qo‘shish", im_h: "Shifokorlarni ro‘yxatdan qo‘shish",
    im_p: "Faqat Shifokor’da ko‘rsatilishiga rozilik bergan shifokorlarni qo‘shing. Har biriga shaxsiy havola beriladi: shifokor uni ochib, parol o‘rnatadi va profilini tekshiradi.",
    im_steps: ["Shablonni yuklab oling va Excel yoki Google Sheets’da to‘ldiring: har bir qator bitta shifokor.", "CSV qilib saqlang va shu yerga yuklang (yoki matnini qo‘ying), «Tekshirish»ni bosing.", "Xatosiz qatorlarni qo‘shing va har bir shifokorga o‘z havolasini Telegram yoki SMS orqali yuboring."],
    im_cols_h: "Ustunlar", im_cols: [["ism", "To‘liq ismi (majburiy)"], ["telefon", "Shifokorning telefoni, +998… (majburiy)"], ["email", "Ixtiyoriy"], ["mutaxassislik", "Masalan: Ginekolog, Pediatr, Terapevt (majburiy)"], ["viloyat", "Masalan: Qashqadaryo yoki Toshkent shahri"], ["litsenziya", "Litsenziya raqami"], ["tajriba", "Necha yil ishlagan"], ["tillar", "uz, ru, en"], ["ish_joyi", "Shifoxona yoki klinika nomi"], ["matn_narx, audio_narx, video_narx", "Onlayn maslahat narxi, so‘mda; bo‘sh: taklif qilmaydi, 0: bepul"], ["onlayn", "ha, agar onlayn maslahat beradi"], ["haqida", "Qisqacha o‘zi haqida"]],
    im_template: "Bo‘sh shablon (CSV)", im_file: "CSV fayl", im_paste: "Yoki jadval matnini shu yerga qo‘ying", im_check: "Tekshirish",
    im_preview: "Tekshiruv natijasi", im_summary: function (ok, n) { return n + " ta qatordan " + ok + " tasi qo‘shishga tayyor."; }, im_empty: "Sarlavha qatori va kamida bitta shifokor qatori kerak.",
    im_th: ["Qator", "Ism", "Telefon", "Mutaxassislik", "Viloyat", "Onlayn", "Holat"], im_ok: "Tayyor", im_yes: "Ha",
    im_err: { name: "Ism yo‘q", phone: "Telefon noto‘g‘ri", dup: "Bu telefon faylda ikki marta", email: "Email noto‘g‘ri", spec: "Mutaxassislik yo‘q", region: "Viloyat topilmadi", exists: "Bu telefon yoki email bilan hisob allaqachon bor", profile: "Ma’lumot juda uzun" },
    im_agree: "Bu shifokorlar Shifokor’da ko‘rsatilishiga rozilik berishgan va ma’lumotlari to‘g‘ri.", im_err_agree: "Rozilik belgisini qo‘ying.",
    im_go: function (n) { return n + " ta shifokorni qo‘shish"; }, im_busy: "Qo‘shilmoqda…", im_done: function (n) { return n + " ta shifokor qo‘shildi."; },
    im_results: "Taklif havolalari", im_results_p: "Har bir havolani faqat o‘sha shifokorga yuboring. Havola 30 kun amal qiladi va faqat hozir ko‘rsatiladi: kerak bo‘lsa, pastda yangisini oling.",
    im_link: "Taklif havolasi", im_copy: "Nusxa olish", im_copied: "Havola nusxalandi.", im_links_csv: "Havolalar ro‘yxati (CSV)", im_cols_links: ["Ism", "Telefon", "Havola"],
    im_pending: "Havolani hali ochmaganlar", im_pending_p: "Bu shifokorlar katalogda ko‘rinadi, lekin hisobiga kirmaguncha onlayn maslahat olmaydi.",
    im_sent: function (d) { return "havola: " + d; }, im_new_link: "Yangi havola", im_rm: "Olib tashlash", im_rm_yes: "Ha, olib tashlash", im_removed: "Shifokor olib tashlandi.",
    im_pending_note: "Bu profilni Shifokor jamoasi shifokorning roziligi bilan qo‘shgan. Shifokor hali hisobiga kirmagan, shuning uchun onlayn maslahat hozircha yopiq.",
    im_claim_h: "Shifokor profilingiz", im_claim_p: function (n) { return "Assalomu alaykum, " + n + ". Shifokor jamoasi siz uchun profil tayyorladi. Parol o‘rnating, so‘ng ma’lumotlarni tekshirib, kerak bo‘lsa tuzating."; },
    im_pw: "Yangi parol (kamida 6 belgi)", im_pw2: "Parolni takrorlang", im_pw_mismatch: "Parollar bir xil emas.",
    im_claim_agree: "Bu mening profilim va u Shifokor’da ko‘rsatilishiga roziman.", im_claim_need_ok: "Tasdiqlash belgisini qo‘ying.", im_claim_go: "Profilni tasdiqlash",
    im_claim_fine: "Bu siz bo‘lmasangiz yoki profilingiz ko‘rsatilishini istamasangiz, sahifani yoping va Shifokor jamoasiga yozing.",
    im_claimed: "Xush kelibsiz! Endi profilingizni tekshiring.", im_bad_link: "Havola eskirgan yoki noto‘g‘ri. Shifokor jamoasidan yangi havola so‘rang.",
    im_claim_demo: "Taklif havolalari faqat saytning jonli versiyasida ishlaydi.",
    e_invited: "Siz uchun profil allaqachon tayyorlangan. Shifokor jamoasi yuborgan havolani oching yoki yangi havola so‘rang."
  });

  add("ru", {
    adm_tab_import: "Добавить врачей", im_h: "Добавление врачей из списка",
    im_p: "Добавляйте только врачей, которые согласились на показ в Shifokor. Каждый получит личную ссылку: врач открывает её, задаёт пароль и проверяет профиль.",
    im_steps: ["Скачайте шаблон и заполните его в Excel или Google Таблицах: одна строка — один врач.", "Сохраните как CSV и загрузите сюда (или вставьте текст), нажмите «Проверить».", "Добавьте строки без ошибок и отправьте каждому врачу его ссылку в Telegram или по SMS."],
    im_cols_h: "Столбцы", im_cols: [["ism", "Полное имя (обязательно)"], ["telefon", "Телефон врача, +998… (обязательно)"], ["email", "Необязательно"], ["mutaxassislik", "Например: Гинеколог, Педиатр, Терапевт (обязательно)"], ["viloyat", "Например: Кашкадарья или город Ташкент"], ["litsenziya", "Номер лицензии"], ["tajriba", "Стаж в годах"], ["tillar", "uz, ru, en"], ["ish_joyi", "Название больницы или клиники"], ["matn_narx, audio_narx, video_narx", "Цена онлайн-консультации в сумах; пусто — не проводит, 0 — бесплатно"], ["onlayn", "да, если проводит онлайн-консультации"], ["haqida", "Коротко о себе"]],
    im_template: "Пустой шаблон (CSV)", im_file: "Файл CSV", im_paste: "Или вставьте текст таблицы сюда", im_check: "Проверить",
    im_preview: "Результат проверки", im_summary: function (ok, n) { return "Готово к добавлению: " + ok + " из " + n + "."; }, im_empty: "Нужна строка заголовков и хотя бы одна строка с врачом.",
    im_th: ["Строка", "Имя", "Телефон", "Специальность", "Регион", "Онлайн", "Статус"], im_ok: "Готово", im_yes: "Да",
    im_err: { name: "Нет имени", phone: "Неверный телефон", dup: "Этот телефон дважды в файле", email: "Неверный email", spec: "Нет специальности", region: "Регион не найден", exists: "Аккаунт с этим телефоном или email уже есть", profile: "Слишком длинные данные" },
    im_agree: "Эти врачи согласились на показ в Shifokor, и их данные верны.", im_err_agree: "Отметьте согласие.",
    im_go: function (n) { return "Добавить врачей: " + n; }, im_busy: "Добавляем…", im_done: function (n) { return "Добавлено врачей: " + n + "."; },
    im_results: "Ссылки-приглашения", im_results_p: "Отправьте каждую ссылку только этому врачу. Ссылка действует 30 дней и показывается только сейчас; при необходимости получите новую ниже.",
    im_link: "Ссылка-приглашение", im_copy: "Копировать", im_copied: "Ссылка скопирована.", im_links_csv: "Список ссылок (CSV)", im_cols_links: ["Имя", "Телефон", "Ссылка"],
    im_pending: "Ещё не открыли ссылку", im_pending_p: "Эти врачи видны в каталоге, но не получают онлайн-консультации, пока не войдут в аккаунт.",
    im_sent: function (d) { return "ссылка: " + d; }, im_new_link: "Новая ссылка", im_rm: "Убрать", im_rm_yes: "Да, убрать", im_removed: "Врач убран.",
    im_pending_note: "Этот профиль добавила команда Shifokor с согласия врача. Врач ещё не вошёл в аккаунт, поэтому онлайн-консультации пока закрыты.",
    im_claim_h: "Ваш профиль врача", im_claim_p: function (n) { return "Здравствуйте, " + n + ". Команда Shifokor подготовила для вас профиль. Задайте пароль, затем проверьте данные и при необходимости исправьте."; },
    im_pw: "Новый пароль (не менее 6 символов)", im_pw2: "Повторите пароль", im_pw_mismatch: "Пароли не совпадают.",
    im_claim_agree: "Это мой профиль, и я согласен(на) на его показ в Shifokor.", im_claim_need_ok: "Поставьте отметку подтверждения.", im_claim_go: "Подтвердить профиль",
    im_claim_fine: "Если это не вы или вы не хотите показывать профиль, закройте страницу и напишите команде Shifokor.",
    im_claimed: "Добро пожаловать! Теперь проверьте свой профиль.", im_bad_link: "Ссылка устарела или неверна. Попросите новую у команды Shifokor.",
    im_claim_demo: "Ссылки-приглашения работают только на рабочей версии сайта.",
    e_invited: "Для вас уже подготовлен профиль. Откройте ссылку от команды Shifokor или попросите новую."
  });

  add("en", {
    adm_tab_import: "Add doctors", im_h: "Add doctors from a list",
    im_p: "Only add doctors who agreed to be listed on Shifokor. Each gets a personal link: the doctor opens it, sets a password and checks their profile.",
    im_steps: ["Download the template and fill it in with Excel or Google Sheets: one row per doctor.", "Save it as CSV and upload it here (or paste the text), then press “Check”.", "Add the rows without errors and send each doctor their own link by Telegram or SMS."],
    im_cols_h: "Columns", im_cols: [["ism", "Full name (required)"], ["telefon", "The doctor’s phone, +998… (required)"], ["email", "Optional"], ["mutaxassislik", "For example: Gynaecologist, Paediatrician, Therapist (required)"], ["viloyat", "For example: Kashkadarya or Tashkent city"], ["litsenziya", "Licence number"], ["tajriba", "Years of experience"], ["tillar", "uz, ru, en"], ["ish_joyi", "Hospital or clinic name"], ["matn_narx, audio_narx, video_narx", "Online consultation price in soums; empty: not offered, 0: free"], ["onlayn", "yes, if they give online consultations"], ["haqida", "A short bio"]],
    im_template: "Blank template (CSV)", im_file: "CSV file", im_paste: "Or paste the table text here", im_check: "Check",
    im_preview: "Check result", im_summary: function (ok, n) { return ok + " of " + n + " rows are ready to add."; }, im_empty: "You need a header row and at least one doctor row.",
    im_th: ["Row", "Name", "Phone", "Specialty", "Region", "Online", "Status"], im_ok: "Ready", im_yes: "Yes",
    im_err: { name: "No name", phone: "Wrong phone", dup: "This phone is in the file twice", email: "Wrong email", spec: "No specialty", region: "Region not found", exists: "An account with this phone or email already exists", profile: "Too much data" },
    im_agree: "These doctors agreed to be listed on Shifokor, and their details are correct.", im_err_agree: "Tick the consent box.",
    im_go: function (n) { return "Add " + n + (n === 1 ? " doctor" : " doctors"); }, im_busy: "Adding…", im_done: function (n) { return n + (n === 1 ? " doctor" : " doctors") + " added."; },
    im_results: "Invite links", im_results_p: "Send each link only to that doctor. A link lasts 30 days and is shown only now; you can get a new one below.",
    im_link: "Invite link", im_copy: "Copy", im_copied: "Link copied.", im_links_csv: "List of links (CSV)", im_cols_links: ["Name", "Phone", "Link"],
    im_pending: "Haven’t opened their link yet", im_pending_p: "These doctors show in the directory but take no online consultations until they sign in.",
    im_sent: function (d) { return "link: " + d; }, im_new_link: "New link", im_rm: "Remove", im_rm_yes: "Yes, remove", im_removed: "Doctor removed.",
    im_pending_note: "The Shifokor team added this profile with the doctor’s consent. The doctor hasn’t signed in yet, so online consultations are closed for now.",
    im_claim_h: "Your doctor profile", im_claim_p: function (n) { return "Hello, " + n + ". The Shifokor team has prepared a profile for you. Set a password, then check your details and correct them if needed."; },
    im_pw: "New password (at least 6 characters)", im_pw2: "Repeat the password", im_pw_mismatch: "The passwords don’t match.",
    im_claim_agree: "This is my profile, and I agree to it being shown on Shifokor.", im_claim_need_ok: "Tick the confirmation box.", im_claim_go: "Confirm my profile",
    im_claim_fine: "If this isn’t you, or you don’t want your profile shown, close this page and write to the Shifokor team.",
    im_claimed: "Welcome! Now check your profile.", im_bad_link: "This link has expired or is wrong. Ask the Shifokor team for a new one.",
    im_claim_demo: "Invite links work only on the live site.",
    e_invited: "A profile has already been prepared for you. Open the link from the Shifokor team or ask for a new one."
  });
})(window.SHIFOKOR_T);
