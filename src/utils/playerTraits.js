function parseDate(d) {
  if (!d) return null;
  const s = String(d).trim();
  let y, m, day;
  if (s.indexOf("-") !== -1) {
    const p = s.split("-");
    if (p[0].length === 4) { y = +p[0]; m = +p[1]; day = +p[2]; }
    else { day = +p[0]; m = +p[1]; y = +p[2]; }
  } else if (s.indexOf(".") !== -1) {
    const p = s.split(".");
    day = +p[0]; m = +p[1]; y = +p[2];
  } else if (s.indexOf("/") !== -1) {
    const p = s.split("/");
    if (p[0].length === 4) { y = +p[0]; m = +p[1]; day = +p[2]; }
    else { day = +p[0]; m = +p[1]; y = +p[2]; }
  } else return null;
  if (!y || !m || !day) return null;
  const dt = new Date(y, m - 1, day);
  return isNaN(dt.getTime()) ? null : dt;
}

function daysBetween(a, b) {
  return Math.round((b - a) / 86400000);
}

function isFinished(m) {
  const st = (m.event_status || "").toLowerCase();
  if (!st) return true;
  return st.indexOf("finished") !== -1 || st.indexOf("retired") !== -1;
}

function didWin(m, playerKey) {
  const isP1 = String(m.first_player_key) === String(playerKey);
  if (m.event_winner === "First Player") return isP1;
  if (m.event_winner === "Second Player") return !isP1;
  return null;
}

function wasLongMatch(m) {
  const sc = String(m.event_final_result || "").replace(/\s/g, "");
  const parts = sc.split("-");
  if (parts.length === 2) {
    const a = Number(parts[0]) || 0, b = Number(parts[1]) || 0;
    if (a + b >= 3) return true;
    if ((a === 2 && b === 1) || (a === 1 && b === 2)) return true;
  }
  if (m.scores && m.scores.length >= 3) return true;
  return false;
}

function wasBagout(m, playerKey) {
  // won/lost 2-0 style
  const sc = String(m.event_final_result || "").replace(/\s/g, "");
  const parts = sc.split("-");
  if (parts.length !== 2) return false;
  const a = Number(parts[0]) || 0, b = Number(parts[1]) || 0;
  const isP1 = String(m.first_player_key) === String(playerKey);
  if (isP1 && a === 2 && b === 0) return "win";
  if (isP1 && a === 0 && b === 2) return "loss";
  if (!isP1 && b === 2 && a === 0) return "win";
  if (!isP1 && b === 0 && a === 2) return "loss";
  return false;
}

export function buildPlayerTraits(recent, playerKey, playerName) {
  const now = new Date();
  const list = (recent || []).filter(function(m) { return m && isFinished(m); });

  let last10 = 0, last5 = 0, lastMatchDays = null;
  list.forEach(function(m) {
    const d = parseDate(m.event_date);
    if (!d) return;
    const diff = daysBetween(d, now);
    if (diff >= 0 && diff <= 10) last10++;
    if (diff >= 0 && diff <= 5) last5++;
    if (lastMatchDays == null || diff < lastMatchDays) lastMatchDays = diff;
  });

  // fallback if API dates empty: density by recent list size
  if (last10 === 0 && list.length > 0) {
    last10 = Math.min(list.length, 5);
    last5 = Math.min(list.length, 3);
  }

  let fatigueLevel = "свежий";
  let fatigueScore = 0;
  let physical = "Физика: нормальный запас";
  if (last10 >= 5 || last5 >= 3) {
    fatigueLevel = "сильная нагрузка";
    fatigueScore = 3;
    physical = "Физика: риск усталости, тяжелее тянуть длинные розыгрыши";
  } else if (last10 >= 3 || last5 >= 2) {
    fatigueLevel = "заметная нагрузка";
    fatigueScore = 2;
    physical = "Физика: средняя свежесть, в 3-м сете может просесть";
  } else if (last10 === 2) {
    fatigueLevel = "умеренная нагрузка";
    fatigueScore = 1;
    physical = "Физика: небольшой расход сил за неделю";
  } else {
    physical = "Физика: свежие ноги, можно давить в длинных геймах";
  }

  if (lastMatchDays === 0 || lastMatchDays === 1) {
    fatigueScore = Math.max(fatigueScore, 2);
    physical = "Физика: мало восстановления после недавнего матча";
  }

  // Character / style from results
  let longW = 0, longL = 0, bagW = 0, bagL = 0;
  let wins = 0, losses = 0;
  list.forEach(function(m) {
    const w = didWin(m, playerKey);
    if (w == null) return;
    if (w) wins++; else losses++;
    if (wasLongMatch(m)) { if (w) longW++; else longL++; }
    const bag = wasBagout(m, playerKey);
    if (bag === "win") bagW++;
    if (bag === "loss") bagL++;
  });

  const style = [];
  // style of play inferred
  if (bagW >= 2 && bagW > bagL) style.push("Стиль: часто закрывает матчи быстро (контроль)");
  else if (bagL >= 2 && bagL > bagW) style.push("Стиль: иногда сыпется «всухую» — нужен быстрый старт");
  else style.push("Стиль: рабочий, без явного перекоса в быстрые разгромы");

  const longT = longW + longL;
  if (longT >= 2) {
    if (longW >= longL + 1) style.push("Характер: дожимает в долгих матчах");
    else if (longL >= longW + 1) style.push("Характер: после длинной борьбы чаще отдаёт");
    else style.push("Характер: в 3-сетовиках нестабилен");
  } else {
    style.push("Характер: мало длинных матчей в выборке");
  }

  if (wins + losses >= 4) {
    const wr = Math.round(wins / (wins + losses) * 100);
    style.push("Форма: " + wins + "W/" + losses + "L в последних (" + wr + "%)");
  }

  style.push(physical);

  return {
    name: playerName,
    last10: last10,
    last5: last5,
    lastMatchDays: lastMatchDays,
    fatigueLevel: fatigueLevel,
    fatigueScore: fatigueScore,
    traits: style.slice(0, 3).map(function(text) { return { text: text }; }),
    physical: physical
  };
}

export function compareFatigue(t1, t2) {
  if (!t1 || !t2) return "";
  if (t1.fatigueScore === t2.fatigueScore) {
    return "По свежести графики похожи — решают live-подача и брейки";
  }
  if (t1.fatigueScore > t2.fatigueScore) {
    return t1.name + " более нагружен — в равном сете преимущество свежести у " + t2.name;
  }
  return t2.name + " более нагружен — в равном сете преимущество свежести у " + t1.name;
}
