export default function H2HBlock({ h2h, p1Name, p2Name }) {
  if (!h2h) {
    return (
      <div style={{ margin: "0 12px 12px", background: "#1e293b", borderRadius: 16, padding: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>⚔️ H2H</div>
        <div style={{ fontSize: 12, color: "#94a3b8" }}>История личных встреч загружается...</div>
      </div>
    );
  }

  const meetings = h2h.H2H || [];
  const p1Results = h2h.firstPlayerResults || [];
  const p2Results = h2h.secondPlayerResults || [];

  let p1Wins = 0;
  let p2Wins = 0;
  const last = [];

  meetings.slice(0, 8).forEach(function(m) {
    const winner = m.event_winner;
    const score = m.event_final_result || "-";
    const date = m.event_date || "";
    if (winner === "First Player") p1Wins++;
    if (winner === "Second Player") p2Wins++;
    last.push({
      score: score,
      date: date,
      winner: winner === "First Player" ? p1Name : (winner === "Second Player" ? p2Name : "?"),
      tour: m.tournament_name || m.event_type_type || ""
    });
  });

  if (!meetings.length) {
    return (
      <div style={{ margin: "0 12px 12px", background: "#1e293b", borderRadius: 16, padding: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>⚔️ H2H</div>
        <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>
          Прямых встреч в базе мало / нет
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12 }}>
          <div style={{ background: "#0f172a", borderRadius: 10, padding: 10 }}>
            <div style={{ color: "#18d96d", fontWeight: 700, marginBottom: 4 }}>{p1Name}</div>
            <div style={{ color: "#94a3b8" }}>Недавних матчей: {p1Results.length}</div>
          </div>
          <div style={{ background: "#0f172a", borderRadius: 10, padding: 10 }}>
            <div style={{ color: "#18d96d", fontWeight: 700, marginBottom: 4 }}>{p2Name}</div>
            <div style={{ color: "#94a3b8" }}>Недавних матчей: {p2Results.length}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ margin: "0 12px 12px", background: "#1e293b", borderRadius: 16, padding: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>⚔️ H2H · Личные встречи</div>

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "#0f172a",
        borderRadius: 12,
        padding: "10px 14px",
        marginBottom: 10
      }}>
        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>{p1Name}</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#18d96d" }}>{p1Wins}</div>
        </div>
        <div style={{ fontSize: 12, color: "#64748b" }}>VS</div>
        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>{p2Name}</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#18d96d" }}>{p2Wins}</div>
        </div>
      </div>

      <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>Последние встречи</div>
      {last.map(function(item, i) {
        return (
          <div key={i} style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 12,
            padding: "6px 0",
            borderBottom: i < last.length - 1 ? "1px solid #334155" : "none"
          }}>
            <div>
              <div style={{ fontWeight: 600 }}>{item.winner}</div>
              <div style={{ color: "#64748b", fontSize: 11 }}>{item.tour}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 700 }}>{item.score}</div>
              <div style={{ color: "#64748b", fontSize: 11 }}>{item.date}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
