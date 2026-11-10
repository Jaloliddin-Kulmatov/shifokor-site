/* Copy for the AI assistant (#/ai and the home page). */
(function (T) {
  var add = function (lang, o) { Object.keys(o).forEach(function (k) { T[lang][k] = o[k]; }); };

  add("uz", {
    ai_nav: "AI yordamchi", ai_h: "Qaysi shifokor kerakligini bilmaysizmi?", ai_p: "Muammongizni o‘z so‘zlaringiz bilan yozing. AI yordamchi mos shifokor va xizmatni topib beradi.",
    ai_home_h: "Qaysi shifokor kerak? AI yordamchidan so‘rang", ai_home_p: "Nima bezovta qilayotganini oddiy so‘zlar bilan yozing. Mos mutaxassis va shifokorlarni ko‘rsatamiz.",
    ai_label: "Muammongizni yozing", ai_ph: "masalan: bolamda ikki kundan beri yo‘tal va isitma bor", ai_send: "Shifokor topish", ai_wait: "Javob tayyorlanmoqda…", ai_new: "Yangi suhbat",
    ai_try: "Masalan, shunday yozing:", ai_tries: ["Bolamda yo‘tal va isitma bor", "Tishim qattiq og‘riyapti", "Qon tahlili natijasini tushunmayapman", "Uyqum yo‘q, doim xavotirdaman"],
    ai_note: "AI shifokor emas, tashxis qo‘ymaydi va dori yozmaydi. Ism yoki telefon yozmang. Matn javob olish uchun Groq AI xizmatiga yuboriladi, Shifokor uni saqlamaydi.",
    ai_em: "Bu shoshilinch holat bo‘lishi mumkin. Maslahatni kutmang, hoziroq 103 raqamiga qo‘ng‘iroq qiling.", ai_em_note: "Shoshilinch yordam: tez yordam chaqiring.",
    ai_found: function (s) { return "Sizga mos mutaxassis: " + s; }, ai_ask: "Ariza yuborish", ai_all: "Barcha shifokorlar", ai_clinics: "Yaqin klinikalar",
    ai_local: function (s) { return "AI hozir ishlamayapti, shuning uchun so‘zlaringiz bo‘yicha qidirdik. Mos mutaxassis: " + s + "."; }, ai_local_none: "AI hozir ishlamayapti va so‘zlaringiz bo‘yicha mutaxassisni aniqlay olmadik. Oila shifokoridan boshlang.",
    ai_limit: "Bugungi savollar soni tugadi. Ertaga qayta urinib ko‘ring yoki shifokorni o‘zingiz tanlang."
  });

  add("ru", {
    ai_nav: "AI-помощник", ai_h: "Не знаете, какой врач нужен?", ai_p: "Опишите проблему своими словами. AI-помощник подберёт подходящего врача и услугу.",
    ai_home_h: "Какой врач нужен? Спросите AI-помощника", ai_home_p: "Напишите простыми словами, что беспокоит. Мы покажем подходящего специалиста и врачей.",
    ai_label: "Опишите проблему", ai_ph: "например: у ребёнка два дня кашель и температура", ai_send: "Найти врача", ai_wait: "Готовим ответ…", ai_new: "Новый разговор",
    ai_try: "Например, напишите:", ai_tries: ["У ребёнка кашель и температура", "Сильно болит зуб", "Не понимаю результат анализа крови", "Плохо сплю, постоянная тревога"],
    ai_note: "AI не врач: он не ставит диагноз и не назначает лекарства. Не пишите имя и телефон. Текст отправляется в сервис Groq AI для ответа, Shifokor его не хранит.",
    ai_em: "Это может быть срочный случай. Не ждите консультации, позвоните 103 прямо сейчас.", ai_em_note: "Срочная помощь: вызовите скорую.",
    ai_found: function (s) { return "Подходящий специалист: " + s; }, ai_ask: "Отправить заявку", ai_all: "Все врачи", ai_clinics: "Клиники рядом",
    ai_local: function (s) { return "AI сейчас не работает, поэтому мы искали по вашим словам. Подходящий специалист: " + s + "."; }, ai_local_none: "AI сейчас не работает, и по вашим словам не удалось определить специалиста. Начните с семейного врача.",
    ai_limit: "Лимит вопросов на сегодня исчерпан. Попробуйте завтра или выберите врача сами."
  });

  add("en", {
    ai_nav: "AI assistant", ai_h: "Not sure which doctor you need?", ai_p: "Describe the problem in your own words. The AI assistant finds the right doctor and service.",
    ai_home_h: "Which doctor do you need? Ask the AI assistant", ai_home_p: "Write what's bothering you in plain words. We'll show the right specialist and doctors.",
    ai_label: "Describe the problem", ai_ph: "e.g. my child has had a cough and fever for two days", ai_send: "Find a doctor", ai_wait: "Preparing an answer…", ai_new: "New conversation",
    ai_try: "For example, write:", ai_tries: ["My child has a cough and fever", "I have a bad toothache", "I don't understand my blood test", "I can't sleep and feel anxious"],
    ai_note: "The AI isn't a doctor: it doesn't diagnose or prescribe. Don't write your name or phone number. Your text goes to the Groq AI service to get an answer, and Shifokor doesn't store it.",
    ai_em: "This could be an emergency. Don't wait for a consultation, call 103 now.", ai_em_note: "Emergency help: call an ambulance.",
    ai_found: function (s) { return "The right specialist for you: " + s; }, ai_ask: "Send an application", ai_all: "All doctors", ai_clinics: "Clinics nearby",
    ai_local: function (s) { return "The AI isn't working right now, so we searched by your words. The right specialist: " + s + "."; }, ai_local_none: "The AI isn't working right now, and we couldn't tell the specialist from your words. Start with a family doctor.",
    ai_limit: "You've reached today's question limit. Try again tomorrow, or choose a doctor yourself."
  });
})(window.SHIFOKOR_T);
