import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";

export default function ProfileHelp() {
  const navigate = useNavigate();
  const items = [
    { q: "Как работает AI?", a: "Модель смотрит live-счёт, подачу, форму, покрытие и историю. Проценты обновляются каждую секунду." },
    { q: "Что такое матч дня?", a: "Самый интересный live-матч по рейтингу/статусу. После окончания выбирается новый." },
    { q: "Зачем избранное?", a: "Быстрый доступ к матчам и уведомления по ним." },
    { q: "Почему нет флага?", a: "В API иногда нет страны игрока — тогда флаг скрыт." }
  ];
  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", color: "white", paddingBottom: 90 }}>
      <div style={{ padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={function () { navigate("/profile"); }} style={{ background: "none", border: "none", color: "white", fontSize: 20 }}>←</button>
        <h2 style={{ margin: 0 }}>❓ Помощь</h2>
      </div>
      <div style={{ margin: 14 }}>
        {items.map(function (it) {
          return (
            <div key={it.q} style={{ background: "#1e293b", borderRadius: 14, padding: 14, marginBottom: 10 }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>{it.q}</div>
              <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.4 }}>{it.a}</div>
            </div>
          );
        })}
      </div>
      <BottomNav />
    </div>
  );
}
