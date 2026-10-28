"""Build clinics.js for the Shifokor site from Healthsites (OpenStreetMap, ODbL) and OCHA admin boundaries (CC BY-IGO)."""
import csv, json, re, sys, collections
sys.path.insert(0, ".")
import shp

OUT = sys.argv[1]

a1 = shp.read_dbf("adm/uzb_admbnda_adm1_2018b.dbf")
a2 = shp.read_dbf("adm/uzb_admbnda_adm2_2018b.dbf")
s1 = shp.read_polygons("adm/uzb_admbnda_adm1_2018b.shp")
s2 = shp.read_polygons("adm/uzb_admbnda_adm2_2018b.shp")

regions = sorted(range(len(a1)), key=lambda i: a1[i]["ADM1_EN"])
r_index = {a1[i]["ADM1_PCODE"]: n for n, i in enumerate(regions)}
R = [[a1[i]["ADM1_PCODE"], a1[i]["ADM1_EN"], a1[i]["ADM1_UZ"], a1[i]["ADM1_RU"]] for i in regions]

dists = sorted(range(len(a2)), key=lambda i: (a2[i]["ADM1_EN"], a2[i]["ADM2_EN"]))
d_index = {}
D = []
for n, i in enumerate(dists):
    row = a2[i]
    d_index[i] = n
    is_city = 1 if row.get("ADM2TYPEEN", "").lower() != "district" or row["ADM1_EN"] == "Tashkent city" else 0
    x0, y0, x1, y1 = shp.bbox(s2[i]) if s2[i] else (0, 0, 0, 0)
    D.append([row["ADM2_PCODE"], r_index[row["ADM1_PCODE"]], row["ADM2_EN"], row["ADM2_UZ"], row["ADM2_RU"], is_city, round((y0 + y1) / 2, 4), round((x0 + x1) / 2, 4)])
d_boxes = [(i, shp.bbox(s2[i])) for i in range(len(s2)) if s2[i]]
r_boxes = [(i, shp.bbox(s1[i])) for i in range(len(s1)) if s1[i]]


def locate(x, y):
    for i, (x0, y0, x1, y1) in d_boxes:
        if x0 <= x <= x1 and y0 <= y <= y1 and shp.contains(s2[i], x, y):
            return d_index[i]
    return None


def norm(s):
    s = (s or "").lower()
    for ch in "‘’ʻʼ`´":
        s = s.replace(ch, "'")
    return s

RX = lambda p: re.compile(p, re.I)
CATS = [
    ("emergency", RX(r"скор|tez yordam|tez tibbiy|ambulan|\b103\b|шошилинч|shoshilinch|экстрен|emergency|травмпункт|travmpunkt|travmatologiya punkt")),
    ("children", RX(r"детск|bolalar|болалар|children|pediatr|педиатр")),
    ("maternity", RX(r"роддом|родил|tug'?ruq|туғруқ|туғ|перинат|perinatal|ona va bola|она ва бола|мать и дит|материнст|maternit")),
    ("fdp", RX(r"qvp|svp|свп|қвп|квп|сельск|qishloq|кишлок|қишлоқ|oilaviy shifokor|оилавий шифокор|семейного врача|\bфап\b|\bfap\b|\boshp\b|\bошп\b|медпункт|фельдшер|feldsher|rural|врачебный пункт|vrachlik punkt")),
    ("fpc", RX(r"oilaviy poliklinika|оилавий поликлиника|семейн\w* поликлин|family polyclinic|family clinic|oilaviy")),
    ("district", RX(r"\btuman|\bтуман|районн|\bрайон|district|\bцрб\b|\bттб\b|\bttb\b|markaziy|марказий|централь|central")),
    ("special", RX(r"диспансер|dispanser|\bсэс\b|\bсес\b|\bses\b|санэпид|sanitar|санитар|tuberk|туберк|онкол|onkol|наркол|narkol|psixonevr|психоневр|психиатр|psixiatr|sanator|санатор|институт|institut|научн|ilmiy")),
    ("polyclinic", RX(r"poliklin|polikilin|poliklink|поликлин|polyclinic|policlinic")),
    ("hospital", RX(r"больниц|shifoxona|шифохона|kasalxona|касалхона|hospital|госпитал|gospital|klinik shifoxona")),
]
STATE_HINT = RX(r"davlat|давлат|государств|viloyat|вилоят|област|respublika|республик|shahar|шаҳар|городск|\bг[ао]р\w*больниц|№|\b\d+[- ]?(son|сон|-я|я|-й)\b|\bnomli\b")
PRIVATE = RX(r"\bmchj\b|\bмчж\b|\bооо\b|\bllc\b|\bxk\b|\bчп\b|частн|xususiy|хусусий|private|med ?servi|медсерви|medical cent|med cent|медцентр|medcentr|\bklinika|kilinika|(?<!поли)клиник|\bclinic\b|кардиолайф|cardio|kardio|stomat|стомат|dental|denta|optik|оптик|kosmet|космет|estet|эстет|beauty|labor|лаборат|diagnost|диагност|\bplus\b|premium|\bvip\b|\bmed\b|medic|медик|\bshifo\b|шифо\b|tabobat|табобат|\bdoktor\b|\bdoctor\b|\bdr\b|\bлор\b")
STRONG = {"emergency", "maternity", "fdp", "fpc", "district", "polyclinic"}


def classify(name, amenity, op_type):
    n = norm(name)
    cat = None
    for c, rx in CATS:
        if rx.search(n):
            cat = c
            break
    if op_type in ("government", "public"):
        own = "s"
    elif op_type == "private":
        own = "p"
    elif not n:
        own = "s" if amenity == "hospital" else "u"
    elif PRIVATE.search(n) and cat not in STRONG and not STATE_HINT.search(n):
        own = "p"
    elif cat or STATE_HINT.search(n):
        own = "s"
    else:
        own = "u"
    if not cat:
        cat = {"hospital": "hospital", "clinic": "clinic", "doctors": "clinic"}.get(amenity, "clinic")
    if own == "p" and cat in ("polyclinic", "hospital"):
        cat = "clinic" if cat == "polyclinic" else cat
    return cat, own

# names that are not health facilities (pharmacies, traditional healers) or that carry insults/accusations added by map users
DROP = RX(r"dorixona|дорихона|аптек|apteka|pharm|tabib|tabip|табиб|табип|мошен|aldamchi|алдамчи|firibgar|фирибгар|fraud|scam|обман|жулик|экспертиз|ekspertiz|судмед|суд-мед|sud-tibbiy|\bморг|\bmorg\b")
rows = list(csv.DictReader(open("hs.csv", encoding="utf-8")))
C, seen, near = [], set(), {}
stats = collections.Counter()
for x in rows:
    am, hc = x["amenity"], x["healthcare"]
    if am not in ("hospital", "clinic", "doctors") and hc not in ("hospital", "clinic", "doctor", "centre", "polyclinic"):
        continue
    if hc in ("laboratory", "optometrist", "physiotherapist", "alternative", "blood_donation"):
        continue
    try:
        lng, lat = float(x["X"]), float(x["Y"])
    except ValueError:
        continue
    key = x["osm_type"][:1] + x["osm_id"]
    if key in seen:
        continue
    seen.add(key)
    name = (x["name"] or "").strip().strip('"').replace("''", '"')
    if DROP.search(norm(name)):
        stats["dropped"] += 1
        continue
    cat, own = classify(name, am or hc, (x["operator_type"] or "").lower())
    d = locate(lng, lat)
    if d is None:
        stats["outside"] += 1
        continue
    if name:
        dup = near.get((norm(name), d))
        if dup and abs(dup[0] - lat) < 0.004 and abs(dup[1] - lng) < 0.004:
            stats["duplicate"] += 1
            continue
        near[(norm(name), d)] = (lat, lng)
    street = " ".join(v for v in [x["addr_street"], x["addr_housenumber"]] if v).strip()
    C.append([key, name, cat, own, round(lat, 5), round(lng, 5), d, (x["opening_hours"] or "").strip(), street, (x["addr_city"] or "").strip()])
    stats[own] += 1
    stats["cat_" + cat] += 1

C.sort(key=lambda c: (c[6], c[3] != "s", c[1] or "~"))
data = {
    "src": {"facilities": "Healthsites.io / OpenStreetMap contributors (ODbL)", "facilities_date": "2026-09-29",
            "boundaries": "OCHA COD-AB Uzbekistan 2018 (CC BY-IGO)", "built": "2026-10-27"},
    "r": R, "d": D, "c": C,
}
js = "/* Generated by build.py. Facilities: Healthsites.io / OpenStreetMap contributors (ODbL). Boundaries: OCHA COD-AB 2018 (CC BY-IGO). */\nwindow.SHIFOKOR_DATA = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n"
open(OUT, "w", encoding="utf-8").write(js)
print("clinics", len(C), dict(stats))
per_r = collections.Counter(R[D[c[6]][1]][1] for c in C if c[3] == "s")
print("state per region", per_r.most_common())
print("districts with no state facility", sum(1 for i in range(len(D)) if not any(c[6] == i and c[3] == "s" for c in C)))
print("size KB", len(js.encode()) // 1024)
