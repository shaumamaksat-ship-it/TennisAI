import requests
import json

URL = "https://sportscore.com/api/widget/matches/"

r = requests.get(
    URL,
    params={
        "sport": "tennis",
        "limit": 50
    },
    timeout=10
)

data = r.json()

with open("live_stats.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("✅ Сохранено live_stats.json")
