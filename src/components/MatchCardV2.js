import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLiveMatches, getPlayerInfo } from "../api/tennisApi";
import { getFlag, getPlayerPhoto, extractCountry, extractLogo } from "../utils/playerVisual";
import { toRussianName } from "../utils/translit";

function isLive(m) {
  const st = (m.event_status || "").toLowerCase();
  if (!st) return true;
  if (st.indexOf("finished") !== -1) return false;
  if (st.indexOf("retired") !== -1) return false;
  if (st.indexOf("walkover") !== -1) return false;
  if (st.indexOf("cancelled") !== -1) return false;
  return true;
}

function scoreMatch(m) {
  let score = 0;
  const type = (m.event_type_type || "").toLowerCase();
  const tour = (m.tournament_name || "").toLowerCase();
  if (type.indexOf("atp") !== -1) score += 30;
  if (type.indexOf("wta") !== -1) score += 28;
  if (type.indexOf("challenger") !== -1) score += 18;
  if (type.indexOf("itf") !== -1) score += 10;
  if (tour.indexOf("masters") !== -1) score += 20;
  if (m.statistics && m.statistics.length > 0) score += 15;
  const st = (m.event_status || "").toLowerCase();
  if (st.indexOf("set 2") !== -1) score += 8;
  if (st.indexOf("set 3") !== -1) score += 12;
  if (m.event_game_result && m.event_game_result !== "-" && m.event_game_result !== "0 - 0") score += 5;
  return score;
}

export default function MatchCardV2() {
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [p1, setP1] = useState({ photo: null, flag: "🎾" });
  const [p2, setP2] = useState({ photo: null, flag: "🎾" });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const data = await getLiveMatches();
    if (!data || !data.length) {
      setMatch(null);
      setLoading(false);
      return;
    }
    const live = data.filter(isLive);
    if (!live.length) {
      setMatch(null);
      setLoading(false);
      return;
    }
    live.sort(function(a, b) { return scoreMatch(b) - scoreMatch(a); });
    const best = live[0];
    setMatch(best);

    if (best.first_player_key && best.second_player_key) {
      const i1 = await getPlayerInfo(best.first_player_key);
      const i2 = await getPlayerInfo(best.second_player_key);
      setP1({
        photo: getPlayerPhoto(best.event_first_player, extractLogo(i1)),
        flag: getFlag(extractCountry(i1))
      });
      setP2({
        photo: getPlayerPhoto(best.event_second_player, extractLogo(i2)),
        flag: getFlag(extractCountry(i2))
      });
    }
    setLoading(false);
  };

  useEffect(function() {
    load();
    const interval = setInterval(load, 1000);
    return function() { clearInterval(interval); };
  }, []);

  if (loading) {
    return (
      <div style={{ margin: 12, padding: 24, background: "#1e293b", borderRadius: 22, textAlign: "center", color: "#94a3b8" }}>
        Загрузка матча дня...
      </div>
    );
  }

  if (!match) {
    return (
      <div style={{ margin: 12, padding: 24, background: "#1e293b", borderRadius: 22, textAlign: "center", color: "#94a3b8" }}>
        Сейчас нет live-матчей для матча дня
      </div>
    );
  }

  const serve1 = match.event_serve === "First Player";
  const serve2 = match.event_serve === "Second Player";

  let games = "0 : 0";
  if (match.scores && match.scores.length) {
    const last = match.scores[match.scores.length - 1];
    games = (last.score_first || "0") + " : " + (last.score_second || "0");
  }
  const sets = (match.event_final_result && match.event_final_result !== "-") ? match.event_final_result : "0 - 0";

  return (
    <div
      onClick={function() { navigate("/match/" + match.event_key); }}
      style={{
        margin: 12,
        background: "linear-gradient(145deg, #12352a 0%, #1e293b 40%, #0f172a 100%)",
        borderRadius: 24,
        padding: 18,
        border: "2px solid #18d96d",
        cursor: "pointer",
        boxShadow: "0 0 28px rgba(24,217,109,0.25), 0 8px 24px rgba(0,0,0,0.35)"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ background: "linear-gradient(90deg,#18d96d,#34d399)", color: "#0f172a", padding: "6px 12px", borderRadius: 14, fontSize: 11, fontWeight: 800 }}>
          ⭐ МАТЧ ДНЯ
        </span>
        <span style={{ color: "#ef4444", fontWeight: 800, fontSize: 12 }}>● LIVE</span>
      </div>

      <div style={{ fontSize: 11, color: "#a7f3d0", marginBottom: 12, textAlign: "center", fontWeight: 600 }}>
        {match.tournament_name || match.event_type_type || "Live"} · {match.event_status || ""}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ position: "relative", width: 58, height: 58, margin: "0 auto 8px" }}>
            <img
              src={p1.photo}
              alt=""
              onClick={function(e) {
                e.stopPropagation();
                if (match.first_player_key) navigate("/player/" + match.first_player_key);
              }}
              style={{
                width: 58, height: 58, borderRadius: "50%", objectFit: "cover",
                border: serve1 ? "3px solid #18d96d" : "3px solid #334155",
                boxShadow: serve1 ? "0 0 14px rgba(24,217,109,0.55)" : "none",
                cursor: "pointer"
              }}
            />
            <span style={{ position: "absolute", bottom: -2, right: -4, fontSize: 16 }}>{p1.flag}</span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 800 }}>
            {toRussianName(match.event_first_player)}{serve1 ? " 🎾" : ""}
          </div>
        </div>

        <div style={{ textAlign: "center", minWidth: 110 }}>
          <div style={{ fontSize: 34, fontWeight: 900 }}>{match.event_game_result || "VS"}</div>
          <div style={{ fontSize: 15, color: "#18d96d", fontWeight: 800 }}>{games}</div>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>Сеты {sets}</div>
        </div>

        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ position: "relative", width: 58, height: 58, margin: "0 auto 8px" }}>
            <img
              src={p2.photo}
              alt=""
              onClick={function(e) {
                e.stopPropagation();
                if (match.second_player_key) navigate("/player/" + match.second_player_key);
              }}
              style={{
                width: 58, height: 58, borderRadius: "50%", objectFit: "cover",
                border: serve2 ? "3px solid #18d96d" : "3px solid #334155",
                boxShadow: serve2 ? "0 0 14px rgba(24,217,109,0.55)" : "none",
                cursor: "pointer"
              }}
            />
            <span style={{ position: "absolute", bottom: -2, right: -4, fontSize: 16 }}>{p2.flag}</span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 800 }}>
            {toRussianName(match.event_second_player)}{serve2 ? " 🎾" : ""}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 14, textAlign: "center", fontSize: 12, color: "#6ee7b7", fontWeight: 600 }}>
        Нажми для полного AI-анализа →
      </div>
    </div>
  );
}
