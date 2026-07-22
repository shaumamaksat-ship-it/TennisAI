import requests
import json


API_KEY = "99969bf38c505cb69d9901bada9049e431b7b22a6e71907a732c7c228efe6fcc"


url = "https://api.api-tennis.com/tennis/"


params = {
    "method": "get_livescore",
    "APIkey": API_KEY
}


r = requests.get(
    url,
    params=params,
    timeout=30
)


data = r.json()


matches = data.get("result", [])


print("Найдено лайв матчей:", len(matches))


for i, match in enumerate(matches[:5], start=1):

    print(
        "\n",
        i,
        match.get("event_key"),
        "|",
        match.get("event_first_player"),
        "vs",
        match.get("event_second_player")
    )


    print("\nПоля матча:")

    print(
        list(match.keys())
    )
