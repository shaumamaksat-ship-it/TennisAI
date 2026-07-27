import { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { namesMatch, toRussianName } from "../utils/translit";
import BottomNav from "../components/BottomNav";
import { getLiveMatches, getPlayerInfo } from "../api/tennisApi";
import { getPlayerPhoto, extractLogo } from "../utils/playerVisual";

function isFinished(m) {
  const st = (m.event_status || "").toLowerCase();
  return st.indexOf("finished") !== -1 || st.indexOf("retired") !== -1 || st.indexOf("walkover") !== -1;
}

export default function MatchesPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [allMatches, setAllMatches] = useState([]);
  const [photos, setPhotos] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(params.get("q") || "");
  const [tournament, setTournament] = useState("ALL");
  const [onlyLive, setOnlyLive] = useState(true);

  const load = async () => {
    const data = await getLiveMatches();
    setAllMatches(data || []);
    setLoading(false);

    if (!data || !data.length) return;

    const needed = {};
    data.forEach(function(m) {
      if (m.first_player_key) needed[m.first_player_key] = m.event_first_player;
      if (m.second_player_key) needed[m.second_player_key] = m.event_second_player;
    });

    const nextPhotos = {};
    const keys = Object.keys(needed).slice(0, 30);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      try {
        const info = await getPlayerInfo(key);
        nextPhotos[key] = getPlayerPhoto(needed[key], extractLogo(info));
      } catch (e) {
        nextPhotos[key] = getPlayerPhoto(needed[key], null);
      }
    }
    setPhotos(nextPhotos);
  };

  useEffect(function() {
    const qq = params.get("q");
    if (qq) setSearch(qq);
  }, [params]);

  useEffect(function() {
    load();
    const interval = setInterval(load, 1000);
    return function() { clearInterval(interval); };
  }, []);

  const tournaments = useMemo(function() {
    const set = {};
    allMatches.forEach(function(m) {
      const name = m.tournament_name || m.event_type_type || "Другие";
      set[name] = true;
    });
    return Object.keys(set).sort();
  }, [allMatches]);

  const filtered = useMemo(function() {
    const q = search.trim().toLowerCase();
    return allMatches.filter(function(m) {
      if (onlyLive && isFinished(m)) return false;

      const tName = m.tournament_name || m.event_type_type || "Другие";
      if (tournament !== "ALL" && tName !== tournament) return false;

      if (!q) return true;
      const tour = tName;
      return namesMatch(q, m.event_first_player) || namesMatch(q, m.event_second_player) || namesMatch(q, tour) || namesMatch(q, m.event_type_type || "");
    });
  }, [allMatches, search, tournament, onlyLive]);

  const groups = useMemo(function() {
    const map = {};
    filtered.forEach(function(m) {
      const key = m.tournament_name || m.event_type_type || "Другие";
      if (!map[key]) map[key] = [];
      map[key].push(m);
    });
    return Object.keys(map).map(function(name) {
      const matches = map[name].slice().sort(function(a, b) {
        return (isFinished(a) ? 1 : 0) - (isFinished(b) ? 1 : 0);
      });
      return { name: name, matches: matches };
    });
  }, [filtered]);

  function getGames(m) {
    if (!m.scores || !m.scores.length) return "0 : 0";
    const last = m.scores[m.scores.length - 1];
    return (last.score_first || "0") + " : " + (last.score_second || "0");
  }

  function getSets(m) {
    if (m.event_final_result && m.event_final_result !== "-") return m.event_final_result;
    return "0 - 0";
  }

  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", color: "white", paddingBottom: 90 }}>
      <div style={{ padding: "16px 16px 8px" }}>
        <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>
          🎾 <span style={{ color: "#18d96d" }}>Live Матчи</span>
          <span style={{ color: "#94a3b8", fontSize: 16 }}> ({filtered.length})</span>
        </div>

        {/* Поиск */}
        <input
          value={search}
          onChange={function(e) { setSearch(e.target.value); }}
          placeholder="Поиск игрока или турнира..."
          style={{
            width: "100%",
            boxSizing: "border-box",
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: 12,
            padding: "12px 14px",
            color: "white",
            fontSize: 14,
            outline: "none",
            marginBottom: 10
          }}
        />

        {/* Фильтры */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6 }}>
          <button
            onClick={function() { setOnlyLive(!onlyLive); }}
            style={{
              flexShrink: 0,
              background: onlyLive ? "#18d96d" : "#1e293b",
              color: onlyLive ? "#0f172a" : "#cbd5e1",
              border: "1px solid " + (onlyLive ? "#18d96d" : "#334155"),
              borderRadius: 20,
              padding: "8px 12px",
              fontSize: 12,
              fontWeight: 700
            }}
          >
            {onlyLive ? "● Только LIVE" : "Все матчи"}
          </button>

          <button
            onClick={function() { setTournament("ALL"); }}
            style={{
              flexShrink: 0,
              background: tournament === "ALL" ? "#18d96d" : "#1e293b",
              color: tournament === "ALL" ? "#0f172a" : "#cbd5e1",
              border: "1px solid " + (tournament === "ALL" ? "#18d96d" : "#334155"),
              borderRadius: 20,
              padding: "8px 12px",
              fontSize: 12,
              fontWeight: 700
            }}
          >
            Все турниры
          </button>

          {tournaments.map(function(t) {
            const active = tournament === t;
            return (
              <button
                key={t}
                onClick={function() { setTournament(t); }}
                style={{
                  flexShrink: 0,
                  background: active ? "#18d96d" : "#1e293b",
                  color: active ? "#0f172a" : "#cbd5e1",
                  border: "1px solid " + (active ? "#18d96d" : "#334155"),
                  borderRadius: 20,
                  padding: "8px 12px",
                  fontSize: 12,
                  fontWeight: 700
                }}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {loading && <div style={{ padding: 16, color: "#94a3b8" }}>Загрузка...</div>}

      {!loading && !groups.length && (
        <div style={{ padding: 16, color: "#94a3b8" }}>Ничего не найдено</div>
      )}

      <div style={{ padding: "8px 12px 20px" }}>
        {groups.map(function(group) {
          return (
            <div key={group.name} style={{ marginBottom: 16 }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 10,
                background: "linear-gradient(90deg, rgba(24,217,109,0.18), rgba(24,217,109,0.02))",
                border: "1px solid rgba(24,217,109,0.35)",
                borderLeft: "4px solid #18d96d",
                borderRadius: 10,
                padding: "8px 12px"
              }}>
                <span style={{ fontSize: 14 }}>🏆</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#6ee7b7" }}>{group.name}</span>
                <span style={{
                  marginLeft: "auto",
                  fontSize: 11,
                  color: "#94a3b8",
                  background: "#0f172a",
                  padding: "2px 8px",
                  borderRadius: 8
                }}>
                  {group.matches.length}
                </span>
              </div>

              {group.matches.map(function(m) {
                const finished = isFinished(m);
                const photo1 = photos[m.first_player_key] || getPlayerPhoto(m.event_first_player, null);
                const photo2 = photos[m.second_player_key] || getPlayerPhoto(m.event_second_player, null);

                return (
                  <div
                    key={m.event_key}
                    onClick={function() { navigate("/match/" + m.event_key); }}
                    style={{
                      background: "#1e293b",
                      borderRadius: 14,
                      padding: 12,
                      marginBottom: 8,
                      cursor: "pointer",
                      opacity: finished ? 0.65 : 1
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>{m.event_type_type || ""}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: finished ? "#94a3b8" : "#18d96d" }}>
                        {finished ? "Finished" : (m.event_status || "LIVE")}
                      </span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <img src={photo1} alt="" onClick={function(e) { e.stopPropagation(); if (m.first_player_key) navigate("/player/" + m.first_player_key); }} style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", cursor: "pointer" }} />
                          <span style={{ fontSize: 13, fontWeight: 700 }}>{toRussianName(m.event_first_player)}{m.event_serve === "First Player" ? " ●" : ""}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <img src={photo2} alt="" onClick={function(e) { e.stopPropagation(); if (m.second_player_key) navigate("/player/" + m.second_player_key); }} style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", cursor: "pointer" }} />
                          <span style={{ fontSize: 13, fontWeight: 700 }}>{toRussianName(m.event_second_player)}{m.event_serve === "Second Player" ? " ●" : ""}</span>
                        </div>
                      </div>

                      <div style={{ textAlign: "right", minWidth: 90 }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: finished ? "#94a3b8" : "#18d96d" }}>
                          {m.event_game_result || "-"}
                        </div>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>Геймы: {getGames(m)}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>Сеты: {getSets(m)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
}
