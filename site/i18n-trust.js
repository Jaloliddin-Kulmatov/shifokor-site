/* Copy for checked clinics and doctors, the admin page and Telegram / SMS notices. */
(function (T) {
  var add = function (lang, o) { Object.keys(o).forEach(function (k) { T[lang][k] = o[k]; }); };

  add("uz", {
    vf_yes: "Tekshirilgan", vf_h: "Tekshiruv", vf_wait: "kutilmoqda", vf_ok_p: "Hisobingizni Shifokor jamoasi tekshirgan.", vf_reset: "Nom, litsenziya yoki shifoxona o‘zgarsa, qayta tekshiriladi.",
    vf_wait_clinic: "Shifokor jamoasi shifoxonangizni uning rasmiy telefon raqami orqali tekshiradi. Tekshiruvdan o‘tmaguncha bemorlar sizga onlayn yozila olmaydi.",
    vf_wait_doc: "Shifokor jamoasi litsenziya raqamingizni tekshiradi. Shu paytgacha profilingizda «Litsenziya hali tekshirilmagan» yozuvi turadi.",
    vf_need_clinic: "Tekshiruv uchun pastda litsenziya raqamini va «Klinikangiz xaritada» maydonini to‘ldiring.", vf_need_doc: "Tekshiruv uchun pastda litsenziya raqamini kiriting.",
    ap_unv: "Bu klinika hali tekshirilmagan, shuning uchun onlayn yozilish ochilmagan.", e_ap_unv: "Bu shifoxona hali tekshirilmagan, yozilish ochilmagan.",
    nt_h: "Telegram xabarnomalari", nt_p: "Qabul tasdiqlansa, yangi so‘rov kelsa yoki shifokor javob yozsa, Telegramga xabar keladi.", nt_sms: "Telegram ulanmagan bo‘lsa, qabul javobi SMS bilan keladi.",
    nt_on: "Telegram ulangan", nt_link: "Telegramni ulash", nt_unlink: "Telegramni uzish", nt_wait: "Telegram ochildi. Botda «Start» (Boshlash) tugmasini bosing va shu sahifaga qayting.", nt_off: "Telegram xabarnomalari hali sozlanmagan.",
    nt_tip: "Shifoxona javobini Telegramda oling.",
    adm_nav: "Tekshiruv", adm_h: "Klinika va shifokorlarni tekshirish", adm_p: "Tasdiqlashdan oldin rasmiy manbadan tekshiring: shifoxonaning rasmiy telefoniga qo‘ng‘iroq qiling, litsenziyani litsenziyalar reyestrida tekshiring.",
    adm_pending: "Tekshiruv kutayotganlar", adm_done: "Tekshirilganlar", adm_ok: "Tasdiqlash", adm_no: "Rad etish", adm_revoke: "Tasdiqni bekor qilish", adm_none: "Hech kim yo‘q.",
    adm_contact: "Aloqa", adm_lic: "Litsenziya", adm_fac: "Shifoxona (da’vo)", adm_since: "Ro‘yxatdan o‘tgan", adm_ok_done: "Tasdiqlandi.", adm_no_done: "Tasdiq olib tashlandi.",
    adm_tg: "Telegram botni shu saytga ulash", adm_tg_ok: function (b) { return "Bot ulandi: @" + b; }, adm_forbidden: "Bu sahifa faqat administratorlar uchun."
  });

  add("ru", {
    vf_yes: "Проверено", vf_h: "Проверка", vf_wait: "ожидается", vf_ok_p: "Ваш аккаунт проверен командой Shifokor.", vf_reset: "При смене названия, лицензии или больницы нужна новая проверка.",
    vf_wait_clinic: "Команда Shifokor проверит больницу по её официальному телефону. До проверки пациенты не смогут записываться к вам онлайн.",
    vf_wait_doc: "Команда Shifokor проверит номер вашей лицензии. До этого в профиле будет пометка «Лицензия ещё не проверена».",
    vf_need_clinic: "Для проверки укажите ниже номер лицензии и заполните поле «Ваша клиника на карте».", vf_need_doc: "Для проверки укажите ниже номер лицензии.",
    ap_unv: "Эта клиника ещё не проверена, поэтому онлайн-запись не открыта.", e_ap_unv: "Эта больница ещё не проверена, запись не открыта.",
    nt_h: "Уведомления в Telegram", nt_p: "Когда приём подтвердят, придёт новый запрос или врач ответит, вы получите сообщение в Telegram.", nt_sms: "Если Telegram не подключён, ответ о приёме придёт по SMS.",
    nt_on: "Telegram подключён", nt_link: "Подключить Telegram", nt_unlink: "Отключить Telegram", nt_wait: "Telegram открыт. Нажмите «Start» (Запустить) в боте и вернитесь на эту страницу.", nt_off: "Уведомления в Telegram ещё не настроены.",
    nt_tip: "Получайте ответ больницы в Telegram.",
    adm_nav: "Проверка", adm_h: "Проверка клиник и врачей", adm_p: "Перед подтверждением проверьте по официальному источнику: позвоните на официальный телефон больницы, проверьте лицензию в реестре лицензий.",
    adm_pending: "Ждут проверки", adm_done: "Проверены", adm_ok: "Подтвердить", adm_no: "Отклонить", adm_revoke: "Снять подтверждение", adm_none: "Никого нет.",
    adm_contact: "Контакты", adm_lic: "Лицензия", adm_fac: "Больница (заявлена)", adm_since: "Зарегистрирован", adm_ok_done: "Подтверждено.", adm_no_done: "Подтверждение снято.",
    adm_tg: "Подключить Telegram-бота к этому сайту", adm_tg_ok: function (b) { return "Бот подключён: @" + b; }, adm_forbidden: "Эта страница только для администраторов."
  });

  add("en", {
    vf_yes: "Checked", vf_h: "Check", vf_wait: "pending", vf_ok_p: "The Shifokor team has checked your account.", vf_reset: "Changing the name, licence or hospital needs a new check.",
    vf_wait_clinic: "The Shifokor team checks your hospital through its official phone number. Until then, patients can’t book with you online.",
    vf_wait_doc: "The Shifokor team checks your licence number. Until then your profile says “Licence not checked yet”.",
    vf_need_clinic: "For the check, fill in the licence number and “Your clinic on the map” below.", vf_need_doc: "For the check, fill in your licence number below.",
    ap_unv: "This clinic hasn’t been checked yet, so online booking isn’t open.", e_ap_unv: "This hospital hasn’t been checked yet, so booking isn’t open.",
    nt_h: "Telegram notices", nt_p: "Get a Telegram message when a visit is confirmed, a new request arrives or a doctor replies.", nt_sms: "Without Telegram, visit replies come by SMS.",
    nt_on: "Telegram connected", nt_link: "Connect Telegram", nt_unlink: "Disconnect Telegram", nt_wait: "Telegram is open. Press “Start” in the bot, then come back to this page.", nt_off: "Telegram notices aren’t set up yet.",
    nt_tip: "Get the hospital’s reply in Telegram.",
    adm_nav: "Checks", adm_h: "Check clinics and doctors", adm_p: "Before confirming, check with an official source: call the hospital’s official phone number and look the licence up in the licence register.",
    adm_pending: "Waiting for a check", adm_done: "Checked", adm_ok: "Confirm", adm_no: "Reject", adm_revoke: "Remove check", adm_none: "Nobody here.",
    adm_contact: "Contact", adm_lic: "Licence", adm_fac: "Hospital (claimed)", adm_since: "Registered", adm_ok_done: "Confirmed.", adm_no_done: "Check removed.",
    adm_tg: "Connect the Telegram bot to this site", adm_tg_ok: function (b) { return "Bot connected: @" + b; }, adm_forbidden: "This page is for admins only."
  });
})(window.SHIFOKOR_T);
