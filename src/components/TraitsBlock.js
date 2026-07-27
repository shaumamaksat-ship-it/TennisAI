import { buildPlayerTraits, compareFatigue } from "../utils/playerTraits";

export default function TraitsBlock({ match, recent1, recent2 }) {
  if (!match) return null;
  const p1 = match.event_first_player || "Игрок 1";
  const p2 = match.event_second_player || "Игрок 2";
  const t1 = buildPlayerTraits(recent1 || [], match.first_player_key, p1);
  const t2 = buildPlayerTraits(recent2 || [], match.second_player_key, p2);
  const cmp = compareFatigue(t1, t2);

  const fColor = function(score) {
    if (score >= 3) return "#f87171";
    if (score >= 2) return "#fbbf24";
    if (score >= 1) return "#94a3b8";
    return "#18d96d";
  };

  return (
    <div style={{ margin: "0 12px 10px", background: "#1e293b", borderRadius: 14, padding: "12px 12px 10px" }}>
      <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 8 }}>🧠 Стиль · характер · физика</div>
      <div style={{ display: "flex", gap: 10 }}>
        {[t1, t2].map(function(tr) {
          return (
            <div key={tr.name} style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#18d96d", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {tr.name}
              </div>
              <div style={{ fontSize: 10, color: fColor(tr.fatigueScore), marginBottom: 4 }}>
                {tr.last10}/10д · {tr.fatigueLevel}
              </div>
              {tr.traits.map(function(x, i) {
                return (
                  <div key={i} style={{ fontSize: 10, color: "#cbd5e1", lineHeight: 1.35, marginBottom: 3 }}>
                    {x.text}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 11, color: "#fbbf24", marginTop: 8, borderTop: "1px solid #334155", paddingTop: 6, lineHeight: 1.35 }}>
        {cmp}
      </div>
    </div>
  );
}
