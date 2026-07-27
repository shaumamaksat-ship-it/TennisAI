import { useEffect, useRef, useState } from "react";
import { runAutoTrainTick } from "../ai/AITrainer";

export default function AutoTrainer() {
  const [stats, setStats] = useState({ tracked: 0, learned: 0 });
  const busy = useRef(false);

  useEffect(function() {
    const tick = async function() {
      if (busy.current) return;
      busy.current = true;
      try {
        const r = await runAutoTrainTick();
        if (r) setStats(r);
      } catch (e) {}
      busy.current = false;
    };
    tick();
    const id = setInterval(tick, 3000);
    return function() { clearInterval(id); };
  }, []);

  // small hidden indicator - optional badge top-left debug
  return (
    <div style={{
      position: "fixed",
      bottom: 72,
      right: 10,
      zIndex: 50,
      background: "rgba(15,23,42,0.85)",
      border: "1px solid #334155",
      borderRadius: 10,
      padding: "4px 8px",
      fontSize: 10,
      color: "#94a3b8",
      pointerEvents: "none"
    }}>
      🧠 auto · live {stats.tracked} · learned {stats.learned}
    </div>
  );
}
