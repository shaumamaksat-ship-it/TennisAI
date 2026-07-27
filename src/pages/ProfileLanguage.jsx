import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import { useState } from "react";

export default function ProfileLanguage() {
  const navigate = useNavigate();
  const [lang, setLang] = useState(localStorage.getItem("tennisai_lang") || "ru");

  function pick(l) {
    setLang(l);
    localStorage.setItem("tennisai_lang", l);
  }

  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", color: "white", paddingBottom: 90 }}>
      <div style={{ padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={function () { navigate("/profile"); }} style={{ background: "none", border: "none", color: "white", fontSize: 20 }}>←</button>
        <h2 style={{ margin: 0 }}>🌐 Язык</h2>
      </div>
      <div style={{ margin: 14, background: "#1e293b", borderRadius: 16, padding: 8 }}>
        {[
          { id: "ru", title: "Русский" },
          { id: "en", title: "English" },
          { id: "kk", title: "Қазақша" }
        ].map(function (l) {
          return (
            <div
              key={l.id}
              onClick={function () { pick(l.id); }}
              style={{
                padding: 16,
                borderBottom: "1px solid #334155",
                display: "flex",
                justifyContent: "space-between",
                cursor: "pointer"
              }}
            >
              <span>{l.title}</span>
              <span style={{ color: "#18d96d" }}>{lang === l.id ? "✓" : ""}</span>
            </div>
          );
        })}
      </div>
      <p style={{ margin: "0 18px", fontSize: 12, color: "#94a3b8" }}>
        Сейчас интерфейс на русском. Выбор языка сохраняется для следующих версий перевода.
      </p>
      <BottomNav />
    </div>
  );
}
