/* Copy for medicine lists after a consultation and home delivery by a partner pharmacy. */
(function (T) {
  var add = function (lang, o) { Object.keys(o).forEach(function (k) { T[lang][k] = o[k]; }); };

  add("uz", {
    rx_h: "Dorilar ro‘yxati", rx_h_pat: function (n) { return n + " yozgan dorilar"; },
    rx_doc_p: "Bemor ro‘yxatni o‘z sahifasida ko‘radi va uyga yetkazib berishni so‘rashi mumkin.",
    rx_name: "Dori nomi", rx_how: "Qanday ichiladi", rx_how_ph: "masalan: kuniga 2 marta, ovqatdan keyin", rx_days_l: "Necha kun",
    rx_days: function (n) { return n + " kun"; }, rx_rm: "Olib tashlash", rx_add: "Yana dori qo‘shish", rx_save: "Ro‘yxatni saqlash",
    rx_none_doc: "Kerak bo‘lsa, bemorga dorilar ro‘yxatini yozing.", rx_edit: "Ro‘yxatni o‘zgartirish", rx_write: "Dorilar ro‘yxatini yozish",
    rx_del_h: "Uyga yetkazib berish", rx_pilot: "Sinov",
    rx_offer: "Hamkor dorixona dorilarni uyingizga olib keladi. Narx va vaqtni dorixona telefon orqali aytadi, to‘lov dori qo‘lingizga kelganda.",
    rx_order: "Yetkazib berishni so‘rash", rx_addr: "Manzil", rx_addr_ph: "Shahar yoki qishloq, ko‘cha, uy", rx_note: "Izoh (ixtiyoriy)",
    rx_ok: "Narxni dorixona telefon orqali aytishiga va to‘lov yetkazilganda bo‘lishiga roziman. Retsept talab qiladigan dorilarni dorixona faqat qonunga muvofiq beradi.",
    rx_send: "So‘rov yuborish", rx_st: { "new": "So‘rov yuborildi", confirmed: "Dorixona tasdiqladi", on_way: "Yo‘lda", delivered: "Yetkazildi" },
    rx_wait: "Dorixona tez orada qo‘ng‘iroq qilib, narx va vaqtni aytadi.", rx_cancel: "Bekor qilish", rx_cancelled: "Bekor qilingan",
    rx_err_days: "Kunlar soni 1 dan 365 gacha bo‘lsin.", rx_saved: "Dorilar ro‘yxati saqlandi.", rx_err_fill: "Viloyat, manzil va telefonni kiriting.",
    rx_err_ok: "Shartlarga roziligingizni belgilang.", rx_sent: "So‘rov yuborildi. Dorixona qo‘ng‘iroq qiladi.",
    adm_tab_meds: "Dori yetkazish", mo_h: "Dorilarni yetkazib berish so‘rovlari",
    mo_p: "Har bir so‘rovni hamkor dorixonaga yuboring. Dorixona bemorga qo‘ng‘iroq qilgach, holatini shu yerda belgilang: bemor Telegram orqali xabar oladi.",
    vc_rx: "Maslahatdan keyin shifokor yozgan dorilarni uyga yetkazib berishni so‘rashingiz mumkin (sinov)."
  });

  add("ru", {
    rx_h: "Список лекарств", rx_h_pat: function (n) { return "Лекарства от врача " + n; },
    rx_doc_p: "Пациент увидит список на своей странице и сможет заказать доставку домой.",
    rx_name: "Название", rx_how: "Как принимать", rx_how_ph: "например: 2 раза в день после еды", rx_days_l: "Сколько дней",
    rx_days: function (n) { return n + " дн."; }, rx_rm: "Убрать", rx_add: "Добавить лекарство", rx_save: "Сохранить список",
    rx_none_doc: "Если нужно, напишите пациенту список лекарств.", rx_edit: "Изменить список", rx_write: "Написать список лекарств",
    rx_del_h: "Доставка домой", rx_pilot: "Тест",
    rx_offer: "Аптека-партнёр привезёт лекарства домой. Цену и время аптека скажет по телефону, оплата при получении.",
    rx_order: "Заказать доставку", rx_addr: "Адрес", rx_addr_ph: "Город или село, улица, дом", rx_note: "Комментарий (необязательно)",
    rx_ok: "Согласен, что цену аптека скажет по телефону, а оплата — при получении. Рецептурные лекарства аптека выдаёт только по закону.",
    rx_send: "Отправить заявку", rx_st: { "new": "Заявка отправлена", confirmed: "Аптека подтвердила", on_way: "В пути", delivered: "Доставлено" },
    rx_wait: "Аптека скоро позвонит и скажет цену и время.", rx_cancel: "Отменить", rx_cancelled: "Отменено",
    rx_err_days: "Количество дней — от 1 до 365.", rx_saved: "Список лекарств сохранён.", rx_err_fill: "Укажите область, адрес и телефон.",
    rx_err_ok: "Отметьте согласие с условиями.", rx_sent: "Заявка отправлена. Аптека позвонит.",
    adm_tab_meds: "Доставка лекарств", mo_h: "Заявки на доставку лекарств",
    mo_p: "Передайте каждую заявку аптеке-партнёру. Когда аптека позвонит пациенту, отметьте статус здесь: пациент получит сообщение в Telegram.",
    vc_rx: "После консультации можно заказать доставку лекарств, которые выписал врач (тест)."
  });

  add("en", {
    rx_h: "Medicines", rx_h_pat: function (n) { return "Medicines from " + n; },
    rx_doc_p: "The patient sees the list on their page and can ask for home delivery.",
    rx_name: "Medicine", rx_how: "How to take it", rx_how_ph: "e.g. twice a day after meals", rx_days_l: "Days",
    rx_days: function (n) { return n + (n === 1 ? " day" : " days"); }, rx_rm: "Remove", rx_add: "Add a medicine", rx_save: "Save the list",
    rx_none_doc: "If needed, write the patient a list of medicines.", rx_edit: "Change the list", rx_write: "Write a medicine list",
    rx_del_h: "Home delivery", rx_pilot: "Trial",
    rx_offer: "A partner pharmacy brings the medicines to your home. The pharmacy tells you the price and time by phone; you pay on delivery.",
    rx_order: "Ask for delivery", rx_addr: "Address", rx_addr_ph: "Town or village, street, house", rx_note: "Note (optional)",
    rx_ok: "I agree the pharmacy tells me the price by phone and I pay on delivery. Prescription medicines are given only as the law allows.",
    rx_send: "Send request", rx_st: { "new": "Request sent", confirmed: "Pharmacy confirmed", on_way: "On the way", delivered: "Delivered" },
    rx_wait: "The pharmacy will call soon with the price and time.", rx_cancel: "Cancel", rx_cancelled: "Cancelled",
    rx_err_days: "Days must be 1 to 365.", rx_saved: "Medicine list saved.", rx_err_fill: "Enter the region, address and phone.",
    rx_err_ok: "Tick that you agree to the terms.", rx_sent: "Request sent. The pharmacy will call.",
    adm_tab_meds: "Medicine delivery", mo_h: "Medicine delivery requests",
    mo_p: "Pass each request to the partner pharmacy. Once the pharmacy has called the patient, set the status here: the patient gets a Telegram message.",
    vc_rx: "After a consultation you can ask for the medicines your doctor wrote to be delivered home (trial)."
  });
})(window.SHIFOKOR_T);
