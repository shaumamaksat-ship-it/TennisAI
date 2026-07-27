export function getFavorites() {
  try {
    const raw = localStorage.getItem("tennisai_favorites");
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function isFavorite(eventKey) {
  return getFavorites().some(function(f) {
    return String(f.event_key) === String(eventKey);
  });
}

export function toggleFavorite(match) {
  if (!match || !match.event_key) return getFavorites();
  const list = getFavorites();
  const idx = list.findIndex(function(f) {
    return String(f.event_key) === String(match.event_key);
  });

  if (idx >= 0) {
    list.splice(idx, 1);
  } else {
    list.unshift({
      event_key: match.event_key,
      p1: match.event_first_player,
      p2: match.event_second_player,
      tournament: match.tournament_name || match.event_type_type || "",
      addedAt: Date.now()
    });
  }

  try {
    localStorage.setItem("tennisai_favorites", JSON.stringify(list.slice(0, 40)));
  } catch (e) {}
  return list;
}
