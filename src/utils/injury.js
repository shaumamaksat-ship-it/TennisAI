const BAD = ["injur", "retire", "withdraw", "medical", "ambulance", "walkover", "wo ", "illness", "ankle", "knee", "shoulder", "wrist", "back pain", "aband", "снят", "травм", "отказ"];

export function matchInjurySignals(match) {
  const signals = [];
  if (!match) return signals;
  const st = (match.event_status || "").toLowerCase();
  if (st.indexOf("retired") !== -1) signals.push({ type: "retired", text: "Игрок снялся (Retired) — возможен фактор травмы/самочувствия" });
  if (st.indexOf("walkover") !== -1) signals.push({ type: "walkover", text: "Walkover — соперник не вышел на матч" });
  if (st.indexOf("cancelled") !== -1) signals.push({ type: "cancelled", text: "Матч отменён" });
  return signals;
}

export function scoreNewsRisk(items) {
  if (!items || !items.length) return { level: "low", label: "Явных новостей о травме не найдено", hits: [] };
  const hits = [];
  items.forEach(function(it) {
    const t = ((it.title || "") + " " + (it.source || "")).toLowerCase();
    for (let i = 0; i < BAD.length; i++) {
      if (t.indexOf(BAD[i]) !== -1) {
        hits.push(it);
        break;
      }
    }
  });
  if (hits.length >= 2) return { level: "high", label: "Много упоминаний травмы/снятия в новостях", hits: hits.slice(0, 4) };
  if (hits.length === 1) return { level: "mid", label: "Есть новости, похожие на травму/снятие", hits: hits.slice(0, 3) };
  return { level: "low", label: "Свежие новости есть, явной травмы не видно", hits: items.slice(0, 3) };
}
