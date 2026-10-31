/* Copy for why Shifokor exists: finding a good doctor is easy in cities and hard in villages. */
(function (T) {
  var add = function (lang, o) { Object.keys(o).forEach(function (k) { T[lang][k] = o[k]; }); };

  add("uz", {
    mis_h: "Yaxshi shifokor faqat shaharliklar uchun emas",
    mis_p: "Shaharda yaxshi klinika yoki shifokorni topish oson. Qishloqda esa shifokorni ko‘pincha tanishlar maqtagani uchun tanlashadi, shaharga borib yaxshi shifokor izlash esa yo‘l, vaqt va pulga tushadi. Shifokor shuning uchun yaratildi: qayerda yashashingizdan qat’i nazar, yaxshi shifokorni topib, o‘zingiz tanlagan shifokordan maslahat olishingiz uchun.",
    mis_was: "Odatda", mis_now: "Shifokor bilan",
    mis_rows: [["Tanishlar maqtagan shifokorga borasiz", "Haqiqiy bemorlar sharhlari va tekshirilgan litsenziyaga qarab tanlaysiz"], ["Shaharga borish uchun yo‘l, vaqt va pul ketadi", "Avval uydan turib chat yoki video orqali maslahat olasiz"], ["Narxni borgandan keyin bilasiz", "Narx oldindan ko‘rinadi"], ["Yaxshi xususiy klinika yoki shifokorni qayerdan izlashni bilmaysiz", "Mutaxassislik bo‘yicha qidirasiz va reytinglarni solishtirasiz"]]
  });

  add("ru", {
    mis_h: "Хороший врач нужен не только горожанам",
    mis_p: "В городе найти хорошую клинику или врача легко. В селе врача чаще выбирают по рассказам знакомых, а поездка в город на поиски хорошего врача стоит дороги, времени и денег. Поэтому мы и сделали Shifokor: где бы вы ни жили, вы можете найти хорошего врача и получить консультацию у того, кого выбрали сами.",
    mis_was: "Обычно", mis_now: "С Shifokor",
    mis_rows: [["Идёте к врачу, которого хвалили знакомые", "Выбираете по отзывам настоящих пациентов и проверенной лицензии"], ["Поездка в город стоит дороги, времени и денег", "Сначала консультация из дома в чате или по видео"], ["Цену узнаёте только на месте", "Цена видна заранее"], ["Не знаете, где искать хорошую частную клинику или врача", "Ищете по специальности и сравниваете рейтинги"]]
  });

  add("en", {
    mis_h: "A good doctor shouldn’t be only for city people",
    mis_p: "In cities it’s easy to find a good clinic or doctor. In villages, people usually pick a doctor because friends spoke well of them, and travelling to the city to find a good one costs a lot of time and money. That’s why we built Shifokor: wherever you live, you can find a good doctor and get advice from the one you choose.",
    mis_was: "Usually", mis_now: "With Shifokor",
    mis_rows: [["You go to the doctor your friends praised", "You choose by real patients’ reviews and a checked licence"], ["A trip to the city costs time and money", "You first get advice from home, by chat or video"], ["You learn the price only when you arrive", "You see the price up front"], ["You don’t know where to look for a good private clinic or doctor", "You search by specialty and compare ratings"]]
  });
})(window.SHIFOKOR_T);
