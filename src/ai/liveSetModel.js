/**
 * Concrete live set model (not canned text).
 * Uses current games, server, hold estimates from match stats / defaults.
 */

function clamp(x, a, b) {
  return Math.max(a, Math.min(b, x));
}

function parseSets(match) {
  const sp = String((match && match.event_final_result) || "0-0").replace(/\s/g, "").split("-");
  return { s1: Number(sp[0] || 0), s2: Number(sp[1] || 0) };
}

function currentGames(match) {
  const { s1, s2 } = parseSets(match);
  const completed = s1 + s2;
  const scores = (match && match.scores) || [];
  if (scores.length > completed) {
    const last = scores[scores.length - 1];
    return {
      g1: Number(last.score_first || 0),
      g2: Number(last.score_second || 0),
      setNo: completed + 1
    };
  }
  return { g1: 0, g2: 0, setNo: completed + 1 };
}

function readHoldRate(match, playerKey) {
  // Prefer service games won / points if present
  if (!match || !match.statistics || !playerKey) return null;
  const names = [
    "Service games won",
    "Service Games Won",
    "Service games won percentage"
  ];
  for (let i = 0; i < names.length; i++) {
    const items = match.statistics.filter(function(s) {
      return String(s.player_key) === String(playerKey) && String(s.stat_name || "").toLowerCase() === names[i].toLowerCase();
    });
    if (!items.length) continue;
    const it = items[items.length - 1];
    if (it.stat_won != null && it.stat_total != null && Number(it.stat_total) > 0) {
      return Number(it.stat_won) / Number(it.stat_total);
    }
    const v = parseFloat(String(it.stat_value || "").replace("%", ""));
    if (!isNaN(v)) return v / 100;
  }
  // fallback from service points won
  const pts = match.statistics.filter(function(s) {
    return String(s.player_key) === String(playerKey) && /service points won/i.test(String(s.stat_name || ""));
  });
  if (pts.length) {
    const it = pts[pts.length - 1];
    const v = parseFloat(String(it.stat_value || "").replace("%", ""));
    if (!isNaN(v)) {
      // map points won \~62% -> hold \~0.78, 50% -> \~0.55
      return clamp(0.35 + (v / 100) * 0.7, 0.45, 0.92);
    }
  }
  return null;
}

function defaultHold(surfaceKey) {
  if (surfaceKey === "grass") return 0.82;
  if (surfaceKey === "clay") return 0.72;
  return 0.76; // hard
}

/**
 * From games g1-g2, server is 1 or 2, hold1/hold2.
 * Monte-Carlo-lite: iterate possible next games until set ends.
 */
function simulateSet(g1, g2, server, hold1, hold2, nSim) {
  nSim = nSim || 400;
  let win1 = 0;
  let sumGames = 0;
  let comeback2 = 0; // p2 wins set while trailing at start
  let comeback1 = 0;
  const startLead1 = g1 > g2;
  const startLead2 = g2 > g1;

  for (let s = 0; s < nSim; s++) {
    let a = g1, b = g2;
    let srv = server;
    let guard = 0;
    while (guard++ < 40) {
      // set over?
      if ((a >= 6 || b >= 6) && Math.abs(a - b) >= 2) break;
      if (a === 7 || b === 7) break; // TB simplified as game to 7
      // tiebreak at 6-6
      if (a === 6 && b === 6) {
        // TB: slight edge to better hold player
        const p1tb = hold1 / (hold1 + hold2);
        if (Math.random() < p1tb) a = 7; else b = 7;
        break;
      }
      const hold = srv === 1 ? hold1 : hold2;
      if (Math.random() < hold) {
        if (srv === 1) a++; else b++;
      } else {
        // break
        if (srv === 1) b++; else a++;
      }
      srv = srv === 1 ? 2 : 1;
    }
    const totalG = a + b;
    sumGames += totalG;
    if (a > b) {
      win1++;
      if (startLead2) comeback1++;
    } else {
      if (startLead1) comeback2++;
    }
  }

  return {
    p1Set: Math.round((win1 / nSim) * 100),
    p2Set: Math.round((1 - win1 / nSim) * 100),
    expGames: Math.round((sumGames / nSim) * 10) / 10,
    comebackP1: Math.round((comeback1 / nSim) * 100),
    comebackP2: Math.round((comeback2 / nSim) * 100)
  };
}

function expectedFinalScore(g1, g2, p1SetPct, expGames) {
  // most likely final set scoreband
  const lead = g1 - g2;
  if (p1SetPct >= 70) {
    if (g1 >= 5) return g1 >= 6 ? (g1 + ":" + g2 + " (закрытие)") : "6:" + g2 + " / 6:" + (g2 + 1);
    return "6:3 / 6:4";
  }
  if (p1SetPct <= 30) {
    if (g2 >= 5) return g2 >= 6 ? (g1 + ":" + g2 + " (закрытие)") : g1 + ":6 / " + (g1 + 1) + ":6";
    return "3:6 / 4:6";
  }
  if (Math.abs(lead) <= 1) return "7:5 / 7:6 (долгий сет)";
  return "около " + expGames + " геймов в сете";
}

export function analyzeLiveSet(match, surfaceKey) {
  if (!match) return null;
  const cg = currentGames(match);
  const { s1, s2 } = parseSets(match);
  const p1 = match.event_first_player || "Игрок 1";
  const p2 = match.event_second_player || "Игрок 2";

  let server = 0;
  if (match.event_serve === "First Player") server = 1;
  if (match.event_serve === "Second Player") server = 2;
  if (!server) server = 1;

  const base = defaultHold(surfaceKey || "hard");
  let hold1 = readHoldRate(match, match.first_player_key);
  let hold2 = readHoldRate(match, match.second_player_key);
  if (hold1 == null) hold1 = base;
  if (hold2 == null) hold2 = base;
  // shrink toward base if little evidence
  hold1 = clamp(hold1, 0.5, 0.95);
  hold2 = clamp(hold2, 0.5, 0.95);

  const sim = simulateSet(cg.g1, cg.g2, server, hold1, hold2, 500);
  const setFav = sim.p1Set >= sim.p2Set ? p1 : p2;
  const setPct = Math.max(sim.p1Set, sim.p2Set);

  let path = "";
  if (sim.p1Set >= 65) {
    path = p1 + " скорее закроет сет. Камбек " + p2 + " (\~" + sim.p2Set + "%) только через брейк и удержание.";
  } else if (sim.p2Set >= 65) {
    path = p2 + " скорее закроет сет. Камбек " + p1 + " (\~" + sim.p1Set + "%) только через брейк и удержание.";
  } else {
    path = "Сет на грани: кто первый сделает брейк — тот и возьмёт. Ожидаемо \~" + sim.expGames + " геймов.";
  }

  const serveName = server === 1 ? p1 : p2;
  const holdSrv = server === 1 ? hold1 : hold2;
  const holdNow = Math.round(holdSrv * 100);

  return {
    setNo: cg.setNo,
    g1: cg.g1,
    g2: cg.g2,
    s1: s1,
    s2: s2,
    server: serveName,
    hold1: Math.round(hold1 * 100),
    hold2: Math.round(hold2 * 100),
    p1Set: sim.p1Set,
    p2Set: sim.p2Set,
    setFav: setFav,
    setPct: setPct,
    expGames: sim.expGames,
    finalHint: expectedFinalScore(cg.g1, cg.g2, sim.p1Set, sim.expGames),
    path: path,
    holdNow: holdNow,
    detail:
      "Модель: удержание подачи " + p1 + " " + Math.round(hold1 * 100) + "% / " + p2 + " " + Math.round(hold2 * 100) +
      "%. Симуляция с счёта " + cg.g1 + ":" + cg.g2 + ", подаёт " + serveName + "."
  };
}
