/* Copy for paying doctors: the admin's payouts tab and the doctor's earnings card. */
(function (T) {
  var add = function (lang, o) { Object.keys(o).forEach(function (k) { T[lang][k] = o[k]; }); };

  add("uz", {
    adm_tab_chk: "Tekshiruv", adm_tab_pay: "Shifokorlarga to‘lov", po_h: "Shifokorlarga to‘lov",
    po_p: function (f) { return "Shifokorga to‘langan va yakunlangan maslahatlar uchun pul o‘tkaziladi. Platforma ulushi: " + f + "%. Pulni bank orqali o‘tkazgach, shu yerda qayd eting."; },
    po_collected: "Bemorlardan yig‘ilgan", po_platform: "Platforma ulushi", po_owed_all: "Shifokorlarga to‘lanishi kerak", po_paid_all: "Shifokorlarga o‘tkazilgan",
    po_owed: "To‘lanishi kerak", po_done: function (n) { return "Yakunlangan maslahatlar (" + n + ")"; }, po_fee: function (f) { return "Platforma ulushi (" + f + "%)"; },
    po_net: "Shifokor ulushi", po_out: "O‘tkazilgan",
    po_open: function (n, s) { return "Yana " + n + " ta to‘langan maslahat hali yakunlanmagan (" + s + "). Yakunlangach, to‘lanadigan summaga qo‘shiladi."; },
    po_last: function (d) { return "Oxirgi o‘tkazma: " + d; }, po_record: "O‘tkazmani qayd etish",
    po_amount: "Summa (so‘m)", po_day: "O‘tkazilgan sana", po_ref: "Hujjat raqami", po_ref_ph: "To‘lov topshiriqnomasi raqami", po_note: "Izoh (ixtiyoriy)", po_save: "Saqlash", po_cancel: "Bekor qilish",
    po_hint: "Avval pulni bank orqali o‘tkazing, keyin shu yerda qayd eting. Shifokorga Telegram orqali xabar boradi.", po_saved: "O‘tkazma qayd etildi.",
    po_e_amount: "Summani kiriting.", po_e_over: "Bu summa shifokorga to‘lanishi kerak bo‘lgan puldan ko‘p.", po_e_date: "Sanani tekshiring: kelajakdagi yoki bir yildan eski sana bo‘lmasin.",
    po_hist: "O‘tkazmalar tarixi", po_none: "Hali to‘langan maslahat yo‘q.", po_hist_none: "Hali o‘tkazma yo‘q.", po_del: "O‘chirish", po_del_yes: "Ha, o‘chirish", po_deleted: "O‘tkazma o‘chirildi.",
    po_csv_paid: "To‘langan maslahatlar (CSV)", po_csv_out: "O‘tkazmalar (CSV)",
    po_cols_paid: ["Ariza", "To‘langan vaqt", "Shifokor", "Narx", "Platforma ulushi", "Shifokor ulushi", "To‘lov tizimi", "Holat"], po_cols_out: ["Sana", "Shifokor", "Summa", "Hujjat raqami", "Izoh"],
    er_h: "Daromadingiz", er_owed: "Sizga to‘lanishi kerak", er_net: "Sizning ulushingiz", er_out: "Sizga o‘tkazilgan", er_hist: "O‘tkazmalar",
    er_open: function (n, s) { return "Yana " + n + " ta to‘langan maslahat hali yakunlanmagan (" + s + "). Maslahatni yakunlang: shundan keyin pul hisoblanadi."; },
    er_note: "Pul to‘langan va yakunlangan maslahatlar uchun bank orqali o‘tkaziladi. Savol bo‘lsa, Shifokor jamoasiga yozing."
  });

  add("ru", {
    adm_tab_chk: "Проверка", adm_tab_pay: "Выплаты врачам", po_h: "Выплаты врачам",
    po_p: function (f) { return "Врачу переводятся деньги за оплаченные и завершённые консультации. Доля платформы: " + f + "%. После перевода через банк отметьте его здесь."; },
    po_collected: "Собрано с пациентов", po_platform: "Доля платформы", po_owed_all: "К выплате врачам", po_paid_all: "Выплачено врачам",
    po_owed: "К выплате", po_done: function (n) { return "Завершённые консультации (" + n + ")"; }, po_fee: function (f) { return "Доля платформы (" + f + "%)"; },
    po_net: "Доля врача", po_out: "Выплачено",
    po_open: function (n, s) { return "Ещё оплаченных консультаций не завершено: " + n + " (" + s + "). После завершения они добавятся к выплате."; },
    po_last: function (d) { return "Последний перевод: " + d; }, po_record: "Отметить перевод",
    po_amount: "Сумма (сум)", po_day: "Дата перевода", po_ref: "Номер документа", po_ref_ph: "Номер платёжного поручения", po_note: "Комментарий (необязательно)", po_save: "Сохранить", po_cancel: "Отмена",
    po_hint: "Сначала переведите деньги через банк, затем отметьте перевод здесь. Врач получит сообщение в Telegram.", po_saved: "Перевод отмечен.",
    po_e_amount: "Введите сумму.", po_e_over: "Сумма больше, чем причитается врачу.", po_e_date: "Проверьте дату: не в будущем и не старше года.",
    po_hist: "История переводов", po_none: "Оплаченных консультаций пока нет.", po_hist_none: "Переводов пока нет.", po_del: "Удалить", po_del_yes: "Да, удалить", po_deleted: "Перевод удалён.",
    po_csv_paid: "Оплаченные консультации (CSV)", po_csv_out: "Переводы (CSV)",
    po_cols_paid: ["Заявка", "Время оплаты", "Врач", "Цена", "Доля платформы", "Доля врача", "Платёжная система", "Статус"], po_cols_out: ["Дата", "Врач", "Сумма", "Номер документа", "Комментарий"],
    er_h: "Ваш доход", er_owed: "К выплате вам", er_net: "Ваша доля", er_out: "Выплачено вам", er_hist: "Переводы",
    er_open: function (n, s) { return "Ещё оплаченных консультаций не завершено: " + n + " (" + s + "). Завершите консультацию, и сумма будет учтена."; },
    er_note: "Деньги за оплаченные и завершённые консультации переводятся через банк. Если есть вопросы, напишите команде Shifokor."
  });

  add("en", {
    adm_tab_chk: "Checks", adm_tab_pay: "Doctor payouts", po_h: "Doctor payouts",
    po_p: function (f) { return "Doctors are paid for consultations that were paid and finished. Platform share: " + f + "%. After you transfer the money through the bank, record it here."; },
    po_collected: "Collected from patients", po_platform: "Platform share", po_owed_all: "Owed to doctors", po_paid_all: "Paid to doctors",
    po_owed: "Owed", po_done: function (n) { return "Finished consultations (" + n + ")"; }, po_fee: function (f) { return "Platform share (" + f + "%)"; },
    po_net: "Doctor’s share", po_out: "Paid out",
    po_open: function (n, s) { return n + " more paid consultation" + (n === 1 ? " isn’t" : "s aren’t") + " finished yet (" + s + "). Once finished, they’re added to what’s owed."; },
    po_last: function (d) { return "Last transfer: " + d; }, po_record: "Record a transfer",
    po_amount: "Amount (soums)", po_day: "Transfer date", po_ref: "Document number", po_ref_ph: "Payment order number", po_note: "Note (optional)", po_save: "Save", po_cancel: "Cancel",
    po_hint: "Transfer the money through the bank first, then record it here. The doctor gets a Telegram message.", po_saved: "Transfer recorded.",
    po_e_amount: "Enter the amount.", po_e_over: "That’s more than the doctor is owed.", po_e_date: "Check the date: not in the future and not more than a year ago.",
    po_hist: "Transfer history", po_none: "No paid consultations yet.", po_hist_none: "No transfers yet.", po_del: "Delete", po_del_yes: "Yes, delete", po_deleted: "Transfer deleted.",
    po_csv_paid: "Paid consultations (CSV)", po_csv_out: "Transfers (CSV)",
    po_cols_paid: ["Application", "Paid at", "Doctor", "Price", "Platform share", "Doctor’s share", "Payment system", "Status"], po_cols_out: ["Date", "Doctor", "Amount", "Document number", "Note"],
    er_h: "Your earnings", er_owed: "Owed to you", er_net: "Your share", er_out: "Paid to you", er_hist: "Transfers",
    er_open: function (n, s) { return n + " more paid consultation" + (n === 1 ? " isn’t" : "s aren’t") + " finished yet (" + s + "). Finish the consultation and it’s counted."; },
    er_note: "Money for paid and finished consultations is transferred through the bank. If you have questions, write to the Shifokor team."
  });
})(window.SHIFOKOR_T);
