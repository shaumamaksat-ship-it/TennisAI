import requests
import json

API_KEY = "99969bf38c505cb69d9901bada9049e431b7b22a6e71907a732c7c228efe6fcc"

url = "https://api.api-tennis.com/tennis/"

params = {
    "method": "get_livescore",
    "APIkey": API_KEY
}

r = requests.get(url, params=params, timeout=30)
data = r.json()

print(json.dumps(data["result"][0], indent=4, ensure_ascii=False))
