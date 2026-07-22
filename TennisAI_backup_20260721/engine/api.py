import requests

API_KEY = "99969bf38c505cb69d9901bada9049e431b7b22a6e71907a732c7c228efe6fcc"

BASE_URL = "https://api.api-tennis.com/tennis/"


def get_live_matches():
    params = {
        "method": "get_livescore",
        "APIkey": API_KEY
    }

    response = requests.get(BASE_URL, params=params, timeout=30)
    response.raise_for_status()

    data = response.json()

    if data.get("success") != 1:
        print("Ошибка API")
        return []

    return data["result"]


if __name__ == "__main__":
    matches = get_live_matches()

    print(f"Найдено матчей: {len(matches)}\n")

    for m in matches:
        print(
            f"{m['event_first_player']} vs {m['event_second_player']}"
        )
