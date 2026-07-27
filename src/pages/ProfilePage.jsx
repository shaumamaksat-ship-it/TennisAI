import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import BottomNav from "../components/BottomNav";

function loadFavoritesCount() {
  try {
    const raw = localStorage.getItem("tennisai_favorites") || localStorage.getItem("favorites") || "[]";
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.length : 0;
  } catch (e) {
    return 0;
  }
}

function loadAiStats() {
  try {
    const brain = JSON.parse(localStorage.getItem("tennisai_brain") || "{}");
    const hist = JSON.parse(localStorage.getItem("tennisai_history") || localStorage.getItem("tennisai_ai_history") || "[]");
    const dataset = JSON.parse(localStorage.getItem("tennisai_dataset") || "[]");
    const trained = JSON.parse(localStorage.getItem("tennisai_trained") || "{}");
    const learned = Array.isArray(hist) ? hist.length : 0;
    const dataN = Array.isArray(dataset) ? dataset.length : 0;
    const trainedN = trained && typeof trained === "object" ? Object.keys(trained).length : 0;
    return { learned: learned || trainedN, dataset: dataN, weights: brain && brain.liveScoreW ? true : false };
  } catch (e) {
    return { learned: 0, dataset: 0, weights: false };
  }
}

function loadFavoritePlayers() {
  try {
    const raw = localStorage.getItem("tennisai_fav_players") || "[]";
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.length : 0;
  } catch (e) {
    return 0;
  }
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [regDate, setRegDate] = useState("");
  const [stats, setStats] = useState({
    favMatches: 0,
    ai: 0,
    favPlayers: 0,
    dataset: 0
  });

  function refresh() {
    const u = localStorage.getItem("username") || localStorage.getItem("tennisai_user") || "";
    setUsername(u || "Гость");
    const d = localStorage.getItem("tennisai_reg_date") || localStorage.getItem("regDate") || "";
    setRegDate(d || "—");
    const ai = loadAiStats();
    setStats({
      favMatches: loadFavoritesCount(),
      ai: ai.learned,
      favPlayers: loadFavoritePlayers(),
      dataset: ai.dataset
    });
  }

  useEffect(function () {
    if (!localStorage.getItem("tennisai_reg_date") && localStorage.getItem("username")) {
      const now = new Date();
      const dd = String(now.getDate()).padStart(2, "0");
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const yyyy = now.getFullYear();
      localStorage.setItem("tennisai_reg_date", dd + "." + mm + "." + yyyy);
    }
    refresh();
    const t = setInterval(refresh, 3000);
    return function () { clearInterval(t); };
  }, []);

  function logout() {
    localStorage.removeItem("username");
    localStorage.removeItem("tennisai_user");
    navigate("/login");
  }

  const menu = [
    { icon: "⭐", title: "Избранные матчи", path: "/favorites", hint: stats.favMatches },
    { icon: "📊", title: "Аналитика AI", path: "/analytics", hint: stats.ai },
    { icon: "🔔", title: "Уведомления", path: "/profile/notifications", hint: "" },
    { icon: "🌐", title: "Язык", path: "/profile/language", hint: (localStorage.getItem("tennisai_lang") || "ru").toUpperCase() },
    { icon: "🎨", title: "Тема", path: "/profile/theme", hint: (localStorage.getItem("tennisai_theme") || "dark") === "dark" ? "Тёмная" : "Светлая" },
    { icon: "❓", title: "Помощь", path: "/profile/help", hint: "" },
    { icon: "ℹ️", title: "О приложении", path: "/profile/about", hint: "v0.1" }
  ];

  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", color: "white", paddingBottom: 90 }}>
      <div style={{ padding: "18px 16px 8px", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 22 }}>👤</span>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Мой профиль</h1>
      </div>

      {/* Card */}
      <div style={{ margin: "8px 14px", background: "#1e293b", borderRadius: 18, padding: "22px 16px", textAlign: "center" }}>
        <div
          style={{
            width: 84,
            height: 84,
            borderRadius: "50%",
            background: "linear-gradient(145deg,#18d96d,#0ea5e9)",
            margin: "0 auto 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 40
          }}
        >
          🎾
        </div>
        <div style={{ fontSize: 22, fontWeight: 800 }}>{username}</div>
        <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>Дата регистрации</div>
        <div style={{ fontSize: 14, color: "#cbd5e1", marginTop: 2 }}>{regDate}</div>
        {!localStorage.getItem("username") ? (
          <div style={{ marginTop: 14, display: "flex", gap: 10, justifyContent: "center" }}>
            <Link to="/login" style={{ color: "#18d96d", fontWeight: 700, textDecoration: "none" }}>
              Вход
            </Link>
            <Link to="/register" style={{ color: "#18d96d", fontWeight: 700, textDecoration: "none" }}>
              Регистрация
            </Link>
          </div>
        ) : null}
      </div>

      {/* Stats */}
      <div style={{ margin: "12px 14px", background: "#1e293b", borderRadius: 18, padding: 16 }}>
        <div style={{ fontWeight: 800, marginBottom: 12 }}>📊 Статистика</div>
        {[
          { icon: "⭐", label: "Избранные матчи", value: stats.favMatches, path: "/favorites" },
          { icon: "🧠", label: "AI-анализы / обучение", value: stats.ai, path: "/analytics" },
          { icon: "🎾", label: "Любимые игроки", value: stats.favPlayers, path: "/favorites" },
          { icon: "📚", label: "Датасет модели", value: stats.dataset, path: "/analytics" }
        ].map(function (row) {
          return (
            <div
              key={row.label}
              onClick={function () { if (row.path) navigate(row.path); }}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 0",
                borderBottom: "1px solid #334155",
                cursor: "pointer"
              }}
            >
              <span style={{ fontSize: 14 }}>
                {row.icon} {row.label}
              </span>
              <span style={{ fontWeight: 800, color: "#18d96d" }}>{row.value}</span>
            </div>
          );
        })}
      </div>

      {/* Menu */}
      <div style={{ margin: "12px 14px", background: "#1e293b", borderRadius: 18, padding: "8px 12px" }}>
        <div style={{ fontWeight: 800, margin: "8px 4px 4px" }}>💎 Аккаунт</div>
        {menu.map(function (item) {
          return (
            <div
              key={item.title}
              onClick={function () { navigate(item.path); }}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 6px",
                borderBottom: "1px solid #334155",
                cursor: "pointer"
              }}
            >
              <span>
                {item.icon} {item.title}
              </span>
              <span style={{ color: "#64748b", fontSize: 13 }}>
                {item.hint !== "" && item.hint !== undefined ? item.hint + " ›" : "›"}
              </span>
            </div>
          );
        })}
        {localStorage.getItem("username") ? (
          <div
            onClick={logout}
            style={{
              padding: "14px 6px",
              color: "#f87171",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            🚪 Выйти
          </div>
        ) : null}
      </div>

      <BottomNav />
    </div>
  );
}
