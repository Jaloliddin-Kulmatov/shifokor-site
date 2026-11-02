/* Copy for next free times on doctor cards, moving or cancelling a booking, and search by complaint. */
(function (T) {
  var add = function (lang, o) { Object.keys(o).forEach(function (k) { T[lang][k] = o[k]; }); };

  add("uz", {
    nx_h: "Eng yaqin vaqtlar:", nx_today: "Bugun", nx_tomorrow: "Ertaga",
    rs_h: "Yangi vaqtni tanlang", rs_btn: "Vaqtni o‘zgartirish", rs_save: "Yangi vaqtni saqlash", rs_done: "Vaqt o‘zgartirildi. Shifokorga xabar berildi.", rs_note: function (w) { return "Bemor vaqtni o‘zgartirdi: " + w + "."; },
    cx_btn: "Arizani bekor qilish", cx_q: "Arizani bekor qilasizmi?", cx_yes: "Ha, bekor qilish", cx_done: "Ariza bekor qilindi.", cx_note: "Bemor arizani bekor qildi.",
    sym_hint: function (q, s) { return "«" + q + "» bo‘yicha: " + s; },
    ds_name: "Shikoyat yoki shifokor ismi", ds_name_ph: "masalan: isitma, tish og‘rig‘i, Karimova"
  });
  T.uz.cs_st.cancelled = "Bekor qilingan";

  add("ru", {
    nx_h: "Ближайшее время:", nx_today: "Сегодня", nx_tomorrow: "Завтра",
    rs_h: "Выберите новое время", rs_btn: "Перенести время", rs_save: "Сохранить новое время", rs_done: "Время перенесено. Врач получил уведомление.", rs_note: function (w) { return "Пациент перенёс время: " + w + "."; },
    cx_btn: "Отменить заявку", cx_q: "Отменить заявку?", cx_yes: "Да, отменить", cx_done: "Заявка отменена.", cx_note: "Пациент отменил заявку.",
    sym_hint: function (q, s) { return "По запросу «" + q + "»: " + s; },
    ds_name: "Жалоба или имя врача", ds_name_ph: "например: температура, зубная боль, Каримова"
  });
  T.ru.cs_st.cancelled = "Отменена";

  add("en", {
    nx_h: "Next times:", nx_today: "Today", nx_tomorrow: "Tomorrow",
    rs_h: "Pick a new time", rs_btn: "Change the time", rs_save: "Save the new time", rs_done: "Time changed. The doctor has been told.", rs_note: function (w) { return "The patient moved the time to " + w + "."; },
    cx_btn: "Cancel the request", cx_q: "Cancel this request?", cx_yes: "Yes, cancel", cx_done: "Request cancelled.", cx_note: "The patient cancelled the request.",
    sym_hint: function (q, s) { return "For “" + q + "”: " + s; },
    ds_name: "Complaint or doctor’s name", ds_name_ph: "e.g. fever, toothache, Karimova"
  });
  T.en.cs_st.cancelled = "Cancelled";
})(window.SHIFOKOR_T);
