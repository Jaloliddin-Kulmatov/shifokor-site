/* Copy for the day and time that suit the patient, in the application form. */
(function (T) {
  var add = function (lang, o) { Object.keys(o).forEach(function (k) { T[lang][k] = o[k]; }); };
  add("uz", { wt_h: "Qachon gaplashish qulay?", wt_now: "Imkon qadar tez", wt_today: "Bugun", wt_tomorrow: "Ertaga", wt_late: "Bugun uchun vaqt qolmadi, boshqa kunni tanlang.",
    wt_note: "Toshkent vaqti. Shifokor shu vaqtga moslashadi va chatda tasdiqlaydi.", wt_lbl: "Qulay vaqt" });
  add("ru", { wt_h: "Когда вам удобно поговорить?", wt_now: "Как можно скорее", wt_today: "Сегодня", wt_tomorrow: "Завтра", wt_late: "На сегодня время закончилось, выберите другой день.",
    wt_note: "Время Ташкента. Врач подстроится под это время и подтвердит его в чате.", wt_lbl: "Удобное время" });
  add("en", { wt_h: "When suits you to talk?", wt_now: "As soon as possible", wt_today: "Today", wt_tomorrow: "Tomorrow", wt_late: "No times left today, choose another day.",
    wt_note: "Tashkent time. The doctor works around it and confirms in the chat.", wt_lbl: "Convenient time" });
})(window.SHIFOKOR_T);
