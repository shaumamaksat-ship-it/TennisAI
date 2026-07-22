import requests

API_KEY = "99969bf38c505cb69d9901bada9049e431b7b22a6e71907a732c7c228efe6fcc"

url = "https://api.api-tennis.com/tennis/"

params = {
    "method": "get_livescore",
    "APIkey": API_KEY
}

r = requests.get(url, params=params, timeout=30)

data = r.json()

for match in data["result"][:10]:
    print(
        match["event_key"],
        "|",
        match["event_first_player"],
        "vs",
        match["event_second_player"]
    )
