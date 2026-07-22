import requests
from momentum import analyze_momentum


API_KEY = "99969bf38c505cb69d9901bada9049e431b7b22a6e71907a732c7c228efe6fcc"

EVENT_KEY = 12148246


url = "https://api.api-tennis.com/tennis/"


params = {
    "method": "get_livescore",
    "APIkey": API_KEY
}


response = requests.get(
    url,
    params=params,
    timeout=30
)


data = response.json()


for match in data.get("result", []):

    if str(match.get("event_key")) == str(EVENT_KEY):


        players = [

            match.get("event_first_player"),

            match.get("event_second_player")

        ]


        point_data = match.get(
            "pointbypoint"
        )


        analyze_momentum(
            point_data,
            players
        )


        break


else:

    print("Матч не найден")
