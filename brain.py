import json

with open("data/live_matches.json", encoding="utf-8") as f:
    data=json.load(f)

for m in data["matches"]:
    print("\n🎾", m["home"], "-", m["away"])
    print("Турнир:", m.get("competition"))
    print("Счёт:", m.get("home_score"), "-", m.get("away_score"))
    print("Статус:", m.get("status_text"))
