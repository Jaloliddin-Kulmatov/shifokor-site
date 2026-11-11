/* Copy for "Sign in with Google". */
(function (T) {
  var add = function (lang, o) { Object.keys(o).forEach(function (k) { T[lang][k] = o[k]; }); };

  add("uz", {
    g_or: "yoki", g_reg_note: "Avval yuqorida kimligingizni tanlang. Shifokor yoki klinika bo‘lsangiz, majburiy maydonlarni ham to‘ldiring: parol kerak bo‘lmaydi.",
    g_new: "Bu Google hisobi bilan hali ro‘yxatdan o‘tilmagan. Ro‘yxatdan o‘tish sahifasida kimligingizni tanlang va Google tugmasini bosing.",
    g_exists: "Bu email bilan hisob allaqachon bor. Avval email va parol bilan kiring, keyin «Kabinet»da Google’ni ulang.",
    g_taken: "Bu Google hisobi boshqa Shifokor hisobiga ulangan.", g_only: "Hisobingizga faqat Google orqali kirasiz. Uzishdan oldin «Parolni unutdingizmi?» orqali parol o‘rnating.",
    g_bad: "Google orqali kirib bo‘lmadi. Qaytadan urinib ko‘ring.", g_unavailable: "Google orqali kirish hozir ishlamayapti. Email yoki telefon bilan kiring.",
    g_inapp: "Telegram yoki Instagram ichida Google bilan kirish ishlamasligi mumkin: saytni Chrome yoki Safari’da oching.",
    g_need_clinic: "Klinika nomini yozing.", g_h: "Google bilan kirish", g_on: "Google ulangan", g_unlink: "Google’ni uzish", g_unlinked: "Google uzildi.",
    g_link_p: "Google hisobingizni ulang: keyin parolsiz, bitta tugma bilan kirasiz.", g_linked: "Google ulandi. Endi Google bilan kirishingiz mumkin."
  });

  add("ru", {
    g_or: "или", g_reg_note: "Сначала выберите выше, кто вы. Если вы врач или клиника, заполните и обязательные поля: пароль не нужен.",
    g_new: "С этим аккаунтом Google ещё не регистрировались. На странице регистрации выберите, кто вы, и нажмите кнопку Google.",
    g_exists: "Аккаунт с этим email уже есть. Сначала войдите по email и паролю, затем подключите Google в «Кабинете».",
    g_taken: "Этот аккаунт Google уже подключён к другому аккаунту Shifokor.", g_only: "Вы входите только через Google. Перед отключением задайте пароль через «Забыли пароль?».",
    g_bad: "Не удалось войти через Google. Попробуйте ещё раз.", g_unavailable: "Вход через Google сейчас не работает. Войдите по email или телефону.",
    g_inapp: "Внутри Telegram или Instagram вход через Google может не работать: откройте сайт в Chrome или Safari.",
    g_need_clinic: "Укажите название клиники.", g_h: "Вход через Google", g_on: "Google подключён", g_unlink: "Отключить Google", g_unlinked: "Google отключён.",
    g_link_p: "Подключите аккаунт Google: потом вы будете входить без пароля, одной кнопкой.", g_linked: "Google подключён. Теперь можно входить через Google."
  });

  add("en", {
    g_or: "or", g_reg_note: "First choose above who you are. Doctors and clinics also fill in the required fields: no password needed.",
    g_new: "No one has signed up with this Google account yet. On the sign-up page, choose who you are and press the Google button.",
    g_exists: "An account with this email already exists. Sign in with your email and password first, then connect Google in your account.",
    g_taken: "This Google account is already connected to another Shifokor account.", g_only: "You sign in only with Google. Before disconnecting it, set a password with “Forgot password?”.",
    g_bad: "Couldn’t sign in with Google. Please try again.", g_unavailable: "Signing in with Google isn’t working right now. Use your email or phone.",
    g_inapp: "Google sign-in may not work inside Telegram or Instagram: open the site in Chrome or Safari.",
    g_need_clinic: "Enter the clinic’s name.", g_h: "Sign in with Google", g_on: "Google connected", g_unlink: "Disconnect Google", g_unlinked: "Google disconnected.",
    g_link_p: "Connect your Google account to sign in with one button, without a password.", g_linked: "Google connected. You can now sign in with Google."
  });
})(window.SHIFOKOR_T);
