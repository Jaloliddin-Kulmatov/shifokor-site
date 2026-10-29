/* Copy for paying for an online consultation through Payme or Click. */
(function (T) {
  var add = function (lang, o) { Object.keys(o).forEach(function (k) { T[lang][k] = o[k]; }); };

  add("uz", {
    pay_price: "Narx", pay_paid: "To‘langan", pay_refunded: "To‘lov qaytarilgan", pay_due: "To‘lov kutilmoqda", pay_h: "Maslahat uchun to‘lov",
    pay_p: function (d) { return d + " arizangizni qabul qildi. To‘lovdan keyin shifokor javob yozadi yoki qo‘ng‘iroq qiladi."; },
    pay_payme: "Payme orqali to‘lash", pay_click: "Click orqali to‘lash", pay_demo: "Sinov to‘lovi (demo)",
    pay_demo_note: "Demo: haqiqiy pul yechilmaydi, tugma faqat to‘lovdan keyingi holatni ko‘rsatadi.",
    pay_safe: "Karta ma’lumotlarini Payme yoki Click sahifasida kiritasiz. Shifokor ularni ko‘rmaydi va saqlamaydi.",
    pay_checking: "To‘lov tekshirilmoqda. Agar to‘lagan bo‘lsangiz, sahifa bir necha soniyada yangilanadi.",
    pay_off: "Onlayn to‘lov hozir ishlamayapti. Keyinroq urinib ko‘ring yoki chatda shifokorga yozing.", pay_done: "To‘lov qabul qilindi.",
    pay_wait_doc: function (p) { return "Bemor hali " + p + " to‘lamadi. To‘lovdan keyin javob yozishingiz va qo‘ng‘iroq qilishingiz mumkin; Telegramga xabar keladi."; },
    cp_pay_online: "To‘lov shifokor arizani qabul qilgach, Payme yoki Click orqali.", e_unpaid: "Bemor hali to‘lov qilmagan.", e_paid: "Bu ariza allaqachon to‘langan."
  });

  add("ru", {
    pay_price: "Цена", pay_paid: "Оплачено", pay_refunded: "Оплата возвращена", pay_due: "Ждёт оплаты", pay_h: "Оплата консультации",
    pay_p: function (d) { return "Ваша заявка принята врачом " + d + ". После оплаты врач ответит или позвонит."; },
    pay_payme: "Оплатить через Payme", pay_click: "Оплатить через Click", pay_demo: "Тестовая оплата (демо)",
    pay_demo_note: "Демо: деньги не списываются, кнопка только показывает, что происходит после оплаты.",
    pay_safe: "Данные карты вы вводите на странице Payme или Click. Shifokor их не видит и не хранит.",
    pay_checking: "Проверяем оплату. Если вы оплатили, страница обновится через несколько секунд.",
    pay_off: "Онлайн-оплата сейчас не работает. Попробуйте позже или напишите врачу в чате.", pay_done: "Оплата получена.",
    pay_wait_doc: function (p) { return "Пациент ещё не оплатил " + p + ". После оплаты вы сможете ответить и позвонить; придёт сообщение в Telegram."; },
    cp_pay_online: "Оплата через Payme или Click после того, как врач примет заявку.", e_unpaid: "Пациент ещё не оплатил.", e_paid: "Эта заявка уже оплачена."
  });

  add("en", {
    pay_price: "Price", pay_paid: "Paid", pay_refunded: "Payment refunded", pay_due: "Waiting for payment", pay_h: "Pay for the consultation",
    pay_p: function (d) { return d + " accepted your application. After you pay, the doctor replies or calls."; },
    pay_payme: "Pay with Payme", pay_click: "Pay with Click", pay_demo: "Test payment (demo)",
    pay_demo_note: "Demo: no money is taken; the button only shows what happens after payment.",
    pay_safe: "You enter your card details on the Payme or Click page. Shifokor never sees or stores them.",
    pay_checking: "Checking your payment. If you paid, this page updates in a few seconds.",
    pay_off: "Online payment isn’t working right now. Try again later or write to the doctor in the chat.", pay_done: "Payment received.",
    pay_wait_doc: function (p) { return "The patient hasn’t paid " + p + " yet. Once they pay, you can reply and call; you’ll get a Telegram message."; },
    cp_pay_online: "You pay with Payme or Click once the doctor accepts the application.", e_unpaid: "The patient hasn’t paid yet.", e_paid: "This application is already paid."
  });
})(window.SHIFOKOR_T);
