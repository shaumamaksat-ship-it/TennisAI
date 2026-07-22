import os
import json
import csv

INPUT_DIR = "stats_json"      # папка с JSON
OUTPUT = "tennis_stats.csv"

rows = []

for file in os.listdir(INPUT_DIR):
    if not file.endswith(".json"):
        continue

    path = os.path.join(INPUT_DIR, file)

    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception:
        continue

    match_id = data.get("match_key", file)

    players = {}

    stats = data.get("stats", [])

    for block in stats:
        for item in block.get("items", []):
            key = item.get("player_key")

            if key not in players:
                players[key] = {
                    "match_id": match_id,
                    "player_key": key
                }

            name = item.get("stat_name")
            value = item.get("stat_value")

            players[key][name] = value

    rows.extend(players.values())

if rows:
    fields = set()

    for r in rows:
        fields.update(r.keys())

    fields = list(fields)

    with open(OUTPUT, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)

print(f"Готово! Сохранено {len(rows)} строк.")
