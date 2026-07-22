import requests
import json


API_KEY = "99969bf38c505cb69d9901bada9049e431b7b22a6e71907a732c7c228efe6fcc"

event_key = 12148246


url = "https://api.api-tennis.com/tennis/"


params = {
    "method": "get_livescore",
    "APIkey": API_KEY
}


data = requests.get(
    url,
    params=params
).json()


for match in data.get("result", []):

    if str(match.get("event_key")) == str(event_key):

        print(
            json.dumps(
                match.get("pointbypoint"),
                indent=4,
                ensure_ascii=False
            )
        )

        break
