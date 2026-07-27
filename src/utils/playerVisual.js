const COUNTRY_FLAGS = {
  "UNITED STATES": "🇺🇸", USA: "🇺🇸", US: "🇺🇸",
  RUSSIA: "🇷🇺", RUS: "🇷🇺", RU: "🇷🇺",
  SPAIN: "🇪🇸", ESP: "🇪🇸", ES: "🇪🇸",
  FRANCE: "🇫🇷", FRA: "🇫🇷", FR: "🇫🇷",
  "UNITED KINGDOM": "🇬🇧", GBR: "🇬🇧", GB: "🇬🇧", UK: "🇬🇧",
  GERMANY: "🇩🇪", GER: "🇩🇪", DE: "🇩🇪",
  ITALY: "🇮🇹", ITA: "🇮🇹", IT: "🇮🇹",
  SERBIA: "🇷🇸", SRB: "🇷🇸", RS: "🇷🇸",
  ARGENTINA: "🇦🇷", ARG: "🇦🇷", AR: "🇦🇷",
  AUSTRALIA: "🇦🇺", AUS: "🇦🇺", AU: "🇦🇺",
  CANADA: "🇨🇦", CAN: "🇨🇦", CA: "🇨🇦",
  CHINA: "🇨🇳", CHN: "🇨🇳", CN: "🇨🇳",
  JAPAN: "🇯🇵", JPN: "🇯🇵", JP: "🇯🇵",
  "SOUTH KOREA": "🇰🇷", KOREA: "🇰🇷", KOR: "🇰🇷", KR: "🇰🇷",
  POLAND: "🇵🇱", POL: "🇵🇱", PL: "🇵🇱",
  "CZECH REPUBLIC": "🇨🇿", CZECHIA: "🇨🇿", CZE: "🇨🇿", CZ: "🇨🇿",
  SWITZERLAND: "🇨🇭", SUI: "🇨🇭", CH: "🇨🇭",
  GREECE: "🇬🇷", GRE: "🇬🇷", GR: "🇬🇷",
  DENMARK: "🇩🇰", DEN: "🇩🇰", DK: "🇩🇰",
  NORWAY: "🇳🇴", NOR: "🇳🇴", NO: "🇳🇴",
  SWEDEN: "🇸🇪", SWE: "🇸🇪", SE: "🇸🇪",
  BRAZIL: "🇧🇷", BRA: "🇧🇷", BR: "🇧🇷",
  CHILE: "🇨🇱", CHI: "🇨🇱", CL: "🇨🇱",
  COLOMBIA: "🇨🇴", COL: "🇨🇴", CO: "🇨🇴",
  MEXICO: "🇲🇽", MEX: "🇲🇽", MX: "🇲🇽",
  INDIA: "🇮🇳", IND: "🇮🇳", IN: "🇮🇳",
  KAZAKHSTAN: "🇰🇿", KAZ: "🇰🇿", KZ: "🇰🇿",
  UKRAINE: "🇺🇦", UKR: "🇺🇦", UA: "🇺🇦",
  BELARUS: "🇧🇾", BLR: "🇧🇾", BY: "🇧🇾",
  CROATIA: "🇭🇷", CRO: "🇭🇷", HR: "🇭🇷",
  ROMANIA: "🇷🇴", ROU: "🇷🇴", RO: "🇷🇴",
  BULGARIA: "🇧🇬", BUL: "🇧🇬", BG: "🇧🇬",
  HUNGARY: "🇭🇺", HUN: "🇭🇺", HU: "🇭🇺",
  AUSTRIA: "🇦🇹", AUT: "🇦🇹", AT: "🇦🇹",
  BELGIUM: "🇧🇪", BEL: "🇧🇪", BE: "🇧🇪",
  NETHERLANDS: "🇳🇱", NED: "🇳🇱", NL: "🇳🇱",
  PORTUGAL: "🇵🇹", POR: "🇵🇹", PT: "🇵🇹",
  TAIWAN: "🇹🇼", TPE: "🇹🇼", TW: "🇹🇼",
  "HONG KONG": "🇭🇰", HKG: "🇭🇰", HK: "🇭🇰",
  THAILAND: "🇹🇭", THA: "🇹🇭", TH: "🇹🇭",
  "NEW ZEALAND": "🇳🇿", NZL: "🇳🇿", NZ: "🇳🇿",
  "SOUTH AFRICA": "🇿🇦", RSA: "🇿🇦", ZA: "🇿🇦",
  PERU: "🇵🇪", PER: "🇵🇪", PE: "🇵🇪",
  ECUADOR: "🇪🇨", ECU: "🇪🇨", EC: "🇪🇨",
  SLOVAKIA: "🇸🇰", SVK: "🇸🇰", SK: "🇸🇰",
  SLOVENIA: "🇸🇮", SLO: "🇸🇮", SI: "🇸🇮",
  FINLAND: "🇫🇮", FIN: "🇫🇮", FI: "🇫🇮",
  TURKEY: "🇹🇷", TUR: "🇹🇷", TR: "🇹🇷",
  ISRAEL: "🇮🇱", ISR: "🇮🇱", IL: "🇮🇱",
  EGYPT: "🇪🇬", EGY: "🇪🇬", EG: "🇪🇬",
  TUNISIA: "🇹🇳", TUN: "🇹🇳", TN: "🇹🇳",
  MOROCCO: "🇲🇦", MAR: "🇲🇦", MA: "🇲🇦"
};

function getFlag(country) {
  if (!country) return "";
  var key = String(country).trim().toUpperCase();
  if (COUNTRY_FLAGS[key]) return COUNTRY_FLAGS[key];
  for (var k in COUNTRY_FLAGS) {
    if (key.indexOf(k) !== -1 || k.indexOf(key) !== -1) return COUNTRY_FLAGS[k];
  }
  return "";
}

function getPlayerPhoto(name, logo) {
  if (logo && String(logo).indexOf("http") === 0) return logo;
  var n = encodeURIComponent(name || "Player");
  return "https://ui-avatars.com/api/?name=" + n + "&background=0f172a&color=18d96d&size=128&bold=true";
}

function extractCountry(playerObj) {
  if (!playerObj) return null;
  return playerObj.player_country || playerObj.player_country_code || playerObj.country || null;
}

function extractLogo(playerObj) {
  if (!playerObj) return null;
  return playerObj.player_logo || playerObj.logo || null;
}

export { getFlag, getPlayerPhoto, extractCountry, extractLogo };
