export function requestPermission() {
  try {
    if (!("Notification" in window)) return Promise.resolve("denied");
    if (Notification.permission === "granted") return Promise.resolve("granted");
    if (Notification.permission !== "denied") {
      return Notification.requestPermission();
    }
    return Promise.resolve(Notification.permission);
  } catch (e) {
    return Promise.resolve("denied");
  }
}

export function getNotifHistory() {
  try {
    const raw = localStorage.getItem("tennisai_notifs");
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveNotif(item) {
  try {
    const list = getNotifHistory();
    list.unshift(item);
    localStorage.setItem("tennisai_notifs", JSON.stringify(list.slice(0, 40)));
  } catch (e) {}
}

export function sendNotify(title, body, tag) {
  const item = {
    title: title,
    body: body,
    tag: tag || "tennis",
    ts: Date.now()
  };
  saveNotif(item);

  // in-app event
  try {
    window.dispatchEvent(new CustomEvent("tennisai-toast", { detail: item }));
  } catch (e) {}

  // browser notification
  try {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body: body,
        tag: tag || "tennisai",
        silent: false
      });
    }
  } catch (e) {}

  return item;
}

export function detectEvents(prev, next) {
  if (!next) return [];
  const events = [];

  const p1 = next.event_first_player || "Игрок 1";
  const p2 = next.event_second_player || "Игрок 2";
  const title = p1 + " vs " + p2;

  const prevSets = prev ? (prev.event_final_result || "0 - 0") : null;
  const nextSets = next.event_final_result || "0 - 0";
  const prevStatus = prev ? (prev.event_status || "") : "";
  const nextStatus = next.event_status || "";

  const finished = (nextStatus || "").toLowerCase().indexOf("finished") !== -1
    || (nextStatus || "").toLowerCase().indexOf("retired") !== -1;

  // Match finished
  if (prev && !((prevStatus || "").toLowerCase().indexOf("finished") !== -1) && finished) {
    const winner = next.event_winner === "First Player" ? p1
      : (next.event_winner === "Second Player" ? p2 : "Победитель");
    events.push({
      type: "match_end",
      title: "🏁 Матч завершён",
      body: title + " · " + nextSets + " · Победитель: " + winner,
      tag: "end-" + next.event_key
    });
    return events;
  }

  // Set changed
  if (prev && prevSets && nextSets && prevSets !== nextSets && !finished) {
    events.push({
      type: "set",
      title: "🎾 Сет завершён",
      body: title + " · Сеты теперь " + nextSets,
      tag: "set-" + next.event_key + "-" + nextSets
    });
  }

  // Break detection via games in current set
  function gamesObj(m) {
    if (!m || !m.scores || !m.scores.length) return { g1: 0, g2: 0 };
    const last = m.scores[m.scores.length - 1];
    return { g1: Number(last.score_first || 0), g2: Number(last.score_second || 0) };
  }

  if (prev && !finished) {
    const a = gamesObj(prev);
    const b = gamesObj(next);
    const serve = next.event_serve;

    // кто-то взял гейм
    if (b.g1 > a.g1) {
      // p1 won a game
      if (serve === "Second Player" || prev.event_serve === "Second Player") {
        // p1 broke or held depending on who was serving when game ended - approximate:
        // if previous serve was Second Player and p1 gained game -> break by p1
        if (prev.event_serve === "Second Player") {
          events.push({
            type: "break",
            title: "💥 БРЕЙК!",
            body: p1 + " сделал брейк · " + title + " (" + b.g1 + ":" + b.g2 + ")",
            tag: "break-" + next.event_key + "-" + b.g1 + b.g2
          });
        }
      }
    }
    if (b.g2 > a.g2) {
      if (prev.event_serve === "First Player") {
        events.push({
          type: "break",
          title: "💥 БРЕЙК!",
          body: p2 + " сделал брейк · " + title + " (" + b.g1 + ":" + b.g2 + ")",
          tag: "break-" + next.event_key + "-" + b.g1 + b.g2
        });
      }
    }
  }

  return events;
}
