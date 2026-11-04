/* Copy for: a forgotten password, installing the site as an app, licence documents, detailed review ratings,
   and the patient's health record. */
(function (T) {
  var add = function (lang, o) { Object.keys(o).forEach(function (k) { T[lang][k] = o[k]; }); };

  add("uz", {
    ins_h: "Ilova", ins_btn: "Telefonga o‘rnatish", ins_p: "Shifokor telefoningiz ekranida ilova kabi ochiladi.", ins_ios: "Safari’da pastdagi «Ulashish» tugmasini bosing, so‘ng «Bosh ekranga qo‘shish» (Add to Home Screen).", ins_other: "Brauzer menyusidan «Ilovani o‘rnatish» yoki «Bosh ekranga qo‘shish»ni tanlang.", ins_have: "O‘rnatilgan", ins_done: "Shifokor telefoningizga o‘rnatildi.",
    sh_share: "Ulashish", sh_copied: "Havola nusxalandi.", sh_copy: "Havolani nusxalang:",
    fg_e_id: "Telefon raqami (+998 …) yoki emailni to‘g‘ri yozing.",
    fg_link: "Parolni unutdingizmi?", fg_h: "Parolni tiklash", fg_p: "Ro‘yxatdan o‘tgan telefon raqamingiz yoki emailingizni yozing. Sizga 6 xonali kod yuboramiz.",
    fg_send: "Kod yuborish", fg_back: "Kirishga qaytish", fg_other: "Boshqa raqam yoki email",
    fg_sent: function (v) { return "Kod yuborildi: " + v + ". Kodni va yangi parolni kiriting."; }, fg_via: { tg: "Telegram", email: "email", sms: "SMS" },
    fg_none: "Bu hisobga kod yuborib bo‘lmadi: Telegram ulanmagan, email yoki SMS hali ishlamaydi (yoki bunday hisob yo‘q). Bizga Telegram yoki telefon orqali yozing: administrator sizga parolni tiklash havolasini beradi.",
    fg_new: "Yangi parol", fg_save: "Parolni saqlash va kirish", fg_wait: "Kod hozirgina yuborildi. Bir daqiqadan so‘ng qayta urinib ko‘ring.",
    fg_done: "Parol yangilandi. Boshqa qurilmalardagi kirishlar yopildi.", fg_bad_link: "Havola eskirgan yoki ishlatilgan. Yangi havola so‘rang.",
    fg_link_p: function (n) { return n + ", yangi parol o‘rnating."; },
    fg_adm_h: "Parolni tiklash havolasi", fg_adm_p: "Kod ololmagan foydalanuvchi uchun (bemorlar ham). Havola 3 kun amal qiladi; uni faqat egasiga bering.",
    fg_adm_btn: "Havola yaratish", fg_adm_made: "Havola tayyor:", fg_adm_none: "Bu telefon yoki email bilan hisob topilmadi."
  });

  add("ru", {
    ins_h: "Приложение", ins_btn: "Установить на телефон", ins_p: "Shifokor будет открываться с экрана телефона как приложение.", ins_ios: "В Safari нажмите «Поделиться» внизу, затем «На экран «Домой»».", ins_other: "В меню браузера выберите «Установить приложение» или «Добавить на главный экран».", ins_have: "Установлено", ins_done: "Shifokor установлен на телефон.",
    sh_share: "Поделиться", sh_copied: "Ссылка скопирована.", sh_copy: "Скопируйте ссылку:",
    fg_e_id: "Укажите телефон (+998 …) или email правильно.",
    fg_link: "Забыли пароль?", fg_h: "Восстановление пароля", fg_p: "Укажите телефон или email, с которым вы регистрировались. Мы пришлём 6-значный код.",
    fg_send: "Отправить код", fg_back: "Вернуться ко входу", fg_other: "Другой номер или email",
    fg_sent: function (v) { return "Код отправлен: " + v + ". Введите код и новый пароль."; }, fg_via: { tg: "Telegram", email: "email", sms: "SMS" },
    fg_none: "Не удалось отправить код: Telegram не подключён, email и SMS пока не работают (или такого аккаунта нет). Напишите нам в Telegram или позвоните: администратор пришлёт ссылку для смены пароля.",
    fg_new: "Новый пароль", fg_save: "Сохранить пароль и войти", fg_wait: "Код только что отправлен. Попробуйте через минуту.",
    fg_done: "Пароль обновлён. Входы на других устройствах закрыты.", fg_bad_link: "Ссылка устарела или уже использована. Запросите новую.",
    fg_link_p: function (n) { return n + ", задайте новый пароль."; },
    fg_adm_h: "Ссылка для смены пароля", fg_adm_p: "Для пользователя, который не может получить код (включая пациентов). Ссылка действует 3 дня; отдавайте её только владельцу.",
    fg_adm_btn: "Создать ссылку", fg_adm_made: "Ссылка готова:", fg_adm_none: "Аккаунт с таким телефоном или email не найден."
  });

  add("en", {
    ins_h: "App", ins_btn: "Install on this phone", ins_p: "Shifokor opens from your home screen like an app.", ins_ios: "In Safari, tap Share at the bottom, then “Add to Home Screen”.", ins_other: "In your browser menu, choose “Install app” or “Add to Home screen”.", ins_have: "Installed", ins_done: "Shifokor is installed on your phone.",
    sh_share: "Share", sh_copied: "Link copied.", sh_copy: "Copy the link:",
    fg_e_id: "Enter a valid phone number (+998 …) or email.",
    fg_link: "Forgot your password?", fg_h: "Reset your password", fg_p: "Enter the phone number or email you registered with. We'll send you a 6-digit code.",
    fg_send: "Send code", fg_back: "Back to sign in", fg_other: "Another number or email",
    fg_sent: function (v) { return "Code sent by " + v + ". Enter the code and a new password."; }, fg_via: { tg: "Telegram", email: "email", sms: "SMS" },
    fg_none: "We couldn't send a code: Telegram isn't linked, and email and SMS aren't on yet (or there's no such account). Message or call us: an admin will send you a link to set a new password.",
    fg_new: "New password", fg_save: "Save password and sign in", fg_wait: "A code was just sent. Try again in a minute.",
    fg_done: "Password updated. Sign-ins on other devices were closed.", fg_bad_link: "This link has expired or was used. Ask for a new one.",
    fg_link_p: function (n) { return n + ", set a new password."; },
    fg_adm_h: "Password reset link", fg_adm_p: "For someone who can't get a code (patients too). The link works for 3 days; give it only to the account's owner.",
    fg_adm_btn: "Make link", fg_adm_made: "Link ready:", fg_adm_none: "No account with that phone or email."
  });
})(window.SHIFOKOR_T);
