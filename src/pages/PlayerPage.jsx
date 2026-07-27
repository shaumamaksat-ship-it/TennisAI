import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import { getPlayerInfo, getPlayerRecentMatches } from "../api/tennisApi";
import { getFlag, getPlayerPhoto, extractCountry, extractLogo } from "../utils/playerVisual";
import { toRussianName } from "../utils/translit";

function calcAge(bday) {
  if (!bday) return null;
  var parts = String(bday).split(/[./-]/);
  var d, m, y;
  if (parts[0].length === 4) {
    y = Number(parts[0]); m = Number(parts[1]); d = Number(parts[2]);
  } else {
    d = Number(parts[0]); m = Number(parts[1]); y = Number(parts[2]);
  }
  if (!y || !m || !d) return null;
  var now = new Date();
  var age = now.getFullYear() - y;
  if (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) age--;
  return age;
}

function pickBestStats(stats) {
  if (!stats || !stats.length) return null;
  // prefer singles, newest season
  var list = stats.slice().filter(function(s) {
    return (s.type || "").toLowerCase() !== "doubles";
  });
  if (!list.length) list = stats.slice();
  list.sort(function(a, b) {
    return Number(b.season || 0) - Number(a.season || 0);
  });
  return list[0];
}

function matchResult(m, playerKey) {
  var st = (m.event_status || "").toLowerCase();
  var isLive = st && st.indexOf("finished") === -1 && st.indexOf("retired") === -1 && st !== "finished";
  if (isLive && st) {
    return { code: "LIVE", label: st || "LIVE", color: "#18d96d" };
  }

  var isP1 = String(m.first_player_key) === String(playerKey);
  var isP2 = String(m.second_player_key) === String(playerKey);
  var winner = m.event_winner;

  // fallback by final score if winner missing
  if (!winner && m.event_final_result && m.event_final_result !== "-") {
    var parts = String(m.event_final_result).replace(/\s/g, "").split("-");
    if (parts.length === 2) {
      var s1 = Number(parts[0]); var s2 = Number(parts[1]);
      if (!isNaN(s1) && !isNaN(s2) && s1 !== s2) {
        winner = s1 > s2 ? "First Player" : "Second Player";
      }
    }
  }

  if (winner === "First Player") {
    return isP1
      ? { code: "W", label: "Победа", color: "#18d96d" }
      : { code: "L", label: "Поражение", color: "#f87171" };
  }
  if (winner === "Second Player") {
    return isP2
      ? { code: "W", label: "Победа", color: "#18d96d" }
      : { code: "L", label: "Поражение", color: "#f87171" };
  }
  return { code: "—", label: "Нет данных", color: "#94a3b8" };
}

export default function PlayerPage() {
  const navigate = useNavigate();
  const { playerKey } = useParams();
  const [player, setPlayer] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(function() {
    const load = async function() {
      setLoading(true);
      const info = await getPlayerInfo(playerKey);
      setPlayer(info);
      const matches = await getPlayerRecentMatches(playerKey);
      // finished first, then live
      const list = (matches || []).slice().sort(function(a, b) {
        const af = ((a.event_status || "").toLowerCase().indexOf("finished") !== -1) ? 0 : 1;
        const bf = ((b.event_status || "").toLowerCase().indexOf("finished") !== -1) ? 0 : 1;
        return af - bf;
      });
      setRecent(list.slice(0, 15));
      setLoading(false);
    };
    load();
  }, [playerKey]);

  if (loading) {
    return (
      <div style={{ background: "#0f172a", minHeight: "100vh", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
        Загрузка профиля...
      </div>
    );
  }

  if (!player) {
    return (
      <div style={{ background: "#0f172a", minHeight: "100vh", color: "white", padding: 20 }}>
        <button onClick={function() { navigate(-1); }} style={{ background: "none", border: "none", color: "white", fontSize: 24 }}>←</button>
        <div style={{ textAlign: "center", marginTop: 40 }}>Игрок не найден в базе API</div>
        <BottomNav />
      </div>
    );
  }

  const name = player.player_full_name || player.player_name || "Игрок";
  const country = extractCountry(player);
  const flag = getFlag(country);
  const photo = getPlayerPhoto(name, extractLogo(player));
  const age = calcAge(player.player_bday);
  const best = pickBestStats(player.stats);

  const rank = best && best.rank ? "#" + best.rank : "н/д";
  const titles = best && best.titles != null ? String(best.titles) : "н/д";
  const season = best && best.season ? String(best.season) : "н/д";
  const type = best && best.type ? best.type : "singles";

  const hardW = best ? (best.hard_won || "0") : "0";
  const hardL = best ? (best.hard_lost || "0") : "0";
  const clayW = best ? (best.clay_won || "0") : "0";
  const clayL = best ? (best.clay_lost || "0") : "0";
  const grassW = best ? (best.grass_won || "0") : "0";
  const grassL = best ? (best.grass_lost || "0") : "0";
  const mw = best ? (best.matches_won || "0") : "0";
  const ml = best ? (best.matches_lost || "0") : "0";

  let wins = 0, losses = 0;
  recent.forEach(function(m) {
    const r = matchResult(m, playerKey);
    if (r.code === "W") wins++;
    if (r.code === "L") losses++;
  });

  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", color: "white", paddingBottom: 90 }}>
      <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #1e293b" }}>
        <button onClick={function() { navigate(-1); }} style={{ background: "none", border: "none", color: "white", fontSize: 24 }}>←</button>
        <div style={{ marginLeft: 12, fontSize: 18, fontWeight: 800 }}>Профиль игрока</div>
      </div>

      <div style={{
        margin: 12,
        background: "linear-gradient(145deg, #12352a 0%, #1e293b 100%)",
        border: "1px solid #18d96d",
        borderRadius: 20,
        padding: 18,
        textAlign: "center"
      }}>
        <img src={photo} alt="" style={{ width: 96, height: 96, borderRadius: "50%", objectFit: "cover", border: "3px solid #18d96d", marginBottom: 10 }} />
        <div style={{ fontSize: 22, fontWeight: 900 }}>{toRussianName(name)}</div>
        <div style={{ fontSize: 14, color: "#94a3b8", marginTop: 4 }}>
          {flag} {country || "Страна неизвестна"}
        </div>
      </div>

      <div style={{ margin: "0 12px 12px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[
          ["Возраст", age != null ? age + " лет" : "н/д"],
          ["Дата рождения", player.player_bday || "н/д"],
          ["Рейтинг (" + type + ")", rank],
          ["Титулы", titles],
          ["Сезон статистики", season],
          ["Форма (посл. матчи)", wins + "W / " + losses + "L"],
          ["Матчи за сезон", mw + "W / " + ml + "L"],
          ["Hard", hardW + "W / " + hardL + "L"],
          ["Clay", clayW + "W / " + clayL + "L"],
          ["Grass", grassW + "W / " + grassL + "L"]
        ].map(function(row) {
          return (
            <div key={row[0]} style={{ background: "#1e293b", borderRadius: 14, padding: 12 }}>
              <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>{row[0]}</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#18d96d" }}>{row[1]}</div>
            </div>
          );
        })}
      </div>

      {player.stats && player.stats.length > 1 && (
        <div style={{ margin: "0 12px 12px", background: "#1e293b", borderRadius: 16, padding: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>📊 Сезоны</div>
          {player.stats.slice(0, 6).map(function(s, i) {
            return (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", fontSize: 12,
                padding: "6px 0", borderBottom: i < Math.min(5, player.stats.length - 1) ? "1px solid #334155" : "none"
              }}>
                <span>{s.season} · {s.type || "singles"}</span>
                <span style={{ color: "#18d96d" }}>#{s.rank || "—"} · {s.matches_won || 0}W/{s.matches_lost || 0}L</span>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ margin: "0 12px 12px", background: "#1e293b", borderRadius: 16, padding: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>📜 Последние матчи</div>
        {!recent.length && (
          <div style={{ fontSize: 12, color: "#94a3b8" }}>
            API не вернул недавние матчи для этого игрока
          </div>
        )}
        {recent.map(function(m, i) {
          const isP1 = String(m.first_player_key) === String(playerKey);
          const opp = isP1 ? m.event_second_player : m.event_first_player;
          const r = matchResult(m, playerKey);
          const score = m.event_final_result && m.event_final_result !== "-"
            ? m.event_final_result
            : (m.event_game_result || "-");
          return (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between",
              padding: "8px 0",
              borderBottom: i < recent.length - 1 ? "1px solid #334155" : "none",
              fontSize: 12
            }}>
              <div>
                <div style={{ fontWeight: 700 }}>vs {toRussianName(opp)}</div>
                <div style={{ color: "#64748b" }}>
                  {m.tournament_name || m.event_type_type || ""} · {m.event_date || ""}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 800, color: r.color }}>{r.code}</div>
                <div style={{ color: "#94a3b8" }}>{score}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ margin: "0 12px 20px", fontSize: 11, color: "#64748b", textAlign: "center" }}>
        Данные из api-tennis. У части игроков база неполная.
      </div>

      <BottomNav />
    </div>
  );
}
