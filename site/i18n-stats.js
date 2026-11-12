/* Words for the admin's overview page (#/admin?tab=stats) and deleting an account from the check list. */
(function (T) {
  var add = function (lang, o) { Object.keys(o).forEach(function (k) { T[lang][k] = o[k]; }); };
  add("uz", {
    st_tab: "Statistika", st_h: "Umumiy ko‘rinish", st_p: "Saytdagi hamma narsa raqamlarda: kim ro‘yxatdan o‘tdi, nechta ariza va qabul bor, oxirgi 14 kun.",
    st_pat: "Bemorlar", st_doc: "Shifokorlar", st_cli: "Klinikalar", st_cons: "Onlayn arizalar", st_appts: "Klinikaga yozilishlar", st_rv: "Sharhlar", st_money: "To‘langan maslahatlar", st_reach: "Telegram ulaganlar",
    st_week: function (n) { return "bu hafta +" + n; }, st_ver: function (n) { return n + " ta tasdiqlangan"; },
    st_cons_n: function (a, b, c) { return "yangi " + a + " · jarayonda " + b + " · tugagan " + c; }, st_appts_n: function (a, b) { return "yangi " + a + " · tasdiqlangan " + b; },
    st_ai: function (n) { return "so‘rov · bu hafta " + n; }, st_money_n: function (n, fee) { return n + " ta to‘lov · platforma ulushi " + fee; }, st_reach_n: function (n) { return "telefon bildirishnomasi: " + n; },
    st_som: "so‘m", st_days: "Oxirgi 14 kun", st_new_users: "Yangi hisoblar", st_14: function (n) { return "jami " + n; }, st_today: "bugun", st_reload: "Yangilash",
    st_top_spec: "Eng ko‘p so‘ralgan mutaxassislik", st_top_reg: "Arizalar qayerdan", st_recent: "Oxirgi ro‘yxatdan o‘tganlar",
    st_note: "Namuna shifokorlar hisobga kirmaydi: bu faqat haqiqiy hisoblar va arizalar.",
    st_del: "Hisobni o‘chirish", st_del_q: function (n) { return "«" + n + "» hisobi butunlay o‘chirilsinmi? Arizalari, chatlari va sharhlari ham o‘chadi. Qaytarib bo‘lmaydi."; }, st_del_yes: "Ha, o‘chirish", st_deleted: "Hisob o‘chirildi"
  });
  add("ru", {
    st_tab: "Статистика", st_h: "Обзор", st_p: "Всё о сайте в цифрах: кто зарегистрировался, сколько заявок и записей, последние 14 дней.",
    st_pat: "Пациенты", st_doc: "Врачи", st_cli: "Клиники", st_cons: "Онлайн-заявки", st_appts: "Записи в клинику", st_rv: "Отзывы", st_money: "Оплаченные консультации", st_reach: "Подключили Telegram",
    st_week: function (n) { return "за неделю +" + n; }, st_ver: function (n) { return "проверено: " + n; },
    st_cons_n: function (a, b, c) { return "новые " + a + " · в работе " + b + " · завершены " + c; }, st_appts_n: function (a, b) { return "новые " + a + " · подтверждены " + b; },
    st_ai: function (n) { return "запросов · за неделю " + n; }, st_money_n: function (n, fee) { return "платежей: " + n + " · доля платформы " + fee; }, st_reach_n: function (n) { return "уведомления на телефон: " + n; },
    st_som: "сум", st_days: "Последние 14 дней", st_new_users: "Новые аккаунты", st_14: function (n) { return "всего " + n; }, st_today: "сегодня", st_reload: "Обновить",
    st_top_spec: "Самые частые специальности", st_top_reg: "Откуда заявки", st_recent: "Последние регистрации",
    st_note: "Примеры врачей не учитываются: здесь только настоящие аккаунты и заявки.",
    st_del: "Удалить аккаунт", st_del_q: function (n) { return "Удалить аккаунт «" + n + "» навсегда? Его заявки, чаты и отзывы тоже удалятся. Отменить нельзя."; }, st_del_yes: "Да, удалить", st_deleted: "Аккаунт удалён"
  });
  add("en", {
    st_tab: "Analytics", st_h: "Overview", st_p: "The whole site in numbers: who signed up, how many requests and visits, the last 14 days.",
    st_pat: "Patients", st_doc: "Doctors", st_cli: "Clinics", st_cons: "Online requests", st_appts: "Clinic visits", st_rv: "Reviews", st_money: "Paid consultations", st_reach: "Linked Telegram",
    st_week: function (n) { return "+" + n + " this week"; }, st_ver: function (n) { return n + " verified"; },
    st_cons_n: function (a, b, c) { return "new " + a + " · in progress " + b + " · done " + c; }, st_appts_n: function (a, b) { return "new " + a + " · confirmed " + b; },
    st_ai: function (n) { return "questions · " + n + " this week"; }, st_money_n: function (n, fee) { return n + " payments · platform share " + fee; }, st_reach_n: function (n) { return "phone notifications: " + n; },
    st_som: "so‘m", st_days: "Last 14 days", st_new_users: "New accounts", st_14: function (n) { return n + " in all"; }, st_today: "today", st_reload: "Refresh",
    st_top_spec: "Most requested specialties", st_top_reg: "Where requests come from", st_recent: "Latest sign-ups",
    st_note: "Sample doctors aren’t counted: these are real accounts and requests only.",
    st_del: "Delete account", st_del_q: function (n) { return "Delete the account “" + n + "” for good? Its requests, chats and reviews go too. This can’t be undone."; }, st_del_yes: "Yes, delete", st_deleted: "Account deleted"
  });
  ["uz", "ru", "en"].forEach(function (l) { T[l].pn_t.a_stats = T[l].st_tab; });
})(window.SHIFOKOR_T);
