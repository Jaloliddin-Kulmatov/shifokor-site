/* Copy for voice messages, calls either side can start, sign-in prompts and the home search filters. */
(function (T) {
  var add = function (lang, o) { Object.keys(o).forEach(function (k) { T[lang][k] = o[k]; }); };

  add("uz", {
    vo_btn: "Ovozli xabar yozish", vo_rec: "Yozilmoqda… (2 daqiqagacha)", vo_stop: "To‘xtatish", vo_send: "Yuborish", vo_del: "O‘chirish",
    vo_unsup: "Bu brauzer ovoz yozishni qo‘llamaydi. Chrome yoki Safari’ning yangi versiyasini oching.", vo_denied: "Mikrofonga ruxsat bering va qayta urinib ko‘ring.", vo_long: "Ovozli xabar juda uzun. 2 daqiqadan qisqa yozing.",
    cl_call_doc: function (v) { return v ? "Shifokorga video qo‘ng‘iroq" : "Shifokorga qo‘ng‘iroq qilish"; }, cl_pat_ringing: "Bemor qo‘ng‘iroq qilmoqda", cl_answer: "Javob berish",
    cl_call_audio: "Audio qo‘ng‘iroq", cl_pat_msg: "Bemor qo‘ng‘iroq qildi.", cl_pat_toast: function (n) { return "Bemor qo‘ng‘iroq qilmoqda (ariza №" + n + ")"; },
    hf_rated: "Eng yaxshi baholanganlar",
    ag_h: "Ariza yuborish uchun hisobingizga kiring", ag_p: "Bir daqiqada ro‘yxatdan o‘tasiz. Kiritgan ma’lumotlaringiz saqlanib qoladi va kirgandan keyin shu yerga qaytasiz."
  });

  add("ru", {
    vo_btn: "Записать голосовое", vo_rec: "Идёт запись… (до 2 минут)", vo_stop: "Остановить", vo_send: "Отправить", vo_del: "Удалить",
    vo_unsup: "Этот браузер не умеет записывать звук. Откройте свежую версию Chrome или Safari.", vo_denied: "Разрешите доступ к микрофону и попробуйте снова.", vo_long: "Голосовое слишком длинное. Запишите короче 2 минут.",
    cl_call_doc: function (v) { return v ? "Видеозвонок врачу" : "Позвонить врачу"; }, cl_pat_ringing: "Пациент звонит", cl_answer: "Ответить",
    cl_call_audio: "Аудиозвонок", cl_pat_msg: "Пациент позвонил.", cl_pat_toast: function (n) { return "Звонит пациент (заявка №" + n + ")"; },
    hf_rated: "С лучшими оценками",
    ag_h: "Войдите, чтобы отправить заявку", ag_p: "Регистрация занимает минуту. Введённые данные сохранятся, а после входа вы вернётесь сюда."
  });

  add("en", {
    vo_btn: "Record a voice message", vo_rec: "Recording… (up to 2 minutes)", vo_stop: "Stop", vo_send: "Send", vo_del: "Delete",
    vo_unsup: "This browser can’t record sound. Open a recent Chrome or Safari.", vo_denied: "Allow the microphone and try again.", vo_long: "The voice message is too long. Keep it under 2 minutes.",
    cl_call_doc: function (v) { return v ? "Video call the doctor" : "Call the doctor"; }, cl_pat_ringing: "The patient is calling", cl_answer: "Answer",
    cl_call_audio: "Audio call", cl_pat_msg: "The patient called.", cl_pat_toast: function (n) { return "A patient is calling (application №" + n + ")"; },
    hf_rated: "Top rated",
    ag_h: "Sign in to send your request", ag_p: "Registering takes a minute. What you typed stays here, and you come back to this page after signing in."
  });
})(window.SHIFOKOR_T);
