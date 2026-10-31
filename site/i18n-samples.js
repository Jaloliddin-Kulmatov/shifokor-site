/* Copy for sample doctors and search by specialty. */
(function (T) {
  var add = function (lang, o) { Object.keys(o).forEach(function (k) { T[lang][k] = o[k]; }); };

  add("uz", {
    smp_badge: "Namuna",
    smp_note: "Bu namuna profil: shifokor, narxlar va sharhlar o‘ylab topilgan. Sayt qanday ishlashini ko‘rsatadi, maslahat so‘rab bo‘lmaydi.",
    smp_real: "Shu mutaxassislikdagi boshqa shifokorlar",
    smp_rv: "Bu sharhlar namuna: ularni haqiqiy bemorlar yozmagan.",
    smp_dir: "«Namuna» belgili profillar o‘ylab topilgan: ular haqiqiy shifokorlar ro‘yxatdan o‘tguncha sayt qanday ishlashini ko‘rsatadi. Haqiqiy shifokorlar har doim yuqorida turadi.",
    cat_h: "Mutaxassislik bo‘yicha qidiring",
    cat_p: "Yaxshi shifokor topish qiyin, shuning uchun odamlar ko‘pincha kimdir tavsiya qilgan shifokorga boradi. Shifokorda xususiy klinikalar va shifokorlarni mutaxassislik bo‘yicha qidirasiz, reyting va boshqa bemorlar sharhlariga qarab tanlaysiz.",
    cat_n: function (n) { return n + " ta shifokor"; },
    top_docs_h: "Eng yaxshi baholangan shifokorlar"
  });

  add("ru", {
    smp_badge: "Пример",
    smp_note: "Это пример профиля: врач, цены и отзывы придуманы. Он показывает, как работает сайт; консультацию здесь запросить нельзя.",
    smp_real: "Другие врачи этой специальности",
    smp_rv: "Это примеры отзывов: их писали не настоящие пациенты.",
    smp_dir: "Профили с отметкой «Пример» придуманы: они показывают, как работает сайт, пока не зарегистрировались настоящие врачи. Настоящие врачи всегда выше.",
    cat_h: "Поиск по специальности",
    cat_p: "Хорошего врача найти трудно, поэтому чаще всего идут к тому, кого кто-то посоветовал. На Shifokor вы ищете частные клиники и врачей по специальности и выбираете по рейтингу и отзывам других пациентов.",
    cat_n: function (n) { return "врачей: " + n; },
    top_docs_h: "Врачи с лучшими оценками"
  });

  add("en", {
    smp_badge: "Sample",
    smp_note: "This is a sample profile: the doctor, prices and reviews are made up. It shows how the site works; you can’t ask for a consultation here.",
    smp_real: "Other doctors in this specialty",
    smp_rv: "These are sample reviews: real patients didn’t write them.",
    smp_dir: "Profiles marked “Sample” are made up: they show how the site works until real doctors join. Real doctors always come first.",
    cat_h: "Search by specialty",
    cat_p: "A good doctor is hard to find, so people usually go to whoever someone recommended. On Shifokor you search private clinics and doctors by specialty and choose by rating and other patients’ reviews.",
    cat_n: function (n) { return n + (n === 1 ? " doctor" : " doctors"); },
    top_docs_h: "Top-rated doctors"
  });
})(window.SHIFOKOR_T);
