/* Copy for audio and video calls in an online consultation. */
(function (T) {
  var add = function (lang, o) { Object.keys(o).forEach(function (k) { T[lang][k] = o[k]; }); };

  add("uz", {
    cl_wait_doc: "Bemor kutilmoqda. U qo‘shilishi bilan qo‘ng‘iroq ulanadi.", cl_wait_pat: "Shifokor kutilmoqda. U qo‘shilishi bilan qo‘ng‘iroq ulanadi.",
    cl_connecting: "Ulanmoqda…", cl_on: "Ulandi", cl_weak: "Aloqa uzildi. Qayta ulanmoqda…", cl_weak_v: "Aloqa uzildi. Qayta ulanmoqda… Internet sust bo‘lsa, kamerani o‘chiring: ovoz yaxshiroq eshitiladi.",
    cl_left: "Suhbatdosh qo‘ng‘iroqdan chiqdi. U qaytsa, qo‘ng‘iroq o‘zi ulanadi.", cl_fail: "Ulanib bo‘lmayapti. Internetni tekshiring yoki Wi‑Fi’ga ulaning. Chatda yozishingiz ham mumkin.",
    cl_closed: "Maslahat yakunlangan, qo‘ng‘iroq yopildi.", cl_asking: "Brauzer ruxsat so‘rasa, «Ruxsat berish» tugmasini bosing.",
    cl_denied: "Mikrofonga ruxsat berilmadi. Manzil satridagi qulf belgisini bosing, mikrofonga ruxsat bering va «Qayta urinish»ni bosing.",
    cl_denied_v: "Kamera yoki mikrofonga ruxsat berilmadi. Manzil satridagi qulf belgisini bosing, kamera va mikrofonga ruxsat bering va «Qayta urinish»ni bosing.",
    cl_nodev: "Mikrofon topilmadi. Mikrofonli telefon yoki kompyuterdan kiring yoki chatda yozing.", cl_nocam: "Kamera topilmadi yoki band. Qo‘ng‘iroq faqat ovoz bilan davom etadi.",
    cl_unsup: "Bu brauzerda qo‘ng‘iroq ishlamaydi. Chrome, Safari yoki Firefox’ning yangi versiyasini oching.", cl_retry: "Qayta urinish",
    cl_mic_off: "Mikrofonni o‘chirish", cl_mic_on: "Mikrofonni yoqish", cl_cam_off: "Kamerani o‘chirish", cl_cam_on: "Kamerani yoqish", cl_flip: "Old yoki orqa kamera",
    cl_end: "Qo‘ng‘iroqni tugatish", cl_mini: "Chatga qaytish (qo‘ng‘iroq davom etadi)", cl_full: "Qo‘ng‘iroqni kattalashtirish",
    cl_their_mic: "Suhbatdosh mikrofonini o‘chirgan", cl_their_cam: "Suhbatdosh kamerasini o‘chirgan", cl_tap: "Ovozni yoqish uchun bosing",
    cl_note: "Qo‘ng‘iroq ikki brauzer o‘rtasida shifrlangan holda o‘tadi va yozib olinmaydi.", cl_demo: "Demo: qo‘ng‘iroqni shu brauzerning ikkinchi oynasida sinab ko‘ring.",
    cl_ended: function (d) { return "Qo‘ng‘iroq tugadi · " + d; }, cl_ringing: "Shifokor hozir qo‘ng‘iroq qilmoqda",
    cl_ring_toast: function (n) { return "Shifokor qo‘ng‘iroq qilmoqda (ariza №" + n + "). «Qabullarim» bo‘limidan qo‘shiling."; }, e_slow: "Juda ko‘p urinish. Bir daqiqadan keyin qayta urinib ko‘ring."
  });

  add("ru", {
    cl_wait_doc: "Ждём пациента. Звонок соединится, как только он подключится.", cl_wait_pat: "Ждём врача. Звонок соединится, как только он подключится.",
    cl_connecting: "Соединение…", cl_on: "Соединено", cl_weak: "Связь прервалась. Переподключаемся…", cl_weak_v: "Связь прервалась. Переподключаемся… Если интернет слабый, выключите камеру: звук станет лучше.",
    cl_left: "Собеседник вышел из звонка. Когда он вернётся, звонок соединится сам.", cl_fail: "Не удаётся соединиться. Проверьте интернет или подключитесь к Wi‑Fi. Можно также написать в чате.",
    cl_closed: "Консультация завершена, звонок закрыт.", cl_asking: "Если браузер спросит разрешение, нажмите «Разрешить».",
    cl_denied: "Нет доступа к микрофону. Нажмите на значок замка в адресной строке, разрешите микрофон и нажмите «Повторить».",
    cl_denied_v: "Нет доступа к камере или микрофону. Нажмите на значок замка в адресной строке, разрешите камеру и микрофон и нажмите «Повторить».",
    cl_nodev: "Микрофон не найден. Зайдите с телефона или компьютера с микрофоном или напишите в чате.", cl_nocam: "Камера не найдена или занята. Звонок продолжится только со звуком.",
    cl_unsup: "В этом браузере звонки не работают. Откройте новую версию Chrome, Safari или Firefox.", cl_retry: "Повторить",
    cl_mic_off: "Выключить микрофон", cl_mic_on: "Включить микрофон", cl_cam_off: "Выключить камеру", cl_cam_on: "Включить камеру", cl_flip: "Передняя или задняя камера",
    cl_end: "Завершить звонок", cl_mini: "Вернуться в чат (звонок продолжится)", cl_full: "Развернуть звонок",
    cl_their_mic: "Собеседник выключил микрофон", cl_their_cam: "Собеседник выключил камеру", cl_tap: "Нажмите, чтобы включить звук",
    cl_note: "Звонок идёт напрямую между двумя браузерами, зашифрован и не записывается.", cl_demo: "Демо: попробуйте звонок во второй вкладке этого браузера.",
    cl_ended: function (d) { return "Звонок завершён · " + d; }, cl_ringing: "Врач звонит вам сейчас",
    cl_ring_toast: function (n) { return "Врач звонит (заявка №" + n + "). Подключитесь в разделе «Мои визиты»."; }, e_slow: "Слишком много попыток. Попробуйте через минуту."
  });

  add("en", {
    cl_wait_doc: "Waiting for the patient. The call connects as soon as they join.", cl_wait_pat: "Waiting for the doctor. The call connects as soon as they join.",
    cl_connecting: "Connecting…", cl_on: "Connected", cl_weak: "Connection lost. Reconnecting…", cl_weak_v: "Connection lost. Reconnecting… On weak internet, turn your camera off: the sound gets better.",
    cl_left: "The other person left the call. When they come back, the call reconnects by itself.", cl_fail: "Can’t connect. Check your internet or switch to Wi‑Fi. You can also write in the chat.",
    cl_closed: "The consultation is finished, so the call is closed.", cl_asking: "If the browser asks for permission, press “Allow”.",
    cl_denied: "No access to the microphone. Press the lock icon in the address bar, allow the microphone, then press “Try again”.",
    cl_denied_v: "No access to the camera or microphone. Press the lock icon in the address bar, allow the camera and microphone, then press “Try again”.",
    cl_nodev: "No microphone found. Use a phone or computer with a microphone, or write in the chat.", cl_nocam: "No camera found, or it’s busy. The call goes on with sound only.",
    cl_unsup: "Calls don’t work in this browser. Open a recent Chrome, Safari or Firefox.", cl_retry: "Try again",
    cl_mic_off: "Mute microphone", cl_mic_on: "Unmute microphone", cl_cam_off: "Turn camera off", cl_cam_on: "Turn camera on", cl_flip: "Front or back camera",
    cl_end: "End call", cl_mini: "Back to the chat (the call goes on)", cl_full: "Open the call",
    cl_their_mic: "The other person muted their microphone", cl_their_cam: "The other person turned their camera off", cl_tap: "Tap to turn the sound on",
    cl_note: "The call goes directly between the two browsers, encrypted, and isn’t recorded.", cl_demo: "Demo: try the call in a second tab of this browser.",
    cl_ended: function (d) { return "Call ended · " + d; }, cl_ringing: "The doctor is calling you now",
    cl_ring_toast: function (n) { return "The doctor is calling (application №" + n + "). Join from “My visits”."; }, e_slow: "Too many tries. Try again in a minute."
  });
})(window.SHIFOKOR_T);
