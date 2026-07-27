import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import { useState } from "react";

export default function ProfileTheme() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem("tennisai_theme") || "dark");

  function pick(t) {
    setTheme(t);
    localStorage.setItem("tennisai_theme", t);
    document.body.style.background = t === "light" ? "#f1f5f9" : "#0f172a";
  }

  return (
    <div style={{ background: theme === "light" ? "#f1f5f9" : "#0f172a", minHeight: "100vh", color: theme === "light" ? "#0f172a" : "white", paddingBottom: 90 }}>
      <div style={{ padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={function () { navigate("/profile"); }} style={{ background: "none", border: "none", color: "inherit", fontSize: 20 }}>←</button>
        <h2 style={{ margin: 0 }}>🎨 Тема</h2>
      </div>
      <div style={{ margin: 14, background: theme === "light" ? "white" : "#1e293b", borderRadius: 16, padding: 8 }}>
        {[
          { id: "dark", title: "Тёмная" },
          { id: "light", title: "Светлая" }
        ].map(function (t) {
          return (
            <div
              key={t.id}
              onClick={function () { pick(t.id); }}
              style={{
                padding: 16,
                borderBottom: "1px solid #334155",
                display: "flex",
                justifyContent: "space-between",
                cursor: "pointer"
              }}
            >
              <span>{t.title}</span>
              <span style={{ color: "#18d96d" }}>{theme === t.id ? "✓" : ""}</span>
            </div>
          );
        })}
      </div>
      <BottomNav />
    </div>
  );
}
