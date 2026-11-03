/* Copy for the simpler home search. */
(function (T) {
  var add = function (lang, o) { Object.keys(o).forEach(function (k) { T[lang][k] = o[k]; }); };
  add("uz", { hf_more: "Ko‘proq filtrlar: mutaxassislik, til, ayol shifokor", hf_try: "Masalan:", hf_tries: ["isitma", "tish og‘rig‘i", "bosim", "homiladorlik", "uyqusizlik"] });
  add("ru", { hf_more: "Ещё фильтры: специальность, язык, врач-женщина", hf_try: "Например:", hf_tries: ["температура", "зубная боль", "давление", "беременность", "бессонница"] });
  add("en", { hf_more: "More filters: specialty, language, woman doctor", hf_try: "Try:", hf_tries: ["fever", "toothache", "blood pressure", "pregnancy", "can’t sleep"] });
})(window.SHIFOKOR_T);
