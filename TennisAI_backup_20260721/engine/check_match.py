import requests
import json

API_KEY = "99969bf38c505cb69d9901bada9049e431b7b22a6e71907a732c7c228efe6fcc"

BASE_URL = "https://api.api-tennis.com/tennis/"


event_key = 12147873


params = {
    "method": "get_livescore",
    "APIkey": API_KEY
}


r = requests.get(
    BASE_URL,
    params=params,
    timeout=30
)

data = r.json()


for match in data["result"]:

    if str(match["event_key"]) == str(event_key):

        print(json.dumps(
            match,
            indent=4,
            ensure_ascii=False
        ))

        break
