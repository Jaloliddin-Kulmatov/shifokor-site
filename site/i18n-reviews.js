/* Copy for patient reviews: only patients with a finished consultation or a visit can rate. */
(function (T) {
  var add = function (lang, o) { Object.keys(o).forEach(function (k) { T[lang][k] = o[k]; }); };

  add("uz", {
    rv_h: "Bemorlar sharhlari", rv_none: "Hali sharh yo‘q.", rv_n: function (n) { return n + " ta sharh"; },
    rv_only: "Sharhni faqat shu shifokor bilan maslahati tugagan yoki qabulida bo‘lgan bemorlar yoza oladi.",
    rv_ask_h: "Shifokorni baholang", rv_ask_h_c: "Klinikani baholang", rv_ask_p: "Sharhingiz boshqa bemorlarga yaxshi shifokor tanlashga yordam beradi.",
    rv_stars: "Baho", rv_star_l: function (n) { return n + " yulduz"; }, rv_body: "Fikringiz (ixtiyoriy)", rv_body_ph: "Nimasi yoqdi yoki yoqmadi? Tashxis va shaxsiy ma’lumotlarni yozmang.",
    rv_anon: "Ismimni ko‘rsatmang", rv_send: "Sharh yuborish", rv_err_stars: "Yulduzchalar bilan baho bering.", rv_thanks: "Sharhingiz uchun rahmat!", rv_yours: "Sizning sharhingiz",
    rv_anon_name: "Bemor", rv_kind: { c: "Onlayn maslahatdan keyin", v: "Qabuldan keyin" }, rv_reply_h: "Javob", rv_reply_btn: "Javob yozish", rv_reply_ph: "Bemorga hurmat bilan javob bering", rv_reply_send: "Javobni saqlash", rv_reply_done: "Javob saqlandi.",
    rv_mine_h: "Siz haqingizdagi sharhlar", rv_mine_none: "Hali sharh yo‘q. Maslahat tugagach, bemorlar sizni baholay oladi.", rv_rate_btn: "Baholash", rv_rate_badge: "Baholang", rv_hidden: "Yashirilgan",
    rv_sort: "Yuqori baho", e_reviewed: "Bu maslahat yoki qabul uchun allaqachon sharh yozgansiz.", e_stars: "Baho 1 dan 5 gacha bo‘lishi kerak.",
    adm_rv_h: "Sharhlar", adm_rv_p: "Haqoratli, reklama yoki shaxsiy ma’lumotli sharhlarni yashiring.", adm_rv_hide: "Yashirish", adm_rv_show: "Ko‘rsatish", adm_rv_about: "Kim haqida"
  });

  add("ru", {
    rv_h: "Отзывы пациентов", rv_none: "Отзывов пока нет.", rv_n: function (n) { return "отзывов: " + n; },
    rv_only: "Отзыв могут оставить только пациенты, у которых была консультация или приём у этого врача.",
    rv_ask_h: "Оцените врача", rv_ask_h_c: "Оцените клинику", rv_ask_p: "Ваш отзыв поможет другим пациентам выбрать хорошего врача.",
    rv_stars: "Оценка", rv_star_l: function (n) { return n + " из 5"; }, rv_body: "Ваше мнение (по желанию)", rv_body_ph: "Что понравилось или нет? Не пишите диагноз и личные данные.",
    rv_anon: "Не показывать моё имя", rv_send: "Отправить отзыв", rv_err_stars: "Поставьте оценку звёздами.", rv_thanks: "Спасибо за отзыв!", rv_yours: "Ваш отзыв",
    rv_anon_name: "Пациент", rv_kind: { c: "После онлайн-консультации", v: "После приёма" }, rv_reply_h: "Ответ", rv_reply_btn: "Ответить", rv_reply_ph: "Ответьте пациенту вежливо", rv_reply_send: "Сохранить ответ", rv_reply_done: "Ответ сохранён.",
    rv_mine_h: "Отзывы о вас", rv_mine_none: "Отзывов пока нет. После консультации пациенты смогут вас оценить.", rv_rate_btn: "Оценить", rv_rate_badge: "Оцените", rv_hidden: "Скрыт",
    rv_sort: "Высокая оценка", e_reviewed: "Вы уже оставили отзыв об этой консультации или приёме.", e_stars: "Оценка должна быть от 1 до 5.",
    adm_rv_h: "Отзывы", adm_rv_p: "Скрывайте оскорбительные, рекламные отзывы и отзывы с личными данными.", adm_rv_hide: "Скрыть", adm_rv_show: "Показать", adm_rv_about: "О ком"
  });

  add("en", {
    rv_h: "Patient reviews", rv_none: "No reviews yet.", rv_n: function (n) { return n + (n === 1 ? " review" : " reviews"); },
    rv_only: "Only patients who finished a consultation or had a visit with this doctor can review.",
    rv_ask_h: "Rate the doctor", rv_ask_h_c: "Rate the clinic", rv_ask_p: "Your review helps other patients choose a good doctor.",
    rv_stars: "Rating", rv_star_l: function (n) { return n + (n === 1 ? " star" : " stars"); }, rv_body: "Your comments (optional)", rv_body_ph: "What did you like or not? Don’t write diagnoses or personal details.",
    rv_anon: "Don’t show my name", rv_send: "Send review", rv_err_stars: "Choose a star rating.", rv_thanks: "Thank you for your review!", rv_yours: "Your review",
    rv_anon_name: "Patient", rv_kind: { c: "After an online consultation", v: "After a visit" }, rv_reply_h: "Reply", rv_reply_btn: "Reply", rv_reply_ph: "Reply to the patient politely", rv_reply_send: "Save reply", rv_reply_done: "Reply saved.",
    rv_mine_h: "Reviews about you", rv_mine_none: "No reviews yet. After a consultation, patients can rate you.", rv_rate_btn: "Rate", rv_rate_badge: "Rate it", rv_hidden: "Hidden",
    rv_sort: "Highest rated", e_reviewed: "You already reviewed this consultation or visit.", e_stars: "The rating must be from 1 to 5.",
    adm_rv_h: "Reviews", adm_rv_p: "Hide reviews that are abusive, advertising or contain personal details.", adm_rv_hide: "Hide", adm_rv_show: "Show", adm_rv_about: "About"
  });
  ["uz", "ru", "en"].forEach(function (l) { if (T[l].df_sorts) T[l].df_sorts.rating = T[l].rv_sort; });
})(window.SHIFOKOR_T);
