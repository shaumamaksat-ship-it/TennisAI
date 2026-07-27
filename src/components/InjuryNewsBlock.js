export default function InjuryNewsBlock({ p1Name, p2Name, signals, risk1, risk2, news1, news2 }) {
  const color = function(level) {
    if (level === "high") return "#f87171";
    if (level === "mid") return "#fbbf24";
    return "#18d96d";
  };

  return (
    <div style={{ margin: "0 12px 12px", background: "#1e293b", borderRadius: 16, padding: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>🏥 Травмы и новости</div>

      {signals && signals.length > 0 && signals.map(function(s, i) {
        return (
          <div key={"s" + i} style={{ fontSize: 12, color: "#fbbf24", marginBottom: 6 }}>
            ⚠ {s.text}
          </div>
        );
      })}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
        <div style={{ background: "#0f172a", borderRadius: 10, padding: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#18d96d", marginBottom: 4 }}>{p1Name}</div>
          <div style={{ fontSize: 11, color: color(risk1 && risk1.level) }}>{risk1 ? risk1.label : "—"}</div>
        </div>
        <div style={{ background: "#0f172a", borderRadius: 10, padding: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#18d96d", marginBottom: 4 }}>{p2Name}</div>
          <div style={{ fontSize: 11, color: color(risk2 && risk2.level) }}>{risk2 ? risk2.label : "—"}</div>
        </div>
      </div>

      <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>Открытые источники (новости)</div>
      {(news1 || []).slice(0, 2).map(function(n, i) {
        return (
          <div key={"n1" + i} style={{ fontSize: 11, color: "#cbd5e1", marginBottom: 4 }}>
            • {p1Name}: {n.title}
          </div>
        );
      })}
      {(news2 || []).slice(0, 2).map(function(n, i) {
        return (
          <div key={"n2" + i} style={{ fontSize: 11, color: "#cbd5e1", marginBottom: 4 }}>
            • {p2Name}: {n.title}
          </div>
        );
      })}

      {(!news1 || !news1.length) && (!news2 || !news2.length) && (
        <div style={{ fontSize: 11, color: "#64748b" }}>Новостей пока не найдено</div>
      )}

      <div style={{ fontSize: 10, color: "#64748b", marginTop: 8 }}>
        Не медкарта. Данные из открытых новостей и статуса матча.
      </div>
    </div>
  );
}
