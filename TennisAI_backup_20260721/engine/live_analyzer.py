import requests
from brain import TennisBrain


API_KEY = "99969bf38c505cb69d9901bada9049e431b7b22a6e71907a732c7c228efe6fcc"

BASE_URL = "https://api.api-tennis.com/tennis/"


def get_match(event_key):

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
            return match

    return None



def analyze(event_key):

    match = get_match(event_key)

    if not match:
        print("Матч не найден")
        return


    print("\n🎾", match["event_first_player"],
          "vs",
          match["event_second_player"])


    brain = TennisBrain()


    statistics = match.get("statistics", [])


    for s in statistics:

        if s["stat_period"] == "match":

            name = s["stat_name"]
            value = s["stat_value"]

            brain.add(
                name,
                value
            )


    brain.show()



if __name__ == "__main__":

    analyze(12147873)
