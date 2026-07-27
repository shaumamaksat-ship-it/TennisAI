import { useEffect, useRef } from "react";
import { getLiveMatches } from "../api/tennisApi";
import { getFavorites } from "../utils/favorites";
import { detectEvents, sendNotify, requestPermission } from "../utils/notifications";

export default function FavoritesWatcher() {
  const prevMap = useRef({});
  const ready = useRef(false);

  useEffect(function() {
    if (!ready.current) {
      requestPermission();
      ready.current = true;
    }

    const tick = async function() {
      const favs = getFavorites();
      if (!favs.length) return;

      const live = await getLiveMatches();
      if (!live || !live.length) return;

      const favKeys = {};
      favs.forEach(function(f) {
        favKeys[String(f.event_key)] = true;
      });

      live.forEach(function(m) {
        const key = String(m.event_key);
        if (!favKeys[key]) return;

        const prev = prevMap.current[key] || null;
        const events = detectEvents(prev, m);
        events.forEach(function(ev) {
          sendNotify(ev.title, ev.body, ev.tag);
        });
        prevMap.current[key] = m;
      });
    };

    tick();
    const id = setInterval(tick, 1000);
    return function() { clearInterval(id); };
  }, []);

  return null;
}
