/* Copy for the simpler header (find a doctor, clinics, more) and the shorter home page (November 2026). */
(function (T) {
  var add = function (lang, o) { Object.keys(o).forEach(function (k) { T[lang][k] = o[k]; }); };

  add("uz", {
    nv_find: "Shifokor topish", nv_clinics: "Klinikalar", nv_more: "Ko‘proq", nv_pros: "Shifokor va klinikalar uchun",
    care_p: "Har bir holat uchun mos shifokor: bolalar, keksalar, homiladorlar va ruhiy salomatlik.", care_go: "Shifokorlarni ko‘rish",
    top_p: "Haqiqiy bemorlar sharhlari va baholari bo‘yicha.", top_none: "Sharhlar paydo bo‘lishi bilan bu yerda eng yaxshi baholangan shifokorlar ko‘rinadi.",
    pros_h: "Shifokor yoki klinikamisiz?", pros_p: "Shifokor’da profil oching: bemorlar sizni mutaxassislik, viloyat va sharhlar bo‘yicha topadi.",
    pros_pts: ["Arizalar, chat, audio va video qo‘ng‘iroq bitta panelda", "Ish vaqtingiz va narxlaringizni o‘zingiz belgilaysiz", "Klinikalar uchun: filiallar, shifokorlar va umumiy jadval", "Tekshiruvdan so‘ng “Tekshirilgan” belgisi"],
    pros_img: "Shifokor ish stolida bemor bilan onlayn gaplashmoqda"
  });

  add("ru", {
    nv_find: "Найти врача", nv_clinics: "Клиники", nv_more: "Ещё", nv_pros: "Врачам и клиникам",
    care_p: "Подходящий врач для каждого случая: дети, пожилые, беременные и психическое здоровье.", care_go: "Смотреть врачей",
    top_p: "По отзывам и оценкам реальных пациентов.", top_none: "Когда появятся отзывы, здесь будут врачи с лучшими оценками.",
    pros_h: "Вы врач или клиника?", pros_p: "Откройте профиль в Shifokor: пациенты найдут вас по специальности, области и отзывам.",
    pros_pts: ["Заявки, чат, аудио- и видеозвонки в одной панели", "Сами задаёте часы работы и цены", "Для клиник: филиалы, врачи и общее расписание", "После проверки — отметка «Проверено»"],
    pros_img: "Врач за рабочим столом консультирует пациента онлайн"
  });

  add("en", {
    nv_find: "Find a doctor", nv_clinics: "Clinics", nv_more: "More", nv_pros: "For doctors and clinics",
    care_p: "The right doctor for each case: children, older people, pregnancy and mental health.", care_go: "See doctors",
    top_p: "Ranked by real patients' reviews and ratings.", top_none: "Once reviews come in, the best-rated doctors appear here.",
    pros_h: "Are you a doctor or a clinic?", pros_p: "Open a profile on Shifokor: patients find you by specialty, region and reviews.",
    pros_pts: ["Requests, chat, audio and video calls in one panel", "You set your own hours and prices", "For clinics: branches, doctors and a shared calendar", "A “Verified” mark once we've checked you"],
    pros_img: "A doctor at a desk talking with a patient online"
  });
})(window.SHIFOKOR_T);
