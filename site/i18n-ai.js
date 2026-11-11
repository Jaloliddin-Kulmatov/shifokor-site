/* Copy for Shifo_AI, the floating helper in the bottom-right corner. */
(function (T) {
  var add = function (lang, o) { Object.keys(o).forEach(function (k) { T[lang][k] = o[k]; }); };

  add("uz", {
    ai_sub: "Qaysi shifokor kerakligini topib beraman", ai_close: "Yopish", ai_new: "Yangi suhbat",
    ai_hello: "Salom! Men Shifo_AI. Nima bezovta qilayotganini oddiy so‘zlar bilan yozing, sizga mos shifokorni topib beraman.",
    ai_label: "Muammongizni yozing", ai_ph: "Masalan: bolamda yo‘tal va isitma bor", ai_send: "Yuborish", ai_wait: "Javob tayyorlanmoqda…",
    ai_tries: ["Bolamda yo‘tal va isitma bor", "Tishim qattiq og‘riyapti", "Qon tahlili natijasini tushunmayapman", "Uyqum yo‘q, doim xavotirdaman"],
    ai_note: "Shifo_AI shifokor emas: tashxis qo‘ymaydi va dori yozmaydi. Ism va telefon yozmang. Matn javob uchun Groq AI xizmatiga yuboriladi, Shifokor uni saqlamaydi.", ai_em_short: "Shoshilinch holatda: 103",
    ai_em: "Bu shoshilinch holat bo‘lishi mumkin. Maslahatni kutmang, hoziroq 103 raqamiga qo‘ng‘iroq qiling.", ai_em_note: "Tez yordam chaqiring.",
    ai_found: function (s) { return "Sizga mos mutaxassis: " + s; }, ai_ask: "Ariza yuborish", ai_all: "Barcha shifokorlar", ai_clinics: "Yaqin klinikalar",
    ai_local: function (s) { return "AI hozir ishlamayapti, shuning uchun so‘zlaringiz bo‘yicha qidirdim. Mos mutaxassis: " + s + "."; }, ai_local_none: "AI hozir ishlamayapti va so‘zlaringiz bo‘yicha mutaxassisni aniqlay olmadim. Oila shifokoridan boshlang.",
    ai_limit: "Bugungi savollar soni tugadi. Ertaga qayta urinib ko‘ring yoki shifokorni o‘zingiz tanlang."
  });

  add("ru", {
    ai_sub: "Подскажу, какой врач вам нужен", ai_close: "Закрыть", ai_new: "Новый разговор",
    ai_hello: "Здравствуйте! Я Shifo_AI. Напишите простыми словами, что беспокоит, и я подберу подходящего врача.",
    ai_label: "Опишите проблему", ai_ph: "Например: у ребёнка кашель и температура", ai_send: "Отправить", ai_wait: "Готовлю ответ…",
    ai_tries: ["У ребёнка кашель и температура", "Сильно болит зуб", "Не понимаю результат анализа крови", "Плохо сплю, постоянная тревога"],
    ai_note: "Shifo_AI не врач: не ставит диагноз и не назначает лекарства. Не пишите имя и телефон. Текст отправляется в сервис Groq AI для ответа, Shifokor его не хранит.", ai_em_short: "Срочно: 103",
    ai_em: "Это может быть срочный случай. Не ждите консультации, позвоните 103 прямо сейчас.", ai_em_note: "Вызовите скорую помощь.",
    ai_found: function (s) { return "Подходящий специалист: " + s; }, ai_ask: "Отправить заявку", ai_all: "Все врачи", ai_clinics: "Клиники рядом",
    ai_local: function (s) { return "AI сейчас не работает, поэтому я искал по вашим словам. Подходящий специалист: " + s + "."; }, ai_local_none: "AI сейчас не работает, и по вашим словам я не смог определить специалиста. Начните с семейного врача.",
    ai_limit: "Лимит вопросов на сегодня исчерпан. Попробуйте завтра или выберите врача сами."
  });

  add("en", {
    ai_sub: "I'll help you find the right doctor", ai_close: "Close", ai_new: "New conversation",
    ai_hello: "Hello! I'm Shifo_AI. Tell me in plain words what's bothering you, and I'll find the right doctor.",
    ai_label: "Describe the problem", ai_ph: "e.g. my child has a cough and fever", ai_send: "Send", ai_wait: "Preparing an answer…",
    ai_tries: ["My child has a cough and fever", "I have a bad toothache", "I don't understand my blood test", "I can't sleep and feel anxious"],
    ai_note: "Shifo_AI isn't a doctor: it doesn't diagnose or prescribe. Don't write your name or phone number. Your text goes to the Groq AI service for an answer, and Shifokor doesn't store it.", ai_em_short: "Emergency: 103",
    ai_em: "This could be an emergency. Don't wait for a consultation, call 103 now.", ai_em_note: "Call an ambulance.",
    ai_found: function (s) { return "The right specialist for you: " + s; }, ai_ask: "Send an application", ai_all: "All doctors", ai_clinics: "Clinics nearby",
    ai_local: function (s) { return "The AI isn't working right now, so I searched by your words. The right specialist: " + s + "."; }, ai_local_none: "The AI isn't working right now, and I couldn't tell the specialist from your words. Start with a family doctor.",
    ai_limit: "You've reached today's question limit. Try again tomorrow, or choose a doctor yourself."
  });
})(window.SHIFOKOR_T);
