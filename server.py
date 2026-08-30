#!/usr/bin/env python3
"""TennisAI server: static site + SQLite brain."""
from __future__ import annotations

import json
import os
import sqlite3
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent
DB = ROOT / "tennisai.sqlite"
HOST = os.environ.get("HOST", "0.0.0.0")
PORT = int(os.environ.get("PORT", "8787"))
LOCK = threading.Lock()


def db():
    con = sqlite3.connect(DB)
    con.row_factory = sqlite3.Row
    con.execute(
        """CREATE TABLE IF NOT EXISTS kv (
        k TEXT PRIMARY KEY,
        v TEXT NOT NULL
    )"""
    )
    con.execute(
        """CREATE TABLE IF NOT EXISTS preds (
        id TEXT PRIMARY KEY,
        match_id TEXT,
        pick INTEGER,
        game INTEGER,
        p REAL,
        p1 TEXT,
        p2 TEXT,
        t INTEGER
    )"""
    )
    con.execute(
        """CREATE TABLE IF NOT EXISTS results (
        id TEXT PRIMARY KEY,
        pick INTEGER,
        actual INTEGER,
        ok INTEGER,
        p REAL,
        p1 TEXT,
        p2 TEXT,
        t INTEGER
    )"""
    )
    con.commit()
    return con


def kv_get(con, key, default=None):
    row = con.execute("SELECT v FROM kv WHERE k=?", (key,)).fetchone()
    if not row:
        return default
    try:
        return json.loads(row["v"])
    except Exception:
        return default


def kv_set(con, key, val):
    con.execute(
        "INSERT INTO kv(k,v) VALUES(?,?) ON CONFLICT(k) DO UPDATE SET v=excluded.v",
        (key, json.dumps(val, ensure_ascii=False)),
    )


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, fmt, *args):
        print("[%s] %s" % (self.log_date_time_string(), fmt % args))

    def _send(self, code, payload, ctype="application/json; charset=utf-8"):
        raw = payload if isinstance(payload, (bytes, bytearray)) else json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(raw)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(raw)

    def do_OPTIONS(self):
        self._send(204, b"")

    def do_GET(self):
        path = urlparse(self.path).path
        if path in ("/", "/app", "/index.html"):
            html = ROOT / "TennisAI.html"
            if html.exists():
                self._send(200, html.read_bytes(), "text/html; charset=utf-8")
                return
        if path == "/api/health":
            self._send(200, {"ok": True, "db": str(DB), "name": "TennisAI"})
            return
        if path == "/api/brain":
            with LOCK:
                con = db()
                brain = kv_get(con, "brain", {"players": {}, "calib": {"n": 0, "hit": 0}, "matches": {}})
                con.close()
            self._send(200, brain)
            return
        if path == "/api/stats":
            with LOCK:
                con = db()
                n_pred = con.execute("SELECT COUNT(*) c FROM preds").fetchone()["c"]
                n_res = con.execute("SELECT COUNT(*) c FROM results").fetchone()["c"]
                n_ok = con.execute("SELECT COUNT(*) c FROM results WHERE ok=1").fetchone()["c"]
                brain = kv_get(con, "brain", {})
                con.close()
            acc = round(100 * n_ok / n_res) if n_res else 0
            self._send(
                200,
                {
                    "preds": n_pred,
                    "results": n_res,
                    "acc": acc,
                    "calib": (brain or {}).get("calib") or {},
                },
            )
            return
        return super().do_GET()

    def do_POST(self):
        path = urlparse(self.path).path
        n = int(self.headers.get("Content-Length") or 0)
        raw = self.rfile.read(n) if n else b"{}"
        try:
            body = json.loads(raw.decode("utf-8") or "{}")
        except Exception:
            return self._send(400, {"ok": False, "error": "bad json"})
        if path == "/api/brain":
            with LOCK:
                con = db()
                cur = kv_get(con, "brain", {"players": {}, "calib": {"n": 0, "hit": 0}, "matches": {}})
                if isinstance(body, dict):
                    if "players" in body:
                        cur["players"] = {**(cur.get("players") or {}), **(body.get("players") or {})}
                    if "calib" in body:
                        cur["calib"] = body["calib"]
                    if "matches" in body:
                        mm = {**(cur.get("matches") or {}), **(body.get("matches") or {})}
                        keys = list(mm.keys())[-80:]
                        cur["matches"] = {k: mm[k] for k in keys}
                kv_set(con, "brain", cur)
                con.commit()
                con.close()
            return self._send(200, {"ok": True})
        if path == "/api/pred":
            with LOCK:
                con = db()
                pid = str(body.get("id") or body.get("match") or "")
                if pid:
                    con.execute(
                        """INSERT INTO preds(id,match_id,pick,game,p,p1,p2,t)
                           VALUES(?,?,?,?,?,?,?,?)
                           ON CONFLICT(id) DO UPDATE SET pick=excluded.pick,game=excluded.game,p=excluded.p,t=excluded.t""",
                        (
                            pid,
                            str(body.get("match") or pid),
                            body.get("pick"),
                            body.get("game"),
                            body.get("p"),
                            body.get("p1"),
                            body.get("p2"),
                            body.get("t") or 0,
                        ),
                    )
                    con.commit()
                con.close()
            return self._send(200, {"ok": True})
        if path == "/api/result":
            with LOCK:
                con = db()
                rid = str(body.get("id") or "")
                if rid:
                    con.execute(
                        """INSERT INTO results(id,pick,actual,ok,p,p1,p2,t)
                           VALUES(?,?,?,?,?,?,?,?)
                           ON CONFLICT(id) DO UPDATE SET actual=excluded.actual,ok=excluded.ok,t=excluded.t""",
                        (
                            rid,
                            body.get("pick"),
                            body.get("actual"),
                            1 if body.get("ok") else 0,
                            body.get("p"),
                            body.get("p1"),
                            body.get("p2"),
                            body.get("t") or 0,
                        ),
                    )
                    con.commit()
                con.close()
            return self._send(200, {"ok": True})
        self._send(404, {"ok": False, "error": "not found"})


def main():
    db().close()
    httpd = ThreadingHTTPServer((HOST, PORT), Handler)
    print("TennisAI http://%s:%s" % (HOST, PORT))
    print("DB", DB)
    httpd.serve_forever()


if __name__ == "__main__":
    main()
