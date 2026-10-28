/* Copy for photos in online consultations. */
(function (T) {
  var add = function (lang, o) { Object.keys(o).forEach(function (k) { T[lang][k] = o[k]; }); };

  add("uz", {
    ph_add: "Rasm qo‘shish", ph_alt: "Maslahatdagi rasm", ph_open: "Rasmni kattalashtirish", ph_remove: "Olib tashlash", ph_ready: "Rasm tayyor. Izoh ham yozish mumkin.",
    ph_sending: "Yuborilmoqda…", ph_loading: "Rasm yuklanmoqda…", ph_bad: "Bu rasmni ochib bo‘lmadi. Boshqa rasm tanlang (JPG yoki PNG).", ph_full: "Brauzerda joy qolmadi. Sozlamalarda namunaviy ma’lumotlarni tozalang.",
    ph_form: "Rasmlar (ixtiyoriy)", ph_form_p: function (n) { return "Toshma, yara, tahlil natijasi yoki dori qutisining rasmini qo‘shing, " + n + " tagacha."; },
    ph_privacy: "Rasmni faqat siz va shu maslahat shifokori ko‘radi. Rasmdan joylashuv ma’lumoti olib tashlanadi.",
    ph_some_failed: "Ariza yuborildi, lekin ba’zi rasmlar yuklanmadi. Ularni chatda qayta yuboring.", e_photos: "Bu maslahatga boshqa rasm qo‘shib bo‘lmaydi (20 tagacha)."
  });

  add("ru", {
    ph_add: "Добавить фото", ph_alt: "Фото из консультации", ph_open: "Увеличить фото", ph_remove: "Убрать", ph_ready: "Фото готово. Можно добавить подпись.",
    ph_sending: "Отправляется…", ph_loading: "Фото загружается…", ph_bad: "Не удалось открыть это фото. Выберите другое (JPG или PNG).", ph_full: "В браузере не осталось места. Очистите демо-данные в настройках.",
    ph_form: "Фото (по желанию)", ph_form_p: function (n) { return "Добавьте фото сыпи, раны, результата анализа или упаковки лекарства, до " + n + "."; },
    ph_privacy: "Фото видите только вы и врач этой консультации. Данные о местоположении из фото удаляются.",
    ph_some_failed: "Заявка отправлена, но часть фото не загрузилась. Отправьте их ещё раз в чате.", e_photos: "К этой консультации больше нельзя добавить фото (до 20)."
  });

  add("en", {
    ph_add: "Add a photo", ph_alt: "Consultation photo", ph_open: "Enlarge the photo", ph_remove: "Remove", ph_ready: "Photo ready. You can add a caption.",
    ph_sending: "Sending…", ph_loading: "Loading the photo…", ph_bad: "This photo couldn’t be opened. Choose another one (JPG or PNG).", ph_full: "This browser is out of space. Clear the sample data in Settings.",
    ph_form: "Photos (optional)", ph_form_p: function (n) { return "Add a photo of a rash, a wound, a lab result or a medicine box, up to " + n + "."; },
    ph_privacy: "Only you and this consultation’s doctor can see the photos. Location data is removed from them.",
    ph_some_failed: "The application was sent, but some photos didn’t upload. Send them again in the chat.", e_photos: "No more photos can be added to this consultation (up to 20)."
  });
})(window.SHIFOKOR_T);
