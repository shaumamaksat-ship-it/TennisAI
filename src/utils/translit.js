const RU_TO_LAT = {
  "а":"a","б":"b","в":"v","г":"g","д":"d","е":"e","ё":"e","ж":"zh","з":"z","и":"i","й":"y",
  "к":"k","л":"l","м":"m","н":"n","о":"o","п":"p","р":"r","с":"s","т":"t","у":"u","ф":"f",
  "х":"h","ц":"ts","ч":"ch","ш":"sh","щ":"sch","ъ":"","ы":"y","ь":"","э":"e","ю":"yu","я":"ya"
};

// частые фамилии тенниса (латиница -> русский)
const NAME_MAP = {
  "djokovic": "Джокович",
  "nadal": "Надаль",
  "federer": "Федерер",
  "murray": "Маррей",
  "sinner": "Синнер",
  "alcaraz": "Алькарас",
  "medvedev": "Медведев",
  "rublev": "Рублёв",
  "zverev": "Зверев",
  "tsitsipas": "Циципас",
  "ruud": "Руд",
  "rune": "Руне",
  "fritz": "Фриц",
  "tiafoe": "Тиафо",
  "paul": "Пол",
  "shelton": "Шелтон",
  "de minaur": "Де Минаур",
  "hurkacz": "Хуркач",
  "auger-aliassime": "Оже-Альяссим",
  "bublik": "Бублик",
  "khachanov": "Хачанов",
  "safiullin": "Сафиуллин",
  "karatsev": "Карацев",
  "king": "Кинг",
  "mayo": "Майо",
  "boyer": "Бойер",
  "claverie": "Клавери",
  "kwon": "Квон",
  "kupres": "Купрес",
  "savinykh": "Савиных",
  "rubio fierros": "Рубио Фьеррос",
  "fierros": "Фьеррос",
  "rubio": "Рубио",
  "kuramochi": "Курамоти",
  "kuwata": "Кувата",
  "evan": "Эван",
  "carlos": "Карлос",
  "novak": "Новак",
  "jannik": "Янник",
  "daniil": "Даниил",
  "andrey": "Андрей",
  "alexander": "Александр",
  "taylor": "Тейлор",
  "tommy": "Томми",
  "ben": "Бен",
  "frances": "Фрэнсис",
  "sebastian": "Себастьян",
  "casper": "Каспер",
  "holger": "Хольгер",
  "alex": "Алекс",
  "lorenzo": "Лоренцо",
  "stefanos": "Стефанос"
};

export function ruToLat(str) {
  return String(str || "").toLowerCase().split("").map(function(ch) {
    return RU_TO_LAT[ch] !== undefined ? RU_TO_LAT[ch] : ch;
  }).join("");
}

export function normalize(str) {
  return ruToLat(str)
    .toLowerCase()
    .replace(/ё/g, "e")
    .replace(/[^a-z0-9\s\-\.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function namesMatch(query, name) {
  const q = normalize(query);
  const n = normalize(name);
  if (!q) return true;
  if (n.indexOf(q) !== -1) return true;
  // token match: "кинг" -> king inside "e king"
  const qParts = q.split(" ").filter(Boolean);
  const nParts = n.split(" ").filter(Boolean);
  return qParts.every(function(qp) {
    return nParts.some(function(np) { return np.indexOf(qp) !== -1 || qp.indexOf(np) !== -1; });
  });
}

function translitToken(token) {
  const t = token.toLowerCase().replace(/\./g, "");
  if (NAME_MAP[t]) return NAME_MAP[t];
  // simple phonetic fallback latin->cyrillic-ish
  let s = t;
  s = s.replace(/sch/g, "щ").replace(/sh/g, "ш").replace(/ch/g, "ч").replace(/zh/g, "ж").replace(/ts/g, "ц");
  s = s.replace(/yo/g, "ё").replace(/yu/g, "ю").replace(/ya/g, "я").replace(/kh/g, "х");
  const map = { a:"а", b:"б", c:"к", d:"д", e:"е", f:"ф", g:"г", h:"х", i:"и", j:"дж", k:"к", l:"л", m:"м", n:"н", o:"о", p:"п", q:"к", r:"р", s:"с", t:"т", u:"у", v:"в", w:"в", x:"кс", y:"й", z:"з" };
  return s.split("").map(function(ch) { return map[ch] || ch; }).join("");
}

export function toRussianName(name) {
  if (!name) return "";
  // if already cyrillic mostly - return as is
  if (/[а-яё]/i.test(name) && !/[a-z]/i.test(name)) return name;

  const full = String(name).trim();
  const low = full.toLowerCase();
  if (NAME_MAP[low]) return NAME_MAP[low];

  // try last name map
  const parts = full.split(/\s+/);
  const out = parts.map(function(p) {
    const clean = p.replace(/\./g, "").toLowerCase();
    if (NAME_MAP[clean]) return NAME_MAP[clean];
    // initials like E. or A.F.
    if (/^[A-Za-z]\.$/.test(p)) return p.replace(/[A-Za-z]/, function(ch) {
      const m = { A:"А", B:"Б", C:"К", D:"Д", E:"Э", F:"Ф", G:"Г", H:"Х", I:"И", J:"Дж", K:"К", L:"Л", M:"М", N:"Н", O:"О", P:"П", R:"Р", S:"С", T:"Т", U:"У", V:"В", W:"В", Y:"Й", Z:"З" };
      return (m[ch.toUpperCase()] || ch) + ".";
    });
    if (/^[A-Za-z](\.[A-Za-z])+\.?$/.test(p)) {
      return p.split(".").filter(Boolean).map(function(ch) {
        const m = { A:"А", B:"Б", C:"К", D:"Д", E:"Э", F:"Ф", G:"Г", H:"Х", I:"И", J:"Дж", K:"К", L:"Л", M:"М", N:"Н", O:"О", P:"П", R:"Р", S:"С", T:"Т", U:"У", V:"В", W:"В", Y:"Й", Z:"З" };
        return (m[ch.toUpperCase()] || ch) + ".";
      }).join("");
    }
    // capitalized translit
    const tr = translitToken(p);
    return tr.charAt(0).toUpperCase() + tr.slice(1);
  });
  return out.join(" ");
}
