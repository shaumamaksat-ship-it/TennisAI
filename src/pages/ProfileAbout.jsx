import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";

export default function ProfileAbout() {
  const navigate = useNavigate();
  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", color: "white", paddingBottom: 90 }}>
      <div style={{ padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={function () { navigate("/profile"); }} style={{ background: "none", border: "none", color: "white", fontSize: 20 }}>←</button>
        <h2 style={{ margin: 0 }}>ℹ️ О приложении</h2>
      </div>
      <div style={{ margin: 14, background: "#1e293b", borderRadius: 16, padding: 18, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>🎾</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#18d96d" }}>TennisAI</div>
        <div style={{ color: "#94a3b8", marginTop: 6 }}>Версия 0.1</div>
        <p style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.5, marginTop: 14, textAlign: "left" }}>
          Live-аналитика теннисных матчей: счёт, подача, форма, покрытие, прогноз сета и самообучение модели на завершённых играх.
        </p>
      </div>
      <BottomNav />
    </div>
  );
}
