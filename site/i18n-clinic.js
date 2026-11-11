/* Copy for clinic branches, staff doctors and the clinic's shared calendar (clinic panel), and the doctor's invitations. */
(function (T) {
  var add = function (lang, o) { Object.keys(o).forEach(function (k) { T[lang][k] = o[k]; }); };
  var nav = function (lang, o) { Object.keys(o).forEach(function (k) { T[lang].pn_t[k] = o[k]; }); };

  nav("uz", { ccalendar: "Umumiy jadval", cbranches: "Filiallar" });
  add("uz", {
    cl_br_p: "Klinikangizning har bir manzili: bemorlar ularni klinika sahifasida ko‘radi.", cl_br_add: "Filial qo‘shish",
    cl_br_new: "Yangi filial", cl_br_edit: "Filialni o‘zgartirish", cl_br_name: "Filial nomi", cl_br_name_ph: "masalan: Markaziy filial",
    cl_br_none: "Hali filial yo‘q", cl_br_none_p: "Bir nechta manzilingiz bo‘lsa, har birini qo‘shing va shifokorlarni ularga biriktiring.",
    cl_docs_n: function (n) { return n + " shifokor"; }, cl_edit: "O‘zgartirish", cl_delete: "O‘chirish", cl_br_del_q: "Filial o‘chirilsinmi?", cl_del_yes: "Ha, o‘chirish",
    cl_br_err_name: "Filial nomini yozing.", cl_br_saved: "Filial saqlandi.", cl_br_deleted: "Filial o‘chirildi.", cl_br_set: "Filial o‘zgartirildi.", cl_br_pub: "Filiallar",
    cl_no_branch: "Filialsiz", cl_branch: "Filial", cl_all_branches: "Barcha filiallar",
    cl_team_p: "Shifokorlarni telefon raqami orqali taklif qiling. Ular o‘z panelida rozilik bergach, klinika sahifangizda ko‘rinadi.",
    cl_inv_h: "Shifokorni taklif qilish", cl_inv_p: "Shifokor Shifokor’da shu raqam bilan ro‘yxatdan o‘tgan bo‘lsa, taklif darhol uning paneliga tushadi. Bo‘lmasa, ro‘yxatdan o‘tganda ko‘radi.",
    cl_inv_phone: "Shifokorning telefon raqami", cl_inv_send: "Taklif yuborish",
    cl_inv_sent: "Taklif yuborildi. Shifokor o‘z panelida javob beradi.", cl_inv_sent_wait: "Taklif saqlandi. Shifokor shu raqam bilan ro‘yxatdan o‘tganda ko‘radi.",
    cl_err_not_doc: "Bu raqam shifokor hisobiga tegishli emas.", cl_err_exists: "Bu raqamga taklif allaqachon yuborilgan.",
    cl_staff_h: "Xodimlar", cl_staff_none: "Hali hech kim taklif qilinmagan.", cl_st_active: "Ishlaydi", cl_st_invited: "Javob kutilmoqda", cl_st_wait: "Ro‘yxatdan o‘tmagan",
    cl_remove: "Olib tashlash", cl_removed: "Shifokor ro‘yxatdan olib tashlandi.", pn_cdocs_h: "Klinika sahifasidagi shifokorlar",
    cl_inv_wait_n: function (n) { return n + " ta taklif javobsiz"; }, cl_st_branches: "filial",
    cl_cal_p: "Keyingi 7 kun: klinikadagi qabullar va shifokorlaringizning onlayn band vaqtlari.", cl_cal_free: "Band vaqt yo‘q",
    cl_cal_note: "Klinikadagi qabulni bossangiz, so‘rovlar sahifasi ochiladi. «~» — bemor tanlagan taxminiy soat, hali tasdiqlanmagan.",
    cl_inv_to: function (c) { return c + " sizni shifokorlari qatoriga taklif qilmoqda"; },
    cl_inv_note: "Rozi bo‘lsangiz, klinika sahifasida ko‘rinasiz va klinika band vaqtlaringizni (bemor ma’lumotlarisiz) ko‘radi.",
    cl_inv_yes: "Qabul qilish", cl_inv_no: "Rad etish", cl_inv_joined: "Endi siz klinika shifokorlari qatoridasiz.", cl_inv_declined: "Taklif rad etildi.",
    cl_mine_h: "Men ishlaydigan klinikalar", cl_leave: "Klinikadan chiqish", cl_left: "Siz klinikadan chiqdingiz."
  });

  nav("ru", { ccalendar: "Общее расписание", cbranches: "Филиалы" });
  add("ru", {
    cl_br_p: "Каждый адрес вашей клиники: пациенты видят их на странице клиники.", cl_br_add: "Добавить филиал",
    cl_br_new: "Новый филиал", cl_br_edit: "Изменить филиал", cl_br_name: "Название филиала", cl_br_name_ph: "например: Центральный филиал",
    cl_br_none: "Филиалов пока нет", cl_br_none_p: "Если у вас несколько адресов, добавьте каждый и закрепите за ними врачей.",
    cl_docs_n: function (n) { return n + " врач."; }, cl_edit: "Изменить", cl_delete: "Удалить", cl_br_del_q: "Удалить филиал?", cl_del_yes: "Да, удалить",
    cl_br_err_name: "Укажите название филиала.", cl_br_saved: "Филиал сохранён.", cl_br_deleted: "Филиал удалён.", cl_br_set: "Филиал изменён.", cl_br_pub: "Филиалы",
    cl_no_branch: "Без филиала", cl_branch: "Филиал", cl_all_branches: "Все филиалы",
    cl_team_p: "Пригласите врачей по номеру телефона. Когда врач согласится в своей панели, он появится на странице клиники.",
    cl_inv_h: "Пригласить врача", cl_inv_p: "Если врач зарегистрирован в Shifokor с этим номером, приглашение сразу появится в его панели. Если нет — увидит после регистрации.",
    cl_inv_phone: "Телефон врача", cl_inv_send: "Отправить приглашение",
    cl_inv_sent: "Приглашение отправлено. Врач ответит в своей панели.", cl_inv_sent_wait: "Приглашение сохранено. Врач увидит его, когда зарегистрируется с этим номером.",
    cl_err_not_doc: "Этот номер не принадлежит аккаунту врача.", cl_err_exists: "На этот номер приглашение уже отправлено.",
    cl_staff_h: "Сотрудники", cl_staff_none: "Пока никто не приглашён.", cl_st_active: "Работает", cl_st_invited: "Ждём ответа", cl_st_wait: "Не зарегистрирован",
    cl_remove: "Убрать", cl_removed: "Врач убран из списка.", pn_cdocs_h: "Врачи на странице клиники",
    cl_inv_wait_n: function (n) { return n + " без ответа"; }, cl_st_branches: "филиалы",
    cl_cal_p: "Следующие 7 дней: приёмы в клинике и онлайн-записи ваших врачей.", cl_cal_free: "Нет записей",
    cl_cal_note: "Нажмите на приём, чтобы открыть запросы. «~» — примерный час, выбранный пациентом, ещё не подтверждён.",
    cl_inv_to: function (c) { return c + " приглашает вас в число своих врачей"; },
    cl_inv_note: "Если согласитесь, вы появитесь на странице клиники, а клиника увидит ваше занятое время (без данных пациентов).",
    cl_inv_yes: "Принять", cl_inv_no: "Отклонить", cl_inv_joined: "Теперь вы в числе врачей клиники.", cl_inv_declined: "Приглашение отклонено.",
    cl_mine_h: "Клиники, где я работаю", cl_leave: "Выйти из клиники", cl_left: "Вы вышли из клиники."
  });

  nav("en", { ccalendar: "Shared calendar", cbranches: "Branches" });
  add("en", {
    cl_br_p: "Each address of your clinic. Patients see them on your clinic page.", cl_br_add: "Add a branch",
    cl_br_new: "New branch", cl_br_edit: "Edit branch", cl_br_name: "Branch name", cl_br_name_ph: "e.g. Central branch",
    cl_br_none: "No branches yet", cl_br_none_p: "If you have more than one address, add each one and assign your doctors to it.",
    cl_docs_n: function (n) { return n + (n === 1 ? " doctor" : " doctors"); }, cl_edit: "Edit", cl_delete: "Delete", cl_br_del_q: "Delete this branch?", cl_del_yes: "Yes, delete",
    cl_br_err_name: "Enter the branch name.", cl_br_saved: "Branch saved.", cl_br_deleted: "Branch deleted.", cl_br_set: "Branch changed.", cl_br_pub: "Branches",
    cl_no_branch: "No branch", cl_branch: "Branch", cl_all_branches: "All branches",
    cl_team_p: "Invite doctors by phone number. Once a doctor accepts in their panel, they appear on your clinic page.",
    cl_inv_h: "Invite a doctor", cl_inv_p: "If the doctor has a Shifokor account with this number, the invitation reaches their panel at once. If not, they see it when they register.",
    cl_inv_phone: "Doctor's phone number", cl_inv_send: "Send invitation",
    cl_inv_sent: "Invitation sent. The doctor answers in their panel.", cl_inv_sent_wait: "Invitation saved. The doctor sees it when they register with this number.",
    cl_err_not_doc: "This number doesn't belong to a doctor's account.", cl_err_exists: "This number has already been invited.",
    cl_staff_h: "Staff", cl_staff_none: "No one invited yet.", cl_st_active: "Working", cl_st_invited: "Awaiting reply", cl_st_wait: "Not registered",
    cl_remove: "Remove", cl_removed: "Doctor removed from the list.", pn_cdocs_h: "Doctors on your clinic page",
    cl_inv_wait_n: function (n) { return n + " awaiting reply"; }, cl_st_branches: "branches",
    cl_cal_p: "The next 7 days: visits at your clinic and your doctors' booked online times.", cl_cal_free: "Nothing booked",
    cl_cal_note: "Tap a visit to open your requests. “~” marks the hour the patient preferred, not yet confirmed.",
    cl_inv_to: function (c) { return c + " invites you to join their doctors"; },
    cl_inv_note: "If you accept, you appear on the clinic's page and the clinic sees your booked times (without patient details).",
    cl_inv_yes: "Accept", cl_inv_no: "Decline", cl_inv_joined: "You're now one of the clinic's doctors.", cl_inv_declined: "Invitation declined.",
    cl_mine_h: "Clinics I work at", cl_leave: "Leave clinic", cl_left: "You left the clinic."
  });
})(window.SHIFOKOR_T);
