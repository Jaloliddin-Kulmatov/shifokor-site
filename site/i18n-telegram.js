/* Copy for "Sign in with Telegram". */
(function (T) {
  var add = function (lang, o) { Object.keys(o).forEach(function (k) { T[lang][k] = o[k]; }); };

  add("uz", {
    tl_btn: "Telegram orqali kirish", tl_wait_h: "Telegram’da tasdiqlang",
    tl_wait_p: "Botda «Start», keyin «📱 Raqamni yuborish va kirish» tugmasini bosing. Shundan so‘ng bu sahifa o‘zi ochiladi.",
    tl_again: "Telegram’ni qayta ochish", tl_cancel: "Bekor qilish", tl_expired: "Kutish vaqti tugadi. «Telegram orqali kirish»ni qayta bosing.",
    tl_new_h: function (n) { return "Telegram tasdiqlandi" + (n ? ": " + n : "") + "."; }, tl_new_p: "Bu Telegram bilan hali hisob yo‘q. Kim sifatida davom etasiz?",
    tl_as_patient: "Bemor sifatida hisob ochish", tl_as_pro: "Men shifokor yoki klinikaman",
    tl_new_reg: "Yuqorida kimligingizni tanlang va majburiy maydonlarni to‘ldiring: parol kerak emas.", tl_reg_btn: "Telegram bilan ro‘yxatdan o‘tish",
    tl_choose: "Bu Telegram bir nechta hisobga ulangan. Qaysi biriga kirasiz?"
  });

  add("ru", {
    tl_btn: "Войти через Telegram", tl_wait_h: "Подтвердите в Telegram",
    tl_wait_p: "Нажмите в боте «Start», затем «📱 Raqamni yuborish va kirish» (отправить номер и войти). После этого эта страница откроется сама.",
    tl_again: "Открыть Telegram ещё раз", tl_cancel: "Отмена", tl_expired: "Время ожидания истекло. Нажмите «Войти через Telegram» ещё раз.",
    tl_new_h: function (n) { return "Telegram подтверждён" + (n ? ": " + n : "") + "."; }, tl_new_p: "С этим Telegram ещё нет аккаунта. Кем вы продолжите?",
    tl_as_patient: "Открыть аккаунт пациента", tl_as_pro: "Я врач или клиника",
    tl_new_reg: "Выберите выше, кто вы, и заполните обязательные поля: пароль не нужен.", tl_reg_btn: "Зарегистрироваться через Telegram",
    tl_choose: "Этот Telegram подключён к нескольким аккаунтам. В какой войти?"
  });

  add("en", {
    tl_btn: "Sign in with Telegram", tl_wait_h: "Confirm in Telegram",
    tl_wait_p: "In the bot, press “Start”, then “📱 Raqamni yuborish va kirish” (send number and sign in). This page then opens by itself.",
    tl_again: "Open Telegram again", tl_cancel: "Cancel", tl_expired: "The wait ran out. Press “Sign in with Telegram” again.",
    tl_new_h: function (n) { return "Telegram confirmed" + (n ? ": " + n : "") + "."; }, tl_new_p: "There’s no account with this Telegram yet. Continue as who?",
    tl_as_patient: "Open a patient account", tl_as_pro: "I’m a doctor or a clinic",
    tl_new_reg: "Choose above who you are and fill in the required fields: no password needed.", tl_reg_btn: "Sign up with Telegram",
    tl_choose: "This Telegram is connected to several accounts. Which one?"
  });
})(window.SHIFOKOR_T);
