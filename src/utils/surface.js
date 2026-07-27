export function detectSurface(match) {
  if (!match) return { key: "hard", ru: "Хард", assumed: true };

  const raw = [
    match.event_surface, match.surface, match.tournament_surface,
    match.event_type_type, match.tournament_name, match.event_stadium
  ].filter(Boolean).join(" ").toLowerCase();

  if (raw.indexOf("clay") !== -1 || raw.indexOf("грунт") !== -1) return { key: "clay", ru: "Грунт" };
  if (raw.indexOf("grass") !== -1 || raw.indexOf("трава") !== -1) return { key: "grass", ru: "Трава" };
  if (raw.indexOf("carpet") !== -1) return { key: "carpet", ru: "Ковёр" };
  if (raw.indexOf("hard") !== -1 || raw.indexOf("хард") !== -1) return { key: "hard", ru: "Хард" };

  const tour = (match.tournament_name || "").toLowerCase();
  if (tour.indexOf("roland") !== -1 || tour.indexOf("french") !== -1 || tour.indexOf("madrid") !== -1 || tour.indexOf("rome") !== -1) return { key: "clay", ru: "Грунт" };
  if (tour.indexOf("wimbledon") !== -1 || tour.indexOf("halle") !== -1) return { key: "grass", ru: "Трава" };
  if (tour.indexOf("cabos") !== -1 || tour.indexOf("vancouver") !== -1 || tour.indexOf("us open") !== -1 || tour.indexOf("australian") !== -1) return { key: "hard", ru: "Хард" };

  return { key: "hard", ru: "Хард", assumed: true };
}

function sumSurface(stats, surfaceKey) {
  let won = 0, lost = 0;
  (stats || []).forEach(function(s) {
    if ((s.type || "").toLowerCase() === "doubles") return;
    if (surfaceKey === "clay") { won += Number(s.clay_won || 0); lost += Number(s.clay_lost || 0); }
    else if (surfaceKey === "grass") { won += Number(s.grass_won || 0); lost += Number(s.grass_lost || 0); }
    else { won += Number(s.hard_won || 0); lost += Number(s.hard_lost || 0); }
  });
  return { won: won, lost: lost };
}

function sumOverall(stats) {
  let won = 0, lost = 0;
  (stats || []).forEach(function(s) {
    if ((s.type || "").toLowerCase() === "doubles") return;
    won += Number(s.matches_won || 0);
    lost += Number(s.matches_lost || 0);
  });
  return { won: won, lost: lost };
}

/**
 * Strength on surface = primarily volume of wins + experience.
 * NOT raw winrate.
 * score ≈ wins * 1.0 + total * 0.25  (experience floor)
 * Small samples get capped so 18-6 cannot beat 167-121.
 */
export function surfaceRecord(playerInfo, surfaceKey) {
  if (!playerInfo || !playerInfo.stats || !playerInfo.stats.length) {
    return {
      won: 0, lost: 0, total: 0, winrate: 50,
      strength: 0, hasData: false, source: "none",
      label: "нет данных"
    };
  }

  let surf = sumSurface(playerInfo.stats, surfaceKey);
  let source = "surface";
  if (surf.won + surf.lost <= 0) {
    surf = sumOverall(playerInfo.stats);
    source = "overall";
  }

  const won = surf.won;
  const lost = surf.lost;
  const total = won + lost;
  if (total <= 0) {
    return { won: 0, lost: 0, total: 0, winrate: 50, strength: 0, hasData: false, source: "none", label: "нет данных" };
  }

  const winrate = Math.round((won / total) * 100);

  // MAIN SCORE: wins dominate, total experience adds weight
  // 167 wins on 288 games >> 18 wins on 24 games
  let strength = won * 1.0 + total * 0.35;

  // tiny sample penalty (cannot look "elite" on 20 matches)
  if (total < 20) strength *= 0.45;
  else if (total < 40) strength *= 0.7;
  else if (total < 80) strength *= 0.88;

  // mild efficiency bonus only if enough games
  if (total >= 40) {
    strength += (winrate - 50) * 0.15 * Math.min(1, total / 100);
  }

  let label = "мало опыта";
  if (total >= 200) label = "огромный опыт";
  else if (total >= 100) label = "большой опыт";
  else if (total >= 50) label = "средний опыт";
  else if (total >= 25) label = "умеренный опыт";

  return {
    won: won,
    lost: lost,
    total: total,
    winrate: winrate,
    strength: Math.round(strength * 10) / 10,
    hasData: true,
    source: source,
    label: label
  };
}
