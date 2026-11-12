/* Copy for the privacy and terms page (#/privacy). Plain words; says only what the site really does. */
(function (T) {
  var add = function (lang, o) { Object.keys(o).forEach(function (k) { T[lang][k] = o[k]; }); };

  add("uz", {
    pu_row: "Telefonga bildirishnomalar", pu_turn_on: "Yoqish", pu_turn_off: "O‘chirish", pu_is_on: "Yoqilgan: shifokor javob bersa yoki qo‘ng‘iroq qilsa, telefoningizga xabar keladi.", pu_is_off: "O‘chirilgan", pu_unsup: "Bu brauzer bildirishnomalarni qo‘llamaydi (iPhone’da saytni «Ekranga qo‘shish» orqali oching).", pu_blocked: "Brauzer sozlamalarida bloklangan: sayt uchun bildirishnomalarga ruxsat bering.", pu_notyet: "Ruxsat berilmadi. Keyinroq «Sozlamalar»dan yoqishingiz mumkin.", pu_nosrv: "Bildirishnomalar hali serverda sozlanmagan.", pu_err: "Yoqib bo‘lmadi. Qayta urinib ko‘ring.", pu_done: "Bildirishnomalar yoqildi", pu_off_done: "Bildirishnomalar o‘chirildi", pu_card_h: "Javoblar telefoningizga kelsin", pu_card_p: "Shifokor javob yozsa, qo‘ng‘iroq qilsa yoki qabul tasdiqlansa, telefoningizga bildirishnoma keladi.", pu_later: "Keyinroq",
    lg_nav: "Maxfiylik va shartlar", lg_h: "Maxfiylik siyosati va foydalanish shartlari", lg_date: "Oxirgi o‘zgarish: 2026-yil 12-noyabr",
    lg_sec: [
      ["Biz kimmiz", "Shifokor (shifokor.com) — bemorlarni shifokorlar va klinikalar bilan onlayn bog‘laydigan platforma. Loyihani UM_Wolves jamoasi qilmoqda, hozir sinov (pilot) bosqichida."],
      ["Qanday ma’lumot olamiz", "Hisob: ism, telefon yoki email, xohlasangiz Telegram. Ariza: muammo, yosh va jins (ixtiyoriy), rasmlar va ovozli xabarlar, chat. Shifokor xulosasi va qabul so‘rovlari. Shifokor va klinikalardan: mutaxassislik, litsenziya raqami, ish joyi."],
      ["Nima uchun", "Sizni kerakli shifokor bilan bog‘lash, qabul vaqtini kelishish, xabar va eslatmalar yuborish uchun. Ma’lumotlaringizni sotmaymiz va reklama uchun ishlatmaymiz."],
      ["Kim ko‘radi", "Ariza va chatni faqat siz va arizani qabul qilgan shifokor ko‘radi (hali qabul qilinmagan arizani uni qabul qila oladigan shifokorlar ko‘radi). Klinika faqat o‘ziga yuborilgan qabul so‘rovlarini ko‘radi. Adminlar shifokor va klinikalarni tekshirish va xavfsizlik uchun kiradi."],
      ["Shifo_AI", "Shifo_AI ga yozganingiz javob olish uchun AI xizmatiga (Groq) yuboriladi; biz bu matnni saqlamaymiz. Unga ism, telefon yoki boshqa shaxsiy ma’lumot yozmang. Shifo_AI tashxis qo‘ymaydi va dori yozmaydi."],
      ["Saqlash va xavfsizlik", "Sayt bilan aloqa shifrlangan (HTTPS). Rasmlar yuborishdan oldin kichraytiriladi va undagi joylashuv ma’lumoti olib tashlanadi. Sinov bosqichida serverlar O‘zbekistondan tashqarida. Haqiqiy bemorlar bilan to‘liq ishga tushishdan oldin ma’lumotlar O‘zbekistondagi serverlarga ko‘chiriladi, chunki shaxsiy ma’lumotlar to‘g‘risidagi qonun shuni talab qiladi."],
      ["Huquqlaringiz", "Profilingizdagi ma’lumotni istalgan payt ko‘rish va o‘zgartirish mumkin. Hisobingizni «Sozlamalar» sahifasida o‘chirishingiz mumkin. Savol bo‘lsa, Telegram bot orqali yozing: @shifokor_com_bot."],
      ["Foydalanish shartlari", "Shifokor tibbiy muassasa emas: maslahatni shifokor beradi va o‘z maslahati uchun o‘zi javob beradi. Onlayn maslahat yuzma-yuz ko‘rikning o‘rnini to‘liq bosmaydi; kerak bo‘lsa shifokor sizni ko‘rikka yuboradi. Shifokorlarning hujjatlarini jamoamiz tekshiradi. Boshqa odam nomidan yolg‘on ma’lumot yozmang. Pullik maslahatlar yoqilganda to‘lov Payme yoki Click orqali bo‘ladi; Shifokor karta ma’lumotlarini ko‘rmaydi."],
      ["Shoshilinch holat", "Ko‘krak og‘rig‘i, nafas qisishi, hushdan ketish, kuchli qon ketish va boshqa xavfli belgilarda onlayn maslahatni kutmang — darhol 103 ga qo‘ng‘iroq qiling."]
    ]
  });

  add("ru", {
    pu_row: "Уведомления на телефон", pu_turn_on: "Включить", pu_turn_off: "Выключить", pu_is_on: "Включены: когда врач ответит или позвонит, на телефон придёт уведомление.", pu_is_off: "Выключены", pu_unsup: "Этот браузер не поддерживает уведомления (на iPhone откройте сайт через «На экран Домой»).", pu_blocked: "Заблокированы в настройках браузера: разрешите уведомления для сайта.", pu_notyet: "Разрешение не дано. Включить можно позже в «Настройках».", pu_nosrv: "Уведомления ещё не настроены на сервере.", pu_err: "Не удалось включить. Попробуйте ещё раз.", pu_done: "Уведомления включены", pu_off_done: "Уведомления выключены", pu_card_h: "Получайте ответы на телефон", pu_card_p: "Когда врач ответит, позвонит или клиника подтвердит приём, на телефон придёт уведомление.", pu_later: "Позже",
    lg_nav: "Конфиденциальность и условия", lg_h: "Политика конфиденциальности и условия использования", lg_date: "Последнее изменение: 12 ноября 2026",
    lg_sec: [
      ["Кто мы", "Shifokor (shifokor.com) — платформа, которая онлайн связывает пациентов с врачами и клиниками. Проект делает команда UM_Wolves, сейчас это пилот."],
      ["Какие данные мы получаем", "Аккаунт: имя, телефон или email, по желанию Telegram. Заявка: проблема, возраст и пол (необязательно), фото и голосовые сообщения, чат. Заключение врача и запросы на приём. От врачей и клиник: специальность, номер лицензии, место работы."],
      ["Зачем", "Чтобы связать вас с нужным врачом, договориться о времени приёма, присылать уведомления и напоминания. Мы не продаём данные и не используем их для рекламы."],
      ["Кто видит", "Заявку и чат видите только вы и врач, принявший заявку (ещё не принятую заявку видят врачи, которые могут её принять). Клиника видит только запросы на приём к ней. Администраторы входят для проверки врачей и клиник и для безопасности."],
      ["Shifo_AI", "Текст, который вы пишете Shifo_AI, отправляется ИИ-сервису (Groq) для ответа; мы его не храним. Не пишите туда имя, телефон и другие личные данные. Shifo_AI не ставит диагноз и не назначает лекарства."],
      ["Хранение и безопасность", "Связь с сайтом шифруется (HTTPS). Фото уменьшаются перед отправкой, данные о местоположении из них удаляются. На этапе пилота серверы находятся за пределами Узбекистана. Перед полным запуском с реальными пациентами данные будут перенесены на серверы в Узбекистане, как требует закон о персональных данных."],
      ["Ваши права", "Данные профиля можно в любой момент посмотреть и изменить. Аккаунт можно удалить на странице «Настройки». Вопросы — через Telegram-бот: @shifokor_com_bot."],
      ["Условия использования", "Shifokor не медицинское учреждение: консультацию даёт врач и сам за неё отвечает. Онлайн-консультация не заменяет полностью очный осмотр; при необходимости врач направит вас на приём. Документы врачей проверяет наша команда. Не указывайте ложные данные от имени другого человека. Когда платные консультации включены, оплата проходит через Payme или Click; Shifokor не видит данные карты."],
      ["Экстренные случаи", "При боли в груди, одышке, потере сознания, сильном кровотечении и других опасных признаках не ждите онлайн-консультации — сразу звоните 103."]
    ]
  });

  add("en", {
    pu_row: "Phone notifications", pu_turn_on: "Turn on", pu_turn_off: "Turn off", pu_is_on: "On: when a doctor replies or calls, your phone gets a notification.", pu_is_off: "Off", pu_unsup: "This browser doesn’t support notifications (on iPhone, open the site from “Add to Home Screen”).", pu_blocked: "Blocked in the browser settings: allow notifications for this site.", pu_notyet: "Not allowed. You can turn them on later in Settings.", pu_nosrv: "Notifications aren’t set up on the server yet.", pu_err: "Couldn’t turn them on. Please try again.", pu_done: "Notifications are on", pu_off_done: "Notifications are off", pu_card_h: "Get replies on your phone", pu_card_p: "When a doctor replies or calls, or a visit is confirmed, your phone gets a notification.", pu_later: "Later",
    lg_nav: "Privacy and terms", lg_h: "Privacy policy and terms of use", lg_date: "Last changed: 12 November 2026",
    lg_sec: [
      ["Who we are", "Shifokor (shifokor.com) is a platform that connects patients with doctors and clinics online. It is built by the UM_Wolves team and is now in a pilot stage."],
      ["What we collect", "Account: name, phone or email, and Telegram if you choose. Requests: the problem, age and sex (optional), photos and voice messages, the chat. The doctor’s conclusion and visit requests. From doctors and clinics: specialty, licence number, workplace."],
      ["Why", "To connect you with the right doctor, agree a visit time, and send notices and reminders. We don’t sell your data or use it for advertising."],
      ["Who can see it", "Only you and the doctor who accepted your request see the request and chat (a request not yet accepted is seen by doctors who can accept it). A clinic sees only the visit requests sent to it. Admins have access to check doctors and clinics and for security."],
      ["Shifo_AI", "What you write to Shifo_AI is sent to an AI service (Groq) to get an answer; we don’t store that text. Don’t write your name, phone number or other personal details there. Shifo_AI doesn’t diagnose or prescribe."],
      ["Storage and security", "Connections to the site are encrypted (HTTPS). Photos are shrunk before sending and their location data is removed. During the pilot the servers are outside Uzbekistan. Before a full launch with real patients the data will move to servers in Uzbekistan, as the personal data law requires."],
      ["Your rights", "You can see and change your profile at any time. You can delete your account on the Settings page. Questions: write to our Telegram bot, @shifokor_com_bot."],
      ["Terms of use", "Shifokor is not a medical institution: advice comes from the doctor, who is responsible for it. An online consultation doesn’t fully replace an in-person examination; the doctor will refer you when needed. Our team checks doctors’ documents. Don’t give false details in someone else’s name. When paid consultations are on, payment goes through Payme or Click; Shifokor never sees card details."],
      ["Emergencies", "With chest pain, trouble breathing, fainting, heavy bleeding or other danger signs, don’t wait for an online consultation — call 103 at once."]
    ]
  });
})(window.SHIFOKOR_T);
