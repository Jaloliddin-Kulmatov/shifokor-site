/* Copy for the simplified home page and menu. Uzbek is the main language. */
(function (T) {
  var add = function (lang, o) { Object.keys(o).forEach(function (k) { T[lang][k] = o[k]; }); };

  add("uz", {
    nav_set: "Sozlamalar", set_h: "Sozlamalar", set_p: "Sozlamalar shu telefonda saqlanadi.", set_lang: "Til", set_size: "Matn o‘lchami", sizes: { n: "Oddiy", l: "Katta" }, set_theme: "Ko‘rinish", themes: { auto: "Avtomatik", light: "Yorug‘", dark: "Qorong‘i" }, set_map: "Xarita", maps: { on: "Ko‘rsatish", off: "Yashirish (internetni tejaydi)" }, set_loc: "Joylashuv", set_loc_p: "Saqlangan joylashuvingizni unutish.", set_loc_btn: "Joylashuvni unutish", set_loc_done: "Joylashuv unutildi.", set_loc_none: "Joylashuv saqlanmagan.", set_data: "Shu telefondagi ma’lumotlar", set_data_p: "Qabullar, arizalar va demo ma’lumotlarni o‘chirish. Onlayn hisobingiz o‘chirilmaydi.", set_data_btn: "Ma’lumotlarni tozalash", set_data_q: "Shu telefondagi ma’lumotlar o‘chirilsinmi?", set_data_yes: "Ha, tozalash", set_data_done: "Ma’lumotlar tozalandi.", set_acc: "Hisob", set_saved: "Saqlandi",
    nav_hosp: "Shifoxonalar", nav_menu: "Menyu",
    h_sub: "Davlat shifoxonasi, kerakli shifokor va onlayn maslahat bir joyda. Qishloq va chekka hududlarda yashovchilar uchun qulay.",
    act_h: "Nima qilmoqchisiz?",
    acts: [["Shifoxona topish", "Eng yaqin davlat shifoxonasi, QVP yoki poliklinika"], ["Shifokor topish", "Mutaxassislik yoki ism bo‘yicha"], ["Onlayn maslahat", "Ariza to‘ldiring, shifokor yozib yoki qo‘ng‘iroq qilib javob beradi"], ["Boshqa odamni yozish", "Smartfoni yo‘q qo‘shni yoki qarindosh uchun"]],
    how3_h: "Qanday ishlaydi", how3: [["Toping", "Yaqin shifoxona yoki kerakli shifokorni tanlang."], ["Murojaat qiling", "Qabulga yoziling yoki qisqa ariza to‘ldiring."], ["Yordam oling", "Shifokor javob beradi yoki sizni qabulga chaqiradi."]],
    regions_h: "Viloyatingizni tanlang", join_line: "Klinika yoki shifokormisiz?", join_go: "Shifokorda ro‘yxatdan o‘ting", faq_short_h: "Ko‘p beriladigan savollar"
  });

  add("ru", {
    nav_set: "Настройки", set_h: "Настройки", set_p: "Настройки сохраняются на этом телефоне.", set_lang: "Язык", set_size: "Размер текста", sizes: { n: "Обычный", l: "Крупный" }, set_theme: "Оформление", themes: { auto: "Автоматически", light: "Светлое", dark: "Тёмное" }, set_map: "Карта", maps: { on: "Показывать", off: "Скрыть (экономит интернет)" }, set_loc: "Местоположение", set_loc_p: "Забыть сохранённое местоположение.", set_loc_btn: "Забыть местоположение", set_loc_done: "Местоположение забыто.", set_loc_none: "Местоположение не сохранено.", set_data: "Данные на этом телефоне", set_data_p: "Удалить записи, заявки и демо-данные. Онлайн-аккаунт не удаляется.", set_data_btn: "Очистить данные", set_data_q: "Удалить данные на этом телефоне?", set_data_yes: "Да, очистить", set_data_done: "Данные очищены.", set_acc: "Аккаунт", set_saved: "Сохранено",
    nav_hosp: "Больницы", nav_menu: "Меню",
    h_sub: "Государственные больницы, нужный врач и онлайн-консультация в одном месте. Удобно для жителей сёл и отдалённых районов.",
    act_h: "Что вам нужно?",
    acts: [["Найти больницу", "Ближайшая госбольница, СВП или поликлиника"], ["Найти врача", "По специальности или имени"], ["Онлайн-консультация", "Заполните заявку, врач ответит письменно или позвонит"], ["Записать другого человека", "Для соседа или родственника без смартфона"]],
    how3_h: "Как это работает", how3: [["Найдите", "Выберите ближайшую больницу или нужного врача."], ["Обратитесь", "Запишитесь на приём или заполните короткую заявку."], ["Получите помощь", "Врач ответит или пригласит на приём."]],
    regions_h: "Выберите регион", join_line: "Вы клиника или врач?", join_go: "Зарегистрируйтесь на Shifokor", faq_short_h: "Частые вопросы"
  });

  add("en", {
    nav_set: "Settings", set_h: "Settings", set_p: "Settings are saved on this phone.", set_lang: "Language", set_size: "Text size", sizes: { n: "Normal", l: "Large" }, set_theme: "Appearance", themes: { auto: "Automatic", light: "Light", dark: "Dark" }, set_map: "Map", maps: { on: "Show", off: "Hide (saves mobile data)" }, set_loc: "Location", set_loc_p: "Forget your saved location.", set_loc_btn: "Forget my location", set_loc_done: "Location forgotten.", set_loc_none: "No location saved.", set_data: "Data on this phone", set_data_p: "Delete bookings, applications and demo data. Your online account is not deleted.", set_data_btn: "Clear data", set_data_q: "Delete the data on this phone?", set_data_yes: "Yes, clear", set_data_done: "Data cleared.", set_acc: "Account", set_saved: "Saved",
    nav_hosp: "Hospitals", nav_menu: "Menu",
    h_sub: "State hospitals, the right doctor and online consultation in one place. Made for people in villages and remote areas.",
    act_h: "What do you need?",
    acts: [["Find a hospital", "Nearest state hospital, QVP or polyclinic"], ["Find a doctor", "By specialty or name"], ["Online consultation", "Fill in an application; a doctor writes back or calls"], ["Book for someone else", "For a neighbour or relative without a smartphone"]],
    how3_h: "How it works", how3: [["Find", "Pick the nearest hospital or the doctor you need."], ["Ask", "Book a visit or fill in a short application."], ["Get help", "The doctor replies or invites you for a visit."]],
    regions_h: "Choose your region", join_line: "Are you a clinic or a doctor?", join_go: "Register on Shifokor", faq_short_h: "Common questions"
  });
})(window.SHIFOKOR_T);
