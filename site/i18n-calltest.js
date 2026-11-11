/* Copy for the test call page (#/calltest). Short on purpose. */
(function (T) {
  var add = function (lang, o) { Object.keys(o).forEach(function (k) { T[lang][k] = o[k]; }); };
  var WHY = { uz: { url: "LIVEKIT_URL noto‘g‘ri (wss://….livekit.cloud bo‘lishi kerak)", keys: "kalitda ortiqcha belgilar bor, qayta nusxalang", key: "kalitlar noto‘g‘ri", unreachable: "server javob bermadi", net: "tekshirib bo‘lmadi" }, ru: { url: "неверный LIVEKIT_URL (нужен wss://….livekit.cloud)", keys: "в ключах лишние символы, скопируйте заново", key: "неверные ключи", unreachable: "сервер не отвечает", net: "не удалось проверить" }, en: { url: "LIVEKIT_URL is wrong (should be wss://….livekit.cloud)", keys: "the keys have stray characters, copy them again", key: "wrong keys", unreachable: "server didn't answer", net: "couldn't check" } };
  var why = function (l, w) { return WHY[l][w] || w || ""; };

  add("uz", {
    ct_eyebrow: "Video qo‘ng‘iroq", ct_h: "Video qo‘ng‘iroqni sinash", ct_p: "Ikki qurilmada kamera va ovozni tekshiring.",
    ct_checking: "Tekshirilmoqda…", ct_ok: "Video qo‘ng‘iroq tayyor.", ct_off: "Video qo‘ng‘iroq hali sozlanmagan (LiveKit).",
    ct_bad: function (w) { return "Video qo‘ng‘iroq ishlamayapti: " + why("uz", w) + "."; },
    ct_demo: "Buni shifokor.com saytida sinang.",
    ct_login: "Sinash uchun hisobga kiring.", ct_new_h: "Sinov xonasi", ct_new_p: "Xona oching va havolani ikkinchi telefonga yuboring.", ct_new: "Xona ochish",
    ct_room: function (c) { return "Xona " + c; }, ct_share: "Havolani ikkinchi telefonda oching.",
    ct_copy: "Nusxalash", ct_copied: "Nusxalandi.", ct_join_v: "Kirish (video)", ct_join_a: "Faqat ovoz", ct_peer: "Ikkinchi telefon", ct_wait: "Ikkinchi telefon kutilmoqda…",
    ct_limit: "Bugungi limit tugadi. Ertaga urinib ko‘ring.",
    ct_how: "Qanday sinash", ct_steps: ["“Xona ochish”ni bosing.", "Havolani ikkinchi telefonga yuboring.", "Ikkalasida “Kirish”ni bosing va kameraga ruxsat bering.", "Bir-biringizni ko‘rsangiz, hammasi ishlayapti."],
    ct_row: "Video qo‘ng‘iroqni sinash", ct_row_btn: "Sinash", ct_row_p: ""
  });

  add("ru", {
    ct_eyebrow: "Видеозвонок", ct_h: "Проверка видеозвонка", ct_p: "Проверьте камеру и звук на двух устройствах.",
    ct_checking: "Проверяем…", ct_ok: "Видеозвонок готов.", ct_off: "Видеозвонок ещё не настроен (LiveKit).",
    ct_bad: function (w) { return "Видеозвонок не работает: " + why("ru", w) + "."; },
    ct_demo: "Проверьте это на shifokor.com.",
    ct_login: "Войдите, чтобы проверить.", ct_new_h: "Тестовая комната", ct_new_p: "Откройте комнату и отправьте ссылку на второй телефон.", ct_new: "Открыть комнату",
    ct_room: function (c) { return "Комната " + c; }, ct_share: "Откройте ссылку на втором телефоне.",
    ct_copy: "Копировать", ct_copied: "Скопировано.", ct_join_v: "Войти (видео)", ct_join_a: "Только звук", ct_peer: "Второй телефон", ct_wait: "Ждём второй телефон…",
    ct_limit: "Лимит на сегодня исчерпан. Попробуйте завтра.",
    ct_how: "Как проверить", ct_steps: ["Нажмите «Открыть комнату».", "Отправьте ссылку на второй телефон.", "На обоих нажмите «Войти» и разрешите камеру.", "Если видите друг друга, всё работает."],
    ct_row: "Проверка видеозвонка", ct_row_btn: "Проверить", ct_row_p: ""
  });

  add("en", {
    ct_eyebrow: "Video call", ct_h: "Test a video call", ct_p: "Check the camera and sound on two devices.",
    ct_checking: "Checking…", ct_ok: "Video calls are ready.", ct_off: "Video calls aren't set up yet (LiveKit).",
    ct_bad: function (w) { return "Video calls aren't working: " + why("en", w) + "."; },
    ct_demo: "Test this on shifokor.com.",
    ct_login: "Sign in to test.", ct_new_h: "Test room", ct_new_p: "Open a room and send the link to a second phone.", ct_new: "Open a room",
    ct_room: function (c) { return "Room " + c; }, ct_share: "Open the link on the second phone.",
    ct_copy: "Copy", ct_copied: "Copied.", ct_join_v: "Join (video)", ct_join_a: "Audio only", ct_peer: "Second phone", ct_wait: "Waiting for the second phone…",
    ct_limit: "Today's limit is used up. Try tomorrow.",
    ct_how: "How to test", ct_steps: ["Press “Open a room”.", "Send the link to a second phone.", "Press “Join” on both and allow the camera.", "If you see each other, it works."],
    ct_row: "Test a video call", ct_row_btn: "Test", ct_row_p: ""
  });
})(window.SHIFOKOR_T);
