import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import { useEffect, useState } from "react";

export default function ProfileNotifications() {
  const navigate = useNavigate();
  const [enabled, setEnabled] = useState(true);
  const [favOnly, setFavOnly] = useState(true);

  useEffect(function () {
    setEnabled(localStorage.getItem("tennisai_notif") !== "0");
    setFavOnly(localStorage.getItem("tennisai_notif_fav_only") !== "0");
  }, []);

  function save(key, val) {
    localStorage.setItem(key, val ? "1" : "0");
  }

  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", color: "white", paddingBottom: 90 }}>
      <div style={{ padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={function () { navigate("/profile"); }} style={{ background: "none", border: "none", color: "white", fontSize: 20 }}>←</button>
        <h2 style={{ margin: 0 }}>🔔 Уведомления</h2>
      </div>
      <div style={{ margin: 14, background: "#1e293b", borderRadius: 16, padding: 16 }}>
        <Row
          title="Разрешить уведомления"
          on={enabled}
          toggle={function () {
            const v = !enabled;
            setEnabled(v);
            save("tennisai_notif", v);
          }}
        />
        <Row
          title="Только избранные матчи"
          on={favOnly}
          toggle={function () {
            const v = !favOnly;
            setFavOnly(v);
            save("tennisai_notif_fav_only", v);
          }}
        />
        <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 12, lineHeight: 1.4 }}>
          Уведомления о брейках, сете и конце матча. Для работы нужен доступ браузера к уведомлениям.
        </p>
      </div>
      <BottomNav />
    </div>
  );
}

function Row({ title, on, toggle }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #334155" }}>
      <span>{title}</span>
      <button
        onClick={toggle}
        style={{
          width: 48,
          height: 28,
          borderRadius: 14,
          border: "none",
          background: on ? "#18d96d" : "#475569",
          position: "relative"
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 3,
            left: on ? 24 : 4,
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: "white"
          }}
        />
      </button>
    </div>
  );
}
