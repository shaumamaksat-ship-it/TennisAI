export async function getLiveMatches() {
  try {
    const response = await fetch("http://127.0.0.1:5001/api/live");
    const data = await response.json();
    if (data.success === 1 && data.result) return data.result;
    return [];
  } catch (error) {
    console.error("API Error:", error);
    return [];
  }
}

export async function getPlayerForm(playerKey1, playerKey2) {
  try {
    const response = await fetch(
      "http://127.0.0.1:5001/api/h2h?p1=" + playerKey1 + "&p2=" + playerKey2
    );
    const data = await response.json();
    if (data.success === 1 && data.result) return data.result;
    return null;
  } catch (error) {
    console.error("H2H Error:", error);
    return null;
  }
}

export async function getPlayerRecentMatches(playerKey) {
  try {
    const response = await fetch(
      "http://127.0.0.1:5001/api/player-matches?player_key=" + playerKey
    );
    const data = await response.json();
    if (data.success === 1 && data.result) return data.result;
    return [];
  } catch (error) {
    console.error("Player matches error:", error);
    return [];
  }
}

export async function getPlayerInfo(playerKey) {
  try {
    const res = await fetch("http://127.0.0.1:5001/api/player?player_key=" + playerKey);
    const data = await res.json();
    if (data && data.result && data.result.length) return data.result[0];
    if (data && data.result && !Array.isArray(data.result)) return data.result;
    return null;
  } catch (e) {
    return null;
  }
}

export async function getH2H(p1, p2) {
  try {
    const res = await fetch("http://127.0.0.1:5001/api/h2h?p1=" + p1 + "&p2=" + p2);
    const data = await res.json();
    return data && data.result ? data.result : null;
  } catch (e) {
    return null;
  }
}

export async function getPlayerNews(name) {
  try {
    const res = await fetch("http://127.0.0.1:5001/api/player-news?q=" + encodeURIComponent(name || ""));
    const data = await res.json();
    return (data && data.result) ? data.result : [];
  } catch (e) {
    return [];
  }
}
