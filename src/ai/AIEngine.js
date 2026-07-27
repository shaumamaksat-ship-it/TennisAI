function loadBrain() {
  try {
    const raw = localStorage.getItem("tennisai_brain");
    if (!raw) {
      return {
        serveW: 0.18, returnW: 0.16, bpConvW: 0.14, bpSavedW: 0.12,
        ptsW: 0.18, formW: 0.20, momentumW: 2.0, liveScoreW: 0.32,
        prevSetW: 0.25, games: 0, correct: 0
      };
    }
    return JSON.parse(raw);
  } catch (e) {
    return {
      serveW: 0.18, returnW: 0.16, bpConvW: 0.14, bpSavedW: 0.12,
      ptsW: 0.18, formW: 0.20, momentumW: 2.0, liveScoreW: 0.32,
      prevSetW: 0.25, games: 0, correct: 0
    };
  }
}

function saveBrain(brain) {
  try { localStorage.setItem("tennisai_brain", JSON.stringify(brain)); } catch (e) {}
}

function getCurrentSetNumber(match) {
  const status = (match.event_status || "").toLowerCase();
  const m = status.match(/set\s*(\d+)/);
  if (m) return Number(m[1]);
  if (match.scores && match.scores.length) {
    const last = match.scores[match.scores.length - 1];
    if (last.score_set) return Number(last.score_set);
  }
  return 1;
}

function getCurrentSetGamesObj(match) {
  const setNo = getCurrentSetNumber(match);
  if (match.scores && match.scores.length) {
    for (let i = match.scores.length - 1; i >= 0; i--) {
      const s = match.scores[i];
      if (Number(s.score_set) === setNo) {
        return { g1: Number(s.score_first || 0), g2: Number(s.score_second || 0), setNo: setNo };
      }
    }
  }
  return { g1: 0, g2: 0, setNo: setNo };
}

function getSetsLead(match) {
  const raw = match.event_final_result || "0 - 0";
  const parts = raw.replace(/\s/g, "").split("-");
  return { s1: Number(parts[0] || 0), s2: Number(parts[1] || 0) };
}

function analyzePreviousSets(match) {
  const result = {
    prevSets: [], p1SetsWon: 0, p2SetsWon: 0,
    lastSetWinner: null, lastSetScore: null,
    lastSetWasClose: false, lastSetWasBlowout: false, notes: []
  };

  if (!match.scores || !match.scores.length) return result;
  const currentSet = getCurrentSetNumber(match);

  match.scores.filter(function(s) {
    return Number(s.score_set) < currentSet;
  }).forEach(function(s) {
    const g1 = Number(s.score_first || 0);
    const g2 = Number(s.score_second || 0);
    const winner = g1 > g2 ? 1 : 2;
    const total = g1 + g2;
    const diff = Math.abs(g1 - g2);

    if (winner === 1) result.p1SetsWon++; else result.p2SetsWon++;

    const info = {
      setNo: Number(s.score_set), g1: g1, g2: g2, winner: winner,
      total: total, diff: diff,
      close: diff <= 2 || total >= 12,
      blowout: diff >= 4 && total <= 9
    };
    result.prevSets.push(info);
  });

  if (result.prevSets.length > 0) {
    const last = result.prevSets[result.prevSets.length - 1];
    result.lastSetWinner = last.winner;
    result.lastSetScore = last.g1 + ":" + last.g2;
    result.lastSetWasClose = last.close;
    result.lastSetWasBlowout = last.blowout;

    if (last.winner === 1) result.notes.push("Прошлый сет взял 1-й игрок (" + last.g1 + ":" + last.g2 + ")");
    else result.notes.push("Прошлый сет взял 2-й игрок (" + last.g1 + ":" + last.g2 + ")");

    if (last.blowout) result.notes.push("Прошлый сет был разгромным");
    else if (last.close) result.notes.push("Прошлый сет был равным");
  }

  return result;
}

function calcFormFromResults(results, playerKey, playerName) {
  if (!results || results.length === 0) {
    return { wins: 0, losses: 0, winrate: 50, streak: "нет данных", hasData: false };
  }

  const last = results.slice(0, 15);
  let wins = 0, losses = 0;
  const recent = [];
  const nameParts = (playerName || "").toLowerCase().split(/[\s./]+/).filter(Boolean);

  last.forEach(function(m) {
    const status = (m.event_status || "").toLowerCase();
    if (status && status !== "finished" && status.indexOf("finished") === -1) return;

    const p1 = (m.event_first_player || "").toLowerCase();
    const p2 = (m.event_second_player || "").toLowerCase();
    const winner = m.event_winner;

    let isP1 = String(m.first_player_key) === String(playerKey);
    let isP2 = String(m.second_player_key) === String(playerKey);

    if (!isP1 && !isP2) {
      for (let i = 0; i < nameParts.length; i++) {
        const part = nameParts[i];
        if (part.length < 2) continue;
        if (p1.indexOf(part) !== -1) isP1 = true;
        if (p2.indexOf(part) !== -1) isP2 = true;
      }
    }
    if (!isP1 && !isP2) return;

    let won = false;
    if (isP1 && winner === "First Player") won = true;
    if (isP2 && winner === "Second Player") won = true;
    if (won) wins++; else losses++;
    recent.push(won ? "W" : "L");
  });

  const total = wins + losses;
  if (total === 0) return { wins: 0, losses: 0, winrate: 50, streak: "нет данных", hasData: false };

  const winrate = Math.round((wins / total) * 100);
  let streak = "ровная серия";
  if (recent.length > 0) {
    let count = 1;
    for (let i = 1; i < recent.length; i++) {
      if (recent[i] === recent[0]) count++; else break;
    }
    streak = recent[0] === "W" ? (count + " побед подряд") : (count + " поражений подряд");
  }
  return { wins: wins, losses: losses, winrate: winrate, streak: streak, hasData: true };
}

function buildLiveTotal(setInfo, holdStrength, breakPressure, prev) {
  const g1 = setInfo.g1;
  const g2 = setInfo.g2;
  const played = g1 + g2;
  const leader = Math.max(g1, g2);
  const trailer = Math.min(g1, g2);
  const gap = leader - trailer;

  // Базовое ожидание оставшихся геймов
  let remain = 0;

  if (leader >= 6 && gap >= 2) {
    // сет уже должен быть закончен / на грани
    remain = 0;
  } else if (leader === 6 && trailer === 5) {
    remain = 1.2; // возможен 7-5 или тай-брейк
  } else if (leader === 5 && trailer === 5) {
    remain = 2.3;
  } else if (leader === 5 && trailer === 4) {
    remain = 1.8;
  } else if (leader === 5) {
    remain = 1.4 + (trailer < 3 ? 0.3 : 0.8);
  } else if (leader === 4) {
    remain = 3.0;
    if (gap >= 2) remain = 2.2;
  } else if (leader === 3) {
    remain = 4.2;
    if (gap >= 2) remain = 3.3;
  } else if (leader <= 2) {
    remain = 6.5 - played * 0.15;
  }

  // Коррекция по стилю
  if (holdStrength >= 72) remain += 0.7;
  else if (holdStrength <= 55) remain -= 0.8;

  if (breakPressure >= 55) remain -= 0.5;
  if (breakPressure <= 35) remain += 0.4;

  if (prev && prev.lastSetWasBlowout) remain -= 0.4;
  if (prev && prev.lastSetWasClose) remain += 0.3;

  if (remain < 0) remain = 0;

  const expectedTotal = played + remain;

  // Живая линия тотала (ближайшая .5)
  let line = Math.floor(expectedTotal) + 0.5;
  if (line < played + 0.5) line = played + 0.5;

  // Популярные линии рядом
  const lines = [line - 1, line, line + 1].filter(function(x) { return x > played; });

  let side = "BORDER";
  let hint = "";

  if (remain <= 0.3) {
    hint = "Сет почти закрыт. Тотал уже roughly " + played + " геймов";
    side = "DONE";
  } else if (expectedTotal >= line + 0.45) {
    side = "OVER";
    hint = "Живой тотал " + line + ": скорее БОЛЬШЕ (ожидание \~" + expectedTotal.toFixed(1) + ")";
  } else if (expectedTotal <= line - 0.45) {
    side = "UNDER";
    hint = "Живой тотал " + line + ": скорее МЕНЬШЕ (ожидание \~" + expectedTotal.toFixed(1) + ")";
  } else {
    side = "BORDER";
    hint = "Живой тотал " + line + ": на грани (ожидание \~" + expectedTotal.toFixed(1) + ")";
  }

  // Доп. подсказка
  let extra = "";
  if (leader >= 5 && trailer >= 4) extra = "Высокий шанс уйти в 7-5 / тай-брейк";
  else if (gap >= 3 && leader >= 4) extra = "Лидер близко к быстрой закрытию сета";
  else if (played <= 2) extra = "Сет в начале — тотал ещё сильно плавает";

  return {
    played: played,
    expectedTotal: expectedTotal,
    line: line,
    side: side,
    hint: hint,
    extra: extra,
    remain: remain
  };
}


function getTournamentLevel(match) {
  const raw = ((match && (match.event_type_type || "")) + " " + (match.tournament_name || "")).toLowerCase();
  if (raw.indexOf("grand slam") !== -1 || raw.indexOf("wimbledon") !== -1 || raw.indexOf("us open") !== -1 || raw.indexOf("roland") !== -1 || raw.indexOf("australian") !== -1) return "gs";
  if (raw.indexOf("atp") !== -1 || raw.indexOf("wta") !== -1) return "tour";
  if (raw.indexOf("challenger") !== -1) return "challenger";
  if (raw.indexOf("itf") !== -1 || raw.indexOf("w15") !== -1 || raw.indexOf("w25") !== -1 || raw.indexOf("w35") !== -1 || raw.indexOf("m15") !== -1 || raw.indexOf("m25") !== -1) return "itf";
  return "other";
}

function getStatVal(match, playerKey, name) {
  if (!match || !match.statistics) return null;
  const items = match.statistics.filter(function(s) {
    return String(s.player_key) === String(playerKey) && s.stat_name === name && (s.stat_period === "match" || !s.stat_period);
  });
  if (!items.length) return null;
  const it = items[items.length - 1];
  if (it.stat_won != null && it.stat_total != null && Number(it.stat_total) > 0) {
    return { won: Number(it.stat_won), total: Number(it.stat_total), pct: Math.round(Number(it.stat_won) / Number(it.stat_total) * 100) };
  }
  const v = parseFloat(String(it.stat_value || "").replace("%", ""));
  if (!isNaN(v)) return { won: null, total: null, pct: v };
  return null;
}

function getMomentum(match) {
  // last games from scores array + point-by-point if present
  let p1 = 0, p2 = 0, text = "momentum ровный";
  if (match && match.scores && match.scores.length) {
    // compare set games progression roughly using last set score gap
    const last = match.scores[match.scores.length - 1];
    const g1 = Number(last.score_first || 0);
    const g2 = Number(last.score_second || 0);
    if (g1 > g2 + 1) { p1 += 2; text = "momentum у игрока 1"; }
    else if (g2 > g1 + 1) { p2 += 2; text = "momentum у игрока 2"; }
    else if (g1 > g2) { p1 += 1; text = "лёгкий momentum у игрока 1"; }
    else if (g2 > g1) { p2 += 1; text = "лёгкий momentum у игрока 2"; }
  }
  // recent points in event_game_result
  const gr = (match && match.event_game_result) ? String(match.event_game_result) : "";
  // if server is under pressure (0-40, 15-40) against
  return { p1: p1, p2: p2, text: text };
}

function calibrate(p1, p2, brain) {
  // soft calibration from historical accuracy
  const games = Number(brain.games || 0);
  const correct = Number(brain.correct || 0);
  if (games < 8) return { p1: p1, p2: p2 };
  const acc = correct / games;
  // if model overconfident and weak accuracy - shrink toward 50
  let shrink = 1;
  if (acc < 0.45) shrink = 0.75;
  else if (acc < 0.52) shrink = 0.85;
  else if (acc > 0.6) shrink = 1.05;
  let a = 50 + (p1 - 50) * shrink;
  let b = 50 + (p2 - 50) * shrink;
  const sum = a + b;
  if (sum <= 0) return { p1: 50, p2: 50 };
  a = Math.round(a / sum * 100);
  b = 100 - a;
  return { p1: a, p2: b };
}


export function analyzeMatch(match, formData, recent1, recent2, extra) {
  if (!match) return null;

  const extraData = extra || {};
  const surface = extraData.surface || { key: "hard", ru: "Хард" };
  const surf1 = extraData.surf1 || { winrate: 50, hasData: false };
  const surf2 = extraData.surf2 || { winrate: 50, hasData: false };
  const injuryRisk1 = extraData.injuryRisk1 || "low";
  const injuryRisk2 = extraData.injuryRisk2 || "low";
  const injurySignals = extraData.injurySignals || [];

  const brain = loadBrain();
  const stats = match.statistics || [];
  const p1Key = match.first_player_key;
  const p2Key = match.second_player_key;
  const p1Name = match.event_first_player || "Игрок 1";
  const p2Name = match.event_second_player || "Игрок 2";

  function getStat(playerKey, name) {
    const item = stats.find(function(s) {
      return String(s.player_key) === String(playerKey) &&
             s.stat_name === name &&
             s.stat_period === "match";
    });
    if (!item) return null;
    if (item.stat_value && String(item.stat_value).indexOf("%") !== -1) return parseInt(item.stat_value);
    if (item.stat_won != null) return Number(item.stat_won);
    return Number(item.stat_value) || 0;
  }

  const p1Serve = getStat(p1Key, "1st serve points won") ?? 55;
  const p2Serve = getStat(p2Key, "1st serve points won") ?? 55;
  const p1Return = getStat(p1Key, "1st return points won") ?? 30;
  const p2Return = getStat(p2Key, "1st return points won") ?? 30;
  const p1BPConv = getStat(p1Key, "Break Points Converted") ?? 35;
  const p2BPConv = getStat(p2Key, "Break Points Converted") ?? 35;
  const p1BPSaved = getStat(p1Key, "Break Points Saved") ?? 50;
  const p2BPSaved = getStat(p2Key, "Break Points Saved") ?? 50;
  const p1Pts = getStat(p1Key, "Total Points Won") ?? 50;
  const p2Pts = getStat(p2Key, "Total Points Won") ?? 50;
  const p1Last10 = getStat(p1Key, "Last 10 balls") ?? 5;
  const p2Last10 = getStat(p2Key, "Last 10 balls") ?? 5;
  const p1DF = getStat(p1Key, "Double Faults") ?? 0;
  const p2DF = getStat(p2Key, "Double Faults") ?? 0;

  let form1 = calcFormFromResults(formData && formData.firstPlayerResults, p1Key, p1Name);
  let form2 = calcFormFromResults(formData && formData.secondPlayerResults, p2Key, p2Name);
  if (!form1.hasData && recent1 && recent1.length) form1 = calcFormFromResults(recent1, p1Key, p1Name);
  if (!form2.hasData && recent2 && recent2.length) form2 = calcFormFromResults(recent2, p2Key, p2Name);

  const setInfo = getCurrentSetGamesObj(match);
  const sets = getSetsLead(match);
  const setNo = setInfo.setNo;
  const prev = analyzePreviousSets(match);

  let live1 = 50, live2 = 50;
  if (sets.s1 > sets.s2) live1 += 16;
  if (sets.s2 > sets.s1) live2 += 16;
  if (setInfo.g1 > setInfo.g2) live1 += Math.min(12, (setInfo.g1 - setInfo.g2) * 4);
  if (setInfo.g2 > setInfo.g1) live2 += Math.min(12, (setInfo.g2 - setInfo.g1) * 4);
  if (p1Last10 >= 7) live1 += 5;
  if (p2Last10 >= 7) live2 += 5;
  if (p1Last10 <= 3) live1 -= 4;
  if (p2Last10 <= 3) live2 -= 4;

  let prev1 = 0, prev2 = 0;
  if (prev.lastSetWinner === 1) { prev1 += 10; if (prev.lastSetWasBlowout) prev1 += 5; }
  if (prev.lastSetWinner === 2) { prev2 += 10; if (prev.lastSetWasBlowout) prev2 += 5; }
  if (prev.lastSetWasBlowout && prev.lastSetWinner === 2) prev1 -= 3;
  if (prev.lastSetWasBlowout && prev.lastSetWinner === 1) prev2 -= 3;
  prev1 += prev.p1SetsWon * 6;
  prev2 += prev.p2SetsWon * 6;

  let s1 =
    p1Serve * brain.serveW + p1Return * brain.returnW + p1BPConv * brain.bpConvW +
    p1BPSaved * brain.bpSavedW + p1Pts * brain.ptsW + form1.winrate * brain.formW +
    live1 * brain.liveScoreW + prev1 * brain.prevSetW;

  let s2 =
    p2Serve * brain.serveW + p2Return * brain.returnW + p2BPConv * brain.bpConvW +
    p2BPSaved * brain.bpSavedW + p2Pts * brain.ptsW + form2.winrate * brain.formW +
    live2 * brain.liveScoreW + prev2 * brain.prevSetW;

  // Покрытие
  if (injuryRisk1 === "high") s1 -= 6;
  if (injuryRisk2 === "high") s2 -= 6;
  if (injuryRisk1 === "mid") s1 -= 3;
  if (injuryRisk2 === "mid") s2 -= 3;
  if (injurySignals && injurySignals.length) {
    scenarios.push("⚠ " + injurySignals[0].text);
  }
  if (injuryRisk1 === "high") scenarios.push("Новости указывают на риск по состоянию " + p1Name);
  if (injuryRisk2 === "high") scenarios.push("Новости указывают на риск по состоянию " + p2Name);

  
  // --- UPGRADE: tournament level ---
  const level = getTournamentLevel(match);
  if (level === "tour" || level === "gs") {
    // at higher level live form & serve matter more already via weights
  } else if (level === "itf") {
    // more variance - slightly shrink later via calibrate; boost live score weight effect
    s1 += (Number(g1 || 0) - Number(g2 || 0)) * 0.4;
    s2 += (Number(g2 || 0) - Number(g1 || 0)) * 0.4;
  }

  // --- UPGRADE: break points ---
  const bp1 = getStatVal(match, match.first_player_key, "Break Points Converted")
    || getStatVal(match, match.first_player_key, "Break points converted")
    || getStatVal(match, match.first_player_key, "Break Points Won");
  const bp2 = getStatVal(match, match.second_player_key, "Break Points Converted")
    || getStatVal(match, match.second_player_key, "Break points converted")
    || getStatVal(match, match.second_player_key, "Break Points Won");
  const bpSaved1 = getStatVal(match, match.first_player_key, "Break Points Saved")
    || getStatVal(match, match.first_player_key, "Break points saved");
  const bpSaved2 = getStatVal(match, match.second_player_key, "Break Points Saved")
    || getStatVal(match, match.second_player_key, "Break points saved");

  if (bp1 && bp1.pct != null) s1 += (bp1.pct - 40) * 0.06;
  if (bp2 && bp2.pct != null) s2 += (bp2.pct - 40) * 0.06;
  if (bpSaved1 && bpSaved1.pct != null) s1 += (bpSaved1.pct - 50) * 0.04;
  if (bpSaved2 && bpSaved2.pct != null) s2 += (bpSaved2.pct - 50) * 0.04;

  // --- UPGRADE: momentum ---
  const mom = getMomentum(match);
  
  s1 += mom.p1 * 2.2;
  s2 += mom.p2 * 2.2;

  // surface by STRENGTH (wins+experience), not winrate
  if (surf1 && surf1.hasData) s1 += Math.min(12, (surf1.strength || 0) / 40);
  if (surf2 && surf2.hasData) s2 += Math.min(12, (surf2.strength || 0) / 40);
  if (surf1 && surf2 && surf1.hasData && surf2.hasData) {
    const d = (surf1.strength || 0) - (surf2.strength || 0);
    if (d > 30) s1 += 4;
    if (d < -30) s2 += 4;
  }
  // SET_DOMINANCE_BOOST
  // SCORE_HIERARCHY — сеты важнее геймов, геймы важнее очков
  (function() {
    var sp = String(match.event_final_result || "0-0").replace(/\s/g, "").split("-");
    var set1 = Number(sp[0] || 0);
    var set2 = Number(sp[1] || 0);
    var cg1 = 0, cg2 = 0;
    if (match.scores && match.scores.length) {
      var last = match.scores[match.scores.length - 1];
      cg1 = Number(last.score_first || 0);
      cg2 = Number(last.score_second || 0);
    }
    // sets: big weight
    s1 += (set1 - set2) * 8;
    s2 += (set2 - set1) * 8;
    // current set games
    s1 += (cg1 - cg2) * 5;
    s2 += (cg2 - cg1) * 5;
    // близко к взятию сета
    if (cg1 >= 5 && cg1 > cg2) s1 += 6;
    if (cg2 >= 5 && cg2 > cg1) s2 += 6;
    if (cg1 >= 5 && (cg1 - cg2) >= 3) s1 += 4;
    if (cg2 >= 5 && (cg2 - cg1) >= 3) s2 += 4;
    // if someone leads sets AND games — extra
    if (set1 > set2 && cg1 >= cg2) s1 += 3;
    if (set2 > set1 && cg2 >= cg1) s2 += 3;
    // if trailing sets but dominating current set hard (gap>=3) - partial comeback credit
    if (set1 < set2 && (cg1 - cg2) >= 3) s1 += 4;
    if (set2 < set1 && (cg2 - cg1) >= 3) s2 += 4;
  })();


  if (surf1.hasData) s1 += (surf1.winrate - 50) * 0.12;

  if (surf2.hasData) s2 += (surf2.winrate - 50) * 0.12;
  if (surf1.hasData && surf1.winrate >= 65) s1 += 3;
  if (surf2.hasData && surf2.winrate >= 65) s2 += 3;
  if (surf1.hasData && surf1.winrate <= 35) s1 -= 3;
  if (surf2.hasData && surf2.winrate <= 35) s2 -= 3;

  if (form1.streak.indexOf("побед") !== -1) s1 += 3;
  if (form2.streak.indexOf("побед") !== -1) s2 += 3;
  if (form1.streak.indexOf("поражений") !== -1) s1 -= 3;
  if (form2.streak.indexOf("поражений") !== -1) s2 -= 3;

  const totalStr = s1 + s2 || 1;
  let p1Chance = Math.round((s1 / totalStr) * 100);
  p1Chance = Math.max(22, Math.min(78, p1Chance));
  let p2Chance = 100 - p1Chance;

  let leaderText = "";
  let pressureText = "";
  if (sets.s2 > sets.s1 || (sets.s1 === sets.s2 && setInfo.g2 > setInfo.g1)) {
    leaderText = "Сейчас ведёт " + p2Name;
    pressureText = p1Name + " должен отыгрываться";
  } else if (sets.s1 > sets.s2 || (sets.s1 === sets.s2 && setInfo.g1 > setInfo.g2)) {
    leaderText = "Сейчас ведёт " + p1Name;
    pressureText = p2Name + " должен отыгрываться";
  } else {
    leaderText = "Счёт равный";
    pressureText = "Матч на тонкой грани";
  }

  const holdStrength = (p1Serve + p2Serve) / 2;
  const breakPressure = (p1BPConv + p2BPConv + (100 - p1BPSaved) + (100 - p2BPSaved)) / 4;
  const liveTotal = buildLiveTotal(setInfo, holdStrength, breakPressure, prev);

  // Сценарий сета с учётом ТЕКУЩЕГО счёта
  const g1 = setInfo.g1;
  const g2 = setInfo.g2;
  const leaderG = Math.max(g1, g2);
  const trailerG = Math.min(g1, g2);
  const gapG = leaderG - trailerG;
  const leadName = g1 > g2 ? p1Name : (g2 > g1 ? p2Name : null);

  let setScenario = "";
  if (leaderG >= 5 && gapG >= 3) {
    setScenario = "Сет " + setNo + ": " + leadName + " близко к разгрому (сейчас " + g1 + ":" + g2 + ")";
  } else if (leaderG >= 4 && gapG >= 3) {
    setScenario = "Сет " + setNo + ": " + leadName + " давит, путь к 6-1 / 6-2";
  } else if (leaderG >= 4 && gapG >= 2) {
    setScenario = "Сет " + setNo + ": " + leadName + " ближе к 6-2 / 6-3";
  } else if (leaderG >= 5 && gapG === 1) {
    setScenario = "Сет " + setNo + ": на грани, возможен 6-4 / 7-5";
  } else if (leaderG >= 5 && trailerG >= 5) {
    setScenario = "Сет " + setNo + ": равная рубка, 7-5 или тай-брейк";
  } else if (holdStrength >= 72 && breakPressure <= 40 && gapG <= 1) {
    setScenario = "Сет " + setNo + ": борьба / возможен длинный сет";
  } else if (gapG >= 2) {
    setScenario = "Сет " + setNo + ": " + leadName + " контролирует, соперник должен срочно брать брейк";
  } else if (holdStrength <= 55 || breakPressure >= 55) {
    setScenario = "Сет " + setNo + ": много брейков, сет может закрыться быстро";
  } else {
    setScenario = "Сет " + setNo + ": пока ровно, рабочий ход 6-3 / 6-4";
  }

  const serverIsP1 = match.event_serve === "First Player";
  const serverName = serverIsP1 ? p1Name : p2Name;
  const serverServe = serverIsP1 ? p1Serve : p2Serve;
  const serverSaved = serverIsP1 ? p1BPSaved : p2BPSaved;
  const returnerReturn = serverIsP1 ? p2Return : p1Return;
  const returnerBP = serverIsP1 ? p2BPConv : p1BPConv;

  let holdChance = Math.round(
    serverServe * 0.45 + serverSaved * 0.25 +
    (100 - returnerReturn) * 0.15 + (100 - returnerBP) * 0.15
  );
  holdChance = Math.max(35, Math.min(88, holdChance));
  const breakChance = 100 - holdChance;

  let nextGameHint = "";
  if (holdChance >= 70) nextGameHint = serverName + " скорее УДЕРЖИТ (" + holdChance + "%)";
  else if (holdChance <= 48) nextGameHint = "Шанс БРЕЙКА против " + serverName + " (" + breakChance + "%)";
  else nextGameHint = "Гейм на волоске: удержание \~" + holdChance + "%, брейк \~" + breakChance + "%";

  const reasons1 = [];
  const reasons2 = [];

  if (form1.hasData) { reasons1.push("Форма: " + form1.wins + "W / " + form1.losses + "L"); reasons1.push(form1.streak); }
  else reasons1.push("Форма: мало данных");
  if (form2.hasData) { reasons2.push("Форма: " + form2.wins + "W / " + form2.losses + "L"); reasons2.push(form2.streak); }
  else reasons2.push("Форма: мало данных");

  if (sets.s1 < sets.s2 || setInfo.g1 < setInfo.g2) reasons1.push("Сейчас уступает");
  if (sets.s2 < sets.s1 || setInfo.g2 < setInfo.g1) reasons2.push("Сейчас уступает");
  if (sets.s1 > sets.s2 || setInfo.g1 > setInfo.g2) reasons1.push("Сейчас ведёт");
  if (sets.s2 > sets.s1 || setInfo.g2 > setInfo.g1) reasons2.push("Сейчас ведёт");

  if (prev.lastSetWinner === 1) reasons1.push("Взял прошлый сет");
  if (prev.lastSetWinner === 2) reasons2.push("Взял прошлый сет");
  if (prev.lastSetWinner === 2) reasons1.push("Отдал прошлый сет");
  if (prev.lastSetWinner === 1) reasons2.push("Отдал прошлый сет");

  if (p1Serve >= 70) reasons1.push("Подача уверенная");
  else if (p1Serve < 58) reasons1.push("Подача под давлением");
  else reasons1.push("Подача средняя");

  if (p2Serve >= 70) reasons2.push("Подача уверенная");
  else if (p2Serve < 58) reasons2.push("Подача под давлением");
  else reasons2.push("Подача средняя");

  if (p1Return >= 40) reasons1.push("Опасно принимает");
  else if (p1Return < 28) reasons1.push("Слабо принимает");
  if (p2Return >= 40) reasons2.push("Опасно принимает");
  else if (p2Return < 28) reasons2.push("Слабо принимает");

  const scenarios = [];
  scenarios.push(leaderText);
  scenarios.push(pressureText);
  prev.notes.forEach(function(n) {
    scenarios.push(n.replace("1-й игрок", p1Name).replace("2-й игрок", p2Name));
  });
  scenarios.push(liveTotal.hint);
  if (liveTotal.extra) scenarios.push(liveTotal.extra);
  scenarios.push(setScenario);
  scenarios.push(nextGameHint);

  // Покрытие в тексте
  const surfaceLine = "Покрытие: " + surface.ru + (surface.assumed ? " (оценка по турниру)" : "");
  if (bp1 && bp1.pct != null) reasons1.push("Брейки: " + bp1.pct + "%");
  if (bp2 && bp2.pct != null) reasons2.push("Брейки: " + bp2.pct + "%");
  if (bpSaved1 && bpSaved1.pct != null) reasons1.push("Сейвы BP: " + bpSaved1.pct + "%");
  if (bpSaved2 && bpSaved2.pct != null) reasons2.push("Сейвы BP: " + bpSaved2.pct + "%");
  if (mom.p1 > mom.p2) reasons1.push("Momentum на своей стороне");
  if (mom.p2 > mom.p1) reasons2.push("Momentum на своей стороне");
  if (mom.p1 || mom.p2) scenarios.push("Momentum: " + (mom.p1 > mom.p2 ? p1Name : (mom.p2 > mom.p1 ? p2Name : "ровно")));
  scenarios.push("Уровень: " + (level === "gs" ? "Grand Slam" : level === "tour" ? "ATP/WTA" : level === "challenger" ? "Challenger" : level === "itf" ? "ITF" : "турнир"));
  scenarios.unshift(surfaceLine);
  if (surf1.hasData) {
    reasons1.push(surface.ru + ": " + surf1.won + "W/" + surf1.lost + "L (" + surf1.winrate + "%)");
    if (surf1.winrate >= 65) scenarios.push(p1Name + " силён на покрытии «" + surface.ru + "»");
    else if (surf1.winrate <= 35) scenarios.push(p1Name + " слаб на покрытии «" + surface.ru + "»");
  } else {
    reasons1.push(surface.ru + ": мало данных");
  }
  if (surf2.hasData) {
    reasons2.push(surface.ru + ": " + surf2.won + "W/" + surf2.lost + "L (" + surf2.winrate + "%)");
    if (surf2.winrate >= 65) scenarios.push(p2Name + " силён на покрытии «" + surface.ru + "»");
    else if (surf2.winrate <= 35) scenarios.push(p2Name + " слаб на покрытии «" + surface.ru + "»");
  } else {
    reasons2.push(surface.ru + ": мало данных");
  }

  if (surf1.hasData && surf2.hasData) {
    if (surf1.winrate - surf2.winrate >= 15) {
      scenarios.push("Преимущество покрытия у " + p1Name);
    } else if (surf2.winrate - surf1.winrate >= 15) {
      scenarios.push("Преимущество покрытия у " + p2Name);
    }
  }

  if (p1Chance >= 58) scenarios.push("Фаворит матча: " + p1Name + " (" + p1Chance + "%)");
  else if (p2Chance >= 58) scenarios.push("Фаворит матча: " + p2Name + " (" + p2Chance + "%)");
  else scenarios.push("Фаворита почти нет — матч 50/50");

  if (p1Last10 >= 7) scenarios.push("Momentum у " + p1Name);
  if (p2Last10 >= 7) scenarios.push("Momentum у " + p2Name);

    
  
  // LEADER_FROM_SCORE
  (function() {
    var sp = String(match.event_final_result || "0-0").replace(/\s/g, "").split("-");
    var set1 = Number(sp[0] || 0);
    var set2 = Number(sp[1] || 0);
    var cg1 = 0, cg2 = 0;
    if (match.scores && match.scores.length) {
      var last = match.scores[match.scores.length - 1];
      cg1 = Number(last.score_first || 0);
      cg2 = Number(last.score_second || 0);
    }
    var leadName = null;
    var leadSide = 0;
    if (set1 > set2) { leadName = p1Name; leadSide = 1; }
    else if (set2 > set1) { leadName = p2Name; leadSide = 2; }
    else if (cg1 > cg2) { leadName = p1Name; leadSide = 1; }
    else if (cg2 > cg1) { leadName = p2Name; leadSide = 2; }

    // if model favorite contradicts big on-court lead, nudge chances
    if (leadSide === 1 && p1Chance < p2Chance && (set1 > set2 || (cg1 - cg2) >= 2)) {
      var diff = Math.min(12, 6 + Math.abs(cg1 - cg2));
      p1Chance = Math.min(72, p1Chance + diff);
      p2Chance = 100 - p1Chance;
    }
    if (leadSide === 2 && p2Chance < p1Chance && (set2 > set1 || (cg2 - cg1) >= 2)) {
      var diff2 = Math.min(12, 6 + Math.abs(cg2 - cg1));
      p2Chance = Math.min(72, p2Chance + diff2);
      p1Chance = 100 - p2Chance;
    }
  })();

  // BUILD_CLEAN_REASONS
  (function() {
    const leadSets1 = Number(String(match.event_final_result || "0-0").split("-")[0]) || 0;
    const leadSets2 = Number(String(match.event_final_result || "0-0").split("-")[1]) || 0;
    let cg1 = 0, cg2 = 0;
    if (match.scores && match.scores.length) {
      const last = match.scores[match.scores.length - 1];
      cg1 = Number(last.score_first || 0);
      cg2 = Number(last.score_second || 0);
    }
    // match lead by sets, set lead by current games
    let matchLead = 0;
    if (leadSets1 > leadSets2) matchLead = 1;
    else if (leadSets2 > leadSets1) matchLead = 2;
    let setLead = 0;
    if (cg1 > cg2) setLead = 1;
    else if (cg2 > cg1) setLead = 2;

    const r1 = [];
    const r2 = [];
    // CLEAN_STREAK_FILTER — skip useless "1 win streak"
    function usefulStreak(st) {
      if (!st) return false;
      const s = String(st);
      if (s.indexOf("1 побед") !== -1 || s.indexOf("1 побед") !== -1) return false;
      if (s.indexOf("1 побед подряд") !== -1) return false;
      if (/^1\s*побед/.test(s)) return false;
      return true;
    }
    if (form1 && form1.streak && usefulStreak(form1.streak)) r1.push(form1.streak);
    if (form2 && form2.streak && usefulStreak(form2.streak)) r2.push(form2.streak);

    if (setLead === 1) { r1.push("Ведёт в сете " + cg1 + ":" + cg2); r2.push("Отстаёт в сете " + cg1 + ":" + cg2); }
    else if (setLead === 2) { r2.push("Ведёт в сете " + cg1 + ":" + cg2); r1.push("Отстаёт в сете " + cg1 + ":" + cg2); }
    else { r1.push("Сет равный " + cg1 + ":" + cg2); r2.push("Сет равный " + cg1 + ":" + cg2); }

    if (matchLead === 1) { r1.push("Ведёт в матче по сетам"); r2.push("Отстаёт по сетам"); }
    else if (matchLead === 2) { r2.push("Ведёт в матче по сетам"); r1.push("Отстаёт по сетам"); }

    if (typeof prev !== "undefined" && prev) {
      if (prev.lastWinner === 1) { r1.push("Взял прошлый сет"); r2.push("Отдал прошлый сет"); }
      if (prev.lastWinner === 2) { r2.push("Взял прошлый сет"); r1.push("Отдал прошлый сет"); }
    }

    if (typeof bp1 !== "undefined" && bp1 && bp1.total != null && bp1.total >= 3) r1.push("Брейки: " + bp1.won + "/" + bp1.total);
    else if (typeof bp1 !== "undefined" && bp1 && bp1.pct != null && bp1.pct !== 100) r1.push("Брейки: " + bp1.pct + "%");
    if (typeof bp2 !== "undefined" && bp2 && bp2.total != null && bp2.total >= 3) r2.push("Брейки: " + bp2.won + "/" + bp2.total);
    else if (typeof bp2 !== "undefined" && bp2 && bp2.pct != null && bp2.pct !== 100) r2.push("Брейки: " + bp2.pct + "%");
    if (typeof surf1 !== "undefined" && surf1.hasData) r1.push((surface && surface.ru ? surface.ru : "Покрытие") + ": " + surf1.winrate + "%");
    if (typeof surf2 !== "undefined" && surf2.hasData) r2.push((surface && surface.ru ? surface.ru : "Покрытие") + ": " + surf2.winrate + "%");

    if (typeof mom !== "undefined") {
      if (mom.p1 > mom.p2) r1.push("Momentum");
      else if (mom.p2 > mom.p1) r2.push("Momentum");
    }
    if (typeof injuryRisk1 !== "undefined" && injuryRisk1 === "high") r1.push("Риск по состоянию (новости)");
    if (typeof injuryRisk2 !== "undefined" && injuryRisk2 === "high") r2.push("Риск по состоянию (новости)");
    if (typeof injuryRisk1 !== "undefined" && injuryRisk1 === "mid") r1.push("Возможный фактор усталости/состояния");
    if (typeof injuryRisk2 !== "undefined" && injuryRisk2 === "mid") r2.push("Возможный фактор усталости/состояния");

    // overwrite
    reasons1.length = 0; reasons2.length = 0;
    r1.forEach(function(x) { reasons1.push(x); });
    r2.forEach(function(x) { reasons2.push(x); });

    // fix scenarios leader lines duplicates
    const filtered = [];
    const seen = {};
    (scenarios || []).forEach(function(s) {
      if (!s) return;
      if (seen[s]) return;
      // drop contradictory generic lines later
      seen[s] = 1;
      filtered.push(s);
    });
    scenarios.length = 0;
    // FILTER_NOISE_SCENARIOS
    filtered.forEach(function(s) {
      const x = String(s || "");
      if (x.indexOf("должен отыгрываться") !== -1) return;
      if (x.indexOf("Сейчас ведёт") !== -1) return;
      if (x.indexOf("Счёт равный") !== -1) return;
      if (x.indexOf("близко к быстрой") !== -1) return;
      if (x.indexOf("Прошлый сет был") !== -1) return;
      scenarios.push(s);
    });
  })();

  // RICH_NARRATIVE
  (function() {
    const p1 = p1Name;
    const p2 = p2Name;
    const fav = p1Chance >= p2Chance ? p1 : p2;
    const dog = p1Chance >= p2Chance ? p2 : p1;
    const favPct = Math.max(p1Chance, p2Chance);
    const dogPct = Math.min(p1Chance, p2Chance);

    let cg1 = 0, cg2 = 0;
    if (match.scores && match.scores.length) {
      const last = match.scores[match.scores.length - 1];
      cg1 = Number(last.score_first || 0);
      cg2 = Number(last.score_second || 0);
    }
    const sets = String(match.event_final_result || "0-0");
    const points = String(match.event_game_result || "0-0");
    const serve = match.event_serve === "First Player" ? p1 : (match.event_serve === "Second Player" ? p2 : "неизвестно");

    const why = [];
    why.push("Почему " + fav + " выше (" + favPct + "%): лучше сочетание live-счёта, формы и ключевых метрик");
    if (p1Chance > p2Chance) {
      if (cg1 > cg2 || Number(sets.split("-")[0]||0) > Number(sets.split("-")[1]||0)) why.push(p1 + " ведёт по ходу матча — это главный плюс к %");
      if (typeof bp1 !== "undefined" && typeof bp2 !== "undefined" && bp1 && bp2 && bp1.pct != null && bp2.pct != null && bp1.pct > bp2.pct) why.push(p1 + " лучше реализует брейки (" + bp1.pct + "% vs " + bp2.pct + "%)");
      if (typeof surf1 !== "undefined" && typeof surf2 !== "undefined" && surf1.hasData && surf2.hasData && surf1.winrate > surf2.winrate) why.push("На покрытии «" + (surface.ru||"") + "» " + p1 + " выглядит увереннее");
    } else {
      if (cg2 > cg1 || Number(sets.split("-")[1]||0) > Number(sets.split("-")[0]||0)) why.push(p2 + " ведёт по ходу матча — это главный плюс к %");
      if (typeof bp1 !== "undefined" && typeof bp2 !== "undefined" && bp1 && bp2 && bp1.pct != null && bp2.pct != null && bp2.pct > bp1.pct) why.push(p2 + " лучше реализует брейки (" + bp2.pct + "% vs " + bp1.pct + "%)");
      if (typeof surf1 !== "undefined" && typeof surf2 !== "undefined" && surf1.hasData && surf2.hasData && surf2.winrate > surf1.winrate) why.push("На покрытии «" + (surface.ru||"") + "» " + p2 + " выглядит увереннее");
    }

    why.push("Почему " + dog + " ниже (" + dogPct + "%): отставание в матче и/или слабее ключевые показатели");
    if (form1 && form2 && form1.streak && form2.streak) {
      why.push("Форма: " + p1 + " — " + (form1.text||form1.streak) + "; " + p2 + " — " + (form2.text||form2.streak));
    }

    // game narrative
    why.push("Сейчас подаёт: " + serve + ". Счёт гейма " + points + ", геймы сета " + cg1 + ":" + cg2);
    if (match.event_serve === "First Player") {
      why.push("Как может закончиться гейм: " + p1 + " удержит, если закроет очки на подаче; брейк " + p2 + " возможен при серии ошибок 1-й подачи / DF");
    } else if (match.event_serve === "Second Player") {
      why.push("Как может закончиться гейм: " + p2 + " удержит при стабильной подаче; брейк " + p1 + " — если заставит играть 2-ю подачу");
    }

    // set narrative
    const gap = Math.abs(cg1 - cg2);
    if (gap >= 3) {
      const leader = cg1 > cg2 ? p1 : p2;
      why.push("Сет: " + leader + " близко к взятию сета при удержании своих подач (сейчас " + cg1 + ":" + cg2 + ")");
    } else if (gap === 0) {
      why.push("Сет равный (" + cg1 + ":" + cg2 + "): решит первый брейк или тай-брейк");
    } else {
      why.push("Сет пока "+cg1+":"+cg2+" — отстающему нужен брейк, лидеру хватит держать подачу");
    }

    // how can lose
    why.push("Почему фаворит может проиграть: серия DF, потеря своей подачи, спад после длинного гейма, психология при брейк-пойнтах");
    why.push("Почему андердог может выиграть: ранний брейк, давление на 2-й подаче фаворита, камбек по геймам, ошибка фаворита на своих подачах");

    // push into scenarios (limit)
    why.forEach(function(line) {
      if (scenarios.length < 16) scenarios.push(line);
    });
  })();



try {
    const cal = calibrate(p1Chance, p2Chance, brain);
    p1Chance = cal.p1;
    p2Chance = cal.p2;
  } catch (e) {}


  // LEADER_TEXT_FIX
  var _sp = String(match.event_final_result || "0-0").replace(/\s/g, "").split("-");
  var _s1 = Number(_sp[0] || 0), _s2 = Number(_sp[1] || 0);
  var _g1 = 0, _g2 = 0;
  if (match.scores && match.scores.length) {
    var _last = match.scores[match.scores.length - 1];
    _g1 = Number(_last.score_first || 0);
    _g2 = Number(_last.score_second || 0);
  }
  leaderText = "";
  if (_g1 !== _g2) {
    leaderText = "В сете ведёт " + (_g1 > _g2 ? p1Name : p2Name) + " (" + _g1 + ":" + _g2 + ")";
  } else {
    leaderText = "Сет равный (" + _g1 + ":" + _g2 + ")";
  }
  if (_s1 !== _s2) {
    leaderText += " · В матче по сетам ведёт " + (_s1 > _s2 ? p1Name : p2Name) + " (" + _s1 + "-" + _s2 + ")";
  }
  // if dominating set while trailing match - boost already applied; reflect favorite after scores
  if (_g1 >= 5 && _g1 - _g2 >= 2) {
    // p1 closing set
    if (p1Chance < p2Chance) { p1Chance = Math.max(p1Chance, p2Chance + 2); p2Chance = 100 - p1Chance; }
  }
  if (_g2 >= 5 && _g2 - _g1 >= 2) {
    if (p2Chance < p1Chance) { p2Chance = Math.max(p2Chance, p1Chance + 2); p1Chance = 100 - p2Chance; }
  }
return {
    p1Chance: p1Chance,
    p2Chance: p2Chance,
    reasons1: reasons1.slice(0, 5),
    reasons2: reasons2.slice(0, 5),
    scenarios: scenarios.slice(0, 9),
    totalHint: liveTotal.hint,
    totalLine: liveTotal.line,
    totalSide: liveTotal.side,
    totalExpected: liveTotal.expectedTotal,
    setScenario: setScenario,
    nextGameHint: nextGameHint,
    holdChance: holdChance,
    breakChance: breakChance,
    currentSetGames: setInfo.g1 + " : " + setInfo.g2,
    currentSetNo: setNo,
    leaderText: leaderText,
    favoriteName: p1Chance >= p2Chance ? p1Name : p2Name,
    favoriteChance: Math.max(p1Chance, p2Chance),
    surfaceRu: surface.ru,
    surfaceKey: surface.key,
    surfaceP1Text: (function() {
      if (!surf1.hasData) return p1Name + " на «" + surface.ru + "»: мало данных";
      var tag = surf1.winrate >= 65 ? "силён" : (surf1.winrate <= 35 ? "слаб" : "средне");
      return p1Name + " на «" + surface.ru + "»: " + tag + " (" + surf1.won + "W/" + surf1.lost + "L, " + surf1.winrate + "%)";
    })(),
    surfaceP2Text: (function() {
      if (!surf2.hasData) return p2Name + " на «" + surface.ru + "»: мало данных";
      var tag = surf2.winrate >= 65 ? "силён" : (surf2.winrate <= 35 ? "слаб" : "средне");
      return p2Name + " на «" + surface.ru + "»: " + tag + " (" + surf2.won + "W/" + surf2.lost + "L, " + surf2.winrate + "%)";
    })(),
    surfaceVerdict: (function() {
      if (surf1.hasData && surf2.hasData) {
        var diff = surf1.winrate - surf2.winrate;
        if (diff >= 8) return "⚡ Преимущество покрытия: " + p1Name + " (+" + diff + "%)";
        if (diff <= -8) return "⚡ Преимущество покрытия: " + p2Name + " (+" + Math.abs(diff) + "%)";
        return "⚡ На «" + surface.ru + "» примерно равны";
      }
      if (surf1.hasData && !surf2.hasData) {
        return surf1.winrate >= 55
          ? ("⚡ По покрытию лучше выглядит " + p1Name + " (у соперника мало данных)")
          : ("⚡ Данных по покрытию мало для точного преимущества");
      }
      if (!surf1.hasData && surf2.hasData) {
        return surf2.winrate >= 55
          ? ("⚡ По покрытию лучше выглядит " + p2Name + " (у соперника мало данных)")
          : ("⚡ Данных по покрытию мало для точного преимущества");
      }
      return "⚡ По покрытию данных почти нет — опираемся на live-счёт";
    })()
  };
}


function isNoiseResult(match) {
  const st = ((match && match.event_status) || "").toLowerCase();
  return st.indexOf("retired") !== -1 || st.indexOf("walkover") !== -1 || st.indexOf("wo") !== -1 || st.indexOf("cancelled") !== -1;
}

export function buildFinalReport(match, aiSnapshot) {
  if (!match) return null;

  const winner = match.event_winner; // "First Player" / "Second Player"
  const p1Name = match.event_first_player || "Игрок 1";
  const p2Name = match.event_second_player || "Игрок 2";
  const score = match.event_final_result || "-";

  let winnerName = "Неизвестно";
  let didP1Win = null;
  if (winner === "First Player") { winnerName = p1Name; didP1Win = true; }
  if (winner === "Second Player") { winnerName = p2Name; didP1Win = false; }

  const predictedP1 = aiSnapshot && aiSnapshot.p1Chance >= 50;
  const predictedName = predictedP1 ? p1Name : p2Name;
  const predictedChance = aiSnapshot ? Math.max(aiSnapshot.p1Chance, aiSnapshot.p2Chance) : 50;

  let correct = null;
  if (didP1Win !== null && aiSnapshot) {
    correct = predictedP1 === didP1Win;
  }

  // обучение
  if (didP1Win !== null) {
    try {
    if (didP1Win !== null && !isNoiseResult(match)) learnFromResult(didP1Win);
  } catch (e) {}
  }

  // история прогнозов
  try {
    const histRaw = localStorage.getItem("tennisai_history");
    const hist = histRaw ? JSON.parse(histRaw) : [];
    hist.push({
      p1: p1Name,
      p2: p2Name,
      winner: winnerName,
      score: score,
      predicted: predictedName,
      chance: predictedChance,
      correct: correct,
      ts: Date.now()
    });
    localStorage.setItem("tennisai_history", JSON.stringify(hist.slice(-50)));
  } catch (e) {}

  const lessons = [];
  if (correct === true) {
    lessons.push("Прогноз совпал с результатом");
    lessons.push("ИИ верно оценил баланс формы и live-счёта");
  } else if (correct === false) {
    lessons.push("Прогноз не совпал — ИИ ошибся");
    lessons.push("Веса модели слегка скорректированы");
  } else {
    lessons.push("Не удалось определить победителя из API");
  }

  lessons.push("Итоговый счёт: " + score);
  lessons.push("Победитель: " + winnerName);

  if (aiSnapshot && aiSnapshot.leaderText) {
    lessons.push("В лайве ИИ видел: " + aiSnapshot.leaderText);
  }

  return {
    winnerName: winnerName,
    score: score,
    predictedName: predictedName,
    predictedChance: predictedChance,
    correct: correct,
    lessons: lessons,
    didP1Win: didP1Win
  };
}

export function learnFromResult(didP1Win) {
  function loadBrain() {
    try {
      const raw = localStorage.getItem("tennisai_brain");
      if (!raw) {
        return {
          serveW: 0.18, returnW: 0.16, bpConvW: 0.14, bpSavedW: 0.12,
          ptsW: 0.18, formW: 0.20, momentumW: 2.0, liveScoreW: 0.32,
          prevSetW: 0.25, games: 0, correct: 0
        };
      }
      return JSON.parse(raw);
    } catch (e) {
      return {
        serveW: 0.18, returnW: 0.16, bpConvW: 0.14, bpSavedW: 0.12,
        ptsW: 0.18, formW: 0.20, momentumW: 2.0, liveScoreW: 0.32,
        prevSetW: 0.25, games: 0, correct: 0
      };
    }
  }
  function saveBrain(brain) {
    try { localStorage.setItem("tennisai_brain", JSON.stringify(brain)); } catch (e) {}
  }

  const brain = loadBrain();
  const predRaw = localStorage.getItem("tennisai_last_pred");
  brain.games += 1;

  if (predRaw) {
    try {
      const pred = JSON.parse(predRaw);
      const predictedP1 = pred.p1Chance >= 50;
      if (predictedP1 === didP1Win) {
        brain.correct += 1;
        brain.liveScoreW = Math.min(0.42, (brain.liveScoreW || 0.32) + 0.005);
      } else {
        // ошибка — чуть меньше верим форме, больше live
        brain.formW = Math.max(0.12, (brain.formW || 0.20) - 0.01);
        brain.liveScoreW = Math.min(0.45, (brain.liveScoreW || 0.32) + 0.015);
        brain.prevSetW = Math.min(0.35, (brain.prevSetW || 0.25) + 0.01);
      }
    } catch (e) {}
  }

  saveBrain(brain);
  return brain;
}
