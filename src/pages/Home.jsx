import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Home.css";
import MatchCardV2 from "../components/MatchCardV2";
import LiveMatches from "../components/LiveMatches";
import BottomNav from "../components/BottomNav";

export default function Home() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");
  const [showSearch, setShowSearch] = useState(false);
  const [q, setQ] = useState("");

  function onSearch(e) {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    // уводим на вкладку матчи с query в URL
    navigate("/matches?q=" + encodeURIComponent(query));
  }

  return (
    <div className="home" style={{ background: "#0f172a", minHeight: "100vh", color: "white", paddingBottom: 90 }}>
      <header style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 14px",
        borderBottom: "1px solid #1e293b"
      }}>
        <button style={{ background: "none", border: "none", color: "white", fontSize: 22 }}>☰</button>

        <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 800, fontSize: 18 }}>
          <span>🎾</span>
          <span style={{ color: "#18d96d" }}>TennisAI</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={function() { setShowSearch(function(v) { return !v; }); }}
            style={{ background: "none", border: "none", color: "white", fontSize: 20 }}
            title="Поиск"
          >
            🔍
          </button>

          {username ? (
            <div style={{ fontWeight: 700, color: "#18d96d", fontSize: 13 }}>👤 {username}</div>
          ) : (
            <Link to="/login" style={{ color: "#18d96d", fontWeight: 700, textDecoration: "none", fontSize: 13 }}>
              Вход
            </Link>
          )}
        </div>
      </header>

      {showSearch && (
        <form onSubmit={onSearch} style={{ padding: "10px 12px 0" }}>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              autoFocus
              value={q}
              onChange={function(e) { setQ(e.target.value); }}
              placeholder="Игрок, матч или турнир..."
              style={{
                flex: 1,
                background: "#1e293b",
                border: "1px solid #18d96d",
                borderRadius: 12,
                padding: "12px 14px",
                color: "white",
                fontSize: 14,
                outline: "none"
              }}
            />
            <button
              type="submit"
              style={{
                background: "#18d96d",
                color: "#0f172a",
                border: "none",
                borderRadius: 12,
                padding: "0 14px",
                fontWeight: 800
              }}
            >
              Найти
            </button>
          </div>
        </form>
      )}

      <section style={{ padding: "16px 16px 8px" }}>
        <div style={{
          display: "inline-block",
          background: "#18d96d",
          color: "#0f172a",
          fontWeight: 800,
          fontSize: 11,
          borderRadius: 20,
          padding: "4px 10px",
          marginBottom: 10
        }}>
          AI POWERED
        </div>
        <h1 style={{ fontSize: 28, margin: "0 0 6px" }}>TennisAI</h1>
        <p style={{ color: "#94a3b8", margin: 0, fontSize: 14 }}>
          Анализирует теннисные матчи<br />в режиме реального времени
        </p>
      </section>

      <MatchCardV2 />
      <LiveMatches />
      <BottomNav />
    </div>
  );
}
