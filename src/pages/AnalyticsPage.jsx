import { useEffect, useState } from "react";
import BottomNav from "../components/BottomNav";

function loadBrain() {
  try {
    const raw = localStorage.getItem("tennisai_brain");
    if (!raw) {
      return { games: 0, correct: 0, serveW: 0.18, returnW: 0.16, formW: 0.20, liveScoreW: 0.32, prevSetW: 0.25 };
    }
    return JSON.parse(raw);
  } catch (e) {
    return { games: 0, correct: 0 };
  }
}

function loadHistory() {
  try {
    const raw = localStorage.getItem("tennisai_history");
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export default function AnalyticsPage() {
  const [brain, setBrain] = useState(loadBrain());
  const [history, setHistory] = useState(loadHistory());

  useEffect(function() {
    const tick = function() {
      setBrain(loadBrain());
      setHistory(loadHistory());
    };
    tick();
    const id = setInterval(tick, 2000);
    return function() { clearInterval(id); };
  }, []);

  const games = brain.games || 0;
  const correct = brain.correct || 0;
  const accuracy = games > 0 ? Math.round((correct / games) * 100) : 0;

  const recent = history.slice().reverse().slice(0, 12);
  let datasetN = 0;
  try { datasetN = (JSON.parse(localStorage.getItem("tennisai_dataset") || "[]") || []).length; } catch (e) {}
  let trainedN = 0;
  try { trainedN = Object.keys(JSON.parse(localStorage.getItem("tennisai_trained_keys") || "{}")).length; } catch (e) {}

  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", color: "white", paddingBottom: 90 }}>
      <div style={{ padding: "16px 16px 8px" }}>
        <div style={{ fontSize: 22, fontWeight: 800 }}>
          📊 <span style={{ color: "#18d96d" }}>Аналитика ИИ</span>
        </div>
        <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
          Точность прогнозов и самообучение (включая auto-train)
        </div>
      </div>

      {/* Главная карточка точности */}
      <div style={{
        margin: 12,
        background: "linear-gradient(145deg, #12352a 0%, #1e293b 100%)",
        border: "1px solid #18d96d",
        borderRadius: 18,
        padding: 16
      }}>
        <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>ТОЧНОСТЬ ИИ</div>
        <div style={{ fontSize: 42, fontWeight: 900, color: "#18d96d" }}>{accuracy}%</div>
        <div style={{ fontSize: 13, color: "#cbd5e1", marginTop: 4 }}>
          Верных: <b>{correct}</b> из <b>{games}</b> матчей · dataset {datasetN} · auto {trainedN}
        </div>

        <div style={{ height: 10, background: "#0f172a", borderRadius: 8, marginTop: 12, overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: Math.min(100, accuracy) + "%",
            background: accuracy >= 55 ? "#18d96d" : (accuracy >= 45 ? "#fbbf24" : "#f87171")
          }}></div>
        </div>
      </div>

      {/* Веса модели */}
      <div style={{ margin: "0 12px 12px", background: "#1e293b", borderRadius: 16, padding: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>🧠 Веса модели</div>
        {[
          ["Подача", brain.serveW],
          ["Приём", brain.returnW],
          ["Форма", brain.formW],
          ["Live-счёт", brain.liveScoreW],
          ["Прошлые сеты", brain.prevSetW]
        ].map(function(row) {
          const name = row[0];
          const val = Number(row[1] || 0);
          const pct = Math.round(val * 100);
          return (
            <div key={name} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                <span style={{ color: "#cbd5e1" }}>{name}</span>
                <span style={{ color: "#18d96d" }}>{pct}%</span>
              </div>
              <div style={{ height: 6, background: "#0f172a", borderRadius: 6, overflow: "hidden" }}>
                <div style={{ height: "100%", width: Math.min(100, pct * 2) + "%", background: "#18d96d" }}></div>
              </div>
            </div>
          );
        })}
        <div style={{ fontSize: 11, color: "#64748b", marginTop: 8 }}>
          Веса меняются после каждого завершённого матча
        </div>
      </div>

      {/* История */}
      <div style={{ margin: "0 12px 12px", background: "#1e293b", borderRadius: 16, padding: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>📜 Последние прогнозы</div>

        {!recent.length && (
          <div style={{ fontSize: 12, color: "#94a3b8" }}>
            Пока нет завершённых матчей с отчётом. Открой live-матч и дождись конца — ИИ сохранит результат.
          </div>
        )}

        {recent.map(function(item, i) {
          const ok = item.correct === true;
          return (
            <div key={i} style={{
              borderBottom: i < recent.length - 1 ? "1px solid #334155" : "none",
              padding: "8px 0"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                <span style={{ fontSize: 12, fontWeight: 700 }}>
                  {item.p1} vs {item.p2}
                </span>
                <span style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: ok ? "#18d96d" : "#f87171"
                }}>
                  {ok ? "ВЕРНО" : "ОШИБКА"}
                </span>
              </div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>
                ИИ: {item.predicted} ({item.chance}%) · Победитель: {item.winner} · {item.score}
              </div>
            </div>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
}
