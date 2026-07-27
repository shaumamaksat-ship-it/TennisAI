import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import { getLiveMatches } from "../api/tennisApi";
import { getFavorites, toggleFavorite } from "../utils/favorites";
import { toRussianName } from "../utils/translit";

export default function FavoritesPage() {
  const navigate = useNavigate();
  const [favs, setFavs] = useState([]);
  const [liveMap, setLiveMap] = useState({});

  useEffect(function() {
    const load = async function() {
      setFavs(getFavorites());
      const live = await getLiveMatches();
      const map = {};
      (live || []).forEach(function(m) {
        map[String(m.event_key)] = m;
      });
      setLiveMap(map);
    };
    load();
    const id = setInterval(load, 2000);
    return function() { clearInterval(id); };
  }, []);

  function remove(eventKey) {
    toggleFavorite({ event_key: eventKey });
    setFavs(getFavorites());
  }

  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", color: "white", paddingBottom: 90 }}>
      <div style={{ padding: "16px 16px 8px" }}>
        <div style={{ fontSize: 22, fontWeight: 800 }}>
          ⭐ <span style={{ color: "#18d96d" }}>Избранное</span>
          <span style={{ color: "#94a3b8", fontSize: 16 }}> ({favs.length})</span>
        </div>
        <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
          Сохранённые матчи
        </div>
      </div>

      {!favs.length && (
        <div style={{ margin: 16, background: "#1e293b", borderRadius: 16, padding: 16, color: "#94a3b8", fontSize: 13 }}>
          Пока пусто. Открой матч и нажми ⭐ сверху справа.
        </div>
      )}

      <div style={{ padding: "8px 12px" }}>
        {favs.map(function(f) {
          const live = liveMap[String(f.event_key)];
          const status = live ? (live.event_status || "LIVE") : "Нет в live";
          const score = live ? (live.event_game_result || "-") : "-";
          const sets = live && live.event_final_result && live.event_final_result !== "-" ? live.event_final_result : "";

          return (
            <div key={f.event_key} style={{ background: "#1e293b", borderRadius: 14, padding: 12, marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: "#94a3b8" }}>{f.tournament}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: live ? "#18d96d" : "#64748b" }}>{status}</span>
              </div>

              <div onClick={function() { navigate("/match/" + f.event_key); }} style={{ cursor: "pointer" }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{toRussianName(f.p1)}</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{toRussianName(f.p2)}</div>
                <div style={{ fontSize: 13, color: "#18d96d" }}>
                  {score}{sets ? " · Сеты " + sets : ""}
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button
                  onClick={function() { navigate("/match/" + f.event_key); }}
                  style={{ flex: 1, background: "#18d96d", color: "#0f172a", border: "none", borderRadius: 10, padding: "8px 0", fontWeight: 800, fontSize: 12 }}
                >
                  Открыть
                </button>
                <button
                  onClick={function() { remove(f.event_key); }}
                  style={{ background: "#334155", color: "white", border: "none", borderRadius: 10, padding: "8px 12px", fontWeight: 700, fontSize: 12 }}
                >
                  Удалить
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
}
