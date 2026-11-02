/* Copy for booking a time with a doctor (Tashkent time). */
(function (T) {
  var add = function (lang, o) { Object.keys(o).forEach(function (k) { T[lang][k] = o[k]; }); };

  add("uz", {
    sl_pick: "Qulay vaqtni tanlang", sl_tz: "Toshkent vaqti", sl_err: "Shifokor bilan gaplashish vaqtini tanlang.",
    sl_none_set: "Bu shifokor hali qabul vaqtlarini belgilamagan: arizani qabul qilgach, vaqtni chatda kelishasiz.",
    sl_full: "Yaqin 2 haftada bo‘sh vaqt yo‘q. Boshqa shifokorni yoki «Birinchi bo‘sh shifokor»ni tanlang.",
    sl_taken: "Bu vaqtni hozirgina boshqa bemor band qildi. Boshqa vaqtni tanlang.", sl_bad: "Bu vaqt endi mos emas. Boshqa vaqtni tanlang.",
    sl_when: "Qabul vaqti", sl_now: "Hozir", sl_in: function (m) { return m < 60 ? m + " daqiqadan keyin" : m < 1440 ? Math.round(m / 60) + " soatdan keyin" : Math.round(m / 1440) + " kundan keyin"; },
    sl_next: "Eng yaqin bo‘sh vaqt",
    sl_hours_h: "Onlayn qabul vaqtlari", sl_hours_p: "Bemorlar shu vaqtlar ichidan o‘zlariga qulay vaqtni band qiladi. Bir kun oldin Telegram eslatadi.",
    sl_wd: ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"], sl_from: "Boshlanishi", sl_to: "Tugashi", sl_len: "Bir qabul", sl_min: function (m) { return m + " daqiqa"; },
    off_h: "Onlayn maslahat o‘chiq", off_p: "Hozir bemorlar sizga ariza yubora olmaydi. Yoqing: ro‘yxatda «Maslahat so‘rash» tugmasi chiqadi. Narx va qabul vaqtlarini quyida belgilashingiz mumkin.", off_btn: "Onlayn maslahatni yoqish", off_done: "Onlayn maslahat yoqildi.",
    tk_h: "Ariza qabul qilindi:", tk_write: "Xabar yozish", tk_call: "Qo‘ng‘iroq qilish", tk_video: "Video qo‘ng‘iroq",
    vo_many: "Bu arizada ovozli xabarlar soni chegaraga yetdi.", vo_bad: "Ovozli xabarni yuborib bo‘lmadi. Qayta yozib ko‘ring.", rx_open: "Bu dorilar uchun so‘rov allaqachon yuborilgan."
  });

  add("ru", {
    sl_pick: "Выберите удобное время", sl_tz: "время Ташкента", sl_err: "Выберите время разговора с врачом.",
    sl_none_set: "Врач ещё не указал часы приёма: время договоритесь в чате, когда он примет заявку.",
    sl_full: "В ближайшие 2 недели свободного времени нет. Выберите другого врача или «Первый свободный врач».",
    sl_taken: "Это время только что занял другой пациент. Выберите другое.", sl_bad: "Это время уже не подходит. Выберите другое.",
    sl_when: "Время приёма", sl_now: "Сейчас", sl_in: function (m) { return m < 60 ? "через " + m + " мин" : m < 1440 ? "через " + Math.round(m / 60) + " ч" : "через " + Math.round(m / 1440) + " дн."; },
    sl_next: "Ближайшее свободное время",
    sl_hours_h: "Часы онлайн-приёма", sl_hours_p: "Пациенты бронируют удобное время в этих часах. За день до приёма придёт напоминание в Telegram.",
    sl_wd: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"], sl_from: "Начало", sl_to: "Конец", sl_len: "Один приём", sl_min: function (m) { return m + " мин"; },
    off_h: "Онлайн-консультации выключены", off_p: "Сейчас пациенты не могут отправить вам заявку. Включите — в списке появится кнопка «Запросить консультацию». Цены и часы приёма можно указать ниже.", off_btn: "Включить онлайн-консультации", off_done: "Онлайн-консультации включены.",
    tk_h: "Заявка принята:", tk_write: "Написать", tk_call: "Позвонить", tk_video: "Видеозвонок",
    vo_many: "В этой заявке достигнут предел голосовых сообщений.", vo_bad: "Не удалось отправить голосовое. Запишите ещё раз.", rx_open: "Заявка на эти лекарства уже отправлена."
  });

  add("en", {
    sl_pick: "Pick a time that suits you", sl_tz: "Tashkent time", sl_err: "Pick a time to talk to the doctor.",
    sl_none_set: "This doctor hasn’t set their hours yet: you’ll agree a time in the chat once they accept.",
    sl_full: "No free times in the next 2 weeks. Choose another doctor or “First available doctor”.",
    sl_taken: "Another patient just booked this time. Pick another one.", sl_bad: "That time no longer works. Pick another one.",
    sl_when: "Appointment", sl_now: "Now", sl_in: function (m) { return m < 60 ? "in " + m + " min" : m < 1440 ? "in " + Math.round(m / 60) + " h" : "in " + Math.round(m / 1440) + " days"; },
    sl_next: "Next free time",
    sl_hours_h: "Online consultation hours", sl_hours_p: "Patients book a time that suits them within these hours. Telegram reminds both of you a day before.",
    sl_wd: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], sl_from: "From", sl_to: "To", sl_len: "Each consultation", sl_min: function (m) { return m + " min"; },
    off_h: "Online consultations are off", off_p: "Patients can’t send you requests right now. Turn them on and an “Ask for a consultation” button appears in the list. You can set prices and hours below.", off_btn: "Turn on online consultations", off_done: "Online consultations are on.",
    tk_h: "Request accepted:", tk_write: "Write a message", tk_call: "Call", tk_video: "Video call",
    vo_many: "This application has reached the limit of voice messages.", vo_bad: "The voice message couldn’t be sent. Record it again.", rx_open: "A request for these medicines was already sent."
  });
})(window.SHIFOKOR_T);
