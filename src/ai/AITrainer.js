import { getLiveMatches } from "../api/tennisApi";
import { analyzeMatch } from "./AIEngine";

function loadBrain() {
  try {
    const raw = localStorage.getItem("tennisai_brain");
    return raw ? JSON.parse(raw) : {
      games: 0, correct: 0,
      serveW: 0.18, returnW: 0.16, formW: 0.2, liveScoreW: 0.32, prevSetW: 0.25
    };
  } catch (e) {
    return { games: 0, correct: 0, serveW: 0.18, returnW: 0.16, formW: 0.2, liveScoreW: 0.32, prevSetW: 0.25 };
  }
}

function saveBrain(b) {
  try { localStorage.setItem("tennisai_brain", JSON.stringify(b)); } catch (e) {}
}

function loadPredictions() {
  try {
    const raw = localStorage.getItem("tennisai_live_preds");
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function savePredictions(map) {
  try { localStorage.setItem("tennisai_live_preds", JSON.stringify(map)); } catch (e) {}
}

function loadDataset() {
  try {
    const raw = localStorage.getItem("tennisai_dataset");
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveDataset(arr) {
  try { localStorage.setItem("tennisai_dataset", JSON.stringify(arr.slice(-200))); } catch (e) {}
}

function isFinished(m) {
  const st = (m.event_status || "").toLowerCase();
  return st.indexOf("finished") !== -1 || st.indexOf("retired") !== -1 || st.indexOf("walkover") !== -1;
}

function isNoise(m) {
  const st = (m.event_status || "").toLowerCase();
  return st.indexOf("retired") !== -1 || st.indexOf("walkover") !== -1 || st.indexOf("cancelled") !== -1;
}

function winnerIsP1(m) {
  if (m.event_winner === "First Player") return true;
  if (m.event_winner === "Second Player") return false;
  const sp = String(m.event_final_result || "").replace(/\s/g, "").split("-");
  if (sp.length === 2) {
    const a = Number(sp[0]), b = Number(sp[1]);
    if (!isNaN(a) && !isNaN(b) && a !== b) return a > b;
  }
  return null;
}

function learn(didP1Win, predP1) {
  const brain = loadBrain();
  brain.games = (brain.games || 0) + 1;
  const predictedP1 = predP1 >= 50;
  const correct = predictedP1 === didP1Win;
  if (correct) brain.correct = (brain.correct || 0) + 1;

  const step = correct ? 0.004 : 0.01;
  if (!correct) {
    // wrong: boost live score weight (most reliable in tennis)
    brain.liveScoreW = Math.min(0.55, (brain.liveScoreW || 0.32) + step);
    brain.formW = Math.max(0.08, (brain.formW || 0.2) - step * 0.5);
  } else {
    brain.liveScoreW = Math.min(0.5, (brain.liveScoreW || 0.32) + step * 0.3);
  }
  saveBrain(brain);
  return { correct: correct, brain: brain };
}

function pushHistory(m, pred, didP1Win, correct) {
  try {
    const raw = localStorage.getItem("tennisai_history");
    const hist = raw ? JSON.parse(raw) : [];
    hist.push({
      p1: m.event_first_player,
      p2: m.event_second_player,
      winner: didP1Win ? m.event_first_player : m.event_second_player,
      score: m.event_final_result || "-",
      predicted: pred.p1Chance >= pred.p2Chance ? m.event_first_player : m.event_second_player,
      chance: Math.max(pred.p1Chance, pred.p2Chance),
      correct: correct,
      auto: true,
      ts: Date.now()
    });
    localStorage.setItem("tennisai_history", JSON.stringify(hist.slice(-80)));
  } catch (e) {}
}

let trainedKeys = {};
try {
  trainedKeys = JSON.parse(localStorage.getItem("tennisai_trained_keys") || "{}");
} catch (e) {}

export async function runAutoTrainTick() {
  const live = await getLiveMatches();
  if (!live || !live.length) return { tracked: 0, learned: 0 };

  const preds = loadPredictions();
  let learned = 0;
  let tracked = 0;

  for (let i = 0; i < live.length; i++) {
    const m = live[i];
    const key = String(m.event_key);
    if (!key) continue;

    if (!isFinished(m)) {
      // snapshot prediction while live
      try {
        const ai = analyzeMatch(m, null, [], [], null);
        if (ai && ai.p1Chance != null) {
          preds[key] = {
            p1Chance: ai.p1Chance,
            p2Chance: ai.p2Chance,
            p1: m.event_first_player,
            p2: m.event_second_player,
            ts: Date.now()
          };
          tracked++;
        }
      } catch (e) {}
      continue;
    }

    // finished
    if (trainedKeys[key]) continue;
    if (isNoise(m)) {
      trainedKeys[key] = "noise";
      continue;
    }

    const pred = preds[key];
    if (!pred) {
      // no prior snapshot - still mark to avoid loop
      trainedKeys[key] = "no-pred";
      continue;
    }

    const didP1Win = winnerIsP1(m);
    if (didP1Win === null) {
      trainedKeys[key] = "unknown";
      continue;
    }

    const result = learn(didP1Win, pred.p1Chance);
    pushHistory(m, pred, didP1Win, result.correct);

    const ds = loadDataset();
    ds.push({
      key: key,
      p1: m.event_first_player,
      p2: m.event_second_player,
      pred1: pred.p1Chance,
      pred2: pred.p2Chance,
      win1: didP1Win,
      score: m.event_final_result,
      ts: Date.now()
    });
    saveDataset(ds);

    trainedKeys[key] = result.correct ? "ok" : "miss";
    learned++;
    delete preds[key];
  }

  savePredictions(preds);
  try { localStorage.setItem("tennisai_trained_keys", JSON.stringify(trainedKeys)); } catch (e) {}

  return { tracked: tracked, learned: learned };
}
