import requests
import json

URL = "https://sportscore.com/api/widget/matches/"

params = {
    "sport": "tennis",
    "limit": 50
}

r = requests.get(URL, params=params, timeout=10)

data = r.json()

with open("data/live_matches.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("✅ Матчи сохранены:", data.get("count"))
