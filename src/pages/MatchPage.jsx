import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import TraitsBlock from "../components/TraitsBlock";
import {
  getLiveMatches,
  getPlayerForm,
  getPlayerRecentMatches,
  getPlayerInfo,
  getH2H
} from "../api/tennisApi";
import { analyzeMatch, buildFinalReport } from "../ai/AIEngine";
import { analyzeLiveSet } from "../ai/liveSetModel";
import { detectSurface, surfaceRecord } from "../utils/surface";
import { getFlag, getPlayerPhoto, extractCountry, extractLogo } from "../utils/playerVisual";
import { isFavorite, toggleFavorite } from "../utils/favorites";

function getCurrentGames(match) {
  if (!match) return { g1: 0, g2: 0 };
  const sp = String(match.event_final_result || "0-0").replace(/\s/g, "").split("-");
  const completed = Number(sp[0] || 0) + Number(sp[1] || 0);
  const scores = match.scores || [];
  if (scores.length > completed) {
    const last = scores[scores.length - 1];
    return { g1: Number(last.score_first || 0), g2: Number(last.score_second || 0) };
  }
  return { g1: 0, g2: 0 };
}

function getServeName(match) {
  if (!match) return null;
  if (match.event_serve === "First Player") return match.event_first_player;
  if (match.event_serve === "Second Player") return match.event_second_player;
  return null;
}

function readStat(match, playerKey, names) {
  if (!match || !match.statistics || !playerKey) return null;
  const list = names || [];
  for (let i = 0; i < list.length; i++) {
    const name = list[i];
    const items = match.statistics.filter(function (s) {
      return (
        String(s.player_key) === String(playerKey) &&
        String(s.stat_name || "").toLowerCase() === String(name).toLowerCase()
      );
    });
    let it = null;
    for (let j = 0; j < items.length; j++) {
      if (String(items[j].stat_period || "").toLowerCase() === "match") it = items[j];
    }
    if (!it && items.length) it = items[items.length - 1];
    if (it) {
      const won = it.stat_won != null ? Number(it.stat_won) : null;
      const total = it.stat_total != null ? Number(it.stat_total) : null;
      let pct = null;
      if (won != null && total != null && total > 0) pct = Math.round((won / total) * 100);
      else {
        const v = parseFloat(String(it.stat_value || "").replace("%", ""));
        if (!isNaN(v)) pct = v;
      }
      return { won: won, total: total, pct: pct };
    }
  }
  return null;
}

function bpText(stat) {
  if (!stat) return null;
  if (stat.total != null && stat.total > 0) {
    if (stat.total < 3) return stat.won + "/" + stat.total + " (мало)";
    return stat.won + "/" + stat.total + " (" + stat.pct + "%)";
  }
  if (stat.pct != null && stat.pct === 100) return null;
  if (stat.pct != null) return stat.pct + "%";
  return null;
}

function serveLine(match, playerKey) {
  const a = readStat(match, playerKey, ["1st Serve Percentage", "1st serve", "First Serve In"]);
  const p1w = readStat(match, playerKey, ["1st Serve Points Won", "1st serve points won"]);
  const p2w = readStat(match, playerKey, ["2nd Serve Points Won", "2nd serve points won"]);
  const df = readStat(match, playerKey, ["Double Faults", "Double faults"]);
  const ac = readStat(match, playerKey, ["Aces"]);
  const bp = readStat(match, playerKey, ["Break Points Converted", "Break points converted", "Break Points Won"]);
  const parts = [];
  if (a && a.pct != null) parts.push("1-я " + a.pct + "%");
  if (p1w && p1w.pct != null) parts.push("очки 1-й " + p1w.pct + "%");
  if (p2w && p2w.pct != null) parts.push("очки 2-й " + p2w.pct + "%");
  if (ac && ac.won != null) parts.push("эйсы " + ac.won);
  if (df && df.won != null) parts.push("DF " + df.won);
  const b = bpText(bp);
  if (b) parts.push("брейки " + b);
  return parts.length ? parts.join(" · ") : "нет детальной статистики";
}

export default function MatchPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [ai, setAi] = useState(null);
  const [finalReport, setFinalReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [p1Meta, setP1Meta] = useState({ country: null, logo: null });
  const [p2Meta, setP2Meta] = useState({ country: null, logo: null });
  const [surfMeta, setSurfMeta] = useState({ s1: null, s2: null, ru: "Хард" });
  const [recentBox, setRecentBox] = useState({ r1: [], r2: [] });
  const [h2h, setH2h] = useState(null);
  const [fav, setFav] = useState(false);
  const lastAiRef = useRef(null);
  const learnedRef = useRef(false);

  async function loadAll() {
    try {
      const live = await getLiveMatches();
      const found = (live || []).find(function (m) {
        return String(m.event_key) === String(id);
      });
      if (!found) {
        setLoading(false);
        return;
      }
      setMatch(found);
      setFav(isFavorite(found.event_key));

      const status = (found.event_status || "").toLowerCase();
      const finished =
        status.indexOf("finished") !== -1 || status.indexOf("retired") !== -1;

      let formData = null;
      let recent1 = [];
      let recent2 = [];
      let p1info = null;
      let p2info = null;

      if (found.first_player_key && found.second_player_key) {
        try {
          formData = await getPlayerForm(
            found.first_player_key,
            found.second_player_key
          );
        } catch (e) {}
        try {
          recent1 = (await getPlayerRecentMatches(found.first_player_key)) || [];
          recent2 = (await getPlayerRecentMatches(found.second_player_key)) || [];
          setRecentBox({ r1: recent1, r2: recent2 });
        } catch (e) {}
        try {
          p1info = await getPlayerInfo(found.first_player_key);
          p2info = await getPlayerInfo(found.second_player_key);
          setP1Meta({
            country: extractCountry(p1info),
            logo: extractLogo(p1info)
          });
          setP2Meta({
            country: extractCountry(p2info),
            logo: extractLogo(p2info)
          });
        } catch (e) {}
        try {
          const h2hData = await getH2H(
            found.first_player_key,
            found.second_player_key
          );
          setH2h(h2hData);
        } catch (e) {}
      }

      const surface = detectSurface(found);
      const _s1 = surfaceRecord(p1info, surface.key);
      const _s2 = surfaceRecord(p2info, surface.key);
      setSurfMeta({ s1: _s1, s2: _s2, ru: surface.ru });

      const analysis = analyzeMatch(found, formData, recent1, recent2, {
        surface: surface,
        surf1: _s1,
        surf2: _s2
      });
      setAi(analysis);
      if (analysis) lastAiRef.current = analysis;

      if (finished && !learnedRef.current) {
        try {
          setFinalReport(
            buildFinalReport(found, lastAiRef.current || analysis)
          );
        } catch (e) {}
        learnedRef.current = true;
      }
      setLoading(false);
    } catch (e) {
      setLoading(false);
    }
  }

  useEffect(function () {
    learnedRef.current = false;
    setFinalReport(null);
    setLoading(true);
    loadAll();
    const interval = setInterval(loadAll, 1000);
    return function () {
      clearInterval(interval);
    };
  }, [id]);

  if (loading && !match) {
    return (
      <div
        style={{
          background: "#0f172a",
          minHeight: "100vh",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        Загрузка...
      </div>
    );
  }

  if (!match) {
    return (
      <div
        style={{
          background: "#0f172a",
          minHeight: "100vh",
          color: "white",
          padding: 20
        }}
      >
        <button onClick={function () { navigate(-1); }} style={{ color: "#18d96d" }}>
          ← Назад
        </button>
        <p>Матч не найден в live.</p>
        <BottomNav />
      </div>
    );
  }

  const cg = getCurrentGames(match);
  const serve = getServeName(match);
  const liveSet = analyzeLiveSet(
    match,
    surfMeta.ru === "Грунт" ? "clay" : surfMeta.ru === "Трава" ? "grass" : "hard"
  );
  const status = (match.event_status || "").toLowerCase();
  const finished =
    status.indexOf("finished") !== -1 || status.indexOf("retired") !== -1;

  const photo1 = getPlayerPhoto(match.event_first_player, p1Meta.logo);
  const photo2 = getPlayerPhoto(match.event_second_player, p2Meta.logo);
  const flag1 = getFlag(p1Meta.country);
  const flag2 = getFlag(p2Meta.country);

  return (
    <div
      style={{
        background: "#0f172a",
        minHeight: "100vh",
        color: "white",
        paddingBottom: 80
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 14px",
          borderBottom: "1px solid #1e293b"
        }}
      >
        <button
          onClick={function () { navigate(-1); }}
          style={{ background: "none", border: "none", color: "white", fontSize: 20 }}
        >
          ←
        </button>
        <div style={{ fontWeight: 800, color: "#18d96d" }}>🎾 TennisAI</div>
        <button
          onClick={function () {
            toggleFavorite(match);
            setFav(isFavorite(match.event_key));
          }}
          style={{ background: "none", border: "none", fontSize: 20, color: fav ? "#fbbf24" : "#94a3b8" }}
        >
          {fav ? "★" : "☆"}
        </button>
      </div>

      {/* Score card */}
      <div
        style={{
          margin: "12px",
          background: "#1e293b",
          borderRadius: 16,
          padding: 14,
          border: "1px solid #18d96d"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 11 }}>
          <span style={{ background: "#334155", padding: "3px 8px", borderRadius: 8 }}>
            {match.event_type_type || match.tournament_name || "LIVE"}
          </span>
          <span style={{ color: "#f87171", fontWeight: 700 }}>
            {finished ? "FINISHED" : "● LIVE"} · Сет {cg.g1 + cg.g2 >= 0 ? (Number(String(match.event_final_result || "0-0").replace(/\s/g, "").split("-")[0] || 0) + Number(String(match.event_final_result || "0-0").replace(/\s/g, "").split("-")[1] || 0) + 1) : "?"}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div
            style={{ textAlign: "center", width: 90, cursor: "pointer" }}
            onClick={function () {
              if (match.first_player_key) navigate("/player/" + match.first_player_key);
            }}
          >
            <img
              src={photo1}
              alt=""
              style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", border: match.event_serve === "First Player" ? "3px solid #18d96d" : "2px solid #334155" }}
              onError={function (e) {
                e.target.style.display = "none";
              }}
            />
            <div style={{ fontSize: 12, fontWeight: 700, marginTop: 4 }}>
              {flag1} {match.event_first_player}{" "}
              {match.event_serve === "First Player" ? (
                <span style={{ color: "#18d96d", fontSize: 10, marginLeft: 4 }}>● ПОДАЧА</span>
              ) : null}
            </div>
          </div>

          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 900 }}>
              {match.event_game_result || "0 - 0"}
            </div>
            <div style={{ fontSize: 13, color: "#18d96d" }}>
              Геймы {cg.g1} : {cg.g2}
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>
              Сеты {match.event_final_result || "0 - 0"}
            </div>
          </div>

          <div
            style={{ textAlign: "center", width: 90, cursor: "pointer" }}
            onClick={function () {
              if (match.second_player_key) navigate("/player/" + match.second_player_key);
            }}
          >
            <img
              src={photo2}
              alt=""
              style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", border: match.event_serve === "Second Player" ? "3px solid #18d96d" : "2px solid #334155" }}
              onError={function (e) {
                e.target.style.display = "none";
              }}
            />
            <div style={{ fontSize: 12, fontWeight: 700, marginTop: 4 }}>
              {flag2} {match.event_second_player}{" "}
              {match.event_serve === "Second Player" ? (
                <span style={{ color: "#18d96d", fontSize: 10, marginLeft: 4 }}>● ПОДАЧА</span>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Serve + live set */}
      <div
        style={{
          margin: "0 12px 10px",
          background: "#1e293b",
          borderRadius: 14,
          padding: 12
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, color: "#94a3b8" }}>ПОДАЁТ</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: "#18d96d" }}>
              {serve || "—"}
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>
              {match.event_game_result || "—"} · {cg.g1}:{cg.g2} · сеты{" "}
              {match.event_final_result || "0-0"}
            </div>
          </div>
          {liveSet ? (
            <div style={{ textAlign: "right", flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, color: "#94a3b8" }}>СЕТ {liveSet.setNo}</div>
              <div style={{ fontSize: 15, fontWeight: 900, color: "#fbbf24" }}>
                {liveSet.setPct}%
              </div>
              <div style={{ fontSize: 11, color: "#e2e8f0" }}>{liveSet.setFav}</div>
            </div>
          ) : null}
        </div>
        {liveSet ? (
          <div
            style={{
              marginTop: 8,
              paddingTop: 8,
              borderTop: "1px solid #334155",
              fontSize: 11,
              color: "#cbd5e1",
              lineHeight: 1.35
            }}
          >
            <div>{liveSet.path}</div>
            <div style={{ color: "#94a3b8", marginTop: 4 }}>
              \~{liveSet.expGames} геймов · {liveSet.finalHint} · hold {liveSet.hold1}/
              {liveSet.hold2}%
            </div>
          </div>
        ) : null}
      </div>

      <TraitsBlock
        match={match}
        recent1={recentBox.r1 || []}
        recent2={recentBox.r2 || []}
      />

      {/* Serve stats */}
      <div
        style={{
          margin: "0 12px 10px",
          background: "#1e293b",
          borderRadius: 14,
          padding: 12
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
          🎾 Подача в матче
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div style={{ background: "#0f172a", borderRadius: 10, padding: 8 }}>
            <div style={{ color: "#18d96d", fontWeight: 700, fontSize: 11, marginBottom: 4 }}>
              {match.event_first_player}
            </div>
            <div style={{ fontSize: 10, color: "#cbd5e1", lineHeight: 1.35 }}>
              {serveLine(match, match.first_player_key)}
            </div>
          </div>
          <div style={{ background: "#0f172a", borderRadius: 10, padding: 8 }}>
            <div style={{ color: "#18d96d", fontWeight: 700, fontSize: 11, marginBottom: 4 }}>
              {match.event_second_player}
            </div>
            <div style={{ fontSize: 10, color: "#cbd5e1", lineHeight: 1.35 }}>
              {serveLine(match, match.second_player_key)}
            </div>
          </div>
        </div>
      </div>

      {/* Surface short */}
      <div
        style={{
          margin: "0 12px 10px",
          background: "#1e293b",
          borderRadius: 14,
          padding: 12
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>📊 Покрытие</div>
        <div style={{ fontSize: 12, color: "#18d96d", marginBottom: 4 }}>
          {surfMeta.ru || (ai && ai.surfaceRu) || "Хард"}
        </div>
        <div style={{ fontSize: 11, color: "#cbd5e1", marginBottom: 3 }}>
          {match.event_first_player}:{" "}
          {surfMeta.s1 && surfMeta.s1.hasData
            ? surfMeta.s1.won + "W / " + surfMeta.s1.total + " игр (" + (surfMeta.s1.label || "") + ")"
            : "мало данных"}
        </div>
        <div style={{ fontSize: 11, color: "#cbd5e1" }}>
          {match.event_second_player}:{" "}
          {surfMeta.s2 && surfMeta.s2.hasData
            ? surfMeta.s2.won + "W / " + surfMeta.s2.total + " игр (" + (surfMeta.s2.label || "") + ")"
            : "мало данных"}
        </div>
        {ai && ai.totalHint ? (
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>
            Тотал: {ai.totalHint}
          </div>
        ) : null}
      </div>

      {/* H2H minimal */}
      {h2h && h2h.H2H && h2h.H2H.length > 0 ? (
        <div
          style={{
            margin: "0 12px 10px",
            background: "#1e293b",
            borderRadius: 14,
            padding: 12
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>⚔ H2H</div>
          <div style={{ fontSize: 11, color: "#cbd5e1" }}>
            Встреч в базе: {h2h.H2H.length}
          </div>
        </div>
      ) : null}

      {/* AI win chance */}
      {ai ? (
        <div
          style={{
            margin: "0 12px 10px",
            background: "#1e293b",
            borderRadius: 14,
            padding: 14
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
            🤖 AI · Шанс победы в матче
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 28,
              fontWeight: 900
            }}
          >
            <span style={{ color: "#18d96d" }}>{ai.p1Chance}%</span>
            <span>{ai.p2Chance}%</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 11,
              color: "#94a3b8",
              marginBottom: 8
            }}
          >
            <span>{match.event_first_player}</span>
            <span>{match.event_second_player}</span>
          </div>
          <div
            style={{
              height: 8,
              background: "#334155",
              borderRadius: 8,
              overflow: "hidden",
              marginBottom: 10
            }}
          >
            <div
              style={{
                width: (ai.p1Chance || 50) + "%",
                height: "100%",
                background: "#18d96d"
              }}
            />
          </div>
          <div
            style={{
              background: "#0f172a",
              borderRadius: 10,
              padding: 10,
              fontSize: 12
            }}
          >
            <div style={{ color: "#fbbf24", fontWeight: 700, marginBottom: 6 }}>
              Прогноз: {ai.favoriteName || (ai.p1Chance >= ai.p2Chance ? match.event_first_player : match.event_second_player)}{" "}
              ({ai.favoriteChance || Math.max(ai.p1Chance, ai.p2Chance)}%)
            </div>
            <div style={{ color: "#cbd5e1", marginBottom: 4 }}>
              {ai.leaderText || ""}
            </div>
            {liveSet ? (
              <div style={{ color: "#94a3b8" }}>
                Текущий сет: {liveSet.setFav} {liveSet.setPct}% · \~{liveSet.expGames}{" "}
                геймов
              </div>
            ) : null}
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <div style={{ flex: 1, fontSize: 11, color: "#cbd5e1" }}>
              {(ai.reasons1 || []).slice(0, 4).map(function (r, i) {
                return (
                  <div key={i} style={{ marginBottom: 3 }}>
                    • {r}
                  </div>
                );
              })}
            </div>
            <div style={{ flex: 1, fontSize: 11, color: "#cbd5e1" }}>
              {(ai.reasons2 || []).slice(0, 4).map(function (r, i) {
                return (
                  <div key={i} style={{ marginBottom: 3 }}>
                    • {r}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      {/* Final report */}
      {finalReport ? (
        <div
          style={{
            margin: "0 12px 10px",
            background: "#052e1c",
            borderRadius: 14,
            padding: 12,
            border: "1px solid #18d96d"
          }}
        >
          <div style={{ fontWeight: 800, marginBottom: 6 }}>Итог матча</div>
          <div style={{ fontSize: 12 }}>
            Победитель: {finalReport.winnerName} · {finalReport.score}
          </div>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>
            Прогноз был: {finalReport.predictedName} ({finalReport.predictedChance}
            %) ·{" "}
            {finalReport.correct === true
              ? "совпал"
              : finalReport.correct === false
              ? "не совпал"
              : "—"}
          </div>
        </div>
      ) : null}

      <BottomNav />
    </div>
  );
}
